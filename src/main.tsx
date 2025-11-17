import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Notification from "./Notification/Notification.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Notification />
  </BrowserRouter>
);
