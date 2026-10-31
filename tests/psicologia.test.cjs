const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Exercita o script de produção com DOM e rede isolados. Nunca chama o webhook.
const source = fs.readFileSync(path.join(__dirname, '../psicologia/script.js'), 'utf8');
class Element {
  constructor(id = '') {
    this.id = id;
    this.value = '';
    this.hidden = true;
    this.textContent = '';
    this.dataset = {};
    this.listeners = {};
    this.attributes = {};
    const classes = new Set();
    this.classList = { add: v => classes.add(v), remove: v => classes.delete(v), contains: v => classes.has(v) };
  }
  addEventListener(event, handler) { (this.listeners[event] ||= []).push(handler); }
  async emit(event, values = {}) { for (const handler of this.listeners[event] || []) await handler({ preventDefault() {}, target: this, ...values }); }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; return this.emit('close'); }
}

function setup(fetchImpl = async () => ({ ok: true })) {
  const nodes = Object.fromEntries(['inscricao', 'form-inscricao', 'enviar-inscricao', 'form-status', 'continuar-portal', 'nome', 'whatsapp', 'cpf', 'nome-erro', 'whatsapp-erro', 'cpf-erro', 'campus-interesse'].map(id => [id, new Element(id)]));
  const trigger = new Element();
  trigger.dataset = { inscricao: 'Campi', campus: 'Asa Sul' };
  const selectors = { '.dialog-close': new Element(), '.mobile-cta': new Element(), '.hero': new Element() };
  const timers = new Map();
  const calls = [];
  const redirects = [];
  const pixels = [];
  let timerID = 0;
  const window = { location: { hostname: 'localhost', protocol: 'http:', assign: url => redirects.push(url) }, dataLayer: [], fbq: (...args) => pixels.push(args) };
  const sandbox = {
    window, document: { getElementById: id => nodes[id], querySelector: s => selectors[s], querySelectorAll: () => [trigger], body: new Element() },
    setTimeout: (fn, delay) => { timers.set(++timerID, { fn, delay }); return timerID; }, clearTimeout: id => timers.delete(id),
    AbortController, Date, fetch: async (url, options) => { calls.push({ url, options }); return fetchImpl(url, options); }
  };
  vm.runInNewContext(source, sandbox);
  const fill = () => {
    nodes.nome.value = 'Candidato de Teste';
    nodes.whatsapp.value = '(61) 99999-0000';
    nodes.cpf.value = '529.982.247-25';
  };
  return { nodes, trigger, timers, calls, redirects, pixels, window, fill, submit: () => nodes['form-inscricao'].emit('submit') };
}

test('campos vazios, CPF repetido e DDD inválido não disparam requisições', async () => {
  const s = setup();
  await s.trigger.emit('click');
  await s.submit();
  assert.match(s.nodes['nome-erro'].textContent, /nome completo/);
  s.fill(); s.nodes.cpf.value = '111.111.111-11';
  await s.submit();
  assert.equal(s.nodes.cpf.attributes['aria-invalid'], 'true');
  s.fill(); s.nodes.whatsapp.value = '(20) 99999-0000';
  await s.submit();
  assert.equal(s.nodes.whatsapp.attributes['aria-invalid'], 'true');
  assert.equal(s.calls.length, 0);
});

test('máscaras preservam os dígitos de telefone e CPF', async () => {
  const s = setup();
  s.nodes.whatsapp.value = '61999990000'; await s.nodes.whatsapp.emit('input');
  s.nodes.cpf.value = '52998224725'; await s.nodes.cpf.emit('input');
  assert.equal(s.nodes.whatsapp.value, '(61) 99999-0000');
  assert.equal(s.nodes.cpf.value, '529.982.247-25');
});

test('sucesso mantém o contrato, atribui curso/campus e libera continuidade no portal', async () => {
  const s = setup();
  await s.trigger.emit('click'); s.fill(); await s.submit();
  assert.equal(s.calls.length, 1);
  const payload = JSON.parse(s.calls[0].options.body);
  assert.deepEqual(Object.keys(payload).sort(), ['origem', 'nome', 'whatsapp', 'whatsapp_limpo', 'ddd', 'cpf', 'cpf_limpo', 'campanha', 'data'].sort());
  assert.equal(payload.origem, 'Psicologia | Asa Sul | Campi');
  assert.equal(payload.whatsapp_limpo, '61999990000');
  assert.equal(payload.cpf_limpo, '52998224725');
  assert.equal(s.calls[0].options.method, 'POST');
  assert.match(s.calls[0].url, /webhook\/inscr_vest_euro_2026$/);
  assert.equal(s.window.dataLayer.filter(e => e.event === 'lead_submit').length, 1);
  assert.equal(s.pixels.filter(e => e[1] === 'Lead').length, 1);
  assert.equal(s.nodes['continuar-portal'].hidden, false);
  assert.equal(s.nodes['form-status'].classList.contains('success'), true);
  assert.equal(s.nodes.cpf.value, '');
  [...s.timers.values()].find(t => t.delay === 900).fn();
  assert.deepEqual(s.redirects, ['https://portal.apprbs.com.br/unieuro-grad']);
  assert.ok(s.window.dataLayer.some(e => e.event === 'registration_continue'));
  const analytics = JSON.stringify([s.window.dataLayer, s.pixels]);
  for (const privateValue of ['Candidato de Teste', '529.982.247-25', '52998224725', '61999990000']) assert.ok(!analytics.includes(privateValue));
  await s.submit();
  assert.equal(s.calls.length, 1, 'não duplica pré-cadastro já confirmado');
});

for (const [name, response] of [['HTTP 500', async () => ({ ok: false })], ['falha de rede', async () => { throw new Error('offline'); }]]) {
  test(`${name}: mantém dados, permite tentar novamente e não registra Lead nem redireciona`, async () => {
    const s = setup(response);
    await s.trigger.emit('click'); s.fill(); await s.submit();
    assert.equal(s.nodes['form-status'].hidden, false);
    assert.match(s.nodes['form-status'].textContent, /Não conseguimos confirmar/);
    assert.equal(s.nodes['continuar-portal'].hidden, false);
    assert.equal(s.nodes['enviar-inscricao'].disabled, false);
    assert.equal(s.nodes.cpf.value, '529.982.247-25');
    assert.ok(s.window.dataLayer.some(e => e.event === 'lead_submit_error'));
    assert.ok(!s.window.dataLayer.some(e => e.event === 'lead_submit'));
    assert.equal(s.pixels.length, 0);
    assert.equal(s.redirects.length, 0);
    assert.equal(s.timers.size, 0);
  });
}

test('bloqueia envio duplicado enquanto aguarda a rede e recupera após timeout', async () => {
  const s = setup((url, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('timeout')))));
  await s.trigger.emit('click'); s.fill();
  const pending = s.submit();
  await s.submit();
  assert.equal(s.calls.length, 1);
  assert.equal(s.nodes['enviar-inscricao'].disabled, true);
  [...s.timers.values()].find(t => t.delay === 15000).fn();
  await pending;
  assert.equal(s.nodes['enviar-inscricao'].disabled, false);
  assert.equal(s.nodes.nome.readOnly, false);
  assert.equal(s.pixels.length, 0);
});

test('fechar durante o envio não causa navegação inesperada após confirmação', async () => {
  let resolve;
  const s = setup(() => new Promise(done => { resolve = done; }));
  await s.trigger.emit('click'); s.fill();
  const pending = s.submit();
  await s.nodes.inscricao.close();
  resolve({ ok: true }); await pending;
  assert.equal(s.timers.size, 0);
  assert.equal(s.redirects.length, 0);
  assert.equal(s.trigger.focused, true);
  await s.trigger.emit('click');
  assert.equal(s.nodes['continuar-portal'].hidden, false);
  assert.match(s.nodes['form-status'].textContent, /Pré-cadastro enviado/);
});
