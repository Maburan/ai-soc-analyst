import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast, type ToastType } from "../context/ToastContext";

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-green-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
};

const styleMap: Record<ToastType, string> = {
  success: "border-green-500/20 bg-green-500/10 text-green-400",
  error: "border-red-500/20 bg-red-500/10 text-red-400",
  info: "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-24 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg slide-in ${styleMap[toast.type]}`}
          role="alert"
        >
          {iconMap[toast.type]}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
