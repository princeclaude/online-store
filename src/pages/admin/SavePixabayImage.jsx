import { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import EditProductsModal from "../../components/EditProductsModal";
import OrdersModal from "../../components/OrdersModal";
import { useNavigate } from "react-router-dom";

const PIXABAY_API_KEY = "51237583-f873cce823c6088b9c3af6911";

const SavePixabayImageWithMetadata = () => {
  const [searchTerm, setSearchTerm] = useState("Shoes");
  const [results, setResults] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    status: "",
    description: "",
    category: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const navigate = useNavigate();

  const uploadToUploadcare = async (blob) => {
  const UPLOADCARE_PUBLIC_KEY = "86ef078d93587e6ae382"; 
  const formData = new FormData();
  formData.append("UPLOADCARE_STORE", "1");
  formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
  formData.append("file", blob);

  const response = await fetch("https://upload.uploadcare.com/base/", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data && data.file) {
    return `https://ucarecdn.com/${data.file}/`;
  } else {
    throw new Error("Failed to upload to Uploadcare");
}
  };
  

  const handleSaveToFirestore = async (imageUrl) => {
    const catName = form.category.trim().toUpperCase();

    const catQuery = query(
      collection(db, "categories"),
      where("name", "==", catName)
    );
    const catSnap = await getDocs(catQuery);

    if (catSnap.empty) {
      await addDoc(collection(db, "categories"), {
        name: catName,
        createdAt: serverTimestamp(),
      });
    }

    await addDoc(collection(db, "products"), {
      name: form.name,
      price: parseFloat(form.price),
      originalPrice:
        form.category.toUpperCase() === "FLASH SALES"
          ? parseFloat(form.originalPrice)
          : null,
      status: form.status,
      description: form.description,
      category: catName,
      fullImage: imageUrl,
      imageUrl,
      tags: selectedImage.tags,
      source: "uploadcare",
      createdAt: serverTimestamp(),
    });
  };

  const categories = [
    "Shoes",
    "Men's Clothing",
    "Female Collection",
    "Accessories",
    "Bags",
    "Caps",
    "ShowOff",
    "Watches",
    "Sales",
    "Flash Sales",
  ];

  const fetchImages = async () => {
    try {
      const res = await axios.get(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
          searchTerm
        )}&image_type=photo&per_page=50`
      );
      setResults(res.data.hits);
      setMessage("");
    } catch (error) {
      console.error("Failed to fetch images:", error);
      setMessage("❌ Failed to fetch images.");
    }
  };

  const handleImageSelect = (img) => {
    setSelectedImage(img);
    const fallbackCategory =
      searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
    setForm((prevForm) => ({
      ...prevForm,
      category: prevForm.category || fallbackCategory,
    }));
  };

  const handleInputChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

   const handleSave = async () => {
     if (
       !form.name ||
       !form.price ||
       !form.description ||
       !selectedImage ||
       !form.category
     ) {
       return alert("Please fill all fields and select an image and category.");
     }

     if (form.category.toUpperCase() === "FLASH SALES" && !form.originalPrice) {
       return alert("Please enter original price for Flash Sales item.");
     }

     setSaving(true);

     try {
       // Check if product already exists
       const productQuery = query(
         collection(db, "products"),
         where("name", "==", form.name),
         where("imageUrl", "==", selectedImage.largeImageURL)
       );
       const productSnap = await getDocs(productQuery);

       if (!productSnap.empty) {
         alert("⚠ Product already exists with the same name and image.");
         setSaving(false);
         return;
       }

       // Download image as blob
       const response = await fetch(selectedImage.largeImageURL);
       const blob = await response.blob();

       // Upload to Uploadcare
       const uploadedUrl = await uploadToUploadcare(blob);

       // Save to Firestore
       await handleSaveToFirestore(uploadedUrl);

       setMessage("✅ Product saved successfully!");
       setSelectedImage(null);
       setForm({
         name: "",
         price: "",
         originalPrice: "",
         status: "",
         description: "",
         category: "",
       });
     } catch (err) {
       console.error("Error saving:", err);
       setMessage("❌ Error saving product.");
     }

     setSaving(false);
   };
  const handleStopFlashSales = async () => {
    const confirm = window.confirm(
      "Are you sure you want to stop Flash Sales?"
    );
    if (!confirm) return;

    try {
      
      await deleteDoc(doc(db, "flashSales", "global"));

      
      const q = query(
        collection(db, "products"),
        where("category", "==", "FLASH SALES")
      );
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map((docSnap) =>
        deleteDoc(doc(db, "products", docSnap.id))
      );
      await Promise.all(deletePromises);

      alert("✅ Flash Sales stopped and products removed.");
    } catch (err) {
      console.error("Error stopping flash sales:", err);
      alert("❌ Failed to stop Flash Sales.");
    }
  };

  const handleFlashSaleSave = async () => {
    if (!startTime || !endTime) {
      return alert("Please select both start and end time.");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return alert("End time must be after start time.");
    }

    try {
      await setDoc(doc(db, "flashSales", "global"), {
        startTime: Timestamp.fromDate(start),
        endTime: Timestamp.fromDate(end),
      });
      alert("✅ Flash sale time saved!");
    } catch (err) {
      console.error("Failed to save flash sale:", err);
      alert("❌ Failed to save flash sale timer.");
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm py-4 mb-6">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Flash Sale Timer UI */}
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-4">
            <h3 className="font-bold text-lg mb-2 text-yellow-800">
               Set Flash Sales Timer
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <button
                onClick={handleFlashSaleSave}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save Timer
              </button>
              <button
                onClick={handleStopFlashSales}
                className="bg-red-700 text-white px-4 py-2 rounded"
              >
                Stop Flash Sales
              </button>
            </div>
          </div>

          {/* Top Buttons */}
          <div className="flex flex-wrap gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search e.g. Shoes, Bags"
              className="w-[60%] border px-4 py-2 rounded"
            />
            <button
              onClick={fetchImages}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Search
            </button>
            <button
              onClick={() => setShowOrdersModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Orders
            </button>
            <button
              onClick={() => navigate("/allproducts")}
              className="bg-pink-600 text-white px-4 py-2 rounded"
            >
              All Products
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => navigate("/home")}
            >
              Website
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate("/home")}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {showOrdersModal && (
        <OrdersModal onClose={() => setShowOrdersModal(false)} />
      )}

      <div className="p-6 max-w-4xl mx-auto">
        {message && <p className="text-green-600 mb-4">{message}</p>}

        {!selectedImage ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((img, idx) => (
              <img
                key={idx}
                src={img.webformatURL}
                alt={img.tags}
                onClick={() => handleImageSelect(img)}
                className="cursor-pointer rounded shadow hover:scale-105 transition"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <img
                src={selectedImage.largeImageURL}
                alt="Selected"
                className="rounded shadow max-h-80 object-contain"
              />

              <div className="space-y-4">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  className="w-full border px-4 py-2 rounded"
                />
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="Price (₦)"
                  className="w-full border px-4 py-2 rounded"
                />

                {form.category.toUpperCase() === "FLASH SALES" && (
                  <input
                    name="originalPrice"
                    type="number"
                    value={form.originalPrice}
                    onChange={handleInputChange}
                    placeholder="Original Price (₦)"
                    className="w-full border px-4 py-2 rounded"
                  />
                )}

                <input
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  placeholder="Availability Status"
                  className="w-full border px-4 py-2 rounded"
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full border px-4 py-2 rounded"
                ></textarea>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full border px-4 py-2 rounded"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-sm text-white px-4 py-2 rounded bg-red-700 ml-4"
                >
                  Cancel
                </button>
              </div>
            </div>
            {showEditModal && (
              <EditProductsModal onClose={() => setShowEditModal(false)} />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SavePixabayImageWithMetadata;
