import { SectionHeading } from "./SectionHeading";
import { CtaButton } from "./CtaButton";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";

const numeros = [
  { v: "+25", l: "Anos do Centro Universitário Unieuro em Brasília" },
  { v: "+30", l: "Anos do Grupo Educacional Ceuma em ensino superior" },
  { v: "Asa Sul", l: "Prédio dedicado ao curso de Medicina" },
  { v: "DF", l: "Rede de hospitais e ambulatórios para prática clínica" },
];

export function ReconhecimentoSection() {
  return (
    <section
      id="reconhecimento"
      className="relative overflow-hidden bg-black-deep py-16 text-white md:py-24"
      aria-labelledby="reconhecimento-title"
    >
      <div className="absolute inset-y-0 left-6 hidden w-px border-l border-dotted border-gold md:block" />
      <div className="container-lp relative px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <SectionHeading
            invert
            align="center"
            eyebrow="Tradição"
            title="Mais de duas décadas formando profissionais em Brasília."
            className="[&_h2]:text-[26px] [&_h2]:sm:text-[30px] [&_h2]:md:text-[36px] [&_h2]:lg:text-[42px]"
            description="O Centro Universitário Unieuro é uma das instituições de referência do Distrito Federal, com tradição em ensino superior, infraestrutura ampla e excelência acadêmica."
          />
        </Reveal>

        <RevealStagger className="mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {numeros.map((n) => (
            <RevealItem key={n.l}>
              <div
                className="flex flex-col justify-center rounded-[4px] border border-gold/30 bg-navy p-7 text-center transition-all hover:border-gold hover:shadow-[0_8px_24px_rgba(201,169,97,0.15)] h-full will-change-transform"
              >
                <div className="font-display text-3xl font-[900] uppercase text-gold md:text-4xl whitespace-nowrap leading-none">
                  {n.v}
                </div>
                <div className="mt-3 text-sm font-medium leading-relaxed text-white/80">
                  {n.l}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-white/10 pt-10 text-center">
          <Reveal direction="up" delay={0.1}>
            <span className="inline-flex items-center gap-2 rounded-[4px] bg-badge-red px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_4px_12px_rgba(200,36,44,0.4)]">
              Vagas limitadas
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.2}>
            <p className="max-w-xl text-sm font-medium text-white/75">
              São aproximadamente 20 vagas para transferência externa em 2026.2. As inscrições seguem por ordem de chegada até 30 de julho.
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.3} className="mt-10">
            <CtaButton source="reconhecimento" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
