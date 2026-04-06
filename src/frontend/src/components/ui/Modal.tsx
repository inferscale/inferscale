import { X } from "lucide-react";

const widthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: keyof typeof widthClasses;
}

export default function Modal({
  title,
  onClose,
  children,
  maxWidth = "md",
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`bg-surface border border-border rounded-lg shadow-xl w-full ${widthClasses[maxWidth]} p-6 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-surface-hover transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
