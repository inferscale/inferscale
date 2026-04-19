import type { EndpointStatus } from "../../types";

const STYLES: Record<EndpointStatus, string> = {
  Running: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Creating: "bg-blue-50 text-blue-700 border-blue-200",
  Deleting: "bg-zinc-100 text-zinc-500 border-zinc-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
};

const DOT: Record<EndpointStatus, string> = {
  Running: "bg-emerald-500",
  Pending: "bg-amber-500 animate-pulse",
  Creating: "bg-blue-500 animate-pulse",
  Deleting: "bg-zinc-400",
  Failed: "bg-red-500",
};

export default function StatusBadge({ status }: { status: EndpointStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STYLES[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[status]}`} />
      {status}
    </span>
  );
}
