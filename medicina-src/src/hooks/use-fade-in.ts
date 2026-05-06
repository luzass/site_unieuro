import { useEffect, useRef } from "react";

/**
 * Hook otimizado para fade-in suave em viewport.
 * Aplica is-visible quando o elemento entra na tela e mantém visível.
 * Usa rAF para evitar layout thrashing e reduz threshold para reagir mais rápido.
 */
export function useFadeIn<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Se IntersectionObserver não existe (SSR ou browsers muito antigos), exibe imediatamente
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    // Se já está visível na carga inicial (viewport top), exibe imediatamente sem animar
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      requestAnimationFrame(() => {
        el.classList.add("is-visible");
      });
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              entry.target.classList.add("is-visible");
            });
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05, // Reduzido de 0.12 para 0.05 - dispara mais cedo
        rootMargin: "0px 0px 100px 0px", // Pré-carrega 100px antes de aparecer (era -40px)
      },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
