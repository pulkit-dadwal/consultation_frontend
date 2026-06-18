import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchCurrentUser } from "../../api/userApi";
import { depositFunds, fetchWalletTransactions } from "../../api/walletApi";
import { fetchOnlineConsultants } from "../../api/consultantApi";
import { fetchConsultations } from "../../api/consultationApi";
import {
  fetchMyConsultantRequests,
  submitConsultantRequest,
} from "../../api/consultantRequestApi";

import ClientLayout from "../../components/layout/ClientLayout";
import LoadingScreen from "../../components/common/LoadingScreen";
import DashboardStats from "../../components/client/dashboard/DashboardStats";
import WalletOverview from "../../components/client/dashboard/WalletOverview";
import AddFundsModal from "../../components/client/dashboard/AddFundsModal";
import TransactionHistory from "../../components/client/dashboard/TransactionHistory";
import OnlineConsultants from "../../components/client/dashboard/OnlineConsultants";
import ConsultationOverview from "../../components/client/dashboard/ConsultationOverview";
import ConsultantApplication from "../../components/client/dashboard/ConsultantApplication";
import Button from "../../components/ui/Button";

function ClientDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [consultantRequests, setConsultantRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const [
      userData,
      walletTransactions,
      onlineConsultants,
      userConsultations,
      requests,
    ] = await Promise.all([
      fetchCurrentUser(),
      fetchWalletTransactions(),
      fetchOnlineConsultants(),
      fetchConsultations(),
      fetchMyConsultantRequests(),
    ]);

    if (userData.role !== "client") {
      throw new Error(
        "This dashboard is for clients only. Consultant and admin dashboards are coming next."
      );
    }

    localStorage.setItem("userRole", userData.role);
    setUser(userData);
    setTransactions(walletTransactions);
    setConsultants(onlineConsultants);
    setConsultations(userConsultations);
    setConsultantRequests(requests);
  }, [navigate]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await loadDashboardData();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      await loadDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddFunds = async (amount) => {
    await depositFunds(amount);
    await loadDashboardData();
  };

  const handleConsultantApplication = async (requestData) => {
    await submitConsultantRequest(requestData);
    const requests = await fetchMyConsultantRequests();
    setConsultantRequests(requests);
  };

  const activeConsultationsCount = useMemo(
    () =>
      consultations.filter((item) =>
        ["pending", "accepted", "ongoing"].includes(item.status)
      ).length,
    [consultations]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Unable to load dashboard
          </h2>
          <p className="mt-3 text-sm text-rose-600">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back to Login
            </Button>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientLayout user={user} onRefresh={handleRefresh}>
      <div className="space-y-8">
        <section className="space-y-2">
          <p className="text-sm font-medium text-indigo-600">Welcome back</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Hello, {user.name}
          </h1>
          <p className="max-w-2xl text-slate-600">
            Manage your wallet, browse online consultants, and track your
            consultation requests from one place.
          </p>
        </section>

        <DashboardStats
          user={user}
          consultantsCount={consultants.length}
          consultationsCount={activeConsultationsCount}
        />

        <WalletOverview
          balance={user.wallet_balance}
          loading={refreshing}
          onAddFunds={() => setIsAddFundsOpen(true)}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <ConsultationOverview
            consultations={consultations}
            loading={refreshing}
          />
          <OnlineConsultants consultants={consultants} loading={refreshing} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <TransactionHistory transactions={transactions} loading={refreshing} />
          <ConsultantApplication
            requests={consultantRequests}
            onSubmit={handleConsultantApplication}
            loading={refreshing}
          />
        </div>
      </div>

      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        onSubmit={handleAddFunds}
      />
    </ClientLayout>
  );
}

export default ClientDashboard;
