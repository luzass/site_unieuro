# Rastreamento da LP de Psicologia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar `/psicologia` com o mesmo rastreamento da LP principal (GTM, GA4, Pixel, Clarity, Consent Mode e conversão única) e com as conversões das duas LPs disponíveis e corretas no Google Ads.

**Architecture:** O site é estático na Vercel, sem build para esta página. `psicologia/index.html` recebe o bloco de rastreamento no `<head>` e `psicologia/script.js` passa a registrar a conversão com as mesmas regras de `index.html`. GTM, GA4 e Google Ads são configurados no navegador depois do deploy, porque o GA4 só oferece um evento novo ao Ads depois de recebê-lo.

**Tech Stack:** HTML, CSS e JS sem framework; `node:test`; Vercel; GTM; GA4; Google Ads; Meta Pixel; Clarity; Claude in Chrome.

**Spec:** Sem spec separada. O requisito é o pedido do André de 2026-11-04 (mesmo rastreamento da LP principal, sem erros, com todas as conversões das duas LPs vinculadas no Google Ads). A referência de comportamento é `index.html`.

## Global Constraints

- GTM: `GTM-NJ3XR4DP`. GA4: `G-ZEH3B57GG9`. Pixel: `1624374258784284`. Clarity: `wqlh8jst6p`. Nenhum ID novo.
- Google Ads: conta `Unieuro (DF)`, `305-001-4168`. Conversão `Lead - Site Vestibular`: ID `457189117`, rótulo `9FtbCMr8qqkcEP3NgNoB`.
- Conversão é envio confirmado pelo webhook (HTTP ok), uma vez por CPF, com a chave `unieuro_leads_convertidos` compartilhada com a LP principal.
- CPF nunca entra em `dataLayer`, Pixel ou Clarity. O telefone só entra em `user_data.phone_number` e na correspondência avançada do Pixel.
- Copy, paleta, organização visual e webhook não mudam.
- Claude não digita CPF no navegador, nem valor de teste. O envio real do formulário é feito pelo André.
- Se o Chrome negar um domínio, pedir a liberação ao André. Não trocar de ferramenta para contornar o bloqueio.
- Toda mensagem de commit termina com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- A cópia de trabalho está em CRLF (`core.autocrlf=true`) e o repositório em LF. Os blocos deste plano estão em LF. Se a ferramenta de edição comparar bytes, converta o arquivo para LF antes de editar. O Git normaliza no commit.
- Em comando de aceite com `fetch`, use `process.exitCode`. `process.exit` dentro do `fetch` derruba o Node no Windows com `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`.

## Estado levantado em 2026-11-04

**GTM, versão publicada 6 (ponto de rollback):**

| Tag | Dispara em | Observação |
|---|---|---|
| Google tag `G-ZEH3B57GG9` | `gtm.init` | Envia `user_data` para conversões otimizadas |
| Conversion Linker | `gtm.init` | Domínios: `site-unieuro-iy74kzqia-luzass-projects.vercel.app`, `vestibulareuro.com.br` |
| GA4 `generate_lead` | `lead_submit` | Parâmetros incluem `value`, `currency`, `transaction_id={{event_id}}` |
| Ads `Lead - Site Vestibular` | `lead_submit` | `orderId={{event_id}}`, `value`, `currency` |
| GA4 `lead_medicina` | `lead_submit` e `curso` contém `medicina` | Regra errada, ver abaixo |

**GA4:** propriedade `Vestibular Euro` (`a394062067p536778901`). `generate_lead` é evento principal e a conta Ads `305-001-4168` está vinculada.

**Google Ads:** a página da conta avisa "Não há anúncios sendo veiculados". A tabela completa de conversões **não foi lida**: o Chrome passou a negar a leitura de `ads.google.com`. Por isso a Task 6 começa lendo a tabela e decide por uma tabela de estados.

**Diferenças de `/psicologia` em relação à LP principal:**

- Sem Consent Mode e sem banner de cookies. GTM, Pixel e Clarity carregam sem escolha do visitante.
- GTM carrega 1,6 s depois do `load`.
- `lead_submit` sem `value`, `currency`, `event_id`, `transaction_id`, `campus` e `user_data`. Sem isso o Ads não deduplica nem recebe valor.
- Pixel `Lead` sem `eventID`, sem valor e sem correspondência avançada.
- Sem conversão única por CPF: o mesmo candidato conta de novo em nova visita.
- O redirecionamento ao portal não espera GTM e Pixel, o que pode perder a conversão.
- Sem captura de UTM e `gclid`, e o webhook não recebe `event_id`, `external_id`, `fbp`, `fbc` nem `consentimento`.
- Clique no WhatsApp não gera evento.

**Bug encontrado na regra de `lead_medicina`:** a comparação do GTM é `String(a).indexOf(String(b))>=0`. O card `Biomedicina` da LP principal grava `curso: "Biomedicina"` no `form_open`, e o `lead_submit` herda esse valor. Como "Biomedicina" contém "medicina", esse lead dispara `lead_medicina`. A LP `/medicina` envia `curso: 'medicina'`, então a regra certa é igualdade. Esta conclusão vem da leitura do código e será confirmada no Preview da Task 3.

**Publicação:** não existe `.vercelignore` e `https://www.vestibulareuro.com.br/tests/psicologia.test.cjs` responde 200. Sem ajuste, este plano ficaria público depois do deploy.

## Decisões

1. **O que conta como conversão:** envio confirmado, como na LP principal. Clique em CTA gera só `cta_click` e `form_open` no `dataLayer`. Contar clique como conversão inflaria o número e ensinaria o lance a buscar quem clica, não quem se inscreve.
2. **Conversão primária no Ads:** `Lead - Site Vestibular` continua sendo a primária. Ela já recebe os leads das duas LPs, e a atribuição por clique separa os resultados por campanha.
3. **Conversões por curso:** `lead_psicologia` e `lead_medicina` entram no Ads como secundárias, para relatório sem contar o mesmo lead duas vezes. Uma meta específica de campanha só faz sentido quando existir campanha ativa de um único curso.
4. **Card Psicologia da LP principal:** também dispara `lead_psicologia`, porque o lead é do mesmo curso.
5. **Fora do escopo:** a LP `/medicina`, exceto a regra do GTM. Observação para o relatório: ela envia `lead_submit` antes da confirmação do webhook e sem `value` nem `event_id`.

## Autorizações ao aprovar este plano

- Merge em `main`, que publica o visual novo e o rastreamento, somente depois do OK do André ao visual (Task 2, Step 2).
- Publicar a nova versão do container GTM, criar o evento principal no GA4 e alterar as conversões do Ads conforme a tabela da Task 6.
- Clicar em "Aceitar todos" e "Apenas essenciais" no banner do próprio site, somente para testar.

## Itens

- [ ] T1 | files: psicologia/,tests/psicologia.test.cjs,.vercelignore,docs/ | check: node --test tests/psicologia.test.cjs | exec: sonnet | Task 1: código de rastreamento em /psicologia, testes e .vercelignore
- [ ] T2 | after: T1 | check: node -e "fetch('https://www.vestibulareuro.com.br/psicologia').then(r=>r.text()).then(h=>{process.exitCode=h.includes('tracking-head')?0:1})" | exec: sonnet | Task 2: PR, OK do André e deploy
- [ ] T3 | after: T2 | check: node -e "fetch('https://www.googletagmanager.com/gtm.js?id=GTM-NJ3XR4DP').then(r=>r.text()).then(s=>{process.exitCode=s.includes('lead_psicologia')?0:1})" | exec: sonnet | Task 3: GTM com lead_psicologia e correção da regra de medicina
- [ ] T4 | after: T3 | exec: sonnet | Task 4: lead_psicologia como evento principal no GA4
- [ ] T5 | after: T4 | exec: sonnet | Task 5: validação em produção, com envio real feito pelo André
- [ ] T6 | after: T5 | exec: sonnet | Task 6: conversões no Google Ads e relatório final

---

### Task 1: Código de rastreamento em `/psicologia`

**Files:**
- Modify: `tests/psicologia.test.cjs` (substituição completa)
- Modify: `psicologia/index.html`
- Modify: `psicologia/script.js`
- Modify: `psicologia/styles.css` (o redesign já está no arquivo, sem commit)
- Create: `.vercelignore`

**Interfaces:**
- Consumes: `track(event, extra)` de `psicologia/script.js`, que continua sendo a única porta para o `dataLayer`.
- Produces: `lead_submit` com `curso: 'Psicologia'`, `campus: 'Asa Sul'`, `origem`, `event_id`, `transaction_id`, `value: 1`, `currency: 'BRL'` e `user_data.phone_number`. As Tasks 3 e 5 dependem desses nomes.

- [ ] **Step 1: Criar o branch e comitar o redesign separado**

```bash
git checkout -b tracking-psicologia
git add psicologia/styles.css
git commit -m "Redesenha o visual da LP de Psicologia" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 2: Substituir o arquivo de testes**

Substitua todo o conteúdo de `tests/psicologia.test.cjs` por:

<!-- write: tests/psicologia.test.cjs -->
```js
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
```

- [ ] **Step 3: Rodar os testes e confirmar a falha**

Run: `node --test tests/psicologia.test.cjs`
Expected: `tests 26`, `pass 6`, `fail 20`.

- [ ] **Step 4: Editar `psicologia/index.html`**

Coloque o rastreamento antes das fontes. Troque:

<!-- edit: psicologia/index.html -->
```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
```

Por:

```html
  <script id="tracking-head">
  // Mesmo rastreamento da LP principal (index.html): ao mudar um, revise o outro.
  // Atribuição: guarda UTMs e IDs de clique (Google/Meta) para enviar junto com o lead.
  (function () {
    var chaves = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid"];
    var params = new URLSearchParams(window.location.search);
    var atribuicao = {};
    try { atribuicao = JSON.parse(localStorage.getItem("unieuro_atribuicao") || "{}"); } catch (_) {}
    var nova = {};
    chaves.forEach(function (chave) {
      var valor = params.get(chave);
      if (valor) nova[chave] = valor;
    });
    if (Object.keys(nova).length) {
      nova.landing_page = window.location.href;
      nova.capturado_em = new Date().toISOString();
      atribuicao = nova;
      try { localStorage.setItem("unieuro_atribuicao", JSON.stringify(nova)); } catch (_) {}
    }
    window.__unieuroAtribuicao = atribuicao;
  })();

  // Consent Mode v2: negado até a escolha no banner (a escolha é a mesma da LP principal).
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  (function () {
    var escolha = null;
    try { escolha = localStorage.getItem("unieuro_cookies"); } catch (_) {}
    window.__cookiesEscolha = escolha;
    gtag("consent", "default", {
      ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
      analytics_storage: "denied", wait_for_update: 500
    });
    // Mantém o gclid na URL entre páginas mesmo sem cookies, para a atribuição não se perder.
    gtag("set", "url_passthrough", true);
    if (escolha === "all") {
      gtag("consent", "update", {
        ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted"
      });
    }
  })();

  // GTM, Pixel e Clarity. Desenvolvimento local fica sem telemetria externa.
  (function () {
    window.iniciarClarity = function () {};
    if (["localhost", "127.0.0.1", "::1", "[::1]"].indexOf(window.location.hostname) !== -1 || window.location.protocol === "file:") return;

    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-NJ3XR4DP');

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('consent', window.__cookiesEscolha === 'all' ? 'grant' : 'revoke');
    fbq('init', '1624374258784284');
    fbq('track', 'PageView');
    fbq('track', 'ViewContent', { content_name: 'Psicologia UNIEURO', content_category: 'Vestibular' });

    // Clarity usa cookies próprios: só carrega depois de "Aceitar todos".
    window.iniciarClarity = function () {
      if (window.__clarityIniciado) return;
      window.__clarityIniciado = true;
      setTimeout(function () {
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);
          t.async=1;
          t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];
          y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "wqlh8jst6p");
      }, 2000);
    };
    if (window.__cookiesEscolha === "all") window.addEventListener("load", window.iniciarClarity);
  })();
  </script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1624374258784284&ev=PageView&noscript=1" alt=""></noscript>
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://fonts.googleapis.com">
```

Adicione o `noscript` do GTM. Troque:

<!-- edit: psicologia/index.html -->
```html
<body>
```

Por:

```html
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NJ3XR4DP" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

Adicione o banner de cookies. Troque:

<!-- edit: psicologia/index.html -->
```html
</body>
```

Por:

```html
  <div id="cookie-banner" class="cookie-banner" role="dialog" aria-label="Preferências de cookies" hidden>
    <p>Usamos cookies para entender como o site é usado e melhorar sua experiência. Você pode aceitar todos ou só os essenciais.</p>
    <div class="cookie-acoes">
      <button type="button" class="cookie-todos" data-cookies="all">Aceitar todos</button>
      <button type="button" class="cookie-essenciais" data-cookies="essential">Apenas essenciais</button>
    </div>
  </div>
</body>
```

- [ ] **Step 5: Adicionar o estilo do banner ao fim de `psicologia/styles.css`**

<!-- append: psicologia/styles.css -->
```css

/* Banner de cookies: mesmo da LP principal, acima da barra de CTA mobile (25) */
.cookie-banner {
  position: fixed;
  left: 1rem; right: 1rem;
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  z-index: 10000;
  max-width: 26rem;
  padding: 1.1rem 1.15rem;
  border-radius: 1rem;
  background: #fff;
  color: #1f2937;
  border-top: 3px solid #ba9008;
  box-shadow: 0 24px 60px -16px rgba(0, 20, 45, .5);
  font-size: .875rem;
  line-height: 1.45;
}
.cookie-banner[hidden] { display: none; }
.cookie-banner p { margin: 0 0 .9rem; }
.cookie-banner .cookie-acoes { display: flex; gap: .6rem; flex-wrap: wrap; }
.cookie-banner button {
  flex: 1 1 8rem;
  min-height: 2.75rem;
  padding: .6rem 1rem;
  border-radius: 999px;
  font-family: inherit;
  font-weight: 700;
  font-size: .875rem;
  cursor: pointer;
  transition: background-color .2s ease, box-shadow .2s ease;
}
.cookie-banner .cookie-todos { background: #ba9008; color: #fff; border: 2px solid #ba9008; }
.cookie-banner .cookie-todos:hover { background: #a07b06; border-color: #a07b06; }
.cookie-banner .cookie-essenciais { background: #fff; color: #004181; border: 2px solid #004181; }
.cookie-banner .cookie-essenciais:hover { background: #eef4fb; }
.cookie-banner button:focus-visible { outline: 3px solid #004181; outline-offset: 2px; }
@media (min-width: 768px) { .cookie-banner { right: auto; left: 1.5rem; bottom: 1.5rem; } }
```

- [ ] **Step 6: Editar `psicologia/script.js`**

Adicione as constantes. Troque:

<!-- edit: psicologia/script.js -->
```js
  const CAMPUS = 'Asa Sul';
```

Por:

```js
  const CAMPUS = 'Asa Sul';
  const PIXEL_ID = '1624374258784284';
  const CHAVE_LEADS_CONVERTIDOS = 'unieuro_leads_convertidos';
```

Atualize o comentário, que deixaria de ser verdadeiro. Troque:

<!-- edit: psicologia/script.js -->
```js
  // Apenas dados de contexto: os eventos nunca recebem os valores dos campos.
```

Por:

```js
  // Apenas dados de contexto. Única exceção: user_data.phone_number no lead_submit, como na LP principal.
```

Adicione `campus`, que a tag GA4 lê no GTM. Troque:

<!-- edit: psicologia/script.js -->
```js
    const context = { event, curso: 'Psicologia', origem: source, campus_interesse: CAMPUS, campanha: CAMPAIGN, ...extra };
```

Por:

```js
    const context = { event, curso: 'Psicologia', origem: source, campus: CAMPUS, campus_interesse: CAMPUS, campanha: CAMPAIGN, ...extra };
```

Adicione os helpers de conversão. Troque:

<!-- edit: psicologia/script.js -->
```js
  function continueInPortal() {
```

Por:

```js
  // Conversão única e deduplicação: mesmas regras e mesma chave da LP principal.
  async function hashLead(texto) {
    try {
      const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
      return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (_) {
      return texto.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7).toString(16);
    }
  }
  function lerLeadsConvertidos() {
    try { return JSON.parse(localStorage.getItem(CHAVE_LEADS_CONVERTIDOS) || '[]'); } catch (_) { return []; }
  }
  function gerarEventId() {
    return (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function semAcento(texto) {
    return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
  function lerCookie(nome) {
    const m = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : '';
  }
  // fbc: cookie do Pixel ou, sem ele, montado com o fbclid da chegada (formato fb.1.<ms>.<fbclid>).
  function lerFbc() {
    const cookie = lerCookie('_fbc');
    if (cookie) return cookie;
    const a = window.__unieuroAtribuicao || {};
    return a.fbclid ? `fb.1.${Date.parse(a.capturado_em) || Date.now()}.${a.fbclid}` : '';
  }

  // Dispara a conversão no Pixel, Clarity e GTM (Google Ads/GA4). Resolve quando o GTM terminou
  // e o Pixel teve tempo de enviar (mínimo 400 ms), com limite de 1,5 s. Nunca rejeita.
  function registrarConversao(dados, eventId) {
    return new Promise(resolve => {
      let gtmPronto = false;
      let pixelPronto = false;
      const tentar = () => { if (gtmPronto && pixelPronto) resolve(); };
      setTimeout(() => { pixelPronto = true; tentar(); }, 400);
      setTimeout(resolve, 1500);
      try {
        if (typeof window.fbq === 'function') {
          // Correspondência avançada: o Pixel faz o hash (SHA-256) antes de enviar. CPF nunca entra aqui.
          const partes = semAcento(dados.nome).split(/\s+/).filter(Boolean);
          window.fbq('init', PIXEL_ID, {
            external_id: dados.external_id,
            ph: `55${dados.whatsapp_limpo}`,
            fn: partes[0] || '',
            ln: partes.slice(1).join(' ')
          });
          window.fbq('track', 'Lead', {
            content_name: 'Psicologia UNIEURO', content_category: 'Vestibular', origem: dados.origem, value: 1, currency: 'BRL'
          }, { eventID: eventId });
        }
      } catch (_) { /* Analytics não bloqueia a continuidade. */ }
      try {
        if (typeof window.clarity === 'function') {
          window.clarity('set', 'origem', dados.origem);
          window.clarity('set', 'campanha', dados.campanha);
        }
      } catch (_) { /* Analytics não bloqueia a continuidade. */ }
      try {
        track('lead_submit', {
          status_envio: 'sucesso',
          event_id: eventId,
          transaction_id: eventId,
          value: 1,
          currency: 'BRL',
          // Para conversões otimizadas do Google Ads (o GTM faz o hash antes de enviar).
          user_data: { phone_number: `+55${dados.whatsapp_limpo}` },
          eventCallback: () => { gtmPronto = true; tentar(); },
          eventTimeout: 1500
        });
      } catch (_) { resolve(); }
    });
  }

  function continueInPortal() {
```

Amplie o contrato do webhook. Troque:

<!-- edit: psicologia/script.js -->
```js
    const [name, phone, cpf] = fields.map(input => input.value.trim());
    // Curso/campus ficam na origem existente: nenhum campo novo no contrato.
    const payload = {
      origem: source, nome: name, whatsapp: phone,
      whatsapp_limpo: digits(phone), ddd: digits(phone).slice(0, 2),
      cpf, cpf_limpo: digits(cpf), campanha: CAMPAIGN,
      data: new Date().toLocaleString('pt-BR')
    };
```

Por:

```js
    const [name, phone, cpf] = fields.map(input => input.value.trim());
    const eventId = gerarEventId();
    const idLead = await hashLead(digits(cpf));
    const leads = lerLeadsConvertidos();
    const jaConvertido = leads.includes(idLead);
    // Mesmo contrato da LP principal. Curso/campus seguem na origem existente.
    // conversao_unica=false: lead repetido, o n8n NÃO deve enviar Lead ao Meta.
    const payload = {
      origem: source, nome: name, whatsapp: phone,
      whatsapp_limpo: digits(phone), ddd: digits(phone).slice(0, 2),
      cpf, cpf_limpo: digits(cpf), campanha: CAMPAIGN,
      data: new Date().toLocaleString('pt-BR'),
      pagina: window.location.href,
      event_id: eventId,
      ...(window.__unieuroAtribuicao || {}),
      external_id: idLead,
      conversao_unica: !jaConvertido,
      fbp: lerCookie('_fbp'),
      fbc: lerFbc(),
      user_agent: navigator.userAgent,
      event_source_url: window.location.href,
      event_time: Math.floor(Date.now() / 1000),
      consentimento: window.__cookiesEscolha || 'nao_escolhido'
    };
```

Registre a conversão uma vez por CPF e espere GTM e Pixel antes de redirecionar. Troque:

<!-- edit: psicologia/script.js -->
```js
      sent = true;
      // Meta Lead e lead_submit somente após confirmação HTTP bem-sucedida.
      track('lead_submit', { status_envio: 'sucesso' });
      try {
        if (typeof window.fbq === 'function') window.fbq('track', 'Lead', {
          content_name: 'Psicologia UNIEURO', content_category: 'Vestibular', origem: source
        });
      } catch (_) { /* Analytics não bloqueia a continuidade. */ }
      fields.forEach(input => { input.value = ''; });
      status.textContent = 'Pré-cadastro enviado. Você continuará sua inscrição no portal.';
      status.classList.add('success');
      status.hidden = false;
      portalLink.hidden = false;
      submit.textContent = 'Continuar no portal';
      if (dialog.open) redirectTimer = setTimeout(continueInPortal, 900);
```

Por:

```js
      sent = true;
      fields.forEach(input => { input.value = ''; });
      status.textContent = 'Pré-cadastro enviado. Você continuará sua inscrição no portal.';
      status.classList.add('success');
      status.hidden = false;
      portalLink.hidden = false;
      submit.textContent = 'Continuar no portal';
      // Meta Lead e lead_submit somente após confirmação HTTP bem-sucedida e uma vez por CPF.
      if (jaConvertido) {
        track('lead_duplicado');
      } else {
        try { localStorage.setItem(CHAVE_LEADS_CONVERTIDOS, JSON.stringify([...leads, idLead].slice(-20))); } catch (_) { /* Sem storage, segue. */ }
        await registrarConversao(payload, eventId);
      }
      if (dialog.open) redirectTimer = setTimeout(continueInPortal, 900);
```

Use o nome de evento da LP principal. Troque:

<!-- edit: psicologia/script.js -->
```js
      track('lead_submit_error', { status_envio: 'nao_confirmado' });
```

Por:

```js
      track('lead_erro_envio', { status_envio: 'nao_confirmado' });
```

O carregador antigo sai, porque o `<head>` agora carrega tudo depois de declarar o consentimento. Troque:

<!-- edit: psicologia/script.js -->
```js
  // Mesmos identificadores do site principal; desenvolvimento local sem telemetria externa.
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname) || window.location.protocol === 'file:';
  if (local) return;
  function loadScript(src) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  if (!window.fbq) {
    const pixel = window.fbq = function () { pixel.callMethod ? pixel.callMethod.apply(pixel, arguments) : pixel.queue.push(arguments); };
    pixel.queue = []; pixel.loaded = true; pixel.version = '2.0'; window._fbq = pixel;
    pixel('init', '1624374258784284');
    pixel('track', 'PageView');
    pixel('track', 'ViewContent', { content_name: 'Psicologia UNIEURO', content_category: 'Vestibular' });
  }
  window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadScript('https://www.googletagmanager.com/gtm.js?id=GTM-NJ3XR4DP');
      loadScript('https://connect.facebook.net/en_US/fbevents.js');
      loadScript('https://www.clarity.ms/tag/wqlh8jst6p');
    }, 1600);
  }, { once: true });
```

Por:

```js
  // Cliques no WhatsApp viram evento para GTM (GA4/Google Ads) e Meta, como na LP principal.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href*="wa.me"]');
    if (!link) return;
    track('whatsapp_click', { link_url: link.href });
    try { if (typeof window.fbq === 'function') window.fbq('track', 'Contact'); } catch (_) { /* Analytics não bloqueia o contato. */ }
  });

  // Banner de cookies: mesma chave e mesmo comportamento da LP principal.
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    if (!window.__cookiesEscolha) banner.hidden = false;
    banner.addEventListener('click', event => {
      const botao = event.target.closest('[data-cookies]');
      if (!botao) return;
      const escolha = botao.getAttribute('data-cookies');
      const ok = escolha === 'all';
      try { localStorage.setItem('unieuro_cookies', escolha); } catch (_) { /* Sem storage, vale só nesta visita. */ }
      window.__cookiesEscolha = escolha;
      const estado = ok ? 'granted' : 'denied';
      window.gtag('consent', 'update', { ad_storage: estado, ad_user_data: estado, ad_personalization: estado, analytics_storage: estado });
      if (typeof window.fbq === 'function') window.fbq('consent', ok ? 'grant' : 'revoke');
      if (ok) window.iniciarClarity();
      window.dataLayer.push({ event: 'cookie_consent', consentimento: escolha });
      banner.hidden = true;
    });
  }
```

- [ ] **Step 7: Rodar os testes e confirmar que passam**

Run: `node --test tests/psicologia.test.cjs`
Expected: `tests 26`, `pass 26`, `fail 0`.

- [ ] **Step 8: Criar `.vercelignore` para o plano não ser publicado**

<!-- write: .vercelignore -->
```text
docs/
```

- [ ] **Step 9: Conferir no localhost**

Run: `python -m http.server 8099` na raiz do repositório, se o servidor já não estiver no ar. Abra `http://localhost:8099/psicologia/`.

Expected:
- O banner aparece no desktop e não cobre o CTA principal.
- "Aceitar todos" fecha o banner e, depois de recarregar, ele não volta.
- Nenhuma requisição sai para `googletagmanager.com`, `facebook.net` ou `clarity.ms`.

Em 400 px, confira o banner acima da barra de CTA. Na sessão anterior o redimensionamento da janela não mudou o layout. Se isso se repetir, peça ao André para conferir no celular e registre que Claude não verificou o mobile.

Limpe a escolha ao terminar: `localStorage.removeItem('unieuro_cookies')`.

- [ ] **Step 10: Comitar**

```bash
git add tests/psicologia.test.cjs psicologia/index.html psicologia/script.js psicologia/styles.css .vercelignore docs/superpowers/plans/2026-11-04-rastreamento-psicologia.md
git commit -m "Iguala o rastreamento da LP de Psicologia ao da LP principal" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: PR, aprovação e deploy

**Files:** nenhum.

**Interfaces:**
- Consumes: branch `tracking-psicologia` da Task 1.
- Produces: `/psicologia` em produção com `<script id="tracking-head">`. As Tasks 3 a 6 testam contra esse deploy.

- [ ] **Step 1: Abrir o PR**

```bash
git push -u origin tracking-psicologia
gh pr create --base main --title "Visual e rastreamento da LP de Psicologia" --body "$(cat <<'EOF'
Redesenha o visual da LP de Psicologia e iguala o rastreamento ao da LP principal: Consent Mode, banner de cookies, conversão única por CPF, valor e deduplicação no lead_submit, Pixel com eventID e captura de UTM e gclid.

Testes: `node --test tests/psicologia.test.cjs`, 26 passando.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: Parar e pedir o OK do André**

Mostre o link do PR e `http://localhost:8099/psicologia/`. Não faça merge sem o OK, porque o merge publica o visual novo em produção.

- [ ] **Step 3: Fazer o merge**

Run: `gh pr merge --merge`
O repositório usa merge commit, como no PR #1.

- [ ] **Step 4: Confirmar o deploy**

Depois que a Vercel terminar, rode:

```bash
node -e "fetch('https://www.vestibulareuro.com.br/psicologia').then(r=>r.text()).then(h=>{process.exitCode=h.includes('tracking-head')?0:1})"; echo "html=$?"
curl -s -o /dev/null -w "plano=%{http_code}\n" https://www.vestibulareuro.com.br/docs/superpowers/plans/2026-11-04-rastreamento-psicologia.md
```

Expected: `html=0` e `plano=404`.

Rollback, se a página quebrar: `git revert -m 1 <commit do merge>`, seguido de PR.

---

### Task 3: GTM

**Files:** nenhum no repositório. Container `GTM-NJ3XR4DP`.

**Interfaces:**
- Consumes: `lead_submit` e a variável `{{curso}}`.
- Produces: evento GA4 `lead_psicologia`, usado pelas Tasks 4 e 6.

- [ ] **Step 1: Conferir o ponto de partida**

Abra o container em `tagmanager.google.com`, com `andre@gitguard.com.br`.
Expected: versão publicada 6 e nenhuma alteração pendente no workspace. Se houver alteração pendente, pare e pergunte ao André, porque publicar levaria junto o trabalho de outra pessoa.

- [ ] **Step 2: Corrigir a regra de `lead_medicina`**

No acionador usado pela tag GA4 `lead_medicina`, troque a condição `curso contém medicina` por `curso é igual a medicina`.

- [ ] **Step 3: Criar o acionador de Psicologia**

- Tipo: Evento personalizado.
- Nome do evento: `lead_submit`.
- Disparar em: alguns eventos personalizados, com `curso` `é igual a` `Psicologia`.
- Nome: `CE - lead_submit - Psicologia`.

- [ ] **Step 4: Criar a tag `lead_psicologia`**

Copie a tag GA4 de `lead_medicina` e altere:

- Nome da tag: `GA4 - lead_psicologia`.
- Nome do evento: `lead_psicologia`.
- Acionador: `CE - lead_submit - Psicologia`.
- Parâmetros adicionais: `value={{value}}`, `currency={{currency}}` e `transaction_id={{event_id}}`, iguais aos da tag `generate_lead`.

Mantenha os parâmetros copiados: `content_name`, `content_category`, `form_origin`, `ingresso`, `modalidade` e `curso`.

- [ ] **Step 5: Testar no Preview**

Conecte o Tag Assistant a `https://www.vestibulareuro.com.br/psicologia` e, na aba conectada, rode um evento por vez:

```js
window.dataLayer.push({ event: 'lead_submit', curso: 'Psicologia', campus: 'Asa Sul', origem: 'TESTE PREVIEW', event_id: 'teste-preview-psi', transaction_id: 'teste-preview-psi', value: 1, currency: 'BRL' });
window.dataLayer.push({ event: 'lead_submit', curso: 'Biomedicina', origem: 'TESTE PREVIEW', event_id: 'teste-preview-bio', transaction_id: 'teste-preview-bio', value: 1, currency: 'BRL' });
window.dataLayer.push({ event: 'lead_submit', curso: 'medicina', origem: 'TESTE PREVIEW', event_id: 'teste-preview-med', transaction_id: 'teste-preview-med', value: 1, currency: 'BRL' });
```

Expected:

| `curso` | `generate_lead` | Ads | `lead_psicologia` | `lead_medicina` |
|---|---|---|---|---|
| `Psicologia` | dispara | dispara | dispara | não |
| `Biomedicina` | dispara | dispara | não | não |
| `medicina` | dispara | dispara | não | dispara |

As tags disparam de verdade no Preview. Como não há clique de anúncio, o Ads não atribui esses eventos a nenhuma campanha. Por isso, não repita o teste além do necessário.

- [ ] **Step 6: Publicar**

Nome da versão: `Psicologia: lead_psicologia e correção da regra de medicina`.
Rollback: em Versões, publique de novo a versão 6.

- [ ] **Step 7: Confirmar a publicação**

Run:

```bash
node -e "fetch('https://www.googletagmanager.com/gtm.js?id=GTM-NJ3XR4DP').then(r=>r.text()).then(s=>{process.exitCode=s.includes('lead_psicologia')?0:1})"; echo "gtm=$?"
```

Expected: `gtm=0`.

---

### Task 4: GA4

**Files:** nenhum no repositório. Propriedade `Vestibular Euro`.

**Interfaces:**
- Consumes: evento `lead_psicologia` da Task 3.
- Produces: evento principal importável pelo Ads na Task 6.

- [ ] **Step 1: Criar o evento principal**

Em `https://analytics.google.com/analytics/web/#/a394062067p536778901/admin`, abra Eventos principais e crie `lead_psicologia`, escrito exatamente assim.

- [ ] **Step 2: Conferir os demais**

Expected: `generate_lead` e `lead_psicologia` marcados como principais. Se `lead_medicina` não estiver marcado, marque, porque a Task 6 precisa dele.

---

### Task 5: Validação em produção

**Files:** nenhum.

**Interfaces:**
- Consumes: Tasks 2, 3 e 4.
- Produces: `lead_psicologia` recebido em uso normal, sem Preview, para o GA4 oferecê-lo ao Ads.

- [ ] **Step 1: Testar sem escolha de cookies**

Em `https://www.vestibulareuro.com.br/psicologia`, rode `localStorage.removeItem('unieuro_cookies')`, recarregue e rode:

```js
({
  consentDefault: Array.from(dataLayer).find(e => e[0] === 'consent' && e[1] === 'default')?.[2],
  bannerVisivel: !document.getElementById('cookie-banner').hidden,
  gtm: !!document.querySelector('script[src*="gtm.js?id=GTM-NJ3XR4DP"]'),
  pixel: !!document.querySelector('script[src*="fbevents.js"]'),
  clarity: !!document.querySelector('script[src*="clarity.ms"]')
})
```

Expected: `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage` em `denied`; `bannerVisivel`, `gtm` e `pixel` verdadeiros; `clarity` falso. Nas requisições, `g/collect` traz `tid=G-ZEH3B57GG9` e `gcs=G100`.

- [ ] **Step 2: Testar "Apenas essenciais"**

Clique no botão e recarregue.
Expected: `localStorage.unieuro_cookies` igual a `essential`, banner oculto e Clarity não carregado.

- [ ] **Step 3: Testar "Aceitar todos"**

Rode `localStorage.removeItem('unieuro_cookies')`, recarregue, clique em "Aceitar todos" e espere 3 s.
Expected: `localStorage.unieuro_cookies` igual a `all`, evento `cookie_consent` no `dataLayer`, Clarity carregado e novas requisições `g/collect` com `gcs=G111`. Depois de recarregar, o banner continua oculto.

- [ ] **Step 4: Testar os CTAs**

Clique em "Inscreva-se" no hero, rode o código abaixo e feche o formulário sem enviar:

```js
Array.from(dataLayer).filter(e => ['cta_click', 'form_open'].includes(e.event)).map(({ event, curso, campus, origem }) => ({ event, curso, campus, origem }))
```

Expected: `cta_click` e `form_open` com `curso: 'Psicologia'`, `campus: 'Asa Sul'` e `origem` no formato `Psicologia | Asa Sul | <local do botão>`.

- [ ] **Step 5: Pedir o envio real ao André**

Fora do Preview, com "Aceitar todos" já escolhido, o André abre `/psicologia` e envia o formulário com o nome `TESTE TRACKING`, o próprio WhatsApp e um CPF válido que ele não tenha usado neste navegador.

Esse envio chega ao n8n como lead real, conta `Lead` no Meta e `generate_lead` no GA4. O André avisa o time e apaga o lead de teste depois.

Expected na tela: mensagem de sucesso e redirecionamento para `https://portal.apprbs.com.br/unieuro-grad` em cerca de 1 s.

- [ ] **Step 6: Conferir o envio**

| Onde | Esperado |
|---|---|
| GA4, Tempo real | `generate_lead` e `lead_psicologia` |
| Meta, Gerenciador de Eventos | `Lead` do Pixel `1624374258784284` com `event_id` |
| n8n, conferido pelo André | `event_id` preenchido, `conversao_unica: true`, `consentimento: all` |
| `/psicologia`, `localStorage.unieuro_leads_convertidos` | Um hash a mais, sem CPF em texto |

---

### Task 6: Google Ads e relatório

**Files:** nenhum no repositório. Conta `305-001-4168`.

**Interfaces:**
- Consumes: eventos principais do GA4 da Task 4 e o envio real da Task 5.
- Produces: conversões das duas LPs disponíveis para as campanhas.

- [ ] **Step 1: Pedir a liberação do domínio**

O Chrome negou a leitura de `ads.google.com` em 2026-11-04. Peça ao André para liberar o domínio na extensão e confirme que a conta aberta é `305-001-4168`.

- [ ] **Step 2: Ler a tabela de conversões**

Em Metas, Conversões, Resumo, registre para cada ação: nome, origem, primária ou secundária, contagem e status. Registre também se alguma campanha usa meta específica.

- [ ] **Step 3: Aplicar o estado correto**

| Ação | Estado correto | Se estiver diferente |
|---|---|---|
| `Lead - Site Vestibular` (tag GTM) | Ativa e primária | Corrigir |
| `generate_lead` importada do GA4, se existir | Secundária | Mudar para secundária, porque o mesmo lead já conta na tag |
| `lead_medicina` importada do GA4 | Existe e é secundária | Importar ou mudar para secundária |
| `lead_psicologia` importada do GA4 | Existe e é secundária | Importar em Nova ação, Importar, Google Analytics 4, Web |
| Qualquer outra ação primária da mesma categoria | Sem alteração | Relatar ao André e não mudar |
| Contagem de qualquer ação | Sem alteração | Relatar ao André se `Lead - Site Vestibular` não estiver em "Uma" |

Se o GA4 ainda não oferecer `lead_psicologia`, pare e retome depois. O evento novo pode levar um ou dois dias para aparecer. Avise o André que esta é a única pendência.

- [ ] **Step 4: Conferir**

Expected: `Lead - Site Vestibular` é a única primária entre as ações de lead do site, salvo as relatadas no Step 3, e `lead_psicologia` e `lead_medicina` aparecem como secundárias. Status "Sem conversões recentes" é aceitável, porque o teste não veio de clique de anúncio.

- [ ] **Step 5: Relatar e limpar**

Relate ao André, com evidência de cada item:

- O que foi verificado e o que não foi, inclusive mobile e n8n.
- O aviso "Não há anúncios sendo veiculados".
- A observação sobre `/medicina`: `lead_submit` antes da confirmação do webhook e sem `value` nem `event_id`.
- A confirmação de que o lead `TESTE TRACKING` foi apagado.

Derrube o servidor local na porta 8099 e feche as abas abertas por Claude.
