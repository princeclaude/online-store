import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import EditSingleProductModal from "./EditSingleProductModal";

const EditProductsModal = ({ onClose }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProducts(items);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((item) => item.id !== id));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
    
  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete ALL products?"
    );
    if (!confirmDelete) return;

    try {
      const snap = await getDocs(collection(db, "products"));
      const batchDeletes = snap.docs.map((docSnap) =>
        deleteDoc(doc(db, "products", docSnap.id))
      );

      await Promise.all(batchDeletes);
      alert("✅ All products deleted.");
      setProducts([]); // Clear UI
    } catch (err) {
      console.error("Error deleting all products:", err);
      alert("❌ Failed to delete all products.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-start overflow-y-auto pt-10">
      <div className="bg-white max-w-5xl w-full mx-4 rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Edit All Products</h2>
        {/* Delete All Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDeleteAll}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete All Products
          </button>
        </div>

        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 border rounded p-3 shadow-sm"
            >
              {/* Product Image */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-24 h-24 object-cover rounded border"
              />

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">₦{product.price}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
                <p
                  className={`text-xs font-bold ${
                    product.status === "available"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {product.status}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="text-blue-600 flex items-center"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 flex items-center"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal for single product */}
      {selectedProduct && (
        <EditSingleProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={fetchProducts}
        />
      )}
    </div>
  );
};

export default EditProductsModal;
