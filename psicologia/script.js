/* Mantém o contrato do pré-cadastro da página principal. */
(() => {
  'use strict';
  const WEBHOOK = 'https://casa-oceano-n8n.cj1us3.easypanel.host/webhook/inscr_vest_euro_2026';
  const PORTAL = 'https://portal.apprbs.com.br/unieuro-grad';
  const CAMPAIGN = 'Vestibular Unieuro 2026';
  const dialog = document.getElementById('inscricao');
  const form = document.getElementById('form-inscricao');
  const submit = document.getElementById('enviar-inscricao');
  const status = document.getElementById('form-status');
  const portalLink = document.getElementById('continuar-portal');
  const fields = ['nome', 'whatsapp', 'cpf'].map(id => document.getElementById(id));
  const mobileBar = document.querySelector('.mobile-cta');
  let source = 'Página Psicologia';
  let campus = '';
  let opener = null;
  let submitting = false;
  let sent = false;
  let redirectTimer;

  // Apenas dados de contexto: os eventos nunca recebem os valores dos campos.
  function track(event, extra = {}) {
    const context = { event, curso: 'Psicologia', origem: source, campus_interesse: campus || 'A definir', campanha: CAMPAIGN, ...extra };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(context);
    try { if (typeof window.clarity === 'function') window.clarity('event', event); } catch (_) { /* Analytics não bloqueia a inscrição. */ }
  }

  function clearFeedback() {
    status.hidden = true;
    status.textContent = '';
    status.classList.remove('success');
    portalLink.hidden = true;
    fields.forEach(input => {
      input.removeAttribute('aria-invalid');
      document.getElementById(`${input.id}-erro`).textContent = '';
    });
  }

  document.querySelectorAll('[data-inscricao]').forEach(button => {
    button.addEventListener('click', () => {
      if (submitting) return;
      source = `Psicologia | ${button.dataset.campus || 'Campus a definir'} | ${button.dataset.inscricao}`;
      campus = button.dataset.campus || '';
      track('cta_click');
      opener = button;
      clearTimeout(redirectTimer);
      clearFeedback();
      document.getElementById('campus-interesse').textContent = campus ? `· Interesse: ${campus}` : '';
      if (sent) {
        status.textContent = 'Pré-cadastro enviado. Continue sua inscrição no portal.';
        status.classList.add('success');
        status.hidden = false;
        portalLink.hidden = false;
      }
      dialog.showModal();
      document.body.classList.add('modal-open');
      track('form_open');
      (sent ? portalLink : fields[0]).focus();
    });
  });

  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    clearTimeout(redirectTimer);
    document.body.classList.remove('modal-open');
    if (opener) opener.focus({ preventScroll: true });
  });

  const digits = value => value.replace(/\D/g, '');
  fields[1].addEventListener('input', event => {
    const value = digits(event.target.value).slice(0, 11);
    event.target.value = value.length > 6
      ? `(${value.slice(0, 2)}) ${value.slice(2, value.length > 10 ? 7 : 6)}-${value.slice(value.length > 10 ? 7 : 6)}`
      : value.length > 2 ? `(${value.slice(0, 2)}) ${value.slice(2)}` : value;
  });
  fields[2].addEventListener('input', event => {
    event.target.value = digits(event.target.value).slice(0, 11)
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  });
  fields.forEach(input => input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    document.getElementById(`${input.id}-erro`).textContent = '';
  }));

  function validCPF(value) {
    const cpf = digits(value);
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    return [9, 10].every(length => {
      let sum = 0;
      for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i);
      return ((sum * 10) % 11) % 10 === Number(cpf[length]);
    });
  }
  const validDDDs = new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '));

  function validate() {
    const [name, phone, cpf] = fields.map(input => input.value.trim());
    const errors = [
      name.length >= 3 && /\S+\s+\S+/.test(name) ? '' : 'Informe seu nome completo.',
      /^\d{2}9\d{8}$/.test(digits(phone)) && validDDDs.has(digits(phone).slice(0, 2)) ? '' : 'Informe um WhatsApp válido com DDD.',
      validCPF(cpf) ? '' : 'Verifique os números do seu CPF.'
    ];
    errors.forEach((error, i) => {
      if (error) fields[i].setAttribute('aria-invalid', 'true');
      document.getElementById(`${fields[i].id}-erro`).textContent = error;
    });
    const firstError = errors.findIndex(Boolean);
    if (firstError !== -1) fields[firstError].focus();
    return firstError === -1;
  }

  function continueInPortal() {
    track('registration_continue');
    window.location.assign(PORTAL);
  }
  portalLink.addEventListener('click', () => track('registration_continue', { status_envio: sent ? 'sucesso' : 'nao_confirmado' }));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    if (sent) { continueInPortal(); return; }
    clearFeedback();
    if (!validate()) return;
    submitting = true;
    submit.disabled = true;
    submit.textContent = 'Enviando pré-cadastro…';
    form.setAttribute('aria-busy', 'true');
    fields.forEach(input => { input.readOnly = true; });
    track('pre_registration_submit');
    const [name, phone, cpf] = fields.map(input => input.value.trim());
    // Curso/campus ficam na origem existente: nenhum campo novo no contrato.
    const payload = {
      origem: source, nome: name, whatsapp: phone,
      whatsapp_limpo: digits(phone), ddd: digits(phone).slice(0, 2),
      cpf, cpf_limpo: digits(cpf), campanha: CAMPAIGN,
      data: new Date().toLocaleString('pt-BR')
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      if (!response.ok) throw new Error('Envio não confirmado');
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
    } catch (_) {
      track('lead_submit_error', { status_envio: 'nao_confirmado' });
      status.textContent = 'Não conseguimos confirmar o envio do seu pré-cadastro. Você pode tentar novamente ou continuar diretamente no portal.';
      status.hidden = false;
      portalLink.hidden = false;
      submit.textContent = 'Tentar novamente';
      if (dialog.open) status.focus();
    } finally {
      clearTimeout(timeout);
      submitting = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      fields.forEach(input => { input.readOnly = false; });
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      mobileBar.hidden = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(document.querySelector('.hero'));
  }

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
})();
