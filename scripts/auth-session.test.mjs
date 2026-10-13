/* Run with: node --test scripts/auth-session.test.mjs */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import axios from 'axios';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const loadDependency = createRequire(import.meta.url);
const { NextRequest } = loadDependency('next/server');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Execute the real TypeScript modules with only request/browser boundaries mocked.
function loadModule(filename, mocks = {}, globals = {}, cache = new Map()) {
  const absolute = path.resolve(root, filename);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const loadedModule = { exports: {} };
  cache.set(absolute, loadedModule);
  const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  function resolve(id) {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id.startsWith('@/') || id.startsWith('.')) {
      const target = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(absolute), id);
      return loadModule(`${target}.ts`, mocks, globals, cache);
    }
    return loadDependency(id);
  }
  vm.runInNewContext(code, {
    module: loadedModule, exports: loadedModule.exports, require: resolve,
    URL, URLSearchParams, Headers, Response, console, process, ...globals,
  }, { filename: absolute });
  return loadedModule.exports;
}
const session = loadModule('lib/api/session.ts');
const disabled = { success: false, status: 403, message: 'حساب کاربری شما غیرفعال است.', errors: null };
const destination = '/dashboard/history-reserve?page=3&count=10';

function checkLogout(location, reason, redirectTo) {
  const url = new URL(location, 'https://app.example');
  assert.equal(url.pathname, '/auth/logout');
  assert.equal(url.searchParams.get('session'), reason);
  assert.equal(url.searchParams.get('redirectTo'), redirectTo);
}

test('classifies HTTP and envelope 401, and only inactive-account 403', () => {
  assert.equal(session.getSessionFailure(401, null), 'expired');
  assert.equal(session.getSessionFailure(200, { status: 401 }), 'expired');
  assert.equal(session.getSessionFailure(403, disabled), 'disabled');
  assert.equal(session.getSessionFailure(200, disabled), 'disabled');
  assert.equal(session.getSessionFailure(403, { ...disabled, message: 'دسترسی غیرمجاز' }), null);
  assert.equal(session.getSessionFailure(403, null), null);
  assert.equal(session.getSessionFailure(422, { status: 422 }), null);
  assert.equal(session.getSessionFailure(200, { success: true }), null);
});

test('return destinations preserve query/hash and reject external URLs and redirect loops', () => {
  assert.equal(session.getSafeRedirectTo(`${destination}#details`), `${destination}#details`);
  assert.equal(session.getSafeRedirectTo('/dashboard/wallet?page=2&_rsc=transport'), '/dashboard/wallet?page=2');
  for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/login', '/auth/logout', '/dashboard/../../login', '/dashboardish', 'javascript:alert(1)', '/dashboard\n']) {
    assert.equal(session.getSafeRedirectTo(value), null, value);
  }
});

test('proxy preserves destination without cookies and overwrites spoofed page headers', () => {
  const { proxy } = loadModule('proxy.ts');
  const anonymous = proxy(new NextRequest(`https://app.example${destination}`));
  const login = new URL(anonymous.headers.get('location'));
  assert.equal(login.pathname, '/login');
  assert.equal(login.searchParams.get('redirectTo'), destination);
  const response = proxy(new NextRequest(`https://app.example${destination}`, {
    headers: { cookie: 'user_token=token', [session.CURRENT_PAGE_HEADER]: '/dashboard/spoofed' },
  }));
  assert.equal(response.headers.get(`x-middleware-request-${session.CURRENT_PAGE_HEADER}`), destination);
  const alreadyLoggedIn = proxy(new NextRequest(`https://app.example/login?redirectTo=${encodeURIComponent(destination)}`, {
    headers: { cookie: 'user_token=token' },
  }));
  assert.equal(new URL(alreadyLoggedIn.headers.get('location')).pathname, '/dashboard/history-reserve');
});

test('logout expires the cookie and forwards only safe 401 destinations', () => {
  const { GET } = loadModule('app/auth/logout/route.ts');
  for (const reason of ['expired', 'disabled']) {
    const response = GET(new NextRequest(`https://app.example${session.getLogoutUrl(reason, destination)}`));
    const login = new URL(response.headers.get('location'), 'https://app.example');
    assert.equal(login.pathname, '/login');
    assert.equal(login.searchParams.get('redirectTo'), reason === 'expired' ? destination : null);
    assert.match(response.headers.get('set-cookie'), /user_token=;.*Expires=Thu, 01 Jan 1970/i);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  const response = GET(new NextRequest('https://app.example/auth/logout?redirectTo=https://evil.example'));
  assert.equal(new URL(response.headers.get('location'), 'https://app.example').searchParams.get('redirectTo'), null);
});

function serverHarness(response, token = 'token') {
  const calls = [];
  const { serverApiFetch } = loadModule('lib/api/server.ts', {
    'server-only': {},
    'next/headers': {
      cookies: async () => ({ get: () => token ? { value: token } : undefined }),
      headers: async () => new Headers({ [session.CURRENT_PAGE_HEADER]: `${destination}&_rsc=transport` }),
    },
    'next/navigation': { redirect: (location) => { throw Object.assign(new Error('redirect'), { location }); } },
    './url': { getApiUrl: (value) => `https://api.example/${value}` },
  }, { fetch: async (...args) => { calls.push(args); return response; } });
  return { serverApiFetch, calls };
}

test('server redirects for HTTP/envelope 401 and disabled 403', async () => {
  for (const [status, body, reason] of [[401, null, 'expired'], [200, { status: 401 }, 'expired'], [403, disabled, 'disabled'], [200, disabled, 'disabled']]) {
    const { serverApiFetch } = serverHarness(Response.json(body, { status }));
    await assert.rejects(serverApiFetch('profile'), (error) => {
      checkLogout(error.location, reason, reason === 'expired' ? destination : null);
      return true;
    });
  }
  const { serverApiFetch } = serverHarness(new Response('not JSON', { status: 401 }));
  await assert.rejects(serverApiFetch('profile'), (error) => {
    checkLogout(error.location, 'expired', destination);
    return true;
  });
});

test('server preserves original response body and other errors; missing cookie avoids API request', async () => {
  for (const status of [200, 403, 422]) {
    const body = { status, message: 'ordinary response' };
    const { serverApiFetch, calls } = serverHarness(Response.json(body, { status }));
    const result = await serverApiFetch('profile');
    assert.deepEqual(await result.json(), body);
    assert.equal(calls[0][1].headers.get('Authorization'), 'Bearer token');
  }
  const { serverApiFetch, calls } = serverHarness(null, null);
  await assert.rejects(serverApiFetch('profile'), (error) => {
    checkLogout(error.location, 'expired', destination);
    return true;
  });
  assert.equal(calls.length, 0);
});

function clientHarness(token = 'token') {
  const removed = [];
  const navigations = [];
  const { apiClient } = loadModule('lib/api/client.ts', {
    '@/actions/getAuthTokenAction': { default: async () => token, __esModule: true },
  }, {
    localStorage: { getItem: () => token, setItem: () => {}, removeItem: (key) => removed.push(key) },
    window: { location: { pathname: '/dashboard/history-reserve', search: '?page=3&count=10', hash: '', replace: (value) => navigations.push(value) } },
  });
  return { apiClient, removed, navigations };
}

test('Axios resolved and rejected responses trigger session cleanup and one navigation', async () => {
  for (const rejected of [false, true]) {
    for (const [status, data, reason] of [[401, {}, 'expired'], [200, { status: 401 }, 'expired'], [403, disabled, 'disabled'], [200, disabled, 'disabled']]) {
      const { apiClient, removed, navigations } = clientHarness();
      apiClient.defaults.adapter = async (config) => {
        const response = { config, status, data, headers: {}, statusText: '' };
        if (rejected) throw new axios.AxiosError('error', 'ERR_BAD_RESPONSE', config, null, response);
        return response;
      };
      await assert.rejects(apiClient.get('profile'), { name: 'UnauthorizedError' });
      checkLogout(navigations[0], reason, reason === 'expired' ? destination : null);
      assert.ok(removed.includes('token'));
      assert.ok(removed.includes('persist:root'));
      await assert.rejects(apiClient.get('profile'), { name: 'UnauthorizedError' });
      assert.equal(navigations.length, 1);
    }
  }
});

test('Axios ordinary 403 stays available to caller; missing token redirects before requesting', async () => {
  const { apiClient, navigations } = clientHarness();
  apiClient.defaults.adapter = async (config) => ({ config, status: 403, data: { message: 'forbidden' }, headers: {}, statusText: '' });
  assert.equal((await apiClient.get('profile')).status, 403);
  assert.equal(navigations.length, 0);
  const missing = clientHarness(null);
  missing.apiClient.defaults.adapter = async () => { assert.fail('must not call backend'); };
  await assert.rejects(missing.apiClient.get('profile'), { name: 'UnauthorizedError' });
  checkLogout(missing.navigations[0], 'expired', destination);
});
