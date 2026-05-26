"use client";
import { cn } from "@/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-ink-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-surface-2 border rounded-xl text-sm text-ink placeholder:text-ink-faint",
              "px-3.5 py-2.5 transition-all duration-200",
              "focus:outline-none focus:border-intelligence/60 focus:bg-surface-3 focus:shadow-intelligence",
              error ? "border-danger/50 focus:border-danger" : "border-border hover:border-border-bright",
              icon && "pl-9",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
