import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-xs text-zinc-400">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="p-1 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} className="text-zinc-500" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`min-w-[28px] h-7 rounded text-xs font-medium transition-colors ${
              i === page
                ? "bg-accent text-white"
                : "text-zinc-500 hover:bg-surface-hover"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={page === totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="p-1 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} className="text-zinc-500" />
        </button>
      </div>
    </div>
  );
}
