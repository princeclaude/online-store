import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useBag } from "../contexts/BagContext";
import { FaTrash, FaShareAlt, FaCreditCard } from "react-icons/fa";
import { format } from "date-fns";

const BagScreen = () => {
  const { user } = useAuth();
  const { fetchBagItems } = useBag();
  const [bagItems, setBagItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBagItems = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "bag"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBagItems(items);
    } catch (err) {
      console.error("Error fetching bag items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBagItems();
    fetchBagItems();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "bag", id));
      setBagItems((prev) => prev.filter((item) => item.id !== id));
      await fetchBagItems();
    } catch (err) {
      console.error("Error deleting bag item:", err);
    }
  };

  const handleShare = (item) => {
    alert(`You want to share ${item.name}`);
    // Replace with real share logic or modal
  };

  return (
    <div className="p-4 mt-28 bg-black min-h-screen text-white">
      <h1 className="text-xl font-bold mb-4 text-center sm:text-left">My Bag</h1>

      {loading ? (
        <p className="text-center text-gray-300">Loading...</p>
      ) : bagItems.length === 0 ? (
        <p className="text-center text-gray-400">Your bag is empty.</p>
      ) : (
        <div className="space-y-4">
          {bagItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between shadow"
            >
              {/* Left: Image + Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 sm:mb-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded mb-2 sm:mb-0"
                />
                <div className="text-sm sm:text-base">
                  <h2 className="font-bold text-lg">{item.name}</h2>
                  <p className="text-green-400 text-sm sm:text-base">
                    ₦{parseFloat(item.price).toLocaleString()}
                  </p>
                  <p
                    className={`text-sm ${
                      item.status === "available"
                        ? "text-green-500"
                        : "text-red-400"
                    }`}
                  >
                    {item.status}
                  </p>
                  <p className="text-xs text-gray-400">
                    Added:{" "}
                    {format(item.dateAdded?.toDate?.() || new Date(), "PPP")}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex space-x-4 sm:space-x-3 justify-end sm:justify-start">
                <FaCreditCard
                  className="text-green-500 cursor-pointer hover:text-green-700"
                  title="Pay"
                />
                <FaShareAlt
                  onClick={() => handleShare(item)}
                  className="text-blue-400 cursor-pointer hover:text-blue-600"
                  title="Share"
                />
                <FaTrash
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 cursor-pointer hover:text-red-600"
                  title="Delete"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BagScreen;