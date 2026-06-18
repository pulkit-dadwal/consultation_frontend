import { useEffect, useState } from "react";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";

function ReviewRequestModal({
  isOpen,
  onClose,
  request,
  decision,
  onSubmit,
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRejectionReason("");
      setError("");
    }
  }, [isOpen, request, decision]);

  if (!request) {
    return null;
  }

  const isApproval = decision === "approved";
  const title = isApproval ? "Approve Application" : "Reject Application";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!isApproval && !rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        status: decision,
        rejection_reason: isApproval ? null : rejectionReason.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="review-request-form"
            variant={isApproval ? "primary" : "danger"}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Processing...
              </>
            ) : isApproval ? (
              "Confirm Approval"
            ) : (
              "Confirm Rejection"
            )}
          </Button>
        </>
      }
    >
      <form id="review-request-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">{request.applicant_name}</p>
          <p>{request.applicant_email}</p>
        </div>

        {isApproval ? (
          <p className="text-sm text-slate-600">
            This will promote the client to consultant and create their consultant
            profile in offline mode.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              The client will enter a 30-day cooldown before they can apply again.
            </p>

            <div>
              <label
                htmlFor="rejection-reason"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                rows={4}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Explain why this application was rejected..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                required
              />
            </div>
          </>
        )}

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </Modal>
  );
}

export default ReviewRequestModal;
