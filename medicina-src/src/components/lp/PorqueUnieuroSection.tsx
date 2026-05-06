import { useFadeIn } from "@/hooks/use-fade-in";
import { SectionHeading } from "./SectionHeading";

const pilares = [
  {
    n: "01",
    title: "Tradição institucional",
    desc: "Mais de quatro décadas formando profissionais de saúde no Distrito Federal, com reconhecimento consolidado no mercado.",
  },
  {
    n: "02",
    title: "Corpo docente clínico",
    desc: "Professores médicos com atuação em hospitais e ensino acadêmico, integrando teoria e prática desde os primeiros semestres.",
  },
  {
    n: "03",
    title: "Localização estratégica",
    desc: "Campus em Brasília, com acesso a uma das maiores redes de saúde pública e privada do país para internato e estágios.",
  },
  {
    n: "04",
    title: "Infraestrutura clínica",
    desc: "Laboratórios de habilidades, simulação realística, anatomia e biotério estruturados para o ensino médico contemporâneo.",
  },
];

export function PorqueUnieuroSection() {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <section
      id="porque"
      className="bg-background py-16 md:py-24"
      aria-labelledby="porque-title"
    >
      <div className="container-lp px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="fade-in-up">
          <SectionHeading
            eyebrow="Por que Unieuro"
            title="Uma escolha sólida para sua formação médica"
            className="[&_h2]:text-[26px] [&_h2]:sm:text-[30px] [&_h2]:md:text-[36px] [&_h2]:lg:text-[42px]"
            description="O Centro Universitário Unieuro reúne tradição, corpo docente qualificado e estrutura clínica para garantir a continuidade da sua graduação com excelência."
          />
        </div>

        <div className="mt-14 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pilares.map((p) => (
            <article
              key={p.n}
              className="relative pl-6"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-px border-l border-dotted border-gold"
              />
              <div className="font-display text-2xl text-gold">{p.n}</div>
              <h3 className="mt-3 font-sans text-lg font-semibold text-navy">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
