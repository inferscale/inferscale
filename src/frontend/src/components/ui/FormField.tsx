interface LabelProps {
  children: React.ReactNode;
}

export function FormLabel({ children }: LabelProps) {
  return (
    <label className="block text-xs font-medium text-zinc-500 mb-1.5">
      {children}
    </label>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function FormInput({ className = "", ...rest }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-md bg-bg border border-border text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-accent transition-colors ${className}`}
      {...rest}
    />
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormTextarea({ className = "", ...rest }: TextareaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 rounded-md bg-bg border border-border text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-accent transition-colors resize-none ${className}`}
      {...rest}
    />
  );
}
