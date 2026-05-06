import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/ui/magnetic";

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
  lgpd: z.literal(true, { message: "Você precisa aceitar os termos" }),
});

type LeadInput = {
  nome: string;
  whatsapp: string;
  email: string;
  lgpd: boolean;
};

type Errors = Partial<Record<keyof LeadInput, string>>;

function maskWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface LeadFormProps {
  variant?: "light" | "dark";
  id?: string;
  title?: string;
  subtitle?: string;
}

export function LeadForm({
  variant = "light",
  id = "formulario-hero",
  title = "Solicite contato da coordenação",
  subtitle = "Preencha o formulário e nosso time entrará em contato.",
}: LeadFormProps) {
  const [data, setData] = useState<LeadInput>({
    nome: "",
    whatsapp: "",
    email: "",
    lgpd: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const isDark = variant === "dark";

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
      toast.error("Verifique os campos destacados.");
      return;
    }

    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", {
        content_name: "LP Medicina Unieuro",
        content_category: "Graduação",
      });
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);

    toast.success("Inscrição recebida!", {
      description: "Em breve nossa equipe entrará em contato pelo WhatsApp.",
    });

    setData({
      nome: "",
      whatsapp: "",
      email: "",
      lgpd: false,
    });
  }

  const labelCls = cn(
    "text-xs font-semibold uppercase tracking-wider",
    isDark ? "text-white/85" : "text-navy",
  );
  const inputCls = cn(
    "h-12 rounded-[4px] border-[1.5px] bg-white text-navy text-[16px] md:text-sm placeholder:text-muted-foreground/70",
    isDark ? "border-white/20" : "border-border",
  );
  const errCls = "mt-1 text-xs font-medium text-destructive";

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "relative w-full rounded-[4px] p-5 sm:p-6 md:p-8",
        isDark
          ? "bg-white text-navy shadow-elegant"
          : "bg-white text-navy shadow-card ring-1 ring-border",
      )}
      aria-labelledby={`${id}-title`}
    >
      <div className="mb-6 border-l-2 border-gold pl-4">
        <h3
          id={`${id}-title`}
          className="font-display text-xl uppercase leading-tight text-navy md:text-2xl"
        >
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="space-y-5">

        <div>
          <Label htmlFor={`${id}-nome`} className={labelCls}>
            Nome completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${id}-nome`}
            name="nome"
            autoComplete="name"
            value={data.nome}
            onChange={(e) => update("nome", e.target.value)}
            placeholder="Seu nome completo"
            maxLength={120}
            className={cn("mt-1.5 text-[16px] sm:text-sm", inputCls)}
            aria-invalid={!!errors.nome}
          />
          {errors.nome && <p className={errCls}>{errors.nome}</p>}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor={`${id}-whatsapp`} className={labelCls}>
              WhatsApp <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${id}-whatsapp`}
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={data.whatsapp}
              onChange={(e) => update("whatsapp", maskWhatsapp(e.target.value))}
              placeholder="(61) 99999-9999"
              className={cn("mt-1.5 text-[16px] sm:text-sm", inputCls)}
              aria-invalid={!!errors.whatsapp}
            />
            {errors.whatsapp && <p className={errCls}>{errors.whatsapp}</p>}
          </div>

          <div>
            <Label htmlFor={`${id}-email`} className={labelCls}>
              E-mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="seu@email.com"
              maxLength={160}
              className={cn("mt-1.5 text-[16px] sm:text-sm", inputCls)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className={errCls}>{errors.email}</p>}
          </div>
        </div>

        <div>
          <Label
            htmlFor={`${id}-lgpd`}
            className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted-foreground"
          >
            <Checkbox
              id={`${id}-lgpd`}
              checked={data.lgpd}
              onCheckedChange={(c) => update("lgpd", c === true)}
              className="mt-0.5 border-navy data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-navy"
            />
            <span>
              Autorizo o Centro Universitário Unieuro a tratar meus dados para
              contato sobre o curso de Medicina, conforme a{" "}
              <span className="font-semibold text-navy">LGPD</span> (Lei nº
              13.709/2018).
            </span>
          </Label>
          {errors.lgpd && <p className={errCls}>{errors.lgpd}</p>}
        </div>

        <Magnetic strength={0.1}>
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-[4px] bg-navy text-[16px] sm:text-sm font-semibold uppercase tracking-wider text-white hover:bg-navy-soft disabled:opacity-70"
          >
            {submitting ? "Enviando..." : "Fazer minha inscrição"}
          </Button>
        </Magnetic>
      </div>
    </form>
  );
}
