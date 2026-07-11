import { useEffect, useRef, useCallback } from "react";
import { getToken } from "../api/client";

// This hook:
// 1. Opens an SSE connection when a user logs in
// 2. Calls a provided function when a notification arrives
// 3. Closes the connection when the user logs out
const useNotifications = (userId, onNotification) => {
  // useRef holds the EventSource object without triggering re-renders
  // Think of it as a "sticky note" that persists between renders
  // but changing it doesn't cause the component to redraw
  const eventSourceRef = useRef(null);

  const connect = useCallback(() => {
    // Don't open a second connection if one already exists
    if (eventSourceRef.current) return;

    const token = getToken();
    if (!token || !userId) return;

    // EventSource is built into browsers — no library needed
    // It opens a persistent connection to our SSE endpoint
    // The token goes in the URL because EventSource doesn't support
    // custom headers — this is a known limitation of the browser API
    const url = `/api/notifications/stream`;

    // We can't set headers with EventSource, so we pass the token
    // via a query param — our gateway will need to accept this
    // For now we use a simple approach that works for learning
    const eventSource = new EventSource(url);

    // This fires when the connection successfully opens
    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    // This fires every time the server sends a message
    // The "message" event is the default SSE event type
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Ignore the initial "connected" confirmation message
        if (data.type === "connected") return;

        // Call whatever function the component gave us
        // This lets any component decide what to DO with notifications
        onNotification(data);
      } catch (err) {
        console.error("Failed to parse notification:", err);
      }
    };

    // This fires if the connection drops
    eventSource.onerror = () => {
      console.log("SSE connection lost, will retry...");
      // EventSource automatically retries — that's one of its built-in features
      // We don't need to write retry logic ourselves
    };

    eventSourceRef.current = eventSource;
  }, [userId, onNotification]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup function — runs when component unmounts
    // or when userId changes (e.g. logout)
    return () => disconnect();
  }, [userId, connect, disconnect]);
};

export default useNotifications;