import { useState, useCallback } from "react";
import { useNotifications } from "../hooks/useNotifications";
import "./notification.css";

export default function Notification() {
  const [message, setMessage] = useState<string | null>(null);

  const handleNotification = useCallback((data: unknown) => {
    console.log("Notification received in component:", data);
    const notification = data as { type?: string; id?: string };
    let text = "";
    if (notification.type === "edit")
      text = `Article ${notification.id} was edited`;
    else if (notification.type === "file")
      text = `File attached to article ${notification.id}`;
    else if (notification.type === "delete-file")
      text = `File deleted from article ${notification.id}`;
    else text = "Article updated";
    setMessage(text);

    setTimeout(() => setMessage(null), 3000);
  }, []);

  useNotifications(handleNotification);

  if (!message) return null;
  return (
    <div className="notification">
      {message}
    </div>
  );
}
