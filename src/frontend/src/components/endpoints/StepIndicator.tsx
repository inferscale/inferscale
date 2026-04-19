import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  current: number;
}

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;

        return (
          <div key={step.label} className="flex items-center gap-1 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0
                  transition-colors duration-200
                  ${done ? "bg-accent text-white" : ""}
                  ${active ? "bg-accent text-white" : ""}
                  ${!done && !active ? "bg-zinc-100 text-zinc-400" : ""}
                `}
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span
                className={`text-xs truncate ${
                  active ? "text-zinc-800 font-medium" : "text-zinc-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  done ? "bg-accent" : "bg-zinc-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
