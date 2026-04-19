import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  RefreshCw,
  Server,
} from "lucide-react";
import Button from "../components/ui/Button";
import MetricCard from "../components/dashboard/MetricCard";
import { useDashboardStats } from "../hooks/useQueries";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-lg p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
        <div className="text-center py-16">
          <AlertTriangle size={40} className="mx-auto text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium">Failed to load dashboard</p>
          <Button
            icon={RefreshCw}
            aria-label="Retry loading dashboard"
            onClick={() => refetch()}
            className="mt-3 inline-flex"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = data ?? {
    total_models: 0,
    total_endpoints: 0,
    active_endpoints: 0,
    failed_endpoints: 0,
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Models"
          value={stats.total_models}
          icon={BrainCircuit}
        />
        <MetricCard
          title="Total Endpoints"
          value={stats.total_endpoints}
          icon={Server}
        />
        <MetricCard
          title="Active Endpoints"
          value={stats.active_endpoints}
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Failed Endpoints"
          value={stats.failed_endpoints}
          icon={AlertTriangle}
          color="red"
        />
      </div>
    </div>
  );
}
