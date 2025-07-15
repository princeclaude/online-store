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
import { FaTimes, FaTrash, FaShareAlt, FaCreditCard } from "react-icons/fa";
import { format } from "date-fns";
import ShareModal from "./ShareModal";
import PaystackButtonWrapper from "./PaystackButtonWrapper";
import { useBag } from "../contexts/BagContext";

const BagModal = ({ onClose }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharedItem, setSharedItem] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [checkingOutItem, setCheckingOutItem] = useState(null);
  const [showCheckoutAllModal, setShowCheckoutAllModal] = useState(false);
  const { fetchBagItems } = useBag();

  const fetchBag = async () => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "bag"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const bagItems = snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
    setItems(bagItems);
    setLoading(false);
  };

  useEffect(() => {
    fetchBag();
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  useEffect(() => {
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    setTotalAmount(total);
  }, [items]);

  const deleteItem = async (docId) => {
    await deleteDoc(doc(db, "bag", docId));
    setItems((prev) => prev.filter((item) => item.docId !== docId));
    fetchBagItems();
  };

  const handleSinglePaymentSuccess = async (item) => {
    await deleteDoc(doc(db, "bag", item.docId));
    setItems((prev) => prev.filter((i) => i.docId !== item.docId));
    setCheckingOutItem(null);
    fetchBagItems();
  };

  const handleCheckoutAllSuccess = async () => {
    const batchDeletes = items.map((item) =>
      deleteDoc(doc(db, "bag", item.docId))
    );
    await Promise.all(batchDeletes);
    setItems([]);
    setShowCheckoutAllModal(false);
    fetchBagItems();

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex justify-end sm:justify-center">
      <div className="bg-white w-full sm:max-w-md h-full overflow-y-auto shadow-lg relative rounded-t-2xl sm:rounded-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600 z-10"
        >
          <FaTimes size={20} />
        </button>

        <div className="p-4 sm:p-6 pt-12">
          <h2 className="text-xl font-bold mb-4 text-center">Your Bag</h2>

          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500">Your bag is empty.</p>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.docId}
                  className="border rounded mb-6 p-3 flex flex-col space-y-2"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-48 sm:h-56 w-full object-cover rounded"
                  />
                  <h3 className="font-bold text-sm sm:text-base">
                    {item.name}
                  </h3>
                  <p className="text-sm">
                    ₦{parseFloat(item.price).toLocaleString()}
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      item.status === "available"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    Added:{" "}
                    {format(item.dateAdded?.toDate?.() || new Date(), "PPP p")}
                  </p>

                  <div className="flex flex-wrap justify-between mt-2 gap-3">
                    <button
                      onClick={() => setSharedItem(item)}
                      className="flex items-center space-x-1 text-blue-600 text-sm"
                    >
                      <FaShareAlt /> <span>Share</span>
                    </button>

                    <button
                      onClick={() => setCheckingOutItem(item)}
                      className="flex items-center space-x-1 text-green-600 text-sm"
                    >
                      <FaCreditCard /> <span>Pay</span>
                    </button>

                    <button
                      onClick={() => deleteItem(item.docId)}
                      className="flex items-center space-x-1 text-red-600 text-sm"
                    >
                      <FaTrash /> <span>Delete</span>
                    </button>
                  </div>

                  {sharedItem?.docId === item.docId && (
                    <ShareModal
                      item={sharedItem}
                      onClose={() => setSharedItem(null)}
                    />
                  )}

                  {checkingOutItem?.docId === item.docId && (
                    <div className="mt-3 bg-gray-100 p-3 rounded">
                      <p className="text-sm font-semibold text-black">
                        You want to purchase this item at ₦
                        {parseFloat(item.price).toLocaleString()}?
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <button
                          onClick={() => setCheckingOutItem(null)}
                          className="text-sm bg-red-500 text-white px-4 py-1 rounded"
                        >
                          Cancel
                        </button>

                        <PaystackButtonWrapper
                          email={user?.email}
                          amount={(parseFloat(item.price) / 1000) * 100}
                          items={item}
                          onSuccess={() => handleSinglePaymentSuccess(item)}
                          onClose={() => setCheckingOutItem(null)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Checkout All */}
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-semibold">
                  Total in NGN: ₦{totalAmount.toLocaleString()}
                </p>

                {items.length > 1 && (
                  <button
                    onClick={() => setShowCheckoutAllModal(true)}
                    className="bg-green-700 text-white px-4 py-2 rounded mt-2 w-full hover:bg-green-800"
                  >
                    Pay for All Items
                  </button>
                )}

                {showCheckoutAllModal && (
                  <div className="mt-4 bg-gray-100 p-4 rounded">
                    <p className="text-sm mb-2 font-semibold text-black">
                      You want to purchase <strong>all items</strong> at ₦
                      {totalAmount.toLocaleString()}?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setShowCheckoutAllModal(false)}
                        className="text-sm bg-red-500 text-white px-4 py-1 rounded"
                      >
                        Cancel
                      </button>

                      <PaystackButtonWrapper
                        email={user?.email}
                        amount={(totalAmount / 1000) * 100}
                        items={items}
                        onSuccess={handleCheckoutAllSuccess}
                        onClose={() => setShowCheckoutAllModal(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BagModal;
