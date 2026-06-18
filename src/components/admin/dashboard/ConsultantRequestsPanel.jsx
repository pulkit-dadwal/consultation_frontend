import { useMemo, useState } from "react";
import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { formatDate } from "../../../utils/formatters";

const statusStyles = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const filters = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function ConsultantRequestsPanel({ requests, loading, onReview }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    if (activeFilter === "all") {
      return requests;
    }

    return requests.filter((request) => request.status === activeFilter);
  }, [activeFilter, requests]);

  return (
    <Card id="requests" className="border-slate-800 bg-slate-900 text-slate-100">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Consultant Applications
          </h2>
          <p className="text-sm text-slate-400">
            Review client requests to become consultants
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                activeFilter === filter.id
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-400">
          Loading applications...
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="There are no consultant requests matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-semibold text-white">
                      {request.applicant_name}
                    </h3>
                    <Badge variant={statusStyles[request.status]}>
                      {request.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-400">{request.applicant_email}</p>

                  <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                    <p>Applied: {formatDate(request.applied_at)}</p>
                    {request.reviewed_at ? (
                      <p>Reviewed: {formatDate(request.reviewed_at)}</p>
                    ) : null}
                  </div>

                  {request.notes ? (
                    <p className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-slate-300">
                      {request.notes}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3 text-sm">
                    {request.linkedin_url ? (
                      <a
                        href={request.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-300 hover:text-violet-200"
                      >
                        LinkedIn
                      </a>
                    ) : null}
                    {request.resume_url ? (
                      <a
                        href={request.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-300 hover:text-violet-200"
                      >
                        Resume
                      </a>
                    ) : null}
                    {request.portfolio_url ? (
                      <a
                        href={request.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-300 hover:text-violet-200"
                      >
                        Portfolio
                      </a>
                    ) : null}
                  </div>

                  {request.rejection_reason ? (
                    <p className="text-sm text-rose-300">
                      Rejection reason: {request.rejection_reason}
                    </p>
                  ) : null}

                  {request.cooldown_until ? (
                    <p className="text-sm text-amber-300">
                      Cooldown until: {formatDate(request.cooldown_until)}
                    </p>
                  ) : null}
                </div>

                {request.status === "pending" ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => onReview(request, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onReview(request, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

export default ConsultantRequestsPanel;
