import { Navigate, useLocation } from "react-router-dom";
import { getDashboardPath } from "../../utils/routing";

function ProtectedRoute({ children, allowedRoles = null }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    const redirect = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  if (allowedRoles) {
    const storedRole = localStorage.getItem("userRole");

    if (storedRole && !allowedRoles.includes(storedRole)) {
      return <Navigate to={getDashboardPath(storedRole)} replace />;
    }
  }

  return children;
}

export default ProtectedRoute;