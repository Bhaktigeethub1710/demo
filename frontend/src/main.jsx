import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize i18n before rendering
import "./i18n";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <App />
    </Suspense>
  );
}
