import type { RuntimeCategory } from "../../../types";

interface Props {
  categories: RuntimeCategory[];
  value: string;
  onChange: (id: string) => void;
}

export default function CategoryStep({ categories, value, onChange }: Props) {
  return (
    <div>
      <p className="text-sm text-zinc-500 mb-4">
        What type of model are you deploying?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const selected = cat.id === value;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={`
                flex flex-col items-start gap-3 p-4 rounded-lg border-2 text-left
                transition-all duration-200
                ${selected
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-zinc-300 hover:bg-surface-hover"
                }
              `}
            >
              <div className={`text-sm font-medium ${selected ? "text-accent" : "text-zinc-700"}`}>
                {cat.label}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {cat.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
