import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ConsultantProfilePage from "./pages/ConsultantProfilePage";
import AddFundsPage from "./pages/wallet/AddFundsPage";
import TransactionHistoryPage from "./pages/wallet/TransactionHistoryPage";
import ConsultationHistoryPage from "./pages/ConsultationHistoryPage";
import BecomeConsultantPage from "./pages/BecomeConsultantPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/consultants/:consultantId" element={<ConsultantProfilePage />} />

        <Route
          path="/wallet/add-funds"
          element={
            <ProtectedRoute>
              <AddFundsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consultations"
          element={
            <ProtectedRoute>
              <ConsultationHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/become-consultant"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <BecomeConsultantPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;