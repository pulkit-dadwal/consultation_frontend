import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ConsultantLayout from "../../components/layout/ConsultantLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { fetchCurrentUser } from "../../api/userApi";
import { fetchConsultations } from "../../api/consultationApi";
import { apiRequest } from "../../api/apiClient";
import { formatDate, formatRelativeDate, formatCurrency } from "../../utils/formatters";
import { User, Calendar, Clock } from "lucide-react";
import { useConsultationSocket } from "../../hooks/useConsultationSocket";

export default function ConsultantDashboard() {
  const [user, setUser] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const navigate = useNavigate();

  // Fetches data without triggering global redirect logic
  const fetchDashboardData = useCallback(async () => {
    try {
      const [userData, consultationData] = await Promise.all([
        fetchCurrentUser(),
        fetchConsultations()
      ]);
      setUser(userData);
      setConsultations(consultationData || []);
    } catch (err) {
      console.error("Dashboard fetch error (isolated):", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time listener: Only appends data if it's not already present
  const handleSocketMessage = useCallback((data) => {
    if (data?.type === "consultation_request") {
      const incomingConsultation = data.consultation || {
        id: data.consultation_id,
        client_id: data.client_id,
        original_duration_minutes: data.duration_minutes,
        duration_minutes: data.duration_minutes,
        total_amount: data.total_amount,
        status: "pending",
        notes: data.notes,
        request_expires_at: data.request_expires_at,
      };

      setConsultations((prev) => {
        const exists = prev.some((c) => c.id === incomingConsultation.id);
        return exists ? prev : [incomingConsultation, ...prev];
      });
    }
  }, []);

  useConsultationSocket(localStorage.getItem("token"), handleSocketMessage);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateStatus = async (id, statusAction) => {
    setActioningId(id);
    try {
      // API call: Ensuring no unhandled promise rejection bubbles up
      await apiRequest(`/consultations/${id}/${statusAction}`, {
        method: "PATCH"
      });
    
      if (statusAction === "accept") {
        // Direct navigation to chat
        navigate(`/chat/${id}`);
      } else {
        // Refresh only if non-critical
        await fetchDashboardData();
      }
    } catch (err) {
      console.error("Action failure:", err);
      // alert used instead of throwing, keeping the component alive
      alert(`Operation failed: ${err.message || "Please try again."}`);
    } finally {
      setActioningId(null);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingRequests = consultations.filter((c) => c.status === "pending");
  const baselineHistory = consultations.filter((c) => c.status !== "pending");

  return (
    <ConsultantLayout user={user} onRefresh={fetchDashboardData}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage your live operational inbound consultations and review your history.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Clock className="h-5 w-5 text-amber-500" /> Incoming Requests
        </h2>
        
        {pendingRequests.length === 0 ? (
          <Card className="p-6 text-center border dark:border-slate-800 bg-white dark:bg-slate-900">
            <EmptyState title="No active incoming alerts" description="Waiting for new client requests..." icon={User} />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="p-5 border dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Client Session Request</h3>
                  <div className="space-y-1.5 text-sm my-4 border-y border-slate-100 dark:border-slate-800 py-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Allocated Time:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {req.original_duration_minutes || req.duration_minutes} mins
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gross Payout:</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(req.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button variant="primary" className="w-full" disabled={actioningId !== null} onClick={() => handleUpdateStatus(req.id, "accept")}>
                    {actioningId === req.id ? <Spinner size="sm" /> : "Accept"}
                  </Button>
                  <Button variant="danger" className="w-full" disabled={actioningId !== null} onClick={() => handleUpdateStatus(req.id, "reject")}>
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Calendar className="h-5 w-5 text-indigo-500" /> Session History
        </h2>

        <Card className="overflow-hidden border dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Timeline</th>
                <th className="p-4">Earnings</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {baselineHistory.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-mono text-xs">{item.id.slice(0, 8)}</td>
                  <td className="p-4">{item.started_at ? formatDate(item.started_at) : "Pending"}</td>
                  <td className="p-4 font-semibold text-emerald-600">{formatCurrency(item.total_amount)}</td>
                  <td className="p-4 text-right">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </ConsultantLayout>
  );
}
