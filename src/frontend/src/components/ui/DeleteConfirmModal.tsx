import Button from "./Button";
import Modal from "./Modal";

interface Props {
  title: string;
  name: string;
  isError: boolean;
  isPending: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  title,
  name,
  isError,
  isPending,
  errorMessage = "Failed to delete.",
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal title={title} onClose={onClose} maxWidth="sm">
      <p className="text-sm text-zinc-500 mb-5">
        Are you sure you want to delete{" "}
        <span className="text-zinc-800 font-medium">{name}</span>?
        This action cannot be undone.
      </p>

      {isError && (
        <p className="text-xs text-red-500 mb-3">{errorMessage}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          loading={isPending}
          className="px-4"
        >
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
