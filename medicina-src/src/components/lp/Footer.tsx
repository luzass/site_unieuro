import logoOficial from "@/assets/logo-unieuro-oficial.png";
import { Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <>
      <footer className="bg-black py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            {/* Logo - Esquerda */}
            <div className="flex justify-center md:justify-start">
              <img
                src={logoOficial}
                alt="Unieuro Centro Universitário"
                className="h-16 w-auto"
                width="240"
                height="64"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Redes Sociais - Centro */}
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://www.facebook.com/unieuronarede"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A1A1A] transition-colors hover:bg-[#2A2A2A]"
              >
                <Facebook size={18} className="text-white" fill="white" strokeWidth={0} />
              </a>
              <a
                href="https://www.instagram.com/unieuro_oficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A1A1A] transition-colors hover:bg-[#2A2A2A]"
              >
                <Instagram size={18} className="text-white" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCtV17kCGS6rCvnqFyUgl1vw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A1A1A] transition-colors hover:bg-[#2A2A2A]"
              >
                <Youtube size={18} className="text-white" fill="white" strokeWidth={0} />
              </a>
            </div>

            {/* WhatsApp - Direita */}
            <div className="flex justify-center md:justify-end">
              <div className="text-center md:text-right">
                <div className="font-sans text-xl font-bold text-white">Whatsapp</div>
                <a
                  href="https://wa.me/556134455800"
                  className="font-sans text-sm text-white/80 transition-colors hover:text-white"
                >
                  (61) 3445-5800
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}
