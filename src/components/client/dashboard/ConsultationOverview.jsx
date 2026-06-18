import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import { formatCurrency, formatDate } from "../../../utils/formatters";

const statusStyles = {
  pending: "warning",
  accepted: "info",
  ongoing: "success",
  completed: "default",
  rejected: "danger",
  expired: "danger",
};

function ConsultationOverview({ consultations, loading }) {
  const activeConsultations = consultations.filter((item) =>
    ["pending", "accepted", "ongoing"].includes(item.status)
  );

  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Your Consultations
        </h2>
        <p className="text-sm text-slate-500">
          Track pending requests and active sessions
        </p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">
          Loading consultations...
        </div>
      ) : activeConsultations.length === 0 ? (
        <EmptyState
          title="No active consultations"
          description="Book an online consultant to start your first session."
        />
      ) : (
        <div className="space-y-3">
          {activeConsultations.slice(0, 5).map((consultation) => (
            <div
              key={consultation.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
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
              </div>

              <span className="text-sm font-medium text-indigo-600">
                Chat coming soon
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default ConsultationOverview;
