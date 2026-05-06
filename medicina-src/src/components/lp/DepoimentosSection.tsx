import { SectionHeading } from "./SectionHeading";
import { CtaButton } from "./CtaButton";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";

const depoimentos = [
  {
    nome: "Rafaela M.",
    contexto: "Transferência externa · 5º semestre",
    texto:
      "A análise curricular foi rápida e justa. Consegui dar continuidade ao curso sem perder semestres e a recepção da coordenação fez toda a diferença.",
  },
  {
    nome: "Lucas P.",
    contexto: "Transferência externa · 7º semestre",
    texto:
      "A estrutura prática do Unieuro me surpreendeu. Os laboratórios de simulação e o internato em rede pública trazem uma vivência clínica muito sólida.",
  },
  {
    nome: "Beatriz A.",
    contexto: "Ingresso por vestibular",
    texto:
      "Encontrei um corpo docente próximo do aluno e um ambiente acadêmico sério. Recomendo para quem busca formação médica completa em Brasília.",
  },
];

export function DepoimentosSection() {
  return (
    <section
      id="depoimentos"
      className="bg-gradient-to-b from-offwhite to-white py-16 md:py-24"
      aria-labelledby="depoimentos-title"
    >
      <div className="container-lp px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <SectionHeading
            eyebrow="Depoimentos"
            title="O que dizem nossos alunos"
            description="Estudantes que escolheram o Unieuro para iniciar ou continuar a graduação em Medicina."
          />
        </Reveal>

        <RevealStagger className="mt-12 grid gap-4 sm:gap-6 md:grid-cols-3">
          {depoimentos.map((d) => (
            <RevealItem key={d.nome} className="h-full">
              <figure
                className="relative flex h-full flex-col rounded-[4px] border-t-[3px] border-gold bg-white p-7 shadow-[0_8px_24px_rgba(14,34,64,0.08)] will-change-transform"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-6 left-0 w-px border-l border-dotted border-gold"
                />
                <div
                  aria-hidden="true"
                  className="font-display text-5xl font-[900] leading-none text-gold/70"
                >
                  “
                </div>
                <blockquote className="mt-2 flex-1 text-sm font-medium leading-relaxed text-foreground md:text-[15px]">
                  {d.texto}
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <div className="font-sans text-sm font-semibold text-navy">
                    {d.nome}
                  </div>
                  <div className="text-xs text-muted-foreground">{d.contexto}</div>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal direction="up" delay={0.2} className="mt-14 flex justify-center">
          <CtaButton source="depoimentos" />
        </Reveal>
      </div>
    </section>
  );
}
