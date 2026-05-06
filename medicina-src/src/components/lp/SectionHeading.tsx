import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  invert = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]",
            align === "center" && "justify-center",
            invert ? "text-gold" : "text-gold",
          )}
        >
          <span className="h-px w-8 bg-gold" />
          <span>{eyebrow}</span>
        </div>
      )}
      {!eyebrow && <div className={cn("h-[2px] w-12 bg-gold mb-6", align === "center" && "mx-auto")} />}
      <h2
        className={cn(
          "font-display text-[26px] sm:text-[30px] md:text-[36px] lg:text-[42px] leading-tight",
          invert ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-base font-medium md:text-lg",
            invert ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
