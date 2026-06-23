import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, LogOut, RefreshCw, Wallet } from "lucide-react";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/formatters";

export default function ConsultantLayout({ user, onRefresh, children }) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/consultant/dashboard" className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              CC <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 ml-1">Consultant</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Info */}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
              <Wallet className="h-4 w-4" />
              <span>Earnings: {formatCurrency(user?.wallet_balance || 0)}</span>
            </div>

            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="text-slate-500 dark:text-slate-400">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Refresh Action */}
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh} className="text-slate-500 dark:text-slate-400">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            {/* Logout Action */}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
              <LogOut className="h-4 w-4" />
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