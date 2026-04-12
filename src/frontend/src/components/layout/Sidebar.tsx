import { BrainCircuit, LayoutDashboard, Server } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useVersion } from "../../hooks/useQueries";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Models", icon: BrainCircuit, path: "/models" },
  { label: "Endpoints", icon: Server, path: "/endpoints" },
];

export default function Sidebar() {
  const location = useLocation();
  const { data: version } = useVersion();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="InferScale" width={40} height={40} className="flex-shrink-0" />
          <h1 className="text-xl font-semibold tracking-tight leading-none">
            <span className="text-accent">Infer</span>
            <span className="text-zinc-800">Scale</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-surface-hover"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <span className="text-xs text-zinc-400">{version ? `v${version}` : ""}</span>
      </div>
    </aside>
  );
}
