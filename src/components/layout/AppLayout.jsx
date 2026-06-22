import { useCallback, useEffect, useState } from "react";
import { fetchCurrentUser } from "../../api/userApi";
import SiteHeader from "./SiteHeader";

function AppLayout({ children }) {
  const [user, setUser] = useState(null);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const userData = await fetchCurrentUser();
      localStorage.setItem("userRole", userData.role);
      setUser(userData);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader user={user} onUserUpdate={setUser} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;