import React, { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { FaTimes } from "react-icons/fa";

const GuestBagModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [guestItems, setGuestItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGuestItems = async () => {
    setLoading(true);
    setError("");
    try {
      if (!email || !email.includes("@")) {
        setError("❌ Please enter a valid email.");
        setGuestItems([]);
        setLoading(false);
        return;
      }

      const guestSnap = await getDocs(
        query(collection(db, "guest"), where("email", "==", email))
      );

      if (guestSnap.empty) {
        setError("❌ Email not found in guest records.");
        setGuestItems([]);
        setLoading(false);
        return;
      }

      const purchasesSnap = await getDocs(
        query(
          collection(db, "guest_purchases"),
          where("guestEmail", "==", email)
        )
      );

      const items = purchasesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGuestItems(items);
    } catch (err) {
      console.error("Error fetching guest bag items:", err);
      setError("❌ Failed to fetch guest items.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-700 hover:text-red-600"
        >
          <FaTimes size={18} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-center">See Your Bag</h2>

        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your guest email"
          className="w-full border px-4 py-2 rounded mb-3 text-sm outline-none"
        />

        {/* Fetch Button */}
        <button
          onClick={fetchGuestItems}
          className="bg-black text-white px-4 py-2 rounded w-full text-sm font-semibold hover:bg-gray-900"
          disabled={loading}
        >
          {loading ? "Checking..." : "Fetch My Bag"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

        {/* Guest Items List */}
        {guestItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Items in your bag:</h3>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {guestItems.map((item) => (
                <div
                  key={item.id}
                  className="border p-3 rounded flex gap-3 items-center shadow-sm"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-green-700 font-semibold text-sm">
                      ₦{item.price?.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs font-bold ${
                        item.status === "available"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button className="bg-green-700 text-white px-4 py-2 rounded w-[48%] hover:bg-green-800 text-sm">
                Checkout
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded w-[48%] hover:bg-red-700 text-sm"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBagModal;
