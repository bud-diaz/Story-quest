import { useCallback, useState } from 'react';
import { useEventBus } from '@/ui/hooks/useEventBus';

interface ToastItem {
  id: number;
  message: string;
}

let nextToastId = 0;
const TOAST_DURATION_MS = 3200;

export function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const handleToast = useCallback((payload: { message: string }) => {
    const id = nextToastId++;
    setToasts((prev) => [...prev, { id, message: payload.message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_DURATION_MS);
  }, []);

  useEventBus('toast', handleToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.message}
        </div>
      ))}
    </div>
  );
}
