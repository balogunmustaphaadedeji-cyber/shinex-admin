import React from "react";
import { ChevronDown, AlertCircle, Loader2, Package } from "lucide-react";

export const COLORS = {
  primary: "#5B3FC6",
  primaryDark: "#4A32A3",
  secondary: "#159A61",
  secondaryDark: "#0F7A4C",
  bg: "#EFF7F2",
};

export function money(n) {
  const num = Number(n || 0);
  return `₦${num.toLocaleString("en-NG")}`;
}

export function Logo({ size = 28 }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className="rounded-xl flex items-center justify-center font-bold text-white"
        style={{ width: size, height: size, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, fontSize: size * 0.5 }}
      >
        S
      </div>
      <span className="font-extrabold text-lg tracking-tight" style={{ color: COLORS.primary }}>
        SHINEX <span className="font-semibold" style={{ color: COLORS.secondary }}>Admin</span>
      </span>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", as: As = "button", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const styles = {
    primary: "text-white shadow-sm hover:shadow-md",
    secondary: "text-white shadow-sm hover:shadow-md",
    outline: "border-2 bg-white",
    ghost: "hover:bg-black/5",
  };
  const inline =
    variant === "primary"
      ? { backgroundColor: COLORS.primary }
      : variant === "secondary"
      ? { backgroundColor: COLORS.secondary }
      : variant === "outline"
      ? { borderColor: COLORS.primary, color: COLORS.primary }
      : {};
  return (
    <As className={`${base} ${styles[variant]} ${className}`} style={inline} {...props}>
      {children}
    </As>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>}
      <input
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[15px] outline-none transition focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-[#5B3FC6]/20 focus:border-[#5B3FC6]"
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

export function Select({ label, error, className = "", children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>}
      <div className="relative">
        <select
          className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-[15px] outline-none transition focus:ring-2 bg-white ${
            error ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-[#5B3FC6]/20 focus:border-[#5B3FC6]"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200/80 rounded-xl ${className}`} />;
}

export function EmptyState({ icon: Icon = Package, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${COLORS.primary}14` }}>
        <Icon size={28} style={{ color: COLORS.primary }} />
      </div>
      <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-red-50">
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h3 className="font-semibold text-gray-800 text-lg">Something went wrong</h3>
      <p className="text-gray-500 text-sm mt-1 max-w-xs">{message || "We couldn't load this right now."}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 text-sm font-semibold" style={{ color: COLORS.primary }}>
          Try again
        </button>
      )}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin" size={28} style={{ color: COLORS.primary }} />
    </div>
  );
}
