/* Engajamento de leitura, igual nas 3 LPs (/, /medicina, /psicologia).
 * view_content: a pessoa chega a 50% da página (base da janela no meio do documento).
 * super_view_content: soma 30 s de leitura dentro da metade de baixo (>= 50%), com a aba visível.
 * Cada evento dispara uma vez por visita. Vai para GTM (GA4/Google Ads), Meta Pixel e Clarity. */
(function () {
  'use strict';
  var cfg = (document.currentScript && document.currentScript.dataset) || {};
  var base = { content_name: cfg.nome || document.title, content_category: cfg.categoria || 'Vestibular', curso: cfg.curso || '', campus: 'asa-sul', origem: 'engajamento' };
  var LIMITE = 0.5;
  var SEGUNDOS = 30;
  var viu = false;
  var superViu = false;
  var lidos = 0;
  var timer = null;

  function profundidade() {
    var doc = document.documentElement;
    var altura = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
    if (!altura) return 0;
    return (window.pageYOffset + window.innerHeight) / altura;
  }

  function disparar(evento, eventoMeta, customMeta) {
    var id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: evento, event_id: id, scroll_pct: Math.round(profundidade() * 100) }, base));
    try {
      if (typeof window.fbq === 'function') {
        var params = { content_name: base.content_name, content_category: base.content_category };
        window.fbq(customMeta ? 'trackCustom' : 'track', eventoMeta, params, { eventID: id });
      }
    } catch (_) { /* Analytics não quebra a página. */ }
    try { if (typeof window.clarity === 'function') window.clarity('event', evento); } catch (_) {}
  }

  function tick() {
    if (document.hidden || profundidade() < LIMITE) return;
    lidos += 1;
    if (lidos >= SEGUNDOS && !superViu) {
      superViu = true;
      clearInterval(timer);
      disparar('super_view_content', 'SuperViewContent', true);
    }
  }

  function checar() {
    if (viu || profundidade() < LIMITE) return;
    viu = true;
    window.removeEventListener('scroll', checar);
    disparar('view_content', 'ViewContent', false);
    // Relógio da leitura: conta só enquanto a pessoa está na metade de baixo com a aba aberta.
    timer = setInterval(tick, 1000);
  }

  window.addEventListener('scroll', checar, { passive: true });
  window.addEventListener('load', checar);
})();
