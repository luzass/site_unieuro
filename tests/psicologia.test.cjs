const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { webcrypto } = require('node:crypto');

// Exercita o script de produção com DOM e rede isolados. Nunca chama o webhook.
const source = fs.readFileSync(path.join(__dirname, '../psicologia/script.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../psicologia/index.html'), 'utf8');
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

// O hash do CPF é assíncrono de verdade: espera a condição antes de seguir.
async function until(condition) {
  for (let i = 0; i < 2000 && !condition(); i++) await new Promise(done => setImmediate(done));
  assert.ok(condition(), 'condição não atingida');
}

function setup(fetchImpl = async () => ({ ok: true }), { storage = {}, autoTimers = true, atribuicao, escolha } = {}) {
  const nodes = Object.fromEntries(['inscricao', 'form-inscricao', 'enviar-inscricao', 'form-status', 'continuar-portal', 'nome', 'whatsapp', 'cpf', 'nome-erro', 'whatsapp-erro', 'cpf-erro', 'campus-interesse', 'cookie-banner'].map(id => [id, new Element(id)]));
  const trigger = new Element();
  trigger.dataset = { inscricao: 'Campus', campus: 'Asa Sul' };
  const selectors = { '.dialog-close': new Element(), '.mobile-cta': new Element(), '.hero': new Element() };
  const timers = new Map();
  const calls = [];
  const redirects = [];
  const pixels = [];
  const gtags = [];
  const clarity = [];
  const documentListeners = {};
  let timerID = 0;
  const window = {
    location: { hostname: 'localhost', protocol: 'http:', href: 'https://www.vestibulareuro.com.br/psicologia', assign: url => redirects.push(url) },
    dataLayer: [], fbq: (...args) => pixels.push(args), gtag: (...args) => gtags.push(args), iniciarClarity: () => clarity.push('iniciar'),
    crypto: webcrypto, __unieuroAtribuicao: atribuicao, __cookiesEscolha: escolha
  };
  const sandbox = {
    window, document: { cookie: '', addEventListener: (name, fn) => { documentListeners[name] = fn; }, getElementById: id => nodes[id], querySelector: s => selectors[s], querySelectorAll: () => [trigger], body: new Element() },
    // Os prazos da conversão (400 ms e 1,5 s) correm sozinhos, salvo no teste que os controla.
    setTimeout: (fn, delay) => { if (autoTimers && (delay === 400 || delay === 1500)) { queueMicrotask(fn); return 0; } timers.set(++timerID, { fn, delay }); return timerID; },
    clearTimeout: id => timers.delete(id),
    AbortController, Date, crypto: webcrypto, TextEncoder, navigator: { userAgent: 'teste' },
    localStorage: { getItem: key => (key in storage ? storage[key] : null), setItem: (key, value) => { storage[key] = value; } },
    fetch: async (url, options) => { calls.push({ url, options }); return fetchImpl(url, options); }
  };
  vm.runInNewContext(source, sandbox);
  const fill = () => {
    nodes.nome.value = 'Candidato de Teste';
    nodes.whatsapp.value = '(61) 99999-0000';
    nodes.cpf.value = '529.982.247-25';
  };
  return { documentListeners, nodes, trigger, timers, calls, redirects, pixels, gtags, clarity, storage, window, fill, submit: () => nodes['form-inscricao'].emit('submit') };
}

// Roda o bloco de rastreamento do <head> como um navegador: window é o próprio escopo global.
function runHead({ hostname = 'www.vestibulareuro.com.br', search = '', storage = {} } = {}) {
  const script = html.match(/<script id="tracking-head">([\s\S]*?)<\/script>/)[1];
  const loaded = [];
  const listeners = {};
  const sandbox = {
    location: { hostname, protocol: 'https:', search, href: `https://${hostname}/psicologia${search}` },
    document: { createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore: el => loaded.push(el.src) } }] },
    localStorage: { getItem: key => (key in storage ? storage[key] : null), setItem: (key, value) => { storage[key] = value; } },
    URLSearchParams, setTimeout: fn => fn(), addEventListener: (event, fn) => { listeners[event] = fn; }
  };
  sandbox.window = sandbox;
  vm.runInNewContext(script, sandbox);
  const toArray = entries => Array.from(entries || [], entry => Array.from(entry));
  return { window: sandbox, loaded, listeners, storage, pixelQueue: toArray(sandbox.fbq && sandbox.fbq.queue), script };
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
  assert.deepEqual(Object.keys(payload).sort(), ['origem', 'nome', 'whatsapp', 'whatsapp_limpo', 'ddd', 'cpf', 'cpf_limpo', 'campanha', 'data', 'pagina', 'event_id', 'external_id', 'conversao_unica', 'fbp', 'fbc', 'user_agent', 'event_source_url', 'event_time', 'consentimento'].sort());
  assert.equal(payload.origem, 'Psicologia | Asa Sul | Campus');
  assert.equal(payload.whatsapp_limpo, '61999990000');
  assert.equal(payload.cpf_limpo, '52998224725');
  assert.equal(payload.conversao_unica, true);
  assert.equal(payload.consentimento, 'nao_escolhido');
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
  await s.submit();
  assert.equal(s.calls.length, 1, 'não duplica pré-cadastro já confirmado');
});

test('lead_submit e Pixel levam valor, moeda e o mesmo ID para deduplicar', async () => {
  const s = setup();
  await s.trigger.emit('click'); s.fill(); await s.submit();
  const lead = s.window.dataLayer.find(e => e.event === 'lead_submit');
  const pixelLead = s.pixels.find(e => e[1] === 'Lead');
  assert.ok(lead.event_id);
  assert.equal(lead.transaction_id, lead.event_id);
  assert.equal(pixelLead[3].eventID, lead.event_id);
  assert.equal(JSON.parse(s.calls[0].options.body).event_id, lead.event_id);
  assert.equal(lead.value, 1);
  assert.equal(lead.currency, 'BRL');
  assert.equal(lead.curso, 'Psicologia');
  assert.equal(lead.campus, 'Asa Sul');
  assert.equal(lead.origem, 'Psicologia | Asa Sul | Campus');
  assert.equal(pixelLead[2].value, 1);
  assert.equal(pixelLead[2].currency, 'BRL');
});

test('CPF nunca chega à analytics e telefone só vai em user_data e na correspondência do Pixel', async () => {
  const s = setup();
  await s.trigger.emit('click'); s.fill(); await s.submit();
  [...s.timers.values()].find(t => t.delay === 900).fn();
  const events = JSON.stringify(s.window.dataLayer);
  for (const value of ['Candidato de Teste', 'candidato', '529.982.247-25', '52998224725']) assert.ok(!events.includes(value));
  const lead = s.window.dataLayer.find(e => e.event === 'lead_submit');
  assert.equal(lead.user_data.phone_number, '+5561999990000');
  assert.equal(s.window.dataLayer.filter(e => JSON.stringify(e).includes('61999990000')).length, 1);
  const pixels = JSON.stringify(s.pixels);
  for (const value of ['529.982.247-25', '52998224725']) assert.ok(!pixels.includes(value));
  const init = s.pixels.find(e => e[0] === 'init');
  assert.equal(init[1], '1624374258784284');
  assert.equal(init[2].ph, '5561999990000');
  assert.equal(init[2].fn, 'candidato');
  assert.equal(init[2].ln, 'de teste');
  assert.match(init[2].external_id, /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(s.pixels.filter(e => e[0] === 'track')).includes('61999990000'));
});

test('mesmo CPF em nova visita envia o pré-cadastro, mas não conta conversão de novo', async () => {
  const storage = {};
  const first = setup(undefined, { storage });
  await first.trigger.emit('click'); first.fill(); await first.submit();
  const second = setup(undefined, { storage });
  await second.trigger.emit('click'); second.fill(); await second.submit();
  assert.equal(second.calls.length, 1);
  assert.equal(JSON.parse(second.calls[0].options.body).conversao_unica, false);
  assert.ok(second.window.dataLayer.some(e => e.event === 'lead_duplicado'));
  assert.ok(!second.window.dataLayer.some(e => e.event === 'lead_submit'));
  assert.equal(second.pixels.length, 0);
  assert.equal(second.nodes['continuar-portal'].hidden, false);
  assert.ok([...second.timers.values()].some(t => t.delay === 900));
});

test('conversão da LP principal vale aqui: mesma chave de leads convertidos', async () => {
  const s = setup();
  await s.trigger.emit('click'); s.fill(); await s.submit();
  assert.equal(JSON.parse(s.storage.unieuro_leads_convertidos).length, 1);
  assert.equal(JSON.parse(s.storage.unieuro_leads_convertidos)[0], JSON.parse(s.calls[0].options.body).external_id);
});

test('redirecionamento espera o GTM e o Pixel', async () => {
  const s = setup(undefined, { autoTimers: false });
  await s.trigger.emit('click'); s.fill();
  const pending = s.submit();
  await until(() => s.window.dataLayer.some(e => e.event === 'lead_submit'));
  assert.ok(![...s.timers.values()].some(t => t.delay === 900), 'não agenda o portal antes do GTM');
  s.window.dataLayer.find(e => e.event === 'lead_submit').eventCallback();
  [...s.timers.values()].find(t => t.delay === 400).fn();
  await pending;
  assert.ok([...s.timers.values()].some(t => t.delay === 900));
});

test('GTM bloqueado não prende o candidato: limite de 1,5 s libera o portal', async () => {
  const s = setup(undefined, { autoTimers: false });
  await s.trigger.emit('click'); s.fill();
  const pending = s.submit();
  await until(() => s.window.dataLayer.some(e => e.event === 'lead_submit'));
  [...s.timers.values()].find(t => t.delay === 1500).fn();
  await pending;
  assert.ok([...s.timers.values()].some(t => t.delay === 900));
});

test('atribuição de campanha vai junto com o lead e monta o fbc', async () => {
  const s = setup(undefined, { atribuicao: { gclid: 'gclid-teste', utm_source: 'google', fbclid: 'fb-teste', capturado_em: '2026-11-04T12:00:00.000Z' } });
  await s.trigger.emit('click'); s.fill(); await s.submit();
  const payload = JSON.parse(s.calls[0].options.body);
  assert.equal(payload.gclid, 'gclid-teste');
  assert.equal(payload.utm_source, 'google');
  assert.equal(payload.fbc, `fb.1.${Date.parse('2026-11-04T12:00:00.000Z')}.fb-teste`);
});

test('CTA genérico atribui o pré-cadastro e os eventos exclusivamente à Asa Sul', async () => {
  const s = setup();
  s.trigger.dataset = { inscricao: 'Hero' };
  await s.trigger.emit('click');
  assert.equal(s.nodes['campus-interesse'].textContent, '· Asa Sul');
  s.fill();
  await s.submit();
  assert.equal(JSON.parse(s.calls[0].options.body).origem, 'Psicologia | Asa Sul | Hero');
  assert.ok(s.window.dataLayer.every(event => event.event === 'cookie_consent' || event.campus_interesse === 'Asa Sul'));
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
    assert.ok(s.window.dataLayer.some(e => e.event === 'lead_erro_envio'));
    assert.ok(!s.window.dataLayer.some(e => e.event === 'lead_submit'));
    assert.equal(s.pixels.length, 0);
    assert.equal(s.redirects.length, 0);
    assert.equal(s.timers.size, 0);
    assert.equal(s.storage.unieuro_leads_convertidos, undefined, 'falha não marca o CPF como convertido');
  });
}

test('bloqueia envio duplicado enquanto aguarda a rede e recupera após timeout', async () => {
  const s = setup((url, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('timeout')))));
  await s.trigger.emit('click'); s.fill();
  const pending = s.submit();
  await s.submit();
  await until(() => s.calls.length === 1);
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
  await until(() => s.calls.length === 1);
  await s.nodes.inscricao.close();
  resolve({ ok: true }); await pending;
  assert.equal(s.timers.size, 0);
  assert.equal(s.redirects.length, 0);
  assert.equal(s.trigger.focused, true);
  await s.trigger.emit('click');
  assert.equal(s.nodes['continuar-portal'].hidden, false);
  assert.match(s.nodes['form-status'].textContent, /Pré-cadastro enviado/);
});

test('head: consentimento negado é declarado antes do GTM e do Pixel', () => {
  const { script } = runHead();
  const consent = script.indexOf('"consent", "default"');
  assert.ok(consent !== -1);
  assert.ok(consent < script.indexOf('gtm.js'));
  assert.ok(consent < script.indexOf('fbevents.js'));
});

test('head: em produção carrega GTM e Pixel com os IDs da LP principal, e Pixel revogado sem escolha', () => {
  const h = runHead();
  assert.ok(h.loaded.includes('https://www.googletagmanager.com/gtm.js?id=GTM-NJ3XR4DP'));
  assert.ok(h.loaded.includes('https://connect.facebook.net/en_US/fbevents.js'));
  assert.deepEqual(h.pixelQueue[0], ['consent', 'revoke']);
  assert.deepEqual(h.pixelQueue[1], ['init', '1624374258784284']);
  assert.ok(h.pixelQueue.some(e => e[0] === 'track' && e[1] === 'PageView'));
  assert.equal(h.listeners.load, undefined, 'Clarity não carrega sem aceite');
  const consent = Array.from(h.window.dataLayer).find(e => e[0] === 'consent');
  assert.equal(consent[1], 'default');
  assert.equal(consent[2].ad_storage, 'denied');
});

test('head: quem já aceitou na LP principal entra com consentimento e Clarity liberados', () => {
  const h = runHead({ storage: { unieuro_cookies: 'all' } });
  assert.deepEqual(h.pixelQueue[0], ['consent', 'grant']);
  const update = Array.from(h.window.dataLayer).find(e => e[0] === 'consent' && e[1] === 'update');
  assert.equal(update[2].ad_user_data, 'granted');
  h.listeners.load();
  assert.ok(h.loaded.includes('https://www.clarity.ms/tag/wqlh8jst6p'));
});

test('head: localhost não carrega nenhuma telemetria externa', () => {
  const h = runHead({ hostname: 'localhost' });
  assert.deepEqual(h.loaded, []);
  assert.equal(h.window.fbq, undefined);
  h.window.iniciarClarity();
  assert.deepEqual(h.loaded, []);
});

test('head: guarda gclid e UTMs da chegada e mantém a atribuição em visitas sem parâmetros', () => {
  const storage = {};
  const first = runHead({ search: '?gclid=abc&utm_source=google&outro=x', storage });
  assert.equal(first.window.__unieuroAtribuicao.gclid, 'abc');
  assert.equal(first.window.__unieuroAtribuicao.utm_source, 'google');
  assert.equal(first.window.__unieuroAtribuicao.outro, undefined);
  const second = runHead({ storage });
  assert.equal(second.window.__unieuroAtribuicao.gclid, 'abc');
});

test('head e corpo trazem os noscript e o banner de cookies', () => {
  assert.match(html, /ns\.html\?id=GTM-NJ3XR4DP/);
  assert.match(html, /facebook\.com\/tr\?id=1624374258784284/);
  assert.match(html, /id="cookie-banner"[^>]*hidden/);
  assert.match(html, /data-cookies="all"/);
  assert.match(html, /data-cookies="essential"/);
});

for (const [escolha, estado, pixel] of [['all', 'granted', 'grant'], ['essential', 'denied', 'revoke']]) {
  test(`banner "${escolha}" salva a escolha, atualiza Consent Mode e Pixel`, async () => {
    const s = setup();
    const banner = s.nodes['cookie-banner'];
    assert.equal(banner.hidden, false, 'aparece sem escolha salva');
    await banner.emit('click', { target: { closest: () => ({ getAttribute: () => escolha }) } });
    assert.equal(s.storage.unieuro_cookies, escolha);
    assert.equal(s.window.__cookiesEscolha, escolha);
    // JSON: o objeto nasce dentro do vm, com outro prototype, e o deepEqual estrito o rejeitaria.
    assert.deepEqual(JSON.parse(JSON.stringify(s.gtags[0])), ['consent', 'update', { ad_storage: estado, ad_user_data: estado, ad_personalization: estado, analytics_storage: estado }]);
    assert.deepEqual(s.pixels[0], ['consent', pixel]);
    assert.equal(s.clarity.length, escolha === 'all' ? 1 : 0);
    assert.ok(s.window.dataLayer.some(e => e.event === 'cookie_consent' && e.consentimento === escolha));
    assert.equal(banner.hidden, true);
  });
}

test('clique no WhatsApp gera whatsapp_click e Contact; outros cliques não', () => {
  const s = setup();
  const link = { href: 'https://wa.me/556134455891' };
  s.documentListeners.click({ target: { closest: () => null } });
  assert.ok(!s.window.dataLayer.some(e => e.event === 'whatsapp_click'));
  s.documentListeners.click({ target: { closest: selector => (selector === 'a[href*="wa.me"]' ? link : null) } });
  const evento = s.window.dataLayer.find(e => e.event === 'whatsapp_click');
  assert.equal(evento.link_url, link.href);
  assert.equal(evento.curso, 'Psicologia');
  assert.deepEqual(s.pixels.at(-1), ['track', 'Contact']);
});

test('correspondência avançada do Pixel tira acentos do nome', async () => {
  const s = setup();
  await s.trigger.emit('click'); s.fill(); s.nodes.nome.value = 'João Conceição';
  await s.submit();
  const init = s.pixels.find(e => e[0] === 'init');
  assert.equal(init[2].fn, 'joao');
  assert.equal(init[2].ln, 'conceicao');
});

test('banner fica oculto para quem já escolheu', () => {
  assert.equal(setup(undefined, { escolha: 'essential' }).nodes['cookie-banner'].hidden, true);
});
