import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignIn = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.email === "admin@classicroyal.com") {
        navigate("/save");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login failed:", err.message);
      alert("Login failed: " + err.message);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent. Please check your inbox.");
      setForgotModal(false);
      setResetEmail("");
    } catch (error) {
      console.error("Password reset error:", error.message);
      alert("Error: " + error.message);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
        <h2 className="text-4xl font-bold mb-4">SIGN-IN</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded pr-10"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-sm cursor-pointer text-blue-600 select-none"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
          <p
            className="text-red-600 cursor-pointer italic text-sm text-center mt-2"
            onClick={() => setForgotModal(true)}
          >
            Forgot password?
          </p>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full border px-4 py-2 mb-4 rounded"
              placeholder="Enter your email"
              required
            />
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setForgotModal(false);
                  setResetEmail("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Send Reset Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;
