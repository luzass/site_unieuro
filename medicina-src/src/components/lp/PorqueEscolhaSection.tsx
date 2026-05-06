import {
  School,
  Microscope,
  Hospital,
  GraduationCap,
  HandCoins,
  Library,
  UserRound,
  Presentation,
  BookOpenCheck,
} from "lucide-react";
import { CtaButton } from "./CtaButton";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";

const beneficios = [
  {
    icon: School,
    text: "Uma das mais estruturadas e bem conceituadas universidades do País.",
  },
  {
    icon: Microscope,
    text: "Laboratórios Didáticos com equipamentos de ponta e tecnologia educacional inovadora.",
  },
  {
    icon: Hospital,
    text: "Clínicas-Escola próprias com especialidades a serviço da comunidade.",
  },
  {
    icon: GraduationCap,
    text: "Mais de 30 cursos de excelência e tradição acadêmica em Brasília.",
  },
  {
    icon: HandCoins,
    text: "Acesso direto a bolsas de estudo e financiamentos.",
  },
  {
    icon: Library,
    text: "Bibliotecas com acervo de mais de 1 milhão de títulos, nas versões física e digital.",
  },
  {
    icon: UserRound,
    text: "Aval do mercado de trabalho e tradição de 30 anos.",
  },
  {
    icon: Presentation,
    text: "Professores especialistas, mestres e doutores e capacitados a cada semestre em Metodologias Ativas e recursos didáticos de última geração.",
  },
  {
    icon: BookOpenCheck,
    text: "Política pedagógica de inclusão e de responsabilidade social.",
  },
];

export function PorqueEscolhaSection() {
  return (
    <section className="bg-offwhite py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" className="text-center">
          <h2 className="mx-auto max-w-4xl font-display text-[26px] sm:text-[30px] md:text-[36px] lg:text-[42px] font-extrabold leading-[1.15] text-navy">
            Porque o Centro Universitário Unieuro é a sua melhor escolha:
          </h2>
        </Reveal>

        <RevealStagger className="mt-12 grid gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 md:grid-cols-3 md:gap-x-12 md:gap-y-12" staggerDelay={0.05}>
          {beneficios.map((item, i) => (
            <RevealItem key={i} className="flex flex-col">
              <item.icon size={48} strokeWidth={1.5} className="text-navy" />
              <p className="mt-5 font-sans text-[15px] font-medium leading-[1.6] text-navy/85">
                {item.text}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal direction="up" delay={0.2} className="mt-16 flex justify-center md:mt-20">
          <CtaButton source="porque-escolha" />
        </Reveal>
      </div>
    </section>
  );
}
