/* Mantém o contrato do pré-cadastro da página principal. */
(() => {
  'use strict';
  const WEBHOOK = 'https://casa-oceano-n8n.cj1us3.easypanel.host/webhook/inscr_vest_euro_2026';
  const PORTAL = 'https://portal.apprbs.com.br/unieuro-grad';
  const CAMPAIGN = 'Vestibular Unieuro 2026';
  const CAMPUS = 'Asa Sul';
  const PIXEL_ID = '1624374258784284';
  const CHAVE_LEADS_CONVERTIDOS = 'unieuro_leads_convertidos';
  const dialog = document.getElementById('inscricao');
  const form = document.getElementById('form-inscricao');
  const submit = document.getElementById('enviar-inscricao');
  const status = document.getElementById('form-status');
  const portalLink = document.getElementById('continuar-portal');
  const fields = ['nome', 'whatsapp', 'cpf'].map(id => document.getElementById(id));
  const mobileBar = document.querySelector('.mobile-cta');
  let source = `Psicologia | ${CAMPUS} | Página`;
  let opener = null;
  let submitting = false;
  let sent = false;
  let redirectTimer;

  // Apenas dados de contexto. Única exceção: user_data.phone_number no lead_submit, como na LP principal.
  function track(event, extra = {}) {
    const context = { event, curso: 'Psicologia', origem: source, campus: CAMPUS, campus_interesse: CAMPUS, campanha: CAMPAIGN, ...extra };
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
      source = `Psicologia | ${CAMPUS} | ${button.dataset.inscricao}`;
      track('cta_click');
      opener = button;
      clearTimeout(redirectTimer);
      clearFeedback();
      document.getElementById('campus-interesse').textContent = `· ${CAMPUS}`;
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      if (!response.ok) throw new Error('Envio não confirmado');
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
    } catch (_) {
      track('lead_erro_envio', { status_envio: 'nao_confirmado' });
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
})();
