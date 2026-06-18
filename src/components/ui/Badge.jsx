const styles = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-indigo-100 text-indigo-700",
  online: "bg-emerald-100 text-emerald-700",
};

function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
