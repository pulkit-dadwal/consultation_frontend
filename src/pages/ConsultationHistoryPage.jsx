import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchConsultations } from "../api/consultationApi";
import AppLayout from "../components/layout/AppLayout";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingScreen from "../components/common/LoadingScreen";
import { formatCurrency, formatDate } from "../utils/formatters";

const statusStyles = {
  pending: "warning",
  accepted: "info",
  ongoing: "success",
  completed: "default",
  rejected: "danger",
  expired: "danger",
};

function ConsultationHistoryPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConsultations = useCallback(async () => {
    try {
      const data = await fetchConsultations();
      setConsultations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  if (loading) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Consultation History
          </h1>
          <p className="mt-2 text-slate-600">
            Track all your consultation requests and sessions.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : consultations.length === 0 ? (
          <EmptyState
            title="No consultations yet"
            description="Book an online consultant from the home page to get started."
          />
        ) : (
          <div className="space-y-3">
            {consultations.map((consultation) => (
              <Card key={consultation.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">
                        {consultation.duration_minutes} min session
                      </p>
                      <Badge variant={statusStyles[consultation.status]}>
                        {consultation.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Total: {formatCurrency(consultation.total_amount)} · Requested{" "}
                      {formatDate(consultation.scheduled_at)}
                    </p>
                    {consultation.notes ? (
                      <p className="mt-2 text-sm text-slate-600">{consultation.notes}</p>
                    ) : null}
                  </div>

                  {["pending", "accepted", "ongoing"].includes(consultation.status) ? (
                    <span className="text-sm font-medium text-indigo-600">
                      Chat coming soon
                    </span>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ConsultationHistoryPage;