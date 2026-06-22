import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMyConsultantRequests,
  submitConsultantRequest,
} from "../api/consultantRequestApi";
import AppLayout from "../components/layout/AppLayout";
import ConsultantApplication from "../components/client/dashboard/ConsultantApplication";
import LoadingScreen from "../components/common/LoadingScreen";

function BecomeConsultantPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchMyConsultantRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSubmit = async (requestData) => {
    await submitConsultantRequest(requestData);
    const updated = await fetchMyConsultantRequests();
    setRequests(updated);
  };

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
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Become a Consultant</h1>
          <p className="mt-2 text-slate-600">
            Submit your profile for admin review and start offering consultations.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <ConsultantApplication
            requests={requests}
            onSubmit={handleSubmit}
            loading={false}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default BecomeConsultantPage;