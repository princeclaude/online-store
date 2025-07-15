// ProductDetailModal.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";
import { useBag } from "../contexts/BagContext";
import { db } from "../firebase/firebaseConfig";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

const ProductDetailModal = ({ product, onClose }) => {
  const { user } = useAuth();
  const { fetchBagItems } = useBag();

  const handleAddToBag = async () => {
    if (!user) return alert("Please sign in to add items to your bag.");

    await addDoc(collection(db, "bag"), {
      ...product,
      userId: user.uid,
      dateAdded: Timestamp.now(),
    });

    fetchBagItems(); // update bag badge
    alert("Item added to bag");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-start pt-10 overflow-y-auto">
      <div className="bg-white w-[90%] max-w-md rounded-md shadow-lg p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600"
        >
          <FaTimes size={20} />
        </button>

        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover rounded"
        />

        <div className="mt-4">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-gray-600 mt-2">
            {product.description || "No description provided."}
          </p>
          <p className="text-lg font-semibold mt-3">
            ₦{Number(product.price).toLocaleString()}
          </p>

          <button
            onClick={handleAddToBag}
            className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
