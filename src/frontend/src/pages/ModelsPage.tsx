import { BrainCircuit, Plus, RefreshCw, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateEndpointWizard from "../components/endpoints/CreateEndpointWizard";
import Button from "../components/ui/Button";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { FormInput, FormLabel, FormTextarea } from "../components/ui/FormField";
import Modal from "../components/ui/Modal";
import SkeletonRows from "../components/ui/SkeletonRows";
import {
  useCreateModel,
  useDeleteModel,
  useModels,
  PAGE_SIZE,
} from "../hooks/useQueries";
import Pagination from "../components/ui/Pagination";
import type { MLModel, ModelCreateRequest } from "../types";

const INITIAL_FORM: ModelCreateRequest = {
  name: "",
  model_path: "",
  description: "",
};

export default function ModelsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, refetch, isFetching } = useModels(page);
  const createModelMutation = useCreateModel();
  const deleteMutation = useDeleteModel();

  const [showRegister, setShowRegister] = useState(false);
  const [deployModel, setDeployModel] = useState<MLModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MLModel | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState<ModelCreateRequest>({ ...INITIAL_FORM });

  const models = data?.items ?? [];
  const selectedModel = models.find((m) => m.id === selectedId) ?? null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    createModelMutation.mutate(
      {
        name: form.name,
        model_path: form.model_path,
        description: form.description,
      },
      {
        onSuccess: () => {
          setShowRegister(false);
          setForm({ ...INITIAL_FORM });
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (selectedId === deleteTarget.id) setSelectedId(null);
        setPage(0);
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-800">Models</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your ML models
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            icon={Plus}
            iconSize={14}
            onClick={() => setShowRegister(true)}
          >
            Register Model
          </Button>
          <Button
            icon={Play}
            disabled={!selectedModel}
            aria-label="Deploy selected model"
            onClick={() => {
              if (selectedModel) setDeployModel(selectedModel);
            }}
          >
            Deploy
          </Button>
          <Button
            variant="danger-outline"
            icon={Trash2}
            disabled={!selectedModel}
            aria-label="Delete selected model"
            onClick={() => {
              if (selectedModel) setDeleteTarget(selectedModel);
            }}
          >
            Delete
          </Button>
          <Button
            icon={RefreshCw}
            loading={isFetching}
            aria-label="Refresh models list"
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
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Model Path</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Endpoints</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows cols={5} />}

            {!isLoading && isError && (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <BrainCircuit size={40} className="mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500 font-medium">Failed to load models</p>
                  <Button
                    icon={RefreshCw}
                    aria-label="Retry loading models"
                    onClick={() => refetch()}
                    className="mt-3 inline-flex"
                  >
                    Retry
                  </Button>
                </td>
              </tr>
            )}

            {!isLoading && !isError && models.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <BrainCircuit size={40} className="mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500 font-medium">No models yet</p>
                  <p className="text-zinc-400 text-xs mt-1">
                    Register your first model to get started
                  </p>
                </td>
              </tr>
            )}

            {models.map((model) => {
              const isSelected = selectedId === model.id;
              return (
                <tr
                  key={model.id}
                  onClick={() => setSelectedId(isSelected ? null : model.id)}
                  className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-accent/5"
                      : "hover:bg-surface-hover"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-accent"
                            : "border-zinc-300"
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
                        navigate(`/models/${model.id}`);
                      }}
                      className="font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
                    >
                      {model.name}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-zinc-400 truncate block max-w-xs">
                      {model.model_path}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {model.endpoint_count > 0 ? (
                      <span className="text-emerald-600 text-xs font-medium">
                        {model.endpoint_count}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {new Date(model.created_at).toLocaleString(undefined, { hour12: false })}
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

      {showRegister && (
        <Modal title="Register Model" onClose={() => setShowRegister(false)}>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <FormLabel>Name</FormLabel>
              <FormInput
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="my-model"
              />
            </div>

            <div>
              <FormLabel>Model Path</FormLabel>
              <FormInput
                type="text"
                value={form.model_path}
                onChange={(e) => setForm({ ...form, model_path: e.target.value })}
                required
                placeholder="s3://bucket/path/to/model"
                className="font-mono text-xs"
              />
            </div>

            <div>
              <FormLabel>Description (optional)</FormLabel>
              <FormTextarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="e.g., XGBoost classifier trained on customer churn data"
              />
            </div>

            {createModelMutation.isError && (
              <p className="text-xs text-red-500">
                Failed to register model. Check if the name is unique.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setShowRegister(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={createModelMutation.isPending}
                className="px-4"
              >
                {createModelMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deployModel && (
        <CreateEndpointWizard
          model={deployModel}
          onClose={() => setDeployModel(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Model"
          name={deleteTarget.name}
          isError={deleteMutation.isError}
          isPending={deleteMutation.isPending}
          errorMessage="Cannot delete model with active endpoints."
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
