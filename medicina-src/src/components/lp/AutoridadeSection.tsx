import { Stethoscope, FlaskConical, Users, MapPin } from "lucide-react";
import { CtaButton } from "./CtaButton";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";

const diferenciais = [
  {
    number: "60-85%",
    subtitle: "APROVEITAMENTO CURRICULAR",
    text: "Análise individualizada de equivalência das disciplinas já cursadas na instituição de origem. Você não recomeça do zero, continua de onde parou.",
  },
  {
    number: "ASA SUL",
    subtitle: "PRÉDIO DEDICADO",
    text: "Edifício no coração de Brasília projetado para o curso de Medicina, com laboratórios, salas de simulação e espaços de prática clínica integrados ao ambiente acadêmico.",
  },
  {
    number: "+25",
    subtitle: "ANOS EM BRASÍLIA",
    text: "Centro Universitário Unieuro consolidado no Distrito Federal desde 1998, integrante do Grupo Educacional Ceuma com mais de três décadas de tradição em ensino superior.",
  },
];

const provaInstitucional = [
  {
    icon: Stethoscope,
    title: "Clínica-escola",
    text: "Espaço próprio com atendimento à comunidade e prática supervisionada dos alunos.",
  },
  {
    icon: FlaskConical,
    title: "Laboratórios",
    text: "Anatomia, simulação e habilidades clínicas com equipamentos modernos.",
  },
  {
    icon: Users,
    title: "Corpo docente",
    text: "Mestres e doutores com atuação em hospitais e instituições de saúde do DF.",
  },
  {
    icon: MapPin,
    title: "Asa Sul",
    text: "Localização central de Brasília, com infraestrutura urbana completa e mobilidade.",
  },
];

export function AutoridadeSection() {
  return (
    <section className="bg-gradient-to-b from-black-deep via-navy to-navy-soft py-16 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <Reveal direction="up" className="text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[2px] text-gold">
            POR QUE O UNIEURO
          </span>
          <h2 className="mt-4 font-display text-[26px] sm:text-[30px] md:text-[36px] lg:text-[42px] leading-tight text-white">
            Tradição em Brasília. <br className="hidden md:block" />
            Estrutura para a Medicina que você quer fazer.
          </h2>
          <p className="mx-auto mt-6 max-w-[760px] text-[17px] font-medium leading-[1.6] text-[#C9C9C9]">
            Instituição de referência em Brasília e oferecido em prédio dedicado no campus Asa Sul. Um projeto institucional 
            construído com infraestrutura e ambiente clínico para formar médicos preparados para a prática profissional.
          </p>
        </Reveal>

        {/* Grid de Diferenciais */}
        <RevealStagger className="mt-16 grid gap-8 sm:gap-10 md:grid-cols-3 md:gap-12">
          {diferenciais.map((d, i) => (
            <RevealItem key={i} className="relative pl-6">
              {/* Linha pontilhada vertical */}
              <div className="absolute inset-y-0 left-0 w-px border-l border-dotted border-gold" />
              
              <div className="font-display text-[48px] leading-none text-gold tracking-tight md:text-[56px] whitespace-nowrap">
                {d.number}
              </div>
              <div className="mt-3 h-[2px] w-12 bg-gold" />
              <h3 className="mt-2 font-sans text-[13px] font-semibold uppercase tracking-[1px] text-white min-h-[20px]">
                {d.subtitle}
              </h3>
              <div className="mt-3 h-[2px] w-10 bg-gold" />
              <p className="mt-4 font-sans text-[15px] leading-[1.6] text-[#C9C9C9]">
                {d.text}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>

        {/* Bloco de Prova Institucional */}
        <div className="mt-20 border-t border-gold/20 pt-16">
          <RevealStagger staggerDelay={0.08} className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {provaInstitucional.map((item, i) => (
              <RevealItem key={i} className="flex flex-col gap-3 rounded-[4px] bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]">
                <item.icon size={24} className="text-gold" aria-hidden="true" />
                <h4 className="font-sans text-[14px] font-bold uppercase tracking-[0.5px] text-white">
                  {item.title}
                </h4>
                <p className="font-sans text-[13px] leading-[1.5] text-[#C9C9C9]">
                  {item.text}
                </p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>

        {/* CTA Final */}
        <Reveal direction="up" delay={0.2} className="mt-12 text-center">
          <CtaButton source="autoridade" />
        </Reveal>
      </div>
    </section>
  );
}
