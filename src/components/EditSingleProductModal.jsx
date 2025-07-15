import React, { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { FaTimes } from "react-icons/fa";

const EditSingleProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: product.name || "",
    price: product.price || "",
    status: product.status || "",
    description: product.description || "",
    imageUrl: product.imageUrl || "",
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "products", product.id);
      await updateDoc(ref, {
        name: form.name,
        price: parseFloat(form.price),
        status: form.status,
        description: form.description,
        imageUrl: form.imageUrl,
      });
      onClose();
      onSave();
    } catch (error) {
      console.error("Update failed:", error);
      alert("❌ Failed to update product. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Product</h2>

        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Product"
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}

        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full border px-4 py-2 rounded mb-3"
        />
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full border px-4 py-2 rounded mb-3"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border px-4 py-2 rounded mb-3"
        />
        <input
          name="status"
          value={form.status}
          onChange={handleChange}
          placeholder="Status"
          className="w-full border px-4 py-2 rounded mb-3"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-4 py-2 rounded mb-4"
        />

        <button
          onClick={handleSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditSingleProductModal;
