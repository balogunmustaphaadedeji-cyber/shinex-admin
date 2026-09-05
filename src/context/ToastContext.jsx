import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 rounded-xl shadow-lg px-4 py-3 text-sm font-medium border animate-[fadein_.2s_ease-out] ${
              t.type === "success"
                ? "bg-white border-[#159A61] text-[#0F7A4C]"
                : t.type === "error"
                ? "bg-white border-red-400 text-red-600"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            {t.type === "success" && <CheckCircle size={18} className="mt-0.5 shrink-0" />}
            {t.type === "error" && <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            {t.type === "info" && <Info size={18} className="mt-0.5 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
