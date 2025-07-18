import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const RestoreSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.email === "admin@classicroyal.com";

  
  useEffect(() => {
    if (user && !isAdmin) {
      sessionStorage.setItem("lastPath", location.pathname);
    }
  }, [location, user, isAdmin]);

  
  useEffect(() => {
    const lastPath = sessionStorage.getItem("lastPath");
    const hasReturned = sessionStorage.getItem("hasReturned");

    if (user && !isAdmin && lastPath && !hasReturned) {
      sessionStorage.setItem("hasReturned", "true");
      if (location.pathname !== lastPath) {
        navigate(lastPath);
        toast.success("Welcome back!");
      }
    }
  }, [user, isAdmin, location, navigate]);

  return null;
};

export default RestoreSession;
