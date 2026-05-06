import heroImg from "@/assets/hero-medicina.jpg";
import { LeadForm } from "./LeadForm";

export function HeroSection() {
  return (
    <section
      id="topo"
      className="relative overflow-hidden bg-navy pb-16 pt-28 text-white md:pb-24 md:pt-36"
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: `url(${heroImg})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/80 to-navy"
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 left-6 hidden w-px border-l border-dotted border-gold md:block" />

      <div className="container-lp relative">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-[4px] border border-gold/40 bg-gold/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Transferência Externa Aberta
            </div>
            <h1
              id="hero-title"
              className="font-display text-4xl uppercase leading-[1.05] text-white md:text-5xl lg:text-6xl"
            >
              Continue sua graduação em{" "}
              <span className="text-gold">Medicina</span> no Unieuro Brasília
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/80 md:text-lg">
              Processo simplificado de transferência externa para alunos que já
              cursam Medicina em outras instituições.
            </p>

            <ul className="mt-8 grid max-w-xl gap-3 text-sm text-white/85 sm:grid-cols-2">
              {[
                "Instituição de referência em Brasília",
                "Análise curricular individualizada",
                "Estrutura clínica em Brasília",
                "Atendimento direto da coordenação",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <LeadForm
              id="formulario-hero"
              variant="dark"
              title="Garanta sua vaga"
              subtitle="Preencha e fale com a coordenação."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
