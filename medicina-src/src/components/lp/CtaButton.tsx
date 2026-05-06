import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  source: string;
  variant?: "primary" | "ghost-gold";
  size?: "default" | "small";
  className?: string;
}

export function CtaButton({
  source,
  variant = "primary",
  size = "default",
  className,
}: CtaButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Magnetismo sutil seguindo o mouse
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.4 });

  // Posição relativa do mouse para o efeito de luz radial
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const lightX = useTransform(mouseX, (v) => `${v * 100}%`);
  const lightY = useTransform(mouseY, (v) => `${v * 100}%`);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);

    // Magnetismo: 12% do offset do mouse
    x.set(offsetX * 0.12);
    y.set(offsetY * 0.12);

    // Posição relativa para a luz
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Ripple effect ao clicar
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple-expand 600ms cubic-bezier(0.4, 0, 0.2, 1);
        background: ${variant === "primary" ? "rgba(14, 34, 64, 0.35)" : "rgba(201, 169, 97, 0.25)"};
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left}px;
        top: ${e.clientY - rect.top}px;
        pointer-events: none;
      `;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    // Scroll suave até o formulário do hero (Lenis se disponível)
    const target = document.getElementById("formulario-hero");
    if (target) {
      const lenisInstance = (window as any).__lenis;
      if (lenisInstance) {
        lenisInstance.scrollTo(target, { duration: 1.6, offset: -80 });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const baseStyles =
    "group relative overflow-hidden rounded-[6px] font-display font-bold uppercase tracking-[1px] transition-[box-shadow,border-color,color,background-color] duration-300 ease-out cursor-pointer";

  const variantStyles = {
    primary:
      "bg-gold text-navy hover:shadow-[0_8px_30px_rgba(201,169,97,0.45),0_0_0_1px_rgba(201,169,97,0.2)] shadow-[0_4px_16px_rgba(201,169,97,0.25)]",
    "ghost-gold":
      "border border-gold bg-transparent text-gold hover:text-navy hover:bg-gold hover:shadow-[0_6px_24px_rgba(201,169,97,0.35)]",
  };

  const sizeStyles = {
    default: "h-auto px-9 py-[18px] text-[14px]",
    small: "h-auto px-5 py-2 text-[12px]",
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cta-source={source}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
    >
      {/* Camada de luz radial seguindo o mouse */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            variant === "primary"
              ? `radial-gradient(circle at ${lightX} ${lightY}, rgba(255, 255, 255, 0.35) 0%, transparent 60%)`
              : `radial-gradient(circle at ${lightX} ${lightY}, rgba(201, 169, 97, 0.25) 0%, transparent 60%)`,
        }}
      />

      {/* Borda interna brilhante (apenas variant primary) */}
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[6px]"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.1)",
          }}
        />
      )}

      {/* Texto do botão */}
      <span className="relative z-10">ME INSCREVER AGORA</span>

      {/* Efeito de brilho passando ao hover (shimmer) */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{
          background:
            variant === "primary"
              ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(201,169,97,0.3) 50%, transparent 100%)",
          mixBlendMode: variant === "primary" ? "overlay" : "screen",
        }}
      />
    </motion.button>
  );
}
