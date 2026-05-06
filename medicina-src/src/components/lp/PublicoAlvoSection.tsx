import { GraduationCap, Building2, RefreshCw, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { CtaButton } from "./CtaButton";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";

const perfis = [
  {
    icon: GraduationCap,
    title: "Estuda Medicina fora do DF",
    text: "Quer voltar para Brasília sem reiniciar o curso ou perder o tempo já investido.",
  },
  {
    icon: Building2,
    title: "Está em uma IES com estrutura limitada",
    text: "Procura prédio próprio, clínica-escola e laboratórios à altura da formação que quer.",
  },
  {
    icon: RefreshCw,
    title: "Sente que pode ter mais onde está",
    text: "Está reavaliando a instituição atual e quer um ambiente que acompanhe o ritmo da sua formação.",
  },
  {
    icon: Calendar,
    title: "Não quer esperar mais um vestibular",
    text: "Pode começar em 2026.2 sem prestar nova prova, com análise de equivalência curricular.",
  },
];

export function PublicoAlvoSection() {
  return (
    <section className="bg-offwhite py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" className="text-center">
          <div className="mx-auto h-[2px] w-12 bg-gold" />
          <h2 className="mt-6 font-display text-[26px] sm:text-[30px] md:text-[36px] lg:text-[42px] leading-tight text-navy">
            Você já escolheu ser médico. <br className="hidden md:block" />
            Agora é hora de escolher onde terminar.
          </h2>

          <p className="mx-auto mt-8 max-w-[720px] text-[16px] font-medium leading-[1.7] text-navy-soft md:text-[18px]">
            Se você está cursando Medicina em outra instituição e sente que pode ter mais. 
            Mais estrutura, mais qualidade, mais proximidade com Brasília, mais alinhamento 
            com o futuro que você quer construir como médico. A transferência externa do 
            Unieuro foi pensada exatamente para você.
          </p>
        </Reveal>

        <RevealStagger className="mt-16 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4" childDelay={0.1}>
          {perfis.map((perfil, index) => (
            <RevealItem key={index}>
              <article
                className={cn(
                  "group relative border border-[#E8E8E8] bg-white p-7 transition-all duration-200 hover:border-gold h-full will-change-transform",
                  "rounded-[6px] text-left overflow-hidden"
                )}
              >
                <div className="absolute right-0 top-0 h-1 w-12 bg-badge-red" />
                {/* Linha pontilhada vertical dourada */}
                <div className="absolute inset-y-0 left-0 w-px border-l border-dotted border-gold" />
                
                <perfil.icon size={28} className="text-gold" />
                
                <h3 className="mt-4 font-sans text-[16px] font-bold text-navy">
                  {perfil.title}
                </h3>
                
                <p className="mt-2 font-sans text-[14px] text-[#555]">
                  {perfil.text}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
        
        <Reveal direction="up" delay={0.2} className="mt-14 flex justify-center">
          <CtaButton source="publico-alvo" />
        </Reveal>
      </div>
    </section>
  );
}
