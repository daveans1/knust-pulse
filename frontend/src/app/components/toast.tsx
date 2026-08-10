"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/* ─── Types ─── */
type ToastVariant = "success" | "error" | "warning";
type Toast = { id: number; message: string; variant: ToastVariant };
type ConfirmState = { message: string; resolve: (v: boolean) => void } | null;

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  confirm: (message: string) => Promise<boolean>;
}

const Ctx = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: string }> = {
  success: { bg: "bg-[#00ba7c]", icon: "✓" },
  error: { bg: "bg-[#f4212e]", icon: "✕" },
  warning: { bg: "bg-[#ff7a00]", icon: "⚠" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const addToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const confirmFn = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = (value: boolean) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  };

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <Ctx.Provider value={{ toast: addToast, confirm: confirmFn }}>
      {children}

      {/* Toast stack */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map((t) => {
          const style = variantStyles[t.variant];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl ${style.bg} px-4 py-3 text-white shadow-lg animate-[slideInRight_300ms_ease-out]`}
            >
              <span className="text-lg font-bold leading-none">{style.icon}</span>
              <p className="text-[14px] font-semibold flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="ml-2 text-white/70 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-[#16181c] border border-[#e6ebe5] dark:border-[#2f3336] shadow-2xl p-6">
            <p className="text-[16px] font-semibold text-[#0f1419] dark:text-[#e7e9ea] mb-6 leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleConfirm(false)}
                className="rounded-full border border-[#cfd9de] dark:border-[#536471] px-5 py-2 text-[14px] font-bold text-[#0f1419] dark:text-[#e7e9ea] hover:bg-[#0f14190a] dark:hover:bg-[#e7e9ea0a] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="rounded-full bg-[#f4212e] px-5 py-2 text-[14px] font-bold text-white hover:opacity-90 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
