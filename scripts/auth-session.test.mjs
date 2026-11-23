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

test('analytics uses the profile ID and clears it after an in-flight identity request', async () => {
  let startSet;
  const setStarted = new Promise(resolve => { startSet = resolve; });
  let finishSet;
  const setResult = new Promise(resolve => { finishSet = resolve; });
  const calls = [];
  const { syncAnalyticsUserId } = loadModule('lib/analytics.ts', {
    './baas-core': { initializeBaasCore: async () => ({}) },
    'baas-web-sdk/analytics': {
      AnalyticsSdk: class {
        setAutomaticCollection() {}
        setUserId(id) {
          calls.push(['set', id]);
          startSet();
          return setResult;
        }
        async clearUserId() {
          calls.push(['clear']);
          return { success: true };
        }
      },
    },
  }, { window: {}, process: { env: { NEXT_PUBLIC_BAAS_API_KEY: 'test-key' } } });

  const { default: authReducer, logIn, setUserProfile, logOut } = loadModule('redux/features/auth-slice.ts');
  const login = authReducer(undefined, logIn({ id: 12 }));
  assert.equal(login.value.profileUserId, undefined);
  const profile = authReducer(login, setUserProfile({ id: 86 }));
  const loginIdentity = syncAnalyticsUserId(profile.value.profileUserId);
  const refreshIdentity = syncAnalyticsUserId('86');
  await setStarted;

  const logout = authReducer(profile, logOut());
  const logoutIdentity = syncAnalyticsUserId(logout.value.profileUserId);
  assert.deepEqual(calls, [['set', '86']]);
  finishSet({ success: true });

  await Promise.all([loginIdentity, refreshIdentity, logoutIdentity]);
  assert.deepEqual(calls, [['set', '86'], ['clear']]);
});

test('push registration uses the live cookie and sends only a validated web installation', async () => {
  let token;
  let upstream = { status: 200, data: { success: true, status: 200 } };
  const received = [];
  const { GET, POST, DELETE } = loadModule('app/api/push/installations/route.ts', {
    'next/headers': { cookies: async () => ({ get: () => token ? { value: token } : undefined }) },
  }, {
    AbortSignal,
    process: { env: { NEXT_PUBLIC_API_ADDRESS: 'https://api.example/api/v1' } },
    fetch: async (url, init) => {
      received.push({ url, method: init.method, auth: init.headers.Authorization, body: init.body && JSON.parse(init.body) });
      return Response.json(upstream.data, { status: upstream.status });
    },
  });
  const send = (device_id = 'installation-1', platform = 'web', site = 'same-origin') => POST(new Request(
    'https://app.example/api/push/installations', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'sec-fetch-site': site, Authorization: 'Bearer ignored' },
      body: JSON.stringify({ device_id, platform, user_id: 123 }),
    },
  ));

  assert.equal((await send()).status, 401);
  token = 'account-a';
  assert.equal((await send('', 'web')).status, 422);
  assert.equal((await send('x'.repeat(192))).status, 422);
  assert.equal((await send('installation-1', 'app')).status, 422);
  assert.equal((await send('installation-1', 'web', 'same-site')).status, 403);
  assert.equal(received.length, 0);
  assert.equal((await send()).status, 200);
  token = 'account-b';
  assert.equal((await send()).status, 200);
  assert.deepEqual(received.map(call => call.auth), ['Bearer account-a', 'Bearer account-b']);
  for (const call of received) {
    assert.equal(call.url, 'https://api.example/api/v1/push/installations');
    assert.deepEqual(call.body, { device_id: 'installation-1', platform: 'web' });
  }
  upstream = { status: 200, data: { status: 401 } };
  assert.equal((await send()).status, 401);
  upstream = { status: 422, data: { status: 422 } };
  assert.equal((await send()).status, 422);
  upstream = { status: 503, data: {} };
  assert.equal((await send()).status, 502);

  const lookup = id => GET(new Request('https://app.example/api/push/installations?' + new URLSearchParams({ device_id: id })));
  assert.equal((await lookup('')).status, 422);
  for (const active of [true, false]) {
    upstream = { status: 200, data: { success: true, status: 200, data: active } };
    assert.deepEqual(await (await lookup('device / +?')).json(), { active });
    assert.equal(received.at(-1).url, 'https://api.example/api/v1/push/installations/active?device_id=device+%2F+%2B%3F');
    assert.equal(received.at(-1).method, 'GET');
    assert.equal(received.at(-1).auth, 'Bearer account-b');
  }
  upstream = { status: 200, data: { success: true, status: 200, data: null } };
  const remove = platform => DELETE(new Request('https://app.example/api/push/installations', {
    method: 'DELETE', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ device_id: 'installation-1', platform }),
  }));
  assert.equal((await remove('app')).status, 422);
  assert.equal((await remove('web')).status, 200);
  assert.equal(received.at(-1).method, 'DELETE');
  assert.deepEqual(received.at(-1).body, { device_id: 'installation-1', platform: 'web' });
});

test('BaaS resolves existing installations through refresh and tracks actual ID changes', async () => {
  let token = 'existing-sdk-token';
  let id = 'existing-installation';
  let refreshes = 0;
  const storage = new Map();
  class CoreSdk {
    async initializeApp() { if (!token) await this.deviceRegister(); }
    async ensureInstallationToken() { return token; }
    async deviceRegister() {
      token = 'new-sdk-token';
      return { success: true, data: { installationId: id, token } };
    }
    async refreshInstallationToken() {
      token = 'refreshed-sdk-token-' + ++refreshes;
      return { success: true, data: { installationId: id, token } };
    }
  }
  const mocks = { 'baas-web-sdk/core': { CoreSdk } };
  const browser = {
    window: new EventTarget(), crypto, TextEncoder,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    process: { env: { NEXT_PUBLIC_BAAS_API_KEY: 'test-key' } },
  };

  let core = loadModule('lib/baas-core.ts', mocks, browser);
  assert.equal(await core.getBaasInstallationId(), 'existing-installation');
  assert.equal(refreshes, 1);
  assert.equal([...storage.values()].some(value => value.includes(token)), false);
  const modules = new Map();
  core = loadModule('lib/baas-core.ts', mocks, browser, modules);
  assert.equal(await core.getBaasInstallationId(), 'existing-installation');
  assert.equal(refreshes, 1, 'no extra refresh on reopen with the matching token');
  const sdk = await core.initializeBaasCore();
  const { subscribeToBaasInstallation } = loadModule('lib/baas-installation.ts', mocks, browser, modules);
  let changes = 0;
  const unsubscribe = subscribeToBaasInstallation(() => changes++);
  id = 'replacement-installation';
  await sdk.deviceRegister();
  assert.equal(await core.getBaasInstallationId(), 'replacement-installation');
  await sdk.refreshInstallationToken();
  assert.equal(await core.getBaasInstallationId(), 'replacement-installation');
  assert.equal(changes, 1);
  unsubscribe();
});

test('push on/off is shared, survives reopen and never posts from a background lookup', async () => {
  let registered = true;
  let failLookup = false;
  let failWrite = false;
  let id = 'device-one';
  let notifyChange;
  const requests = [];
  const window = new EventTarget();
  const { getPushInstallation, observePushInstallation, refreshPushInstallation, setPushInstallationEnabled } = loadModule('lib/push-installation-sync.ts', {
    './baas-core': { getBaasInstallationId: async () => id },
    './baas-installation': { subscribeToBaasInstallation: listener => {
      notifyChange = listener;
      return () => { notifyChange = undefined; };
    } },
  }, {
    window, navigator: {}, AbortSignal,
    localStorage: { setItem() {} },
    process: { env: { NEXT_PUBLIC_BAAS_API_KEY: 'test-key' } },
    fetch: async (url, init) => {
      requests.push({ url, method: init.method ?? 'GET', body: init.body && JSON.parse(init.body) });
      if (!init.method) return Response.json({ active: registered }, { status: failLookup ? 502 : 200 });
      if (failWrite) return new Response(null, { status: 502 });
      registered = init.method === 'POST';
      return new Response(null);
    },
  });
  const flush = () => new Promise(setImmediate);

  let stop = observePushInstallation();
  await flush();
  assert.equal(getPushInstallation().status, 'on');
  assert.equal(await setPushInstallationEnabled(false), true);
  await flush();
  assert.equal(getPushInstallation().status, 'off');
  stop();
  stop = observePushInstallation();
  await flush();
  assert.equal(getPushInstallation().status, 'off');
  window.dispatchEvent(new Event('focus'));
  id = 'device-two';
  notifyChange();
  await flush();
  assert.equal(getPushInstallation().status, 'off');
  assert.ok(requests.some(call => call.url.endsWith('device_id=device-two')));
  assert.deepEqual(requests.filter(call => call.method !== 'GET'), [
    { url: '/api/push/installations', method: 'DELETE', body: { device_id: 'device-one', platform: 'web' } },
  ]);

  failWrite = true;
  assert.equal(await setPushInstallationEnabled(true), false);
  await flush();
  assert.equal(getPushInstallation().status, 'off');
  failWrite = false;
  assert.equal(await setPushInstallationEnabled(true), true);
  await flush();
  assert.equal(getPushInstallation().status, 'on');
  assert.deepEqual(requests.filter(call => call.method === 'POST').at(-1)?.body, { device_id: 'device-two', platform: 'web' });

  stop();
  failLookup = true;
  stop = observePushInstallation();
  await flush();
  assert.equal(getPushInstallation().status, 'error');
  failLookup = false;
  await refreshPushInstallation(true);
  assert.equal(getPushInstallation().status, 'on');
  stop();
});

test('disabling push disconnects the SDK and enabling with a grant never prompts again', async () => {
  let installation = 'on';
  const listeners = new Set();
  let requests = 0;
  let connects = 0;
  let disconnects = 0;
  const Notification = { permission: 'granted', requestPermission: async () => {
    requests++;
    return 'granted';
  } };
  class PushSdk {
    onError() {}
    async start() { connects++; return Notification.permission; }
    disconnect() { disconnects++; }
  }
  const push = loadModule('lib/baas-push.ts', {
    './baas-core': { initializeBaasCore: async () => ({}) },
    './pwa-install': { getInstallState: () => ({ platform: 'desktop' }), subscribeToInstall: () => () => {} },
    './push-installation-sync': {
      getPushInstallation: () => ({ status: installation }),
      subscribeToPushInstallation: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    },
    'baas-web-sdk/push': { PushSdk },
  }, {
    window: Object.assign(new EventTarget(), { isSecureContext: true, Notification, WebSocket: {} }),
    document: new EventTarget(), navigator: { serviceWorker: {} }, Notification,
    process: { env: { NEXT_PUBLIC_BAAS_API_KEY: 'test-key' } },
  });
  const flush = () => new Promise(setImmediate);
  await push.initializePushSdk();
  push.setPushWorkerStatus('ready');
  const stop = push.activateBaasPush();
  await flush();
  assert.equal(connects, 1);
  installation = 'off';
  for (const listener of listeners) listener();
  assert.equal(disconnects, 1);
  assert.equal(Notification.permission, 'granted');
  assert.equal(await push.requestBaasPushPermission(), 'granted');
  assert.equal(connects, 1, 'a browser grant alone does not restart disabled push');
  installation = 'on';
  for (const listener of listeners) listener();
  await flush();
  assert.equal(connects, 2);
  assert.equal(requests, 0);
  stop();
});

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
