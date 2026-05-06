import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { HeaderMinimal, HeroModern } from "@/components/lp/HeroModern";
import { PublicoAlvoSection } from "@/components/lp/PublicoAlvoSection";
import { AutoridadeSection } from "@/components/lp/AutoridadeSection";
import { ComoFuncionaModern } from "@/components/lp/ComoFuncionaModern";
import { PorqueEscolhaSection } from "@/components/lp/PorqueEscolhaSection";
import { ComoFuncionaSection } from "@/components/lp/ComoFuncionaSection";
import { EstruturaSection } from "@/components/lp/EstruturaSection";
import { ReconhecimentoSection } from "@/components/lp/ReconhecimentoSection";
import { DepoimentosSection } from "@/components/lp/DepoimentosSection";
import { FaqCtaSection } from "@/components/lp/FaqCtaSection";
import { Footer } from "@/components/lp/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      {
        title:
          "Medicina Unieuro Brasília | Transferência Externa 2026.2",
      },
      {
        name: "description",
        content:
          "Não comece sua Medicina do zero. Transfira para o Unieuro e aproveite as disciplinas que você já cursou. Instituição de referência em Brasília.",
      },
    ],
  }),
});

function Index() {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "ViewContent", {
        content_name: "LP Medicina Unieuro",
        content_category: "Graduação",
        content_type: "product",
      });
    }
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "Centro Universitário Unieuro",
            description:
              "Curso de Medicina do Unieuro em Brasília com transferência externa aberta para 2026.2.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Brasília",
              addressRegion: "DF",
              addressCountry: "BR",
            },
          }),
        }}
      />
      <HeaderMinimal />
      <main className="bg-background">
        <HeroModern />
        <PublicoAlvoSection />
        <AutoridadeSection />
        <ComoFuncionaModern />
        <EstruturaSection />
        <ReconhecimentoSection />
        <PorqueEscolhaSection />
        <DepoimentosSection />
        <FaqCtaSection />
      </main>
      <Footer />
    </>
  );
}
