import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const leadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo")
    .max(120, "Nome muito longo"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido. Use (DD) 99999-9999"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(160, "E-mail muito longo"),
  aceite: z.literal(true, { message: "Você precisa aceitar os termos" }),
});

type LeadInput = {
  nome: string;
  whatsapp: string;
  email: string;
  aceite: boolean;
};

type Errors = Partial<Record<keyof LeadInput, string>>;

function maskWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function LeadFormHero() {
  const [data, setData] = useState<LeadInput>({
    nome: "",
    whatsapp: "",
    email: "",
    aceite: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LeadInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Tracking Meta Pixel - evento Lead
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", {
        content_name: "LP Medicina Unieuro - Transferência",
        content_category: "Graduação",
      });
    }

    // dataLayer (caso use GTM no futuro)
    if (typeof window !== "undefined") {
      const dataLayer = (window as any).dataLayer || [];
      dataLayer.push({
        event: "lead_submitted",
        formId: "medicina-transferencia-2026-2",
      });
    }

    // Simular envio
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Dados enviados com sucesso!");
  }

  if (submitted) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
          <svg className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl uppercase text-navy font-bold">Dados Recebidos</h3>
        <p className="mt-4 text-sm text-navy-soft max-w-[280px]">
          A coordenação entrará em contato em até 48h pelo WhatsApp informado.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 text-navy font-bold uppercase text-[12px] tracking-wider hover:underline"
        >
          Voltar ao formulário
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            className={cn(
              "h-12 w-full rounded-[6px] border-[1.5px] bg-white px-4 text-[16px] text-navy placeholder:text-gray-400 transition-all duration-200 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20",
              errors.nome ? "border-destructive" : "border-gray-300"
            )}
            value={data.nome}
            onChange={(e) => update("nome", e.target.value)}
          />
          {errors.nome && <p className="text-[11px] text-destructive font-medium">{errors.nome}</p>}
        </div>

        <div className="space-y-1">
          <input
            type="tel"
            name="whatsapp"
            inputMode="numeric"
            placeholder="WhatsApp com DDD"
            className={cn(
              "h-12 w-full rounded-[6px] border-[1.5px] bg-white px-4 text-[16px] text-navy placeholder:text-gray-400 transition-all duration-200 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20",
              errors.whatsapp ? "border-destructive" : "border-gray-300"
            )}
            value={data.whatsapp}
            onChange={(e) => update("whatsapp", maskWhatsapp(e.target.value))}
          />
          {errors.whatsapp && <p className="text-[11px] text-destructive font-medium">{errors.whatsapp}</p>}
        </div>

        <div className="space-y-1">
          <input
            type="email"
            name="email"
            placeholder="Seu melhor e-mail"
            className={cn(
              "h-12 w-full rounded-[6px] border-[1.5px] bg-white px-4 text-[16px] text-navy placeholder:text-gray-400 transition-all duration-200 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20",
              errors.email ? "border-destructive" : "border-gray-300"
            )}
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors.email && <p className="text-[11px] text-destructive font-medium">{errors.email}</p>}
        </div>
      </div>

      {/* Checkbox LGPD */}
      <div className="space-y-1">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-gold border-gray-300 rounded"
            checked={data.aceite}
            onChange={(e) => update("aceite", e.target.checked)}
          />
          <span className="text-[12px] leading-snug text-navy-soft">
            Concordo em receber contato do Unieuro e aceito a Política de Privacidade.
          </span>
        </label>
        {errors.aceite && <p className="text-[11px] text-destructive font-medium">{errors.aceite}</p>}
      </div>

      {/* Botão de envio */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileTap={{ scale: 0.98 }}
        className="group relative h-14 w-full overflow-hidden rounded-[6px] bg-gold font-display text-[14px] font-bold uppercase tracking-[0.5px] text-navy shadow-[0_4px_16px_rgba(201,169,97,0.25)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(201,169,97,0.45)] disabled:opacity-70"
      >
        <span className="relative z-10">{isSubmitting ? "ENVIANDO..." : "SOLICITAR ANÁLISE DE TRANSFERÊNCIA"}</span>
      </motion.button>

      {/* Texto auxiliar */}
      <p className="text-center text-[11px] text-gray-500">
        Análise gratuita. Sem compromisso de matrícula.
      </p>
    </form>
  );
}