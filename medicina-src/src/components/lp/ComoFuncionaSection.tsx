import { useFadeIn } from "@/hooks/use-fade-in";
import { SectionHeading } from "./SectionHeading";

const passos = [
  {
    n: "1",
    title: "Solicite contato",
    desc: "Preencha o formulário desta página informando que você já cursa Medicina em outra instituição.",
  },
  {
    n: "2",
    title: "Envio de documentação",
    desc: "Nossa equipe orientará o envio do histórico, ementas das disciplinas cursadas e comprovantes acadêmicos.",
  },
  {
    n: "3",
    title: "Análise curricular",
    desc: "A coordenação realiza a análise individualizada de aproveitamento de disciplinas e indica o semestre de ingresso.",
  },
  {
    n: "4",
    title: "Matrícula e início",
    desc: "Confirmada a vaga, você efetiva a matrícula e dá continuidade à sua formação médica em Brasília.",
  },
];

export function ComoFuncionaSection() {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <section
      id="como-funciona"
      className="relative bg-offwhite py-16 md:py-24"
      aria-labelledby="como-title"
    >
      <div className="container-lp px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="fade-in-up">
          <SectionHeading
            eyebrow="Transferência externa"
            title="Como funciona o processo"
            description="Quatro etapas claras para você dar continuidade à sua graduação em Medicina sem perder tempo."
          />
        </div>

        <ol className="relative mt-14 grid gap-px overflow-hidden rounded-[4px] bg-border md:grid-cols-2 lg:grid-cols-4">
          {passos.map((p) => (
            <li
              key={p.n}
              className="relative bg-white p-7 md:p-8"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-6 left-0 w-px border-l border-dotted border-gold"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-navy font-display text-xl text-gold">
                {p.n}
              </div>
              <h3 className="mt-4 font-sans text-base font-semibold text-navy">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.desc}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Também aceitamos inscrições de candidatos via{" "}
          <span className="font-semibold text-navy">vestibular tradicional</span>.
          Indique sua situação no formulário.
        </p>
      </div>
    </section>
  );
}
