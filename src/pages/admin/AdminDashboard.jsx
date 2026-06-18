import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchCurrentUser } from "../../api/userApi";
import {
  fetchAdminConsultantRequests,
  reviewConsultantRequest,
} from "../../api/adminApi";

import AdminLayout from "../../components/layout/AdminLayout";
import LoadingScreen from "../../components/common/LoadingScreen";
import AdminStats from "../../components/admin/dashboard/AdminStats";
import ConsultantRequestsPanel from "../../components/admin/dashboard/ConsultantRequestsPanel";
import ReviewRequestModal from "../../components/admin/dashboard/ReviewRequestModal";
import Button from "../../components/ui/Button";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewDecision, setReviewDecision] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const [userData, consultantRequests] = await Promise.all([
      fetchCurrentUser(),
      fetchAdminConsultantRequests(),
    ]);

    if (userData.role !== "admin") {
      throw new Error(
        "This dashboard is for admins only. Please use the correct dashboard for your role."
      );
    }

    localStorage.setItem("userRole", userData.role);
    setUser(userData);
    setRequests(consultantRequests);
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

  const handleReviewClick = (request, decision) => {
    setSelectedRequest(request);
    setReviewDecision(decision);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    await reviewConsultantRequest(selectedRequest.id, reviewData);
    await loadDashboardData();
  };

  if (loading) {
    return <LoadingScreen message="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-100 shadow-sm">
          <h2 className="text-xl font-semibold">Unable to load admin dashboard</h2>
          <p className="mt-3 text-sm text-rose-300">{error}</p>
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
    <AdminLayout user={user} onRefresh={handleRefresh}>
      <div className="space-y-8">
        <section className="space-y-2">
          <p className="text-sm font-medium text-violet-300">Administration</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Consultant Request Queue
          </h1>
          <p className="max-w-2xl text-slate-400">
            Review client applications, approve qualified candidates, or reject
            applications with a mandatory 30-day cooldown.
          </p>
        </section>

        <AdminStats requests={requests} />

        <ConsultantRequestsPanel
          requests={requests}
          loading={refreshing}
          onReview={handleReviewClick}
        />
      </div>

      <ReviewRequestModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        request={selectedRequest}
        decision={reviewDecision}
        onSubmit={handleReviewSubmit}
      />
    </AdminLayout>
  );
}

export default AdminDashboard;
