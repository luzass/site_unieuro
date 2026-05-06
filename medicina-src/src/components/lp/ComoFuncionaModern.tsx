import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CtaButton } from "./CtaButton";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";

const etapas = [
  {
    number: "01",
    title: "VOCÊ SOLICITA A ANÁLISE",
    text: "Preenche o formulário aqui na página com seus dados e a instituição de origem. Em até 48h úteis, a coordenação entra em contato pelo WhatsApp.",
  },
  {
    number: "02",
    title: "ENVIA O HISTÓRICO",
    text: "Você compartilha o histórico escolar e as ementas das disciplinas já cursadas. Nossa equipe conduz toda a análise de equivalência curricular.",
  },
  {
    number: "03",
    title: "RECEBE O PARECER",
    text: "Em poucos dias, você recebe o parecer detalhado: quais disciplinas serão aproveitadas e em qual semestre você ingressa no Unieuro.",
  },
  {
    number: "04",
    title: "FAZ A MATRÍCULA",
    text: "Com a documentação aprovada, você efetiva a matrícula e começa as aulas no semestre 2026.2 no campus Asa Sul.",
  },
];

export function ComoFuncionaModern() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <Reveal direction="up" className="text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[2px] text-badge-red">
            COMO FUNCIONA
          </span>
          <div className="mx-auto h-[2px] w-12 bg-gold" />
          <h2 className="mt-6 font-display text-[26px] sm:text-[30px] md:text-[36px] lg:text-[42px] leading-tight text-navy">
            Uma transferência sem burocracia em 4 etapas.
          </h2>
          <p className="mx-auto mt-6 max-w-[720px] text-[17px] font-medium leading-[1.6] text-gray-600">
            Da solicitação inicial até a sua primeira aula no Unieuro. Tudo conduzido pela nossa coordenação, com clareza em cada etapa.
          </p>
        </Reveal>

        {/* Grid de Etapas */}
        <RevealStagger className="mt-16 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {etapas.map((etapa, index) => (
            <RevealItem key={index}>
              <article
                className="group relative rounded-[6px] bg-offwhite p-7 transition-all duration-200 hover:shadow-md h-full will-change-transform"
              >
                <div className="font-display text-[56px] font-[900] leading-none text-gold opacity-90">
                  {etapa.number}
                </div>
                <h3 className="mt-4 font-sans text-[18px] font-bold uppercase tracking-[0.5px] text-navy">
                  {etapa.title}
                </h3>
                <p className="mt-3 font-sans text-[14px] leading-[1.6] text-navy-soft">
                  {etapa.text}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>

        {/* Bloco de Informação Adicional */}
        <div className="mt-12 flex flex-col items-center">
          <Reveal direction="scale" delay={0.3} className="w-full max-w-[720px] rounded-[6px] bg-navy p-8 text-center">
            <Clock size={32} className="mx-auto text-gold" />
            <h3 className="mt-4 font-display text-[22px] uppercase text-white">
              INSCRIÇÕES ATÉ 30 DE JULHO
            </h3>
            <p className="mx-auto mt-3 max-w-[480px] font-sans text-[15px] text-[#C9C9C9]">
              São aproximadamente 20 vagas de transferência externa para o semestre 2026.2. Quanto antes você solicita a análise, maior a chance de garantir sua vaga.
            </p>
          </Reveal>

          {/* CTA Secundário */}
          <Reveal direction="up" delay={0.4} className="mt-8">
            <CtaButton source="como-funciona" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
