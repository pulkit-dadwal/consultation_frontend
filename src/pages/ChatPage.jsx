import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/apiClient";
import { useConsultationSocket } from "../hooks/useConsultationSocket";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { Clock, Send, ShieldAlert } from "lucide-react";

export default function ChatPage() {
  const { id: consultationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Core State Management
  const [consultation, setConsultation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  
  // Extension State Management
  const [extensionMinutes, setExtensionMinutes] = useState(15);
  const [isRequestingExtension, setIsRequestingExtension] = useState(false);
  const [pendingExtension, setPendingExtension] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial consultation data context
  const fetchChatContext = useCallback(async () => {
    try {
      const [userContext, consultationContext, messageHistory] = await Promise.all([
        apiRequest("/users/me"),
        apiRequest(`/consultations/${consultationId}`),
        apiRequest(`/chat/${consultationId}/messages`),
      ]);
      setCurrentUser(userContext);
      setConsultation(consultationContext);
      setMessages(messageHistory || []);
      
      // Auto-exit if session is already concluded
      if (consultationContext.status === "completed" || consultationContext.status === "completed_expired") {
        navigate(userContext.role === "consultant" ? "/consultant/dashboard" : "/");
        return;
      }

      // Reconstruct extension states if a pending one exists in backend attributes
      if (consultationContext.extension_status === "pending") {
        setPendingExtension({
          duration_minutes: consultationContext.extension_duration_minutes,
          total_amount: consultationContext.extension_total_amount
        });
      }
    } catch (err) {
      console.error("Failed to fetch layout chat contextual metrics:", err);
      alert("Error initializing conversation room structure.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [consultationId, navigate]);

  useEffect(() => {
    fetchChatContext();
  }, [fetchChatContext]);

  const handleSocketMessage = useCallback((data) => {
    if (data.consultation_id && data.consultation_id !== consultationId) return;

    if (data.type === "chat_message") {
      const incomingMessage = data.message || {
        id: data.message_id,
        consultation_id: data.consultation_id,
        sender_id: data.sender_id,
        content: data.content,
        message_type: "chat",
        sent_at: data.sent_at,
      };

      setMessages((prev) => {
        const exists = prev.some((message) => message.id === incomingMessage.id);
        return exists ? prev : [...prev, incomingMessage];
      });
    }

    if (data.type === "extension_request") {
      setPendingExtension({
        duration_minutes: data.additional_minutes,
        total_amount: data.extension_amount,
      });
    }

    if (data.type === "extension_accepted") {
      setPendingExtension(null);
      setConsultation((prev) => ({
        ...prev,
        duration_minutes: data.new_duration_minutes || prev.duration_minutes + data.additional_minutes,
      }));
      alert("Session extension approved successfully!");
    }

    if (data.type === "extension_rejected") {
      setPendingExtension(null);
      alert("The extension request was declined.");
    }

    if (data.type === "consultation_completed") {
      alert("The consultation session window has ended.");
      navigate(currentUser?.role === "consultant" ? "/consultant/dashboard" : "/");
    }
  }, [consultationId, currentUser?.role, navigate]);

  useConsultationSocket(localStorage.getItem("token"), handleSocketMessage);

  // Track and execute live text message transmissions
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const content = typedMessage.trim();
    setTypedMessage("");

    apiRequest("/chat/messages", {
      method: "POST",
      body: JSON.stringify({
        consultation_id: consultationId,
        content,
      }),
    })
      .then((createdMessage) => {
        setMessages((prev) => [...prev, createdMessage]);
      })
      .catch((err) => {
        setTypedMessage(content);
        alert(err.message || "Failed to send message.");
      });
  };

  // Live countdown clock calculations
  useEffect(() => {
    if (!consultation?.started_at) return;

    const interval = setInterval(() => {
      const startTime = new Date(consultation.started_at).getTime();
      const allowedDurationMs = consultation.duration_minutes * 60 * 1000;
      const expirationTimestamp = startTime + allowedDurationMs;
      const remainingMs = expirationTimestamp - Date.now();

      if (remainingMs <= 0) {
        setTimeLeft("00:00");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [consultation]);

  // Auto-scroll layout box on text flow inflation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extension Action Interchanges matching consultation_service hooks
  const handleTriggerExtensionRequest = async () => {
    try {
      setIsRequestingExtension(true);
      await apiRequest(`/consultations/${consultationId}/extension-request`, {
        method: "POST",
        body: JSON.stringify({ additional_minutes: parseInt(extensionMinutes) })
      });
      alert("Extension request dispatched to consultant. Awaiting approval...");
    } catch (err) {
      alert(err.message || "Failed to issue extension transaction request.");
    } finally {
      setIsRequestingExtension(false);
    }
  };

  const handleRespondToExtension = async (responseAction) => {
    try {
      await apiRequest(`/consultations/${consultationId}/extension-request/${responseAction}`, {
        method: "PATCH"
      });
      setPendingExtension(null);
    } catch (err) {
      alert(err.message || "Failed to submit validation status choice.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col bg-white rounded-xl shadow border border-slate-200 overflow-hidden max-w-5xl mx-auto">
      {/* Dynamic Session Sticky Context Ribbon Header */}
      <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
        <div>
          <h2 className="font-bold text-lg">Live Active Chat Window</h2>
          <p className="text-xs text-slate-400">ID: {consultationId}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
          <span className="font-mono font-bold tracking-wider text-amber-400">{timeLeft || "--:--"}</span>
        </div>
      </div>

      {/* Main Conversation Window Flow Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Stream Pane */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              ✨ Encrypted consultation initiated. Type a message below to start your sync strategy.
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}>
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Contextual Action Panel Sidecar Widget Frame */}
        <div className="w-80 border-l border-slate-200 bg-slate-50/50 p-6 space-y-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-sm text-slate-800 mb-2">Session Parameters</h3>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Role profile context: <strong className="text-slate-700 uppercase font-mono">{currentUser?.role}</strong></div>
              <div>Base time parameter: <strong>{consultation?.duration_minutes} Minutes</strong></div>
            </div>
          </div>

          {/* Render Context for Clients needing to fire dynamic time expansions */}
          {currentUser?.role === "client" && !pendingExtension && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                ➕ Request Time Extension
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Additional Duration</label>
                <select
                  value={extensionMinutes}
                  onChange={(e) => setExtensionMinutes(e.target.value)}
                  className="w-full text-sm border rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="3">3 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                </select>
              </div>
              <Button
                onClick={handleTriggerExtensionRequest}
                loading={isRequestingExtension}
                variant="primary"
                className="w-full text-xs py-2"
              >
                Request Extension
              </Button>
            </div>
          )}

          {/* Real-time Inline Dialog Interceptor for Pending Extension approvals */}
          {pendingExtension && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm space-y-3 animate-fade-in">
              <h4 className="font-semibold text-sm text-amber-900 flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 text-amber-600" /> Pending Extension
              </h4>
              <p className="text-xs text-amber-800">
                A request has been opened to extend this consultation session by{" "}
                <strong>{pendingExtension.duration_minutes} minutes</strong>.
              </p>

              {currentUser?.role === "consultant" ? (
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => handleRespondToExtension("accept")} variant="primary" className="flex-1 text-xs py-1.5 bg-amber-600 hover:bg-amber-700 border-none">
                    Accept
                  </Button>
                  <Button onClick={() => handleRespondToExtension("reject")} variant="danger" className="flex-1 text-xs py-1.5">
                    Decline
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-amber-600 italic animate-pulse text-center">
                  Waiting for consultant response...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Text Message Dispatch Bar */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4 bg-white flex gap-3">
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="Type your message context here..."
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        <Button type="submit" variant="primary" className="rounded-xl px-5 flex items-center gap-1.5">
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
