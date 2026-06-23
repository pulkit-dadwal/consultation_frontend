import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Calendar, UserPlus, LogOut, Menu, X, Plus, Sun, Moon } from "lucide-react";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";

const menuItems = [
  { label: "Transaction History", to: "/wallet/transactions", requiresAuth: true, icon: Wallet },
  { label: "Consultation History", to: "/consultations", requiresAuth: true, icon: Calendar },
  { label: "Become Consultant", to: "/become-consultant", requiresAuth: true, icon: UserPlus, clientOnly: true },
];

function SiteHeader({ user, onUserUpdate }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const isLoggedIn = Boolean(user);
  const userRole = user?.role || localStorage.getItem("userRole");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setMenuOpen(false);
    onUserUpdate?.(null);
    navigate("/");
  };

  const handleMenuNavigate = (item) => {
    setMenuOpen(false);

    if (item.requiresAuth && !isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(item.to)}`);
      return;
    }

    navigate(item.to);
  };

  // Filter menu items dynamically based on the current user's role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.clientOnly && userRole !== "client") {
      return false;
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white animate-pulse">
            CC
          </div>
          <p className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
            ConsultConnect
          </p>
        </Link>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Switch */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="text-slate-500 dark:text-slate-400"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 border border-emerald-100/50 px-3 py-1.5 transition text-slate-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-slate-200">
              <Wallet className="h-4.5 w-4.5 text-emerald-600 shrink-0 dark:text-emerald-400" />
              <div className="text-left leading-none sm:block hidden">
                <p className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                  {userRole === "consultant" ? "Earnings" : "Wallet"}
                </p>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {formatCurrency(user.wallet_balance)}
                </p>
              </div>
              <div className="text-left leading-none sm:hidden block">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {formatCurrency(user.wallet_balance)}
                </p>
              </div>
              {userRole === "client" && (
                <button
                  type="button"
                  title="Add Funds"
                  onClick={() => navigate("/wallet/add-funds")}
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </div>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 dark:border-slate-700 dark:bg-slate-800">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleMenuNavigate(item)}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    >
                      <Icon className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                {isLoggedIn ? (
                  <>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="h-4.5 w-4.5 text-rose-500 dark:text-rose-400" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;