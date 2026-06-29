import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { User, Clock, Wallet, X, AlertCircle } from "lucide-react";
import {
  fetchConsultantById,
  fetchConsultantReviews,
} from "../api/consultantApi";
import AppLayout from "../components/layout/AppLayout";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingScreen from "../components/common/LoadingScreen";
import { apiRequest } from "../api/apiClient";
import { formatCurrency, formatDate } from "../utils/formatters";

function ConsultantProfilePage() {
  const { consultantId } = useParams();
  const navigate = useNavigate();

  const [consultant, setConsultant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Booking dialog and logic states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [consultantData, reviewData] = await Promise.all([
          fetchConsultantById(consultantId),
          fetchConsultantReviews(consultantId),
        ]);
        setConsultant(consultantData);
        setReviews(reviewData);

        // Fetch current user wallet balance if a token exists
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await apiRequest("/users/me");
          setCurrentUser(userData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [consultantId]);

  useEffect(() => {
    if (!pendingBooking) return;

    // Set a strict 2-minute expiration countdown locally
    const expirationTime = Date.now() + 2 * 60 * 1000;

    const interval = setInterval(() => {
      const remainingMs = expirationTime - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft("00:00");
        setPendingBooking(false);
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingBooking]);

  const handleOpenBooking = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/consultants/${consultantId}?book=true`)}`
      );
      return;
    }

    setModalError("");
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (duration < 3) {
      setModalError("Please enter a duration of at least 3 minutes.");
      return;
    }

    setBookingLoading(true);
    setModalError("");
    try {
      // Create request payload matching the Pydantic ConsultationCreate schema
      await apiRequest("/consultations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consultant_id: consultantId,
          duration_minutes: parseInt(duration),
          notes: notes,
        }),
      });

      setShowBookingModal(false);
      setPendingBooking(true);
    } catch (err) {
      setModalError(err.message || "Failed to submit booking session request.");
    } finally {
      setBookingLoading(false);
    }
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
            <button 
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
            >
              Back to consultants
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Live total pricing calculations
  const totalCost = duration * (consultant?.consultation_fee_per_minute || 0);
  const isWalletInsufficient = currentUser && currentUser.wallet_balance < totalCost;

  return (
    <AppLayout>
      <div className="space-y-8">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to consultants
        </Link>

        {/* Pending booking countdown status banner */}
        {pendingBooking && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-amber-900 text-lg">
                  ⏳ Request Dispatched Successfully
                </h3>
                <p className="text-sm text-amber-800">
                  Waiting for the consultant to accept. Please keep this screen open.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl self-start sm:self-auto font-mono text-xl font-bold text-amber-950">
                <Clock className="h-5 w-5 text-amber-800" />
                {timeLeft || "02:00"}
              </div>
            </div>
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4 items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                    {consultant.name || "Unknown Consultant"}
                  </h1>
                  <Badge variant={consultant.status === "online" ? "online" : "default"}>
                    {consultant.status}
                  </Badge>
                </div>
                <p className="text-base font-semibold text-indigo-600">
                  {consultant.specialization || "General Consultant"}
                </p>

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
              </div>
            </div>

            <div className="space-y-4">
              <p className="max-w-2xl text-slate-600">
                Book an immediate live consultation. Payment is safely authorized from
                your wallet only after the consultant accepts your request.
              </p>
            </div>

            <button 
              type="button"
              onClick={handleOpenBooking}
              disabled={consultant.status !== "online" || pendingBooking}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-all duration-200 cursor-pointer ${
                consultant.status === "online" && !pendingBooking
                  ? "bg-indigo-600 hover:bg-indigo-700 active:scale-95" 
                  : "bg-slate-300 cursor-not-allowed text-slate-500"
              }`}
            >
              {consultant.status === "online" ? "Book Consultation" : "Offline"}
            </button>
          </div>
        </Card>

        {/* Reviews panel */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
            <p className="text-sm text-slate-500">
              Verified feedback from completed sessions
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

      {}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 transition-opacity backdrop-blur-sm"
            onClick={() => setShowBookingModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                ✨ Configure Consultation Session
              </h3>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-5 pt-4 text-slate-800">
              {modalError && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Manual numeric input for duration */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Session Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="3"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(3, parseInt(e.target.value) || 0))}
                  placeholder="Enter minutes (e.g. 30)"
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description / Topic Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell the consultant what you would like to discuss..."
                  rows={3}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Price Calculations and Wallet Checks */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee per Minute:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(consultant.consultation_fee_per_minute)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculated Cost:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalCost)}</span>
                </div>
                {currentUser && (
                  <div className="flex justify-between border-t border-slate-100 pt-2 text-xs">
                    <span className="text-slate-500">Your Current Wallet:</span>
                    <span className={`font-semibold ${isWalletInsufficient ? "text-rose-600" : "text-emerald-600"}`}>
                      {formatCurrency(currentUser.wallet_balance)}
                    </span>
                  </div>
                )}
              </div>

              {/* Warnings and Action Toggles */}
              {isWalletInsufficient && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-800 flex items-center gap-2">
                  <Wallet className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>You do not have enough funds. Please deposit more money to execute booking.</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isWalletInsufficient || bookingLoading}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white shadow text-sm transition-all duration-200 ${
                    isWalletInsufficient || bookingLoading
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                  }`}
                >
                  {bookingLoading ? "Transmitting..." : "Send Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default ConsultantProfilePage;
