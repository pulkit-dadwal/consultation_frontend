import { useState } from "react";
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

function ConsultantApplication({ requests, onSubmit, loading }) {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const latestRequest = requests[0];
  const hasPendingRequest = latestRequest?.status === "pending";
  const isOnCooldown =
    latestRequest?.status === "rejected" &&
    latestRequest?.cooldown_until &&
    new Date(latestRequest.cooldown_until) > new Date();

  const canApply = !hasPendingRequest && !isOnCooldown;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!linkedinUrl && !resumeUrl && !portfolioUrl && !notes) {
      setError("Please provide at least one detail for your application.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        linkedin_url: linkedinUrl || null,
        resume_url: resumeUrl || null,
        portfolio_url: portfolioUrl || null,
        notes: notes || null,
      });

      setLinkedinUrl("");
      setResumeUrl("");
      setPortfolioUrl("");
      setNotes("");
      setSuccess("Your consultant application has been submitted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card id="become-consultant">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Become a Consultant
        </h2>
        <p className="text-sm text-slate-500">
          Submit your profile for admin review and start offering consultations
        </p>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Loading application status...
        </div>
      ) : (
        <>
          {latestRequest ? (
            <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-700">
                  Latest application
                </span>
                <Badge variant={statusStyles[latestRequest.status]}>
                  {latestRequest.status}
                </Badge>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>Applied: {formatDate(latestRequest.applied_at)}</p>

                {latestRequest.reviewed_at ? (
                  <p>Reviewed: {formatDate(latestRequest.reviewed_at)}</p>
                ) : null}

                {latestRequest.rejection_reason ? (
                  <p className="sm:col-span-2">
                    Reason: {latestRequest.rejection_reason}
                  </p>
                ) : null}

                {isOnCooldown ? (
                  <p className="sm:col-span-2 text-amber-700">
                    You can apply again after{" "}
                    {formatDate(latestRequest.cooldown_until)}.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No applications yet"
              description="Share your LinkedIn, resume, or portfolio to apply as a consultant."
            />
          )}

          {canApply ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                    placeholder="https://linkedin.com/in/you"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Resume URL
                  </label>
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(event) => setResumeUrl(event.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(event) => setPortfolioUrl(event.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="Tell us about your expertise and experience..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              {success ? (
                <p className="text-sm text-emerald-600">{success}</p>
              ) : null}

              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-slate-500">
              {hasPendingRequest
                ? "Your application is pending admin review."
                : "You are currently in a cooldown period after a rejected application."}
            </p>
          )}
        </>
      )}
    </Card>
  );
}

export default ConsultantApplication;
