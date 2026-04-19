import { Server, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import SkeletonRows from "../components/ui/SkeletonRows";
import StatusBadge from "../components/ui/StatusBadge";
import { useDeleteEndpoint, useEndpoints, PAGE_SIZE } from "../hooks/useQueries";
import Pagination from "../components/ui/Pagination";
import type { InferenceEndpoint } from "../types";

export default function EndpointsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, refetch, isFetching } = useEndpoints(page);
  const deleteMutation = useDeleteEndpoint();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const endpoints: InferenceEndpoint[] = data?.items ?? [];
  const selectedEndpoint = endpoints.find((ep) => ep.id === selectedId) ?? null;

  function handleDelete() {
    if (!selectedEndpoint) return;
    deleteMutation.mutate(selectedEndpoint.id, {
      onSuccess: () => {
        setSelectedId(null);
        setShowDeleteConfirm(false);
        setPage(0);
      },
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-800">Endpoints</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your inference endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="danger-outline"
            icon={Trash2}
            disabled={!selectedEndpoint || deleteMutation.isPending}
            aria-label="Delete selected endpoint"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
          <Button
            icon={RefreshCw}
            loading={isFetching}
            aria-label="Refresh endpoints list"
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-zinc-50/50">
              <th className="w-10 px-4 py-3" />
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Model</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">URL</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Instance type</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Replicas</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows cols={8} />}

            {!isLoading && isError && (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <Server size={40} className="mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500 font-medium">Failed to load endpoints</p>
                  <Button
                    icon={RefreshCw}
                    aria-label="Retry loading endpoints"
                    onClick={() => refetch()}
                    className="mt-3 inline-flex"
                  >
                    Retry
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && endpoints.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <Server size={40} className="mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500 font-medium">No endpoints yet</p>
                  <p className="text-zinc-400 text-xs mt-1">
                    Deploy a model from the Models page to create an endpoint
                  </p>
                </td>
              </tr>
            )}

            {endpoints.map((ep) => {
              const isSelected = selectedId === ep.id;
              return (
                <tr
                  key={ep.id}
                  onClick={() => setSelectedId(isSelected ? null : ep.id)}
                  className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                    isSelected ? "bg-accent/5" : "hover:bg-surface-hover"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-accent" : "border-zinc-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/endpoints/${ep.id}`);
                      }}
                      className="font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
                    >
                      {ep.name}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ep.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/models/${ep.model_id}`);
                      }}
                      className="text-accent hover:text-accent-hover hover:underline transition-colors font-medium"
                    >
                      {ep.model_name}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {ep.url ? (
                      <a
                        href={`${ep.url}/docs`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
                        title={ep.url}
                      >
                        <ExternalLink size={11} />
                        Open
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 rounded">
                      {ep.instance_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{ep.replicas}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(ep.created_at).toLocaleString(undefined, { hour12: false })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={data?.total ?? 0}
          onPageChange={setPage}
        />
      </div>

      {showDeleteConfirm && selectedEndpoint && (
        <DeleteConfirmModal
          title="Delete Endpoint"
          name={selectedEndpoint.name}
          isError={deleteMutation.isError}
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
