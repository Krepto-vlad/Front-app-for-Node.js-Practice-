import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    socket = io("http://localhost:3333", {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }
  return socket;
}

export function useNotifications(onNotify: (data: unknown) => void) {
  const onNotifyRef = useRef(onNotify);

  useEffect(() => {
    onNotifyRef.current = onNotify;
  }, [onNotify]);

  useEffect(() => {
    const socket = getSocket();

    const handler = (data: unknown) => {
      console.log("Received notification:", data);
      onNotifyRef.current(data);
    };

    socket.on("article-updated", handler);

    return () => {
      socket.off("article-updated", handler);
    };
  }, []);
}
