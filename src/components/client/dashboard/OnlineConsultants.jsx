import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import { formatCurrency } from "../../../utils/formatters";

function OnlineConsultants({ consultants, loading }) {
  return (
    <Card id="consultants">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Online Consultants
        </h2>
        <p className="text-sm text-slate-500">
          Book a session with experts currently available
        </p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">
          Loading consultants...
        </div>
      ) : consultants.length === 0 ? (
        <EmptyState
          title="No consultants online"
          description="Check back soon. Consultants appear here when they set their status to online."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {consultants.map((consultant) => (
            <article
              key={consultant.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {consultant.specialization || "General Consultant"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(consultant.consultation_fee_per_minute)} / min
                  </p>
                </div>

                <Badge variant="online">Online</Badge>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Rating: {Number(consultant.rating).toFixed(1)} ★
                </span>
                <span className="font-medium text-indigo-600">
                  Book coming soon
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

export default OnlineConsultants;
