import { FaTimes } from "react-icons/fa";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"; // 👈 for navigation
import { useNavigate } from "react-router-dom";

const EmptyWishlistPrompt = ({ onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = () => {
    onClose(); // Close the prompt
    navigate("/signin"); // Navigate to sign-in page
  };

  return (
    <div className="fixed top-16 right-4 sm:right-8 left-4 sm:left-auto z-50 animate-slideInDown">
      <div className="relative bg-white rounded-lg shadow-xl px-5 py-4 w-full max-w-xs sm:w-72">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          <FaTimes size={14} />
        </button>

        {/* Message */}
        <p className="text-sm font-semibold mb-2 text-black">
          Your Wishlist is Empty
        </p>
        <p className="text-xs text-gray-600 mb-4">
          Sign in or create an account to start saving your favorite items.
        </p>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:underline"
          >
            Maybe Later
          </button>

          <button
            onClick={handleSignIn}
            className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyWishlistPrompt;
