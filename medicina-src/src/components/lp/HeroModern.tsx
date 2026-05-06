import logoOficial from "@/assets/logo-unieuro-oficial.png";
import heroImg from "@/assets/hero-medicina.jpg";
// Simulando as versões responsivas (o usuário fará o upload ou eu criaria se tivesse as ferramentas)
const heroImgTablet = heroImg;
const heroImgMobile = heroImg;
import { LeadFormHero } from "./LeadFormHero";
import { Medal, Building2, Stethoscope } from "lucide-react";
import { CtaButton } from "./CtaButton";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function HeaderMinimal() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 50);
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className={`fixed inset-x-0 top-0 z-50 h-[72px] border-b transition-all duration-500 ${
        scrolled
          ? "border-gold/30 bg-black-deep/95 backdrop-blur-md"
          : "border-transparent bg-black-deep/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <img 
          src={logoOficial} 
          alt="Unieuro Centro Universitário" 
          className="h-12 w-auto" 
          width="180" 
          height="48"
          loading="eager"
          decoding="async"
        />
      </div>
    </motion.header>
  );
}

export function HeroModern() {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "0%"] : ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], isMobile ? [1, 1] : [1, 0.4]);

  return (
    <motion.section 
      ref={heroRef}
      className="relative overflow-hidden bg-black-deep pt-[72px] border-t-[3px] border-gold"
    >
      {/* Background Image with Overlay */}
      <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
        <picture>
          <source 
            media="(max-width: 768px)" 
            srcSet={heroImgMobile} 
            type="image/jpeg" 
          />
          <source 
            media="(max-width: 1280px)" 
            srcSet={heroImgTablet} 
            type="image/jpeg" 
          />
          <source 
            srcSet={heroImg} 
            type="image/jpeg" 
          />
          <img 
            src={heroImg} 
            alt="Estudante de Medicina em ambiente clínico do Unieuro" 
            className="h-full w-full object-cover opacity-50"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width="1920"
            height="1080"
          />
        </picture>
        <div 
          className="absolute inset-0" 
          style={{ 
            background: "linear-gradient(135deg, rgba(10,15,28,0.95) 0%, rgba(14,34,64,0.85) 50%, rgba(14,34,64,0.55) 100%)" 
          }} 
        />
      </motion.div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[6fr_4fr]">
          
          {/* Text Column - Removed Reveal to avoid delay */}
          <div className="relative pl-8 md:pl-10">
            {/* Vertical Dotted Line */}
            <div className="absolute inset-y-0 left-0 w-px border-l border-dotted border-gold" />
            
            <div className="inline-block rounded-[4px] bg-gold px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] text-navy">
              TRANSFERÊNCIA EXTERNA · 2026.2
            </div>

            <h1 className="mt-6 font-display text-[32px] leading-[1.1] text-white sm:text-[38px] md:text-[48px] lg:text-[56px]">
              Não comece sua Medicina do zero.
            </h1>

            <p className="mt-5 max-w-[540px] text-[15px] font-medium leading-[1.5] text-[#E8E8E8] sm:text-[16px] md:mt-6 md:text-[18px] lg:text-[20px]">
              Transfira para o Unieuro e aproveite as disciplinas que você já cursou. 
              Instituição de referência em Brasília, prédio dedicado na Asa Sul e clínica-escola própria.
            </p>

            <ul className="mt-8 flex flex-col gap-3.5 md:mt-10 md:gap-4">
              <li className="flex items-center gap-3">
                <Medal className="h-5 w-5 flex-shrink-0 text-gold md:h-6 md:w-6" strokeWidth={1.75} />
                <span className="text-[14px] font-semibold text-white md:text-[15px]">
                  Instituição de referência em Brasília
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Building2 className="h-5 w-5 flex-shrink-0 text-gold md:h-6 md:w-6" strokeWidth={1.75} />
                <span className="text-[14px] font-semibold text-white md:text-[15px]">
                  Prédio dedicado na Asa Sul
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 flex-shrink-0 text-gold md:h-6 md:w-6" strokeWidth={1.75} />
                <span className="text-[14px] font-semibold text-white md:text-[15px]">
                  Clínica-escola própria
                </span>
              </li>
            </ul>
          </div>

          {/* Form Column - Removed Reveal to avoid delay */}
          <div id="formulario-hero">
            <div className="rounded-[8px] bg-white p-5 sm:p-6 md:p-7 shadow-2xl will-change-transform">
              <div className="mb-5 space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-[1.5px] text-gold">
                  VAGAS LIMITADAS · 2026.2
                </span>
              </div>

              <LeadFormHero />
            </div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}
