const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/engajamento.js'), 'utf8');

function setup() {
  const listeners = {};
  const pixels = [];
  let tick;
  const win = {
    pageYOffset: 0, innerHeight: 800, dataLayer: [], fbq: (...a) => pixels.push(a),
    addEventListener: (e, fn) => { listeners[e] = fn; }, removeEventListener: () => {},
    crypto: { randomUUID: () => 'id-' + Math.random() }
  };
  const sandbox = {
    window: win, crypto: win.crypto, Math, Date, Object,
    document: { hidden: false, title: 't', currentScript: { dataset: { nome: 'LP', curso: 'X' } }, documentElement: { scrollHeight: 8000 }, body: { scrollHeight: 8000 } },
    setInterval: fn => { tick = fn; return 1; }, clearInterval: () => { tick = null; }
  };
  vm.runInNewContext(source, sandbox);
  return { win, pixels, listeners, doc: sandbox.document, tick: () => tick && tick() };
}
const events = s => s.win.dataLayer.map(e => e.event);

test('abaixo de 50% nada dispara', () => {
  const s = setup(); s.win.pageYOffset = 1000; s.listeners.scroll();
  assert.deepEqual(events(s), []);
});

test('50% dispara view_content uma vez, com Pixel ViewContent e eventID igual', () => {
  const s = setup(); s.win.pageYOffset = 3300; s.listeners.scroll(); s.listeners.scroll();
  assert.deepEqual(events(s), ['view_content']);
  assert.equal(s.pixels[0][0], 'track'); assert.equal(s.pixels[0][1], 'ViewContent');
  assert.equal(s.pixels[0][3].eventID, s.win.dataLayer[0].event_id);
});

test('30 s na metade de baixo dispara super_view_content (custom no Pixel), uma vez', () => {
  const s = setup(); s.win.pageYOffset = 3300; s.listeners.scroll();
  for (let i = 0; i < 29; i++) s.tick();
  assert.deepEqual(events(s), ['view_content']);
  s.tick(); s.tick();
  assert.deepEqual(events(s), ['view_content', 'super_view_content']);
  assert.deepEqual(s.pixels[1].slice(0, 2), ['trackCustom', 'SuperViewContent']);
});

test('voltar para cima ou aba oculta pausa a contagem', () => {
  const s = setup(); s.win.pageYOffset = 3300; s.listeners.scroll();
  for (let i = 0; i < 20; i++) s.tick();
  s.win.pageYOffset = 0; for (let i = 0; i < 50; i++) s.tick();
  s.win.pageYOffset = 3300; s.doc.hidden = true; for (let i = 0; i < 50; i++) s.tick();
  assert.deepEqual(events(s), ['view_content']);
  s.doc.hidden = false; for (let i = 0; i < 10; i++) s.tick();
  assert.deepEqual(events(s), ['view_content', 'super_view_content']);
});
