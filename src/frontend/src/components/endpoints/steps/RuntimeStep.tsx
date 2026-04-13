import { Check } from "lucide-react";
import type { RuntimeInfo } from "../../../types";

interface Props {
  runtimes: RuntimeInfo[];
  value: string;
  onChange: (name: string) => void;
}

export default function RuntimeStep({ runtimes, value, onChange }: Props) {
  return (
    <div>
      <p className="text-sm text-zinc-500 mb-4">
        Choose a serving runtime
      </p>

      <div className="space-y-2">
        {runtimes.map((rt) => {
          const selected = rt.name === value;

          return (
            <button
              key={rt.name}
              type="button"
              onClick={() => onChange(rt.name)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left
                transition-all duration-200
                ${selected
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-zinc-300 hover:bg-surface-hover"
                }
              `}
            >
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${selected ? "text-accent" : "text-zinc-700"}`}>
                  {rt.label}
                </span>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">
                  {rt.description}
                </p>
              </div>

              {selected && (
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
