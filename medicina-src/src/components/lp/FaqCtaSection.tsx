import { SectionHeading } from "./SectionHeading";
import { LeadForm } from "./LeadForm";
import { CtaButton } from "./CtaButton";
import { Reveal } from "@/components/ui/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Quem pode pedir transferência externa para Medicina no Unieuro?",
    a: "Estudantes regularmente matriculados em curso de Medicina em outra instituição de ensino superior de referência, mediante análise curricular e disponibilidade de vagas.",
  },
  {
    q: "Quais documentos preciso enviar?",
    a: "Histórico escolar atualizado, ementas das disciplinas já cursadas, comprovante de matrícula vigente e documentos pessoais. A equipe enviará a lista completa após o contato.",
  },
  {
    q: "Como é feito o aproveitamento de disciplinas?",
    a: "A coordenação realiza análise individualizada, comparando ementa, carga horária e conteúdo programático com a matriz curricular do Unieuro.",
  },
  {
    q: "O processo de transferência é burocrático?",
    a: "Não. A coordenação do Unieuro oferece suporte direto para agilizar a análise das ementas e garantir que você aproveite o máximo possível de disciplinas já cursadas.",
  },
  {
    q: "O Unieuro é referência em Brasília?",
    a: "Sim. O Centro Universitário Unieuro é uma instituição de referência com mais de duas décadas de atuação em Brasília e integra o Grupo Educacional Ceuma, com tradição consolidada em ensino superior nas regiões Norte, Nordeste e Centro-Oeste.",
  },
];

export function FaqCtaSection() {
  return (
    <section
      id="faq-cta"
      className="bg-background py-16 md:py-24"
      aria-labelledby="faq-title"
    >
      <div className="container-lp px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <SectionHeading
            align="center"
            eyebrow="Tire suas dúvidas"
            title="Perguntas frequentes"
            className="[&_h2]:text-[22px] [&_h2]:sm:text-[26px] [&_h2]:md:text-[30px] [&_h2]:lg:text-[36px]"
            description="Reunimos as principais dúvidas sobre transferência externa e ingresso no curso de Medicina do Unieuro."
          />
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-6xl gap-8 sm:gap-10 lg:gap-12 lg:grid-cols-5">
          <Reveal direction="up" delay={0.1} className="lg:col-span-3">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="py-5 text-left font-sans text-base font-semibold text-navy hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm font-medium leading-relaxed text-muted-foreground md:text-[15px]">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10">
              <p className="font-sans text-[14px] font-medium text-muted-foreground">
                Pronto para garantir sua vaga?
              </p>
              <div className="mt-4">
                <CtaButton source="faq" />
              </div>
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.2} className="lg:col-span-2">
            <LeadForm
              id="formulario-final"
              variant="light"
              title="Faça sua inscrição"
              subtitle="Última chamada — preencha e garanta sua análise."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
