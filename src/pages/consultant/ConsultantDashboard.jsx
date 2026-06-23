import React, { useState, useEffect, useCallback } from "react";
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

export default function ConsultantDashboard() {
  const [user, setUser] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Using your explicit layer abstractions instead of broken .request() calls
      const [userData, consultationData] = await Promise.all([
        fetchCurrentUser(),
        fetchConsultations()
      ]);
      
      if (userData.role !== "consultant") {
        throw new Error("Unauthorized role entry point.");
      }
      
      setUser(userData);
      setConsultations(consultationData || []);
    } catch (err) {
      console.error("Dashboard payload initialization failure:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateStatus = async (id, statusAction) => {
    try {
      setActioningId(id);
      
      // Fixed signature matching your exact apiClient.js implementation
      await apiRequest(`/consultations/${id}/${statusAction}`, {
        method: "PATCH"
      });
      
      await fetchDashboardData();
    } catch (err) {
      alert(`Failed to execute ${statusAction}: ` + err.message);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
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
      {/* Welcome & Text Profile Stats banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage your live operational inbound consultations, process incoming user queues, and review your history.
        </p>
      </div>

      {/* Section 1: Inbound Pending Requests */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Clock className="h-5 w-5 text-amber-500" /> Incoming Requests
        </h2>
        
        {pendingRequests.length === 0 ? (
          <Card className="p-6 text-center border dark:border-slate-800 bg-white dark:bg-slate-900">
            <EmptyState 
              title="No active incoming alerts" 
              description="Clients searching for assignments will showcase entry flags inside this segment workspace layout."
              icon={User}
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="p-5 border dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-full text-indigo-600 dark:text-indigo-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Client Session Request</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">ID: ...{req.id.slice(-8)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-sm my-4 border-y border-slate-100 dark:border-slate-800 py-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Allocated Time:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{req.original_duration_minutes} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Gross Payout:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(req.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Expires:</span>
                      <span className="font-medium text-rose-500">{formatRelativeDate(req.request_expires_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="primary" 
                    className="w-full" 
                    disabled={actioningId !== null}
                    onClick={() => handleUpdateStatus(req.id, "accept")}
                  >
                    {actioningId === req.id ? <Spinner size="sm" /> : "Accept"}
                  </Button>
                  <Button 
                    variant="danger" 
                    className="w-full" 
                    disabled={actioningId !== null}
                    onClick={() => handleUpdateStatus(req.id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Previous Delivered Sessions */}
      <section>
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Calendar className="h-5 w-5 text-indigo-500" /> Session History & Completed Logs
        </h2>

        {baselineHistory.length === 0 ? (
          <Card className="p-6 text-center border dark:border-slate-800 bg-white dark:bg-slate-900">
            <EmptyState title="No historical logs found" description="Delivered items and adjustments appear here historical completion traces." />
          </Card>
        ) : (
          <Card className="overflow-hidden border dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b dark:border-slate-800">
                  <tr>
                    <th className="p-4">Session Token Reference</th>
                    <th className="p-4">Delivery Timeline</th>
                    <th className="p-4">Duration Context</th>
                    <th className="p-4">Valuation Earnings</th>
                    <th className="p-4 text-right">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {baselineHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        CC-SESSION-{item.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="p-4 text-slate-900 dark:text-white font-medium">
                        {item.started_at ? `Delivered ${formatDate(item.started_at)}` : `Requested ${formatDate(item.created_at)}`}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {item.duration_minutes || item.original_duration_minutes} minutes
                      </td>
                      <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.total_amount)}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium 
                          ${item.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : ""}
                          ${item.status === "ongoing" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : ""}
                          ${item.status === "rejected" || item.status === "expired" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" : ""}
                        `}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </ConsultantLayout>
  );
}