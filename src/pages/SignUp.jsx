import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, address } = form;

    if (!name || !email || !password || !phone || !address) {
      alert("All fields must be filled!")
      return;
    }
      

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

     
      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        role: "user",
        wallet: 0,
        createdAt: new Date(),
        emailVerified: false,
      });

      
      
    } catch (error) {
      console.error(error.message);
      alert("Signup failed: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-4xl font-bold mb-4">SIGN-UP</h2>

      {showVerificationMessage ? (
        <div className="bg-yellow-100 text-yellow-800 border border-yellow-400 p-4 rounded text-center">
          Please verify your email to continue. <br />A verification link has
          been sent to your email.
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4 mt-4">
          <input
            name="name"
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border p-2"
          />
          <input
            name="email"
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="w-full border p-2"
          />
          <div className="relative">
            <input
              name="password"
              onChange={handleChange}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="w-full border p-2"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-sm cursor-pointer text-blue-600 select-none"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
          <input
            name="phone"
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border p-2"
          />
          <input
            name="address"
            onChange={handleChange}
            placeholder="Address"
            className="w-full border p-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full rounded-lg"
          >
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
};

export default SignupPage;
