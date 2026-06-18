function Card({ children, className = "", padding = "p-6" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${padding} ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
