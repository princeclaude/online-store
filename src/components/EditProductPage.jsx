import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          setMessage("Product not found.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Error loading product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!product.name || !product.price) {
      setMessage("Name and Price are required.");
      return;
    }

    try {
      setUpdating(true);
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, product);
      setMessage("Product updated successfully!");
      setTimeout(() => navigate("/admin/products"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update product.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

      {message && <p className="text-sm text-red-500 mb-3">{message}</p>}

      <div className="grid gap-4">
        <input
          type="text"
          name="name"
          value={product.name || ""}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="price"
          value={product.price || ""}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="status"
          value={product.status || ""}
          onChange={handleChange}
          placeholder="Status (available/out of stock)"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="category"
          value={product.category || ""}
          onChange={handleChange}
          placeholder="Category"
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="description"
          value={product.description || ""}
          onChange={handleChange}
          placeholder="Description"
          rows={4}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="imageUrl"
          value={product.imageUrl || ""}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full border px-3 py-2 rounded"
        />

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={updating}
        >
          {updating ? "Updating..." : "Update Product"}
        </button>
      </div>
    </div>
  );
};

export default EditProductPage;
