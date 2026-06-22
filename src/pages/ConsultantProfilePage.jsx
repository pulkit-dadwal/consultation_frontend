import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchConsultantById,
  fetchConsultantReviews,
} from "../api/consultantApi";
import AppLayout from "../components/layout/AppLayout";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingScreen from "../components/common/LoadingScreen";
import { formatCurrency, formatDate } from "../utils/formatters";

function ConsultantProfilePage() {
  const { consultantId } = useParams();
  const navigate = useNavigate();

  const [consultant, setConsultant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [consultantData, reviewData] = await Promise.all([
          fetchConsultantById(consultantId),
          fetchConsultantReviews(consultantId),
        ]);
        setConsultant(consultantData);
        setReviews(reviewData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [consultantId]);

  const handleBookConsultation = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/consultants/${consultantId}?book=true`)}`
      );
      return;
    }

    // Chat/booking flow will be implemented in a later phase.
    setBookingMessage(
      "Consultation booking and chat will be available soon. You are logged in and ready to book."
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  if (error || !consultant) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Consultant not found
          </h2>
          <p className="mt-3 text-sm text-rose-600">{error || "This profile could not be loaded."}</p>
          <div className="mt-6">
            <Button onClick={() => navigate("/")}>Back to consultants</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to consultants
        </Link>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">
                  {consultant.specialization || "General Consultant"}
                </h1>
                <Badge variant={consultant.status === "online" ? "online" : "default"}>
                  {consultant.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">
                    {Number(consultant.rating).toFixed(1)} ★
                  </span>{" "}
                  average rating
                </p>
                <p>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(consultant.consultation_fee_per_minute)}
                  </span>{" "}
                  per minute
                </p>
                <p>{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
              </div>

              <p className="max-w-2xl text-slate-600">
                Book a consultation session with this expert. Payment is deducted from
                your wallet only after the consultant accepts your request.
              </p>
            </div>

            <Button size="lg" onClick={handleBookConsultation}>
              Book Consultation
            </Button>
          </div>

          {bookingMessage ? (
            <p className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              {bookingMessage}
            </p>
          ) : null}
        </Card>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
            <p className="text-sm text-slate-500">
              Feedback from completed consultations
            </p>
          </div>

          {reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="This consultant has not received any reviews yet."
            />
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">
                      {review.rating} ★
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

export default ConsultantProfilePage;