import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: "default" | "green" | "red" | "yellow";
}

const COLOR_MAP = {
  default: "text-zinc-400",
  green: "text-green-600",
  red: "text-red-500",
  yellow: "text-yellow-500",
};

const VALUE_COLOR_MAP = {
  default: "text-zinc-800",
  green: "text-green-600",
  red: "text-red-600",
  yellow: "text-yellow-600",
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  color = "default",
}: Props) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={COLOR_MAP[color]} />
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <p className={`text-3xl font-semibold ${VALUE_COLOR_MAP[color]}`}>
        {value}
      </p>
    </div>
  );
}
