// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.email === "admin@classicroyal.com";
  return isAdmin ? children : <Navigate to="/save" replace />;
};

export default AdminRoute;
