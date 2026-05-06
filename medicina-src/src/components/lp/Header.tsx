import logoUnieuro from "@/assets/logo-unieuro.png";
import { Button } from "@/components/ui/button";

function scrollToForm() {
  const el =
    document.getElementById("formulario-hero") ??
    document.getElementById("formulario-final");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const input = el.querySelector<HTMLInputElement>("input[name='nome']");
    setTimeout(() => input?.focus({ preventScroll: true }), 700);
  }
}

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#000000] text-white shadow-elegant">
      <div className="container-lp flex h-16 items-center justify-center md:h-20">
        <a href="#topo" className="flex items-center" aria-label="Unieuro Medicina">
          <img
            src={logoUnieuro}
            alt="Unieuro"
            className="h-10 w-auto md:h-12"
            loading="lazy"
            decoding="async"
          />
        </a>
      </div>
    </header>
  );
}
