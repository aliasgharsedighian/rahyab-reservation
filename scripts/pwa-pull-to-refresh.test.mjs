/* Browser regressions. Run: node --test scripts/pwa-pull-to-refresh.test.mjs
 * Requires Playwright (or PLAYWRIGHT_MODULE_PATH pointing to its installed directory).
 * Uses an installed Chrome/Edge browser; no production dependency is added.
 */
import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const compiled = ts.transpileModule(fs.readFileSync(new URL('../lib/pwa-pull-to-refresh.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
let browser;
before(async () => {
  browser = await chromium.launch({ channel: process.env.PTR_BROWSER || 'chrome', headless: true });
});
after(async () => { await browser?.close(); });

async function setup(t, { standalone = true, ios = false, touch = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: touch, hasTouch: touch });
  t.after(() => context.close());
  const page = await context.newPage();
  await page.setContent(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0} #root{min-height:2000px} #nested{height:100px;overflow:auto} #wide{width:100px;overflow:auto} #fixed{position:fixed;bottom:0}</style>
    <div id="root"><div id="surface" style="height:200px">content</div>
    <button id="button"><span id="button-child">button</span></button><input id="input"><textarea id="textarea"></textarea><a id="link" href="#">link</a>
    <div id="editable" contenteditable="true">edit</div><div id="slider" role="slider">slider</div>
    <div id="carousel" data-slot="carousel"><div id="slide">slide</div></div>
    <div id="nested"><div id="nested-child" style="height:500px">nested scroll</div></div>
    <div id="wide"><div id="wide-child" style="width:500px">table scroll</div></div>
    <div id="scroll-area" data-slot="scroll-area">scroll area</div>
    <div data-pull-to-refresh-ignore><div id="ignore-child">ignore</div></div>
    <div id="fixed">bottom cart</div></div>`);
  await page.evaluate(({ standalone, ios, touch }) => {

    window.media = {};
    window.matchMedia = (query) => {

      let matches = query.includes('display-mode') ? standalone : touch;
      const listeners = new Set();
      const media = { media: query, get matches() { return matches; },
        addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn),
        set(value) { matches = value; for (const fn of listeners) fn(); },
      };
      window.media[query] = media;
      return media;
    };
    if (ios) Object.defineProperty(navigator, 'standalone', { value: true });
  }, { standalone, ios, touch });
  await page.addScriptTag({ content: `window.gestureModule = (() => { const exports = {}; ${compiled}; return exports; })();` });
  await page.evaluate(() => {
    window.refreshes = 0; window.progress = 0; window.busy = false;
    window.dispose = window.gestureModule.installPwaPullToRefresh(document.querySelector('#root'), {
      onProgress: value => window.progress = value,
      onRefresh: () => { window.refreshes++; }, isRefreshing: () => window.busy,
    });
    window.emit = (type, selector = '#surface', x = 150, y = 100, count = 1, cancelable = true) => {
      const target = document.querySelector(selector);
      const touches = type === 'touchend' || type === 'touchcancel' ? [] : Array.from({ length: count }, (_, identifier) => new Touch({ identifier, target, clientX: x, clientY: y }));
      const event = new TouchEvent(type, { bubbles: true, cancelable, touches, changedTouches: touches, targetTouches: touches });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    };
    window.pull = (selector = '#surface', endY = 300) => {
      window.emit('touchstart', selector); const prevented = window.emit('touchmove', selector, 150, endY);
      window.emit('touchend', selector); return prevented;
    };
  });
  return page;
}

for (const options of [{ standalone: false }, { touch: false }]) {
  test(`disabled outside installed touch PWA: ${JSON.stringify(options)}`, async t => {
    const page = await setup(t, options);
    assert.equal(await page.evaluate(() => window.pull()), false);
    assert.equal(await page.evaluate(() => window.refreshes), 0);
    assert.equal(await page.evaluate(() => document.documentElement.style.overscrollBehaviorY), '');
  });
}

test('Android standalone and iOS standalone fallback refresh on release only', async t => {
  for (const options of [{}, { standalone: false, ios: true }]) {
    const page = await setup(t, options);
    await page.evaluate(() => { window.emit('touchstart'); window.emit('touchmove', '#surface', 150, 300); });
    assert.equal(await page.evaluate(() => window.refreshes), 0);
    assert.equal(await page.evaluate(() => window.progress), 90);
    await page.evaluate(() => window.emit('touchend'));
    assert.equal(await page.evaluate(() => window.refreshes), 1);
    assert.equal(await page.evaluate(() => window.progress), 0);
  }
});

test('short, horizontal, upward, multi-touch, cancelled and uncancelable gestures never refresh', async t => {
  const page = await setup(t);
  await page.evaluate(() => {
    window.pull('#surface', 180);
    window.emit('touchstart'); window.emit('touchmove', '#surface', 300, 130); window.emit('touchmove', '#surface', 150, 500); window.emit('touchend');
    window.emit('touchstart'); window.emit('touchmove', '#surface', 150, 80); window.emit('touchend');
    window.emit('touchstart'); window.emit('touchmove', '#surface', 150, 300, 2); window.emit('touchend');
    window.emit('touchstart'); window.emit('touchmove', '#surface', 150, 300); window.emit('touchcancel'); window.emit('touchend');
    window.emit('touchstart'); window.emit('touchmove', '#surface', 150, 300, 1, false); window.emit('touchend');
    window.emit('touchstart'); window.emit('touchmove', '#surface', 150, 300); window.emit('touchmove', '#surface', 150, 120); window.emit('touchend');
  });
  assert.equal(await page.evaluate(() => window.refreshes), 0);
});

test('inputs, controls, carousel, internal scroll, fixed cart and opt-out keep gestures', async t => {
  const page = await setup(t);
  for (const id of ['button-child', 'input', 'textarea', 'link', 'editable', 'slider', 'slide', 'nested-child', 'wide-child', 'scroll-area', 'fixed', 'ignore-child']) {
    assert.equal(await page.evaluate(id => window.pull('#' + id), id), false, id);
  }
  assert.equal(await page.evaluate(() => window.refreshes), 0);
});

test('open drawers, sheets, dialogs, popovers, selects and menus block page refresh', async t => {
  const page = await setup(t);
  for (const slot of ['drawer', 'sheet', 'popover', 'select', 'dropdown-menu', 'menubar']) {
    await page.evaluate(slot => {
      const overlay = document.createElement('div'); overlay.id = 'overlay';
      overlay.dataset.slot = slot + '-content'; overlay.dataset.state = 'open'; overlay.textContent = 'open'; document.body.append(overlay);
    }, slot);
    assert.equal(await page.evaluate(() => window.pull()), false, slot);
    await page.evaluate(() => document.querySelector('#overlay').remove());
  }
  for (const role of ['dialog', 'alertdialog']) {
    await page.evaluate(role => { const node = document.createElement('div'); node.id = 'overlay'; node.role = role; node.textContent = 'modal'; document.body.append(node); }, role);
    assert.equal(await page.evaluate(() => window.pull()), false, role);
    await page.evaluate(() => document.querySelector('#overlay').remove());
  }
  await page.evaluate(() => { const d = document.createElement('dialog'); d.id = 'overlay'; document.body.append(d); d.showModal(); });
  assert.equal(await page.evaluate(() => window.pull()), false);
  assert.equal(await page.evaluate(() => window.refreshes), 0);
});

test('page must start at top, nested top does not transfer, busy and edge gestures are ignored', async t => {
  const page = await setup(t);
  await page.evaluate(() => { window.scrollTo(0, 100); window.pull(); window.scrollTo(0, 0); window.emit('touchmove', '#surface', 150, 400); window.emit('touchend'); });
  await page.evaluate(() => { window.busy = true; window.pull(); window.busy = false; window.emit('touchstart', '#surface', 10, 100); window.emit('touchmove', '#surface', 10, 400); window.emit('touchend'); });
  assert.equal(await page.evaluate(() => window.refreshes), 0);
  await page.evaluate(() => window.pull());
  assert.equal(await page.evaluate(() => window.refreshes), 1);
});

test('mode changes and unmount remove gestures and restore root overscroll', async t => {
  const page = await setup(t);
  assert.equal(await page.evaluate(() => document.documentElement.style.overscrollBehaviorY), 'none');
  await page.evaluate(() => { window.media['(display-mode: standalone)'].set(false); window.pull(); });
  assert.equal(await page.evaluate(() => document.documentElement.style.overscrollBehaviorY), '');
  assert.equal(await page.evaluate(() => window.refreshes), 0);
  await page.evaluate(() => { window.media['(display-mode: standalone)'].set(true); window.pull(); window.dispose(); window.pull(); });
  assert.equal(await page.evaluate(() => window.refreshes), 1);
  assert.equal(await page.evaluate(() => document.documentElement.style.overscrollBehaviorY), '');
});

test('real Chromium touch stream claims pull without scrolling or full navigation', async t => {
  const page = await setup(t);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 100 }] });
  for (const y of [120, 150, 190, 240, 300]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 150, y }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.equal(await page.evaluate(() => window.refreshes), 1);
  assert.equal(await page.evaluate(() => window.scrollY), 0);
});

test('offline, focused editors, body locks and overlays opened during a pull cancel refresh', async t => {
  const page = await setup(t);
  await page.evaluate(() => { Object.defineProperty(navigator, 'onLine', { configurable: true, value: false }); window.pull(); Object.defineProperty(navigator, 'onLine', { configurable: true, value: true }); });
  await page.focus('#input');
  await page.evaluate(() => window.pull());
  await page.evaluate(() => { document.activeElement.blur(); document.body.setAttribute('data-scroll-locked', '1'); window.pull(); document.body.removeAttribute('data-scroll-locked'); document.body.style.overflowY = 'hidden'; window.pull(); document.body.style.overflowY = ''; });
  await page.evaluate(() => { window.emit('touchstart'); window.emit('touchmove', '#surface', 150, 300); const dialog = document.createElement('dialog'); document.body.append(dialog); dialog.showModal(); window.emit('touchend'); dialog.remove(); });
  assert.equal(await page.evaluate(() => window.refreshes), 0);
  await page.evaluate(() => window.pull());
  assert.equal(await page.evaluate(() => window.refreshes), 1);
});

test('native upward swipe and nested scrolling keep their normal scrolling behavior', async t => {
  const page = await setup(t);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 180 }] });
  for (const y of [160, 130, 100, 70, 40]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 150, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForFunction(() => window.scrollY > 0);
  assert.equal(await page.evaluate(() => window.refreshes), 0);
});
