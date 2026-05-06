import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CtaButton } from "./CtaButton";
import { Reveal } from "@/components/ui/reveal";

import estrutura1 from "@/assets/estrutura/frame1.jpg";
import estrutura2 from "@/assets/estrutura/frame2.jpg";
import estrutura3 from "@/assets/estrutura/frame3.jpg";
import estrutura4 from "@/assets/estrutura/frame4.jpg";
import estrutura5 from "@/assets/estrutura/frame5.jpg";

const slides = [
  { src: estrutura1, label: "Campus Asa Sul", caption: "Prédio exclusivo de Medicina" },
  { src: estrutura2, label: "Laboratório", caption: "Simulação realística com manequins de alta fidelidade" },
  { src: estrutura3, label: "Clínica-escola", caption: "Atendimento ambulatorial real desde os primeiros semestres" },
  { src: estrutura4, label: "Aula prática", caption: "Habilidades clínicas em ambiente preparado" },
  { src: estrutura5, label: "Biblioteca", caption: "Acervo físico e digital integrado" },
];

const itens = [
  "Laboratórios de simulação realística com manequins de alta fidelidade",
  "Laboratórios multidisciplinares de habilidades clínicas",
  "Clínica-escola e ambulatório próprios em Brasília",
  "Internato em rede hospitalar credenciada no Distrito Federal",
  "Atividades práticas em ambulatórios e unidades básicas de saúde",
  "Núcleo de pesquisa, extensão e ligas acadêmicas ativas",
];

export function EstruturaSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start",
      dragFree: false,
      duration: 25,
      skipSnaps: false,
    },
    [Autoplay({ 
      delay: 5500, 
      stopOnInteraction: false, 
      stopOnMouseEnter: true,
      stopOnFocusIn: true 
    })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  return (
    <section
      id="estrutura"
      className="bg-background py-16 md:py-24"
      aria-labelledby="estrutura-title"
    >
      <div className="container-lp px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Coluna esquerda: texto */}
          <Reveal direction="right" className="relative pl-6">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-px border-l border-dotted border-gold"
            />
            <span className="text-[12px] font-semibold uppercase tracking-[2px] text-badge-red">
              Estrutura
            </span>
            <h2 id="estrutura-title" className="mt-4 font-display text-[26px] sm:text-[30px] md:text-[36px] lg:text-[42px] leading-tight text-navy">
              Conheça o ambiente onde você vai estudar.
            </h2>
            <p className="mt-6 text-[16px] font-medium leading-[1.6] text-navy-soft md:text-[17px]">
              Estrutura pensada para garantir vivência clínica precoce, prática integrada e formação humanística sólida desde o primeiro semestre.
            </p>

            <ul className="mt-8 space-y-4">
              {itens.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground md:text-base">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-block h-2 w-2 flex-shrink-0 rotate-45 bg-gold"
                  />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <CtaButton source="estrutura" />
            </div>
          </Reveal>

          {/* Coluna direita: carrossel */}
          <Reveal direction="left" delay={0.15} className="relative">
            <div className="relative overflow-hidden rounded-[6px] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
              {/* Embla viewport */}
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                  {slides.map((slide, idx) => (
                    <div key={idx} className="relative min-w-0 flex-[0_0_100%]">
                      <div className="aspect-[4/3] w-full">
                        <img
                          src={slide.src}
                          alt={slide.caption}
                          width={1280}
                          height={960}
                          className="h-full w-full object-cover"
                          loading={idx === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </div>
                      {/* Overlay gradiente preto pra legibilidade da legenda */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 100%)"
                        }}
                        aria-hidden="true"
                      />
                      {/* Legenda */}
                      <div className="absolute bottom-6 left-6 right-6 border-l-2 border-gold pl-4 text-white">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                          {slide.label}
                        </div>
                        <div className="mt-1.5 font-display text-lg leading-tight md:text-xl">
                          {slide.caption}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Setas de navegação */}
              <button
                onClick={scrollPrev}
                aria-label="Imagem anterior"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-gold hover:text-navy"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Próxima imagem"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-gold hover:text-navy"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Dots indicadores */}
            <div className="mt-5 flex items-center justify-center gap-2.5">
              {scrollSnaps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  aria-label={`Ir para imagem ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === selectedIndex
                      ? "w-8 bg-gold"
                      : "w-1.5 bg-navy/25 hover:bg-navy/50"
                  }`}
                />
              ))}
            </div>

            {/* Texto de apoio sobre o carrossel */}
            <p className="mt-3 text-center text-[12px] font-medium text-muted-foreground">
              Imagens reais do campus Asa Sul
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
