import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const navItems = [
  { label: "Overview", to: "/admin/dashboard" },
  { label: "Requests", to: "/admin/dashboard#requests" },
];

function AdminLayout({ user, children, onRefresh }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
              AD
            </div>

            <div>
              <p className="text-sm font-semibold text-white">ConsultConnect</p>
              <p className="text-xs text-slate-400">Admin Dashboard</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.to}
                className="text-sm font-medium text-slate-300 transition hover:text-violet-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-right sm:block">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
              onClick={onRefresh}
            >
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

export default AdminLayout;
