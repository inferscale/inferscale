import type { LucideIcon } from "lucide-react";

const variants = {
  primary:
    "bg-accent hover:bg-accent-hover text-white",
  outline:
    "border border-accent text-accent bg-white hover:bg-accent/5",
  secondary:
    "border border-border text-zinc-600 hover:bg-surface-hover",
  danger:
    "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  "danger-outline":
    "border border-border text-zinc-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200",
  ghost:
    "text-zinc-500 hover:text-zinc-700 hover:bg-surface-hover",
} as const;

type Variant = keyof typeof variants;

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: LucideIcon;
  iconSize?: number;
  loading?: boolean;
}

export default function Button({
  variant = "secondary",
  icon: Icon,
  iconSize = 13,
  loading,
  disabled,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `.trim()}
      {...rest}
    >
      {Icon && <Icon size={iconSize} className={loading ? "animate-spin" : ""} />}
      {children}
    </button>
  );
}
