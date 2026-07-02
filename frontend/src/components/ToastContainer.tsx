import { useToast, type ToastType } from "../context/ToastContext";

const iconMap: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2715",
  info: "\u2139",
};

const styleMap: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-24 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg animate-slide-in ${styleMap[toast.type]}`}
          role="alert"
        >
          <span className="text-base">{iconMap[toast.type]}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            \u2715
          </button>
        </div>
      ))}
    </div>
  );
}
