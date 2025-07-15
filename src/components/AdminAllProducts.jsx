import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SmallSpinner from "./SmallSpinner"; 

const AdminAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [deletingAll, setDeletingAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(items);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((item) => item.id !== id));
      alert("Product deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  const handleDeleteAll = async () => {
    const confirm = window.confirm("This will permanently delete ALL products. Continue?");
    if (!confirm) return;

    try {
      setDeletingAll(true);
      const snapshot = await getDocs(collection(db, "products"));
      const batchDelete = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(batchDelete);
      setProducts([]);
      alert("All products deleted.");
    } catch (err) {
      console.error("Failed to delete all products:", err);
      alert("Something went wrong while deleting all products.");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/save")}>
          Home
        </span>{" "}
        / <span className="text-gray-700 font-semibold">All Products</span>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Products</h2>
        <button
          onClick={handleDeleteAll}
          disabled={deletingAll}
          className={`flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition ${
            deletingAll ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {deletingAll && <SmallSpinner small />}
          Delete All Products
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-3 border">Image</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Description</th>
              <th className="p-3 border">Edit</th>
              <th className="p-3 border">Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-2 border">
                  <img
                    src={item.imageUrl || item.fullImage}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="p-2 border font-semibold">{item.name}</td>
                <td className="p-2 border">₦{Number(item.price).toLocaleString()}</td>
                <td
                  className={`p-2 border font-bold ${
                    item.status === "available" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.status}
                </td>
                <td className="p-2 border text-gray-700">{item.description}</td>
                <td className="p-2 border">
                  <FaEdit
                    onClick={() => navigate(`/editproduct/${item.id}`)}
                    className="text-blue-500 cursor-pointer hover:text-blue-700"
                    title="Edit Product"
                  />
                </td>
                <td className="p-2 border">
                  <FaTrash
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 cursor-pointer hover:text-red-800"
                    title="Delete Product"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center p-4 text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAllProducts;