import { BrainCircuit, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackLink from "../components/ui/BackLink";
import Button from "../components/ui/Button";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { useDeleteModel, useModel } from "../hooks/useQueries";

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: model, isLoading } = useModel(id!);
  const deleteMutation = useDeleteModel();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!model) return;
    deleteMutation.mutate(model.id, {
      onSuccess: () => navigate("/models"),
    });
  };

  if (isLoading) {
    return (
      <div>
        <BackLink to="/models">Back to Models</BackLink>
        <div className="space-y-4">
          <div className="h-8 bg-zinc-100 rounded animate-pulse w-1/3" />
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-zinc-100 rounded animate-pulse w-2/3" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div>
        <BackLink to="/models">Back to Models</BackLink>
        <div className="text-center py-16">
          <BrainCircuit size={40} className="mx-auto text-zinc-300 mb-3" />
          <p className="text-zinc-500 font-medium">Model not found</p>
        </div>
      </div>
    );
  }

  const createdDate = new Date(model.created_at).toLocaleString(undefined, { hour12: false });
  const updatedDate = new Date(model.updated_at).toLocaleString(undefined, { hour12: false });

  return (
    <div>
      <BackLink to="/models">Back to Models</BackLink>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-800">{model.name}</h1>
        </div>
        <Button
          variant="danger-outline"
          icon={Trash2}
          aria-label="Delete model"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Model Path</span>
            <span className="font-mono text-xs text-zinc-600 break-all">{model.model_path}</span>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Created</span>
            <div className="flex items-center gap-1.5 text-sm text-zinc-600">
              <Clock size={13} className="text-zinc-400" />
              {createdDate}
            </div>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Updated</span>
            <div className="flex items-center gap-1.5 text-sm text-zinc-600">
              <Clock size={13} className="text-zinc-400" />
              {updatedDate}
            </div>
          </div>
          {model.description && (
            <div className="sm:col-span-2">
              <span className="text-xs text-zinc-400 block mb-1">Description</span>
              <span className="text-sm text-zinc-600">{model.description}</span>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Delete Model"
          name={model.name}
          isError={deleteMutation.isError}
          isPending={deleteMutation.isPending}
          errorMessage="Cannot delete model with active endpoints."
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
