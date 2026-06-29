import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../api/userApi";
import { useConsultationSocket } from "../../hooks/useConsultationSocket";
import { apiRequest } from "../../api/apiClient";
import SiteHeader from "./SiteHeader";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

function AppLayout({ children }) {
  const [user, setUser] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const userData = await fetchCurrentUser();
      localStorage.setItem("userRole", userData.role);
      setUser(userData);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Central handler for incoming WebSocket messages matching backend types
  const handleSocketMessage = useCallback((data) => {
    // 1. If current user is a consultant, intercept instant incoming consultation invitations
    if (data.type === "consultation_request" && user?.role === "consultant") {
      setIncomingRequest(data);
    }
    
    // 2. If current user is the client, auto-redirect immediately when accepted
    if (data.type === "consultation_accepted") {
      navigate(`/chat/${data.consultation_id}`);
    }

    // 3. Inform the client if the request was rejected
    if (data.type === "consultation_rejected") {
      alert("Your consultation request was declined by the consultant.");
    }
  }, [user, navigate]);

  // Persistent connection hook to ws://localhost:8000/ws?token=<JWT>
  useConsultationSocket(token, handleSocketMessage);

  // Handles the consultant accepting or rejecting a notification directly from the popup
  const handleConsultationResponse = async (action) => {
    if (!incomingRequest) return;
    try {
      // Calls PATCH /consultations/{id}/accept or /reject
      await apiRequest(`/consultations/${incomingRequest.consultation_id}/${action}`, {
        method: "PATCH",
      });
      setIncomingRequest(null);
      
      if (action === "accept") {
        navigate(`/chat/${incomingRequest.consultation_id}`);
      }
    } catch (err) {
      alert(err.message || `Failed to ${action} the consultation request.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader user={user} onUserUpdate={setUser} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Global Real-Time Request Invitation Modal Layer */}
      {incomingRequest && user?.role === "consultant" && (
        <Modal
          isOpen={Boolean(incomingRequest)}
          onClose={() => handleConsultationResponse("reject")}
          title="Incoming Consultation Request"
        >
          <div className="p-4 text-slate-800">
            <p className="mb-2">
              <span className="font-semibold">{incomingRequest.client_name}</span> has requested an instant session.
            </p>
            <div className="bg-slate-100 p-3 rounded-lg text-sm mb-4 space-y-1 font-medium text-slate-700">
              <div>⏱️ Duration: {incomingRequest.duration_minutes} Mins</div>
              <div>💰 Total Value: ${parseFloat(incomingRequest.total_amount).toFixed(2)}</div>
              {incomingRequest.notes && <div className="mt-1 font-normal text-slate-500 italic">" {incomingRequest.notes} "</div>}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleConsultationResponse("accept")} variant="primary" className="flex-1 py-2">
                Accept & Open Chat
              </Button>
              <Button onClick={() => handleConsultationResponse("reject")} variant="danger" className="flex-1 py-2">
                Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AppLayout;
