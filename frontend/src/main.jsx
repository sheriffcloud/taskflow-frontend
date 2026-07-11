import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

// ReactDOM.createRoot finds the <div id="root"> in index.html
// and hands full control to React
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* AuthProvider wraps EVERYTHING so all components can access auth */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);