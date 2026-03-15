import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";

const variantStyles = {
  primary:
    "bg-catalyst-600 text-white hover:bg-catalyst-500 hover:shadow-glow hover:ring-1 hover:ring-catalyst-600/20 focus-visible:ring-catalyst-500 disabled:bg-catalyst-600/40 disabled:text-white/50",
  secondary:
    "bg-guard-700 text-guard-100 hover:bg-guard-600 focus-visible:ring-guard-500 disabled:bg-guard-700/50 disabled:text-guard-400",
  outline:
    "border border-catalyst-600/50 bg-transparent text-catalyst-400 hover:bg-catalyst-600/10 focus-visible:ring-catalyst-500 disabled:border-catalyst-600/20 disabled:text-catalyst-600/40",
  ghost:
    "bg-transparent text-guard-300 hover:bg-guard-800 hover:text-guard-100 focus-visible:ring-guard-500 disabled:text-guard-500",
  danger:
    "bg-red-600/20 text-red-400 hover:bg-red-600/30 focus-visible:ring-red-500 disabled:bg-red-600/10 disabled:text-red-400/50",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      asChild = false,
      className = "",
      children,
      ...props
    },
    ref
  ) {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-guard-950 disabled:cursor-not-allowed";

    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

    if (asChild) {
      return (
        <span className={classes} ref={ref as never}>
          {children}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
