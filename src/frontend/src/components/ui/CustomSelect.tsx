import { Check, ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FormLabel } from "./FormField";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Select…",
  disabled = false,
  loading = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        listRef.current && !listRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      if (listRef.current && listRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  useEffect(() => {
    if (open && focusIdx >= 0 && listRef.current) {
      const item = listRef.current.children[focusIdx] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusIdx, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setFocusIdx(options.findIndex((o) => o.value === value));
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIdx((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIdx((i) => (i - 1 + options.length) % options.length);
        break;
      case "Enter":
        e.preventDefault();
        if (focusIdx >= 0) {
          onChange(options[focusIdx].value);
        }
        setOpen(false);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const select = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <FormLabel>{label}</FormLabel>}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setFocusIdx(options.findIndex((o) => o.value === value));
        }}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-2 rounded-lg
          bg-bg border text-sm text-left
          transition-all duration-200
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
          ${open ? "border-accent ring-2 ring-accent/10 shadow-sm" : "border-border hover:border-zinc-300"}
        `}
      >
        {loading ? (
          <span className="text-zinc-400">Loading…</span>
        ) : selected ? (
          <span className="flex items-center gap-2 min-w-0 truncate">
            {selected.icon}
            <span className="truncate text-zinc-800">{selected.label}</span>
            {selected.badge}
          </span>
        ) : (
          <span className="text-zinc-400">{placeholder}</span>
        )}
        <ChevronDown
          size={15}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }}
            className="
              z-[100]
              bg-white border border-border rounded-lg shadow-lg
              max-h-60 overflow-y-auto
              py-1
            "
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isFocused = i === focusIdx;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(opt.value)}
                  onMouseEnter={() => setFocusIdx(i)}
                  className={`
                    flex items-start gap-2.5 px-3 py-2 cursor-pointer
                    transition-colors duration-100
                    ${isFocused ? "bg-accent/5" : ""}
                    ${isSelected ? "text-accent" : "text-zinc-700"}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
                        {opt.label}
                      </span>
                      {opt.badge}
                    </div>
                    {opt.description && (
                      <p className="text-xs text-zinc-400 mt-0.5 ml-0">{opt.description}</p>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={15} className="shrink-0 text-accent mt-0.5" />
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
