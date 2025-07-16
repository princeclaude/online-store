import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";


const PurchaseModal = ({ item, onClose }) => {
  const { user } = useAuth();
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const getOtherUserInfo = async () => {
    try {
      let otherEmail = "";

      // Prefer participants if available
      if (Array.isArray(item?.participants)) {
        otherEmail = item.participants.find((email) => email !== user.email);
      }

      // Fallback logic if participants is missing or invalid
      if (!otherEmail) {
        if (item?.senderEmail && item?.senderEmail !== user.email) {
          otherEmail = item.senderEmail;
        } else if (
          item?.recipientEmail &&
          item?.recipientEmail !== user.email
        ) {
          otherEmail = item.recipientEmail;
        }
      }

      if (!otherEmail || !otherEmail.includes("@")) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "users"),
        where("email", "==", otherEmail)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const doc = snap.docs[0];
        setOtherUserInfo(doc.data());
      }
    } catch (err) {
      console.error("Failed to fetch other user info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOtherUserInfo();
  }, [item]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-red-600"
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-bold mb-4">Purchase Item</h2>

        <img
          src={item?.imageUrl}
          alt={item?.name}
          className="w-full h-52 object-cover rounded mb-4"
        />
        <h3 className="text-xl font-semibold mb-1">{item?.name}</h3>
        <p className="text-green-600 font-bold mb-1">
          ₦{Number(item?.price).toLocaleString()}
        </p>
        <p
          className={`text-sm font-bold mb-4 ${
            item?.status === "available" ? "text-green-700" : "text-red-600"
          }`}
        >
          {item?.status}
        </p>

        <hr className="my-3" />

        <h4 className="text-md font-bold mb-2">RECIPIENT INFO</h4>

        {loading ? (
          <p className="text-sm text-gray-500">Loading user info...</p>
        ) : otherUserInfo ? (
          <div className="text-sm text-gray-700 space-y-1 mb-6">
            <p>
              <strong>Name:</strong> {otherUserInfo.name}
            </p>
            <p>
              <strong>Email:</strong> {otherUserInfo.email}
            </p>
            <p>
              <strong>Phone:</strong> {otherUserInfo.phone}
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-500">Unable to find user info.</p>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => alert("Purchase confirmed!")}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
