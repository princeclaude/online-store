import React, { useState, useEffect } from "react";
import { updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setNewEmail(data.email || user.email);
        setNewAddress(data.address || "");
        setNewPhone(data.phone || "");
      }
    };
    fetchUserData();
  }, [user]);

  const validateInputs = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;

    if (!emailRegex.test(newEmail)) newErrors.email = "Enter a valid email.";
    if (newPassword && newPassword.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!phoneRegex.test(newPhone))
      newErrors.phone = "Phone number must be 10–15 digits.";
    if (!newAddress.trim()) newErrors.address = "Address cannot be empty.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateInputs()) return;
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);

      if (newEmail !== user.email) {
        await updateEmail(user, newEmail);
        await updateDoc(userRef, { email: newEmail });
      }

      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      await updateDoc(userRef, {
        phone: newPhone,
        address: newAddress,
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error("Update failed:", err);
      setErrors({
        general: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteAccount = async () => {
    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      await logout();
      toast.success("Account deleted.");
      navigate("/");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-white p-6">
      {/* ✅ Breadcrumb */}
      <div className="text-sm text-gray-600 mb-6">
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/home")}
        >
          Home
        </span>{" "}
        &gt; <span className="text-gray-800 font-bold">Settings</span>
      </div>

      <h2 className="text-xl font-bold mb-6 text-center">Settings</h2>

      <div className="max-w-md mx-auto space-y-5 text-sm pb-10">
        {/* Email */}
        <div>
          <label className="block font-medium">Change Email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block font-medium">Change Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Leave blank if no change"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-xs text-blue-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium">Change Phone Number</label>
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block font-medium">Change Address</label>
          <textarea
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>

        {/* General error */}
        {errors.general && (
          <p className="text-red-500 text-xs text-center">{errors.general}</p>
        )}

        {/* Save button */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>

        {/* Delete account */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 border border-red-600 hover:bg-red-50 text-sm px-4 py-2 rounded w-full mt-2"
        >
          Delete My Account
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-md animate-slide-in z-50">
          ✅ Settings updated successfully
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold text-red-600">
              Confirm Delete
            </h3>
            <p className="text-sm mt-2 mb-4">
              Are you sure you want to permanently delete your account?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-1 text-gray-600 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteAccount}
                className="px-4 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
