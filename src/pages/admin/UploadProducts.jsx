import { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";

const PIXABAY_API_KEY = "51237583-f873cce823c6088b9c3af6911";

const UploadProduct = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "Men's Clothing",
  });
  const [keyword, setKeyword] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchImages = async () => {
    if (!keyword) {
      alert("Enter a keyword to search");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${keyword}&image_type=photo&orientation=horizontal&per_page=100`
      );
      setImages(res.data.hits);
      if (res.data.hits.length === 0) {
        setMessage("❌ No images found for that keyword.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to fetch images.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Check if category exists (create it in categories collection if not)
      const categoriesRef = collection(db, "categories");
      const snapshot = await getDocs(categoriesRef);
      const existing = snapshot.docs.map((doc) => doc.data().name);
      if (!existing.includes(form.category)) {
        await addDoc(categoriesRef, { name: form.category });
      }

      // Save product to products
      await addDoc(collection(db, "products"), {
        ...form,
        price: parseFloat(form.price),
        imageUrl: selectedImage,
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Product saved successfully!");
      setForm({
        name: "",
        price: "",
        description: "",
        category: "Men's Clothing",
      });
      setImages([]);
      setSelectedImage("");
      setKeyword("");
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border px-4 py-2 rounded"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-4 py-2 rounded"
          required
        ></textarea>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        >
          <option value="Men's Clothing">Men's Clothing</option>
          <option value="Shoes">Shoes</option>
          <option value="Female Collection">Female Collection</option>
          <option value="Accessories">Accessories</option>
          <option value="ShowOff">ShowOff</option>
          <option value="ShowOff">ShowOff</option>
        </select>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search keyword (e.g. shoes)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 border px-4 py-2 rounded"
          />
          <button
            type="button"
            onClick={fetchImages}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Image grid preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4 max-h-[250px] overflow-y-auto no-scrollbar">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.webformatURL}
                alt="pixabay"
                className={`h-24 w-full object-cover rounded cursor-pointer border-2 ${
                  selectedImage === img.webformatURL
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setSelectedImage(img.webformatURL)}
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}

      {selectedImage && (
        <img
          src={selectedImage}
          alt="Preview"
          className="mt-4 w-full max-h-64 object-contain border rounded"
        />
      )}
    </div>
  );
};

export default UploadProduct;