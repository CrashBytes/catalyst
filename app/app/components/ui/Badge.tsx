import { type ReactNode } from "react";

const variantStyles = {
  default: "bg-guard-700/60 text-guard-300",
  success: "bg-catalyst-600/20 text-catalyst-400 ring-1 ring-catalyst-600/30",
  warning: "bg-knowledge-600/20 text-knowledge-400 ring-1 ring-knowledge-600/30",
  error: "bg-red-600/20 text-red-400 ring-1 ring-red-600/30",
  brand: "bg-catalyst-600/20 text-catalyst-400 ring-1 ring-catalyst-600/30",
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
