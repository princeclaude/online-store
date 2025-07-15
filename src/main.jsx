// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css"; // important: includes Tailwind CSS
import "./styles/custom.css";
import { BagProvider } from "./contexts/BagContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BagProvider>
          <App />
        </BagProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
