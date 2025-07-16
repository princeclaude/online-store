import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const UserInfoModal = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid); // 🔁 You may need to use user.email if your docs are keyed by email
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserInfo(snap.data());
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setVisible(true), 50);
    return () => {
      document.body.style.overflow = "auto";
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 500);
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMessage("✅ You have been logged out.");
      setTimeout(() => {
        setMessage("");
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={modalRef}
        className={`w-full sm:w-[400px] h-full bg-white shadow-lg transform transition-transform duration-700 ease-in-out p-6 relative ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800 mt-10">
          User Profile
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <p className="text-gray-700">
              <strong>Name:</strong> {userInfo?.name || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {user?.email || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Address:</strong> {userInfo?.address || "Not provided"}
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> {userInfo?.phone || "Not provided"}
            </p>
            <p className="text-gray-700">
              <strong>Wallet:</strong>{" "}
              {userInfo?.wallet != null
                ? Number(userInfo.wallet).toLocaleString()
                : "Not provided"}
            </p>
            <p className="text-gray-700">
              <strong>Created:</strong>{" "}
              {userInfo?.createdAt?.toDate
                ? userInfo.createdAt.toDate().toLocaleString()
                : "Not provided"}
            </p>

            <button
              onClick={handleLogout}
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>

            {message && (
              <p className="mt-4 text-sm text-green-600 font-medium">
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserInfoModal;
