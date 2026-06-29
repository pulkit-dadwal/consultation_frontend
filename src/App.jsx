import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import RegisterPage from "./pages/RegisterPage";
import ConsultantProfilePage from "./pages/ConsultantProfilePage";
import AddFundsPage from "./pages/wallet/AddFundsPage";
import TransactionHistoryPage from "./pages/wallet/TransactionHistoryPage";
import ConsultationHistoryPage from "./pages/ConsultationHistoryPage";
import BecomeConsultantPage from "./pages/BecomeConsultantPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ConsultantDashboard from "./pages/consultant/ConsultantDashboard";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/consultants/:consultantId" element={<ConsultantProfilePage />} />
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute allowedRoles={["client", "consultant"]}>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Wallet Management (Shared Roles) */}
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

          {/* Consultation Tracking (Shared Roles) */}
          <Route
            path="/consultations"
            element={
              <ProtectedRoute>
                <ConsultationHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Client-Only Workflow */}
          <Route
            path="/become-consultant"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <BecomeConsultantPage />
              </ProtectedRoute>
            }
          />

          {/* Consultant Dashboard Route */}
          <Route
            path="/consultant/dashboard"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <ConsultantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallbacks */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
