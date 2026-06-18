import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/formatters";

const navItems = [
  { label: "Overview", to: "/dashboard" },
  { label: "Consultants", to: "/dashboard#consultants" },
  { label: "Wallet", to: "/dashboard#wallet" },
  { label: "Become Consultant", to: "/dashboard#become-consultant" },
];

function ClientLayout({ user, children, onRefresh }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              CC
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                ConsultConnect
              </p>
              <p className="text-xs text-slate-500">Client Dashboard</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.to}
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl bg-emerald-50 px-3 py-2 text-right sm:block">
              <p className="text-xs text-emerald-700">Wallet Balance</p>
              <p className="text-sm font-semibold text-emerald-800">
                {formatCurrency(user?.wallet_balance)}
              </p>
            </div>

            <Button variant="secondary" size="sm" onClick={onRefresh}>
              Refresh
            </Button>

            <Button variant="danger" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default ClientLayout;
