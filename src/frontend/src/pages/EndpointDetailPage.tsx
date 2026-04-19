import {
  Clock,
  Cpu,
  ExternalLink,
  HardDrive,
  ChartLine,
  Logs as LogsIcon,
  RefreshCw,
  Server,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackLink from "../components/ui/BackLink";
import Button from "../components/ui/Button";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import StatusBadge from "../components/ui/StatusBadge";
import {
  useDeleteEndpoint,
  useEndpoint,
  useEndpointLogs,
  useEndpointPods,
  useGrafanaConfig,
} from "../hooks/useQueries";

type Tab = "metrics" | "logs";

const TAIL_OPTIONS = [100, 300, 500, 1000, 2500] as const;

export default function EndpointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: endpoint, isLoading, isError } = useEndpoint(id!);
  const { data: grafana } = useGrafanaConfig();
  const deleteMutation = useDeleteEndpoint();
  const [activeTab, setActiveTab] = useState<Tab>("metrics");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tailLines, setTailLines] = useState(100);
  const [selectedPod, setSelectedPod] = useState<string>("");

  const { data: pods } = useEndpointPods(id!, activeTab === "logs");

  useEffect(() => {
    if (pods?.length && !selectedPod) {
      setSelectedPod(pods[0].name);
    }
  }, [pods, selectedPod]);

  const {
    data: logs,
    isLoading: logsLoading,
    isError: logsError,
    refetch: refetchLogs,
    isFetching: logsFetching,
  } = useEndpointLogs(id!, selectedPod, tailLines, activeTab === "logs");

  const handleDelete = () => {
    if (!endpoint) return;
    deleteMutation.mutate(endpoint.id, {
      onSuccess: () => navigate("/endpoints"),
    });
  };

  if (isLoading) {
    return (
      <div>
        <BackLink to="/endpoints">Back to Endpoints</BackLink>
        <div className="space-y-4">
          <div className="h-8 bg-zinc-100 rounded animate-pulse w-1/3" />
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-zinc-100 rounded animate-pulse w-2/3"
                />
              ))}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-lg h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !endpoint) {
    return (
      <div>
        <BackLink to="/endpoints">Back to Endpoints</BackLink>
        <div className="text-center py-16">
          <Server size={40} className="mx-auto text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium">
            {isError ? "Failed to load endpoint" : "Endpoint not found"}
          </p>
        </div>
      </div>
    );
  }

  const createdDate = new Date(endpoint.created_at).toLocaleString(undefined, { hour12: false });

  const grafanaUrl =
    grafana?.url && grafana?.dashboard_uid
      ? `${grafana.url}/d/${grafana.dashboard_uid}` +
        `?var-namespace=${encodeURIComponent(endpoint.namespace)}` +
        `&var-inference_service=${encodeURIComponent(endpoint.kserve_name)}` +
        `&kiosk&theme=light&refresh=30s`
      : null;

  const tabs: { key: Tab; label: string; icon: typeof ChartLine }[] = [
    { key: "metrics", label: "Metrics", icon: ChartLine },
    { key: "logs", label: "Logs", icon: LogsIcon },
  ];

  return (
    <div>
      <BackLink to="/endpoints">Back to Endpoints</BackLink>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-800">
            {endpoint.name}
          </h1>
          <StatusBadge status={endpoint.status} />
        </div>
        <Button
          variant="danger-outline"
          icon={Trash2}
          aria-label="Delete endpoint"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Model</span>
            <button
              onClick={() => navigate(`/models/${endpoint.model_id}`)}
              className="text-sm font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
            >
              {endpoint.model_name}
            </button>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block mb-1">
              Instance Type
            </span>
            <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 rounded text-zinc-700">
              {endpoint.instance_type}
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block mb-1">Replicas</span>
            <span className="text-sm text-zinc-700 font-medium">
              {endpoint.replicas}
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block mb-1">Compute</span>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="inline-flex items-center gap-1">
                <Cpu size={12} className="text-zinc-400" />
                {endpoint.cpu} vCPU
              </span>
              <span className="text-zinc-300">|</span>
              <span className="inline-flex items-center gap-1">
                <HardDrive size={12} className="text-zinc-400" />
                {endpoint.memory}
              </span>
              {endpoint.gpu && (
                <>
                  <span className="text-zinc-300">|</span>
                  <span className="text-xs font-medium bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded">
                    GPU
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block mb-1">URL</span>
            {endpoint.url ? (
              <a
                href={`${endpoint.url}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
              >
                <ExternalLink size={12} />
                Open API docs
              </a>
            ) : (
              <span className="text-sm text-zinc-400">Not available</span>
            )}
          </div>

          <div>
            <span className="text-xs text-zinc-400 block mb-1">Namespace</span>
            <span className="font-mono text-xs text-zinc-600">
              {endpoint.namespace}
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block mb-1">
              KServe Name
            </span>
            <span className="font-mono text-xs text-zinc-600">
              {endpoint.kserve_name}
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block mb-1">Created</span>
            <div className="flex items-center gap-1.5 text-sm text-zinc-600">
              <Clock size={13} className="text-zinc-400" />
              {createdDate}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="flex border-b border-border">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            );
          })}

          {activeTab === "logs" && (
            <div className="ml-auto flex items-center gap-3 pr-3">
              <select
                value={selectedPod}
                onChange={(e) => setSelectedPod(e.target.value)}
                className="text-xs bg-transparent border border-border rounded px-2 py-1 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {pods?.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </select>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-400 mr-1">Lines:</span>
                {TAIL_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setTailLines(n)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all duration-150 ${
                      tailLines === n
                        ? "bg-accent text-white"
                        : "text-zinc-500 hover:bg-surface-hover hover:text-zinc-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-border" />
              <Button
                variant="ghost"
                icon={RefreshCw}
                iconSize={12}
                loading={logsFetching}
                onClick={() => refetchLogs()}
              >
                Refresh
              </Button>
            </div>
          )}
        </div>

        <div>
          {activeTab === "metrics" && grafanaUrl && (
            <iframe
              src={grafanaUrl}
              title="Endpoint Metrics"
              className="w-full border-0"
              style={{ height: "600px" }}
            />
          )}

          {activeTab === "logs" && (
            <div>
              {logsLoading && (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw size={20} className="animate-spin text-zinc-400 mr-2" />
                  <span className="text-sm text-zinc-500">Loading logs...</span>
                </div>
              )}

              {!logsLoading && logsError && (
                <div className="text-center py-20">
                  <LogsIcon size={40} className="mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500 font-medium">Failed to load logs</p>
                  <p className="text-zinc-400 text-xs mt-1">
                    Check that the endpoint pod is running and accessible
                  </p>
                </div>
              )}

              {!logsLoading && !logsError && !logs && (
                <div className="text-center py-20">
                  <LogsIcon size={40} className="mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500 font-medium">No logs available</p>
                  <p className="text-zinc-400 text-xs mt-1">
                    Logs will appear once the endpoint container is running
                  </p>
                </div>
              )}

              {!logsLoading && logs && (
                <pre
                  className="px-5 py-4 text-xs leading-5 text-zinc-300 bg-zinc-900 overflow-auto font-mono whitespace-pre-wrap break-all"
                  style={{ minHeight: "600px", maxHeight: "800px" }}
                >
                  {logs}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Delete Endpoint"
          name={endpoint.name}
          isError={deleteMutation.isError}
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
