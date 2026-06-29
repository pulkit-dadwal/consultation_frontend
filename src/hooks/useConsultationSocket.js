import { useEffect, useRef } from "react";

/**
 * Highly stable, strict-mode-resilient WebSocket connection hook.
 * Avoids termination warnings during rapid React mount/unmount lifecycles.
 */
export function useConsultationSocket(token, onMessageReceived) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onMessageReceived);

  // Keep the callback reference fresh without resetting the socket hook connection
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isComponentActive = true;
    let socket = null;

    // Resolve base endpoint dynamically
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const wsBaseUrl = apiBase.replace(/^http/, "ws");
    const wsUrl = `${wsBaseUrl}/ws?token=${token}`;

    const initializeSocket = () => {
      if (!isComponentActive) return;

      console.log("Establishing stable WebSocket channel:", wsUrl);
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (callbackRef.current && isComponentActive) {
            callbackRef.current(data);
          }
        } catch (err) {
          console.error("Failed to parse incoming WebSocket frame payload:", err);
        }
      };

      socket.onerror = (error) => {
        // Prevent printing connection-closed errors during StrictMode tear-down transitions
        if (isComponentActive) {
          console.error("WebSocket network transport error encountered:", error);
        }
      };

      socket.onclose = (event) => {
        if (isComponentActive) {
          console.log(`WebSocket channel disconnected. Code: ${event.code}. Reason: ${event.reason}`);
        }
      };
    };

    // Delay initialization slightly to let double-mount cycles settle gracefully
    const timer = setTimeout(initializeSocket, 50);

    return () => {
      isComponentActive = false;
      clearTimeout(timer);
      console.log("Cleaning up active WebSocket connection reference...");
      
      if (socket) {
        // Check state before closing to avoid handshaking exceptions
        if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => {
            socket.close();
          };
        } else if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      }
    };
  }, [token]);

  return socketRef.current;
}