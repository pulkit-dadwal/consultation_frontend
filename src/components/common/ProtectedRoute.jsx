import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = null }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles) {
    const storedRole = localStorage.getItem("userRole");

    if (storedRole && !allowedRoles.includes(storedRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
