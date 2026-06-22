import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/formatters";

const menuItems = [
  { label: "Transaction History", to: "/wallet/transactions", requiresAuth: true },
  { label: "Consultation History", to: "/consultations", requiresAuth: true },
  { label: "Become Consultant", to: "/become-consultant", requiresAuth: true },
];

function SiteHeader({ user, onUserUpdate }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = Boolean(user);

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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            CC
          </div>
          <p className="text-sm font-semibold text-slate-900 sm:text-base">
            ConsultConnect
          </p>
        </Link>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="hidden rounded-xl bg-emerald-50 px-3 py-2 text-right sm:block">
                <p className="text-xs text-emerald-700">Wallet Balance</p>
                <p className="text-sm font-semibold text-emerald-800">
                  {formatCurrency(user.wallet_balance)}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/wallet/add-funds")}
              >
                Add Funds
              </Button>
            </>
          ) : null}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
            >
              <span className="block h-0.5 w-5 rounded bg-slate-700" />
              <span className="block h-0.5 w-5 rounded bg-slate-700" />
              <span className="block h-0.5 w-5 rounded bg-slate-700" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {isLoggedIn ? (
                  <>
                    {menuItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleMenuNavigate(item)}
                        className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={logout}
                      className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {menuItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleMenuNavigate(item)}
                        className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/login");
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/register");
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;