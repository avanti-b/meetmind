"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "intelligence";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: "bg-ink text-surface-0 hover:bg-ink/90 border border-ink/20",
  secondary: "bg-surface-3 text-ink border border-border-bright hover:bg-surface-4 hover:border-ink/20",
  ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-surface-3 border border-transparent",
  danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
  intelligence: "bg-intelligence text-white border border-intelligence-glow/30 hover:bg-intelligence-dim shadow-intelligence",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-sm gap-2.5 rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
