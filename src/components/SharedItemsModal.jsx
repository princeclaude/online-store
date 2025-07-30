import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  arrayRemove,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { FaTimes, FaTrash, FaCreditCard } from "react-icons/fa";
import { FiShoppingBag } from "react-icons/fi";
import PurchaseModal from "./PurchaseModal";
import toast from "react-hot-toast";

const SharedItemsModal = ({ onClose, fetchBagItems }) => {
  const { user } = useAuth();
  const [sharedItems, setSharedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchSharedItems = async () => {
      if (!user || !user.email) return;
      try {
        const q = query(
          collection(db, "shared"),
          where("participants", "array-contains", user.email)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSharedItems(items);
      } catch (err) {
        console.error("Error fetching shared items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedItems();
  }, [user]);

  const handleDelete = async (item) => {
    try {
      const itemRef = doc(db, "shared", item.id);

      await updateDoc(itemRef, {
        participants: arrayRemove(user.email),
      });

      setSharedItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Error deleting item from your view:", err);
    }
  };

  const handleAddToBag = async (item) => {
    if (!user || !user.uid) {
      alert("You must be signed in to add to bag.");
      return;
    }

    try {
      await addDoc(collection(db, "bag"), {
        userId: user.uid,
        itemId: item.itemId || item.id,
        imageUrl: item.imageUrl,
        name: item.name,
        price: item.price,
        status: item.status,
        dateAdded: serverTimestamp(),
      });

      if (fetchBagItems) {
        await fetchBagItems(); // Immediately update badge count
      }

      toast.success("Item added to your bag.");
    } catch (err) {
      console.error("Error adding to bag:", err);
      toast.error("Failed to add to bag. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded relative shadow-md p-6">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Shared Items</h2>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : sharedItems.length === 0 ? (
          <p className="text-center text-gray-500">No shared items found.</p>
        ) : (
          <div className="space-y-4">
            {sharedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border p-3 rounded shadow-sm relative"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-green-600 font-bold">
                    ₦{item.price?.toLocaleString()}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      item.status === "available"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {item.status}
                  </p>
                  <p className="text-xs mt-1">
                    <strong>From:</strong>{" "}
                    {item.senderEmail === user.email ? "You" : item.senderEmail}
                  </p>
                  <p className="text-xs">
                    <strong>To:</strong>{" "}
                    {item.recipientEmail === user.email
                      ? "You"
                      : item.recipientEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.timestamp?.toDate
                      ? item.timestamp.toDate().toLocaleString()
                      : ""}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-start sm:items-center">
                    <FaCreditCard
                      className="text-green-600 cursor-pointer hover:text-green-800"
                      title="Purchase now"
                      onClick={() => setSelectedItem(item)}
                    />
                    <FiShoppingBag
                      className="text-blue-500 cursor-pointer hover:text-blue-800"
                      title="Add to bag"
                      onClick={() => handleAddToBag(item)}
                    />
                    <FaTrash
                      className="text-red-500 cursor-pointer hover:text-red-700"
                      title="Delete from your view"
                      onClick={() => handleDelete(item)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <PurchaseModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default SharedItemsModal;
