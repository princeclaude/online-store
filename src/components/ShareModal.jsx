import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";

const ShareModal = ({ item, onClose }) => {
  const { user } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Normalize and generate a safe itemId
  const itemId = (
    item?.id ||
    `${item?.name || ""}_${item?.price || ""}`
  )
    .toLowerCase()
    .trim();

  const handleShare = async () => {
    setLoading(true);
    setMessage("");

    if (!recipientEmail || !recipientEmail.includes("@")) {
      alert("Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      // 1. Check recipient exists
      const recipientQuery = query(
        collection(db, "users"),
        where("email", "==", recipientEmail.trim().toLowerCase())
      );
      const recipientSnap = await getDocs(recipientQuery);

      if (recipientSnap.empty) {
        setMessage("❌ No user found with that email.");
        setLoading(false);
        return;
      }

      // 2. Check for duplicate share
    //   const duplicateQuery = query(
    //     collection(db, "shared"),
    //     where("senderEmail", "==", user.email),
    //     where("recipientEmail", "==", recipientEmail.trim().toLowerCase()),
    //     where("itemId", "==", itemId)
    //   );

    //   const duplicateSnap = await getDocs(duplicateQuery);
    //   console.log("Checking for duplicates with itemId:", itemId);
    //   console.log("Duplicate found?", !duplicateSnap.empty);

    //   if (!duplicateSnap.empty) {
    //     setMessage("⚠ You've already shared this item with this user.");
    //     setLoading(false);
    //     return;
    //   }

      // 3. Proceed to share
      await addDoc(collection(db, "shared"), {
        itemId,
        imageUrl: item.imageUrl,
        name: item.name,
        price: item.price,
        status: item.status,
        senderEmail: user.email,
        recipientEmail: recipientEmail.trim().toLowerCase(),
        participants: [user.email, recipientEmail.trim().toLowerCase()],
        timestamp: serverTimestamp(),
      });

      setMessage("✅ Item shared successfully!");
      setRecipientEmail("");
    } catch (err) {
      console.error("Sharing error:", err);
      setMessage("❌ Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-red-600"
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-bold mb-4">Share Item</h2>
        <p className="text-sm text-gray-600 mb-2">Enter recipient's email:</p>

        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="recipient@example.com"
          className="w-full border border-gray-300 px-4 py-2 rounded mb-4"
        />

        <button
          onClick={handleShare}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-900"
        >
          {loading ? "Sharing..." : "Share"}
        </button>

        {message && (
          <p className="text-sm mt-4 text-center font-semibold text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ShareModal;