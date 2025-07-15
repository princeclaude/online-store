import { useEffect, useState, useRef } from "react";
import { FaHeart, FaTimes } from "react-icons/fa";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

const WishlistModal = ({ onClose }) => {
  const modalRef = useRef(null);
  const { user, userProfile } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const q = query(
          collection(db, "wishlist"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWishlist(items);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      }
    };

    if (user) fetchWishlist();
  }, [user]);

  const handleRemove = async (itemId) => {
    try {
      await deleteDoc(doc(db, "wishlist", itemId));
      setWishlist((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing from wishlist", error);
    }
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-start pt-10 z-50 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-4xl p-6 rounded shadow-xl slide-in-bottom relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-xl"
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-bold mb-6 text-center">
          {userProfile?.name}'s Wishlist
        </h2>

        {wishlist.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            ❤ Your wishlist is empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-gray-100 p-4 rounded flex gap-4 items-center relative"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    ₦{item.price.toLocaleString()}
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
                <FaHeart
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 text-xl cursor-pointer hover:scale-110 transition-transform"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistModal;
