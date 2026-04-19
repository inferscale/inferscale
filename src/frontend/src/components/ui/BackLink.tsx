import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  to: string;
  children: React.ReactNode;
}

export default function BackLink({ to, children }: Props) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-6"
    >
      <ArrowLeft size={16} />
      {children}
    </button>
  );
}
