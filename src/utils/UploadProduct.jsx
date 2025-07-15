import { useState } from "react";
import axios from "axios";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const UploadProduct = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "Men's Clothing",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !form.name || !form.price || !form.description) {
      return alert("Please fill all fields and select a file");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "product_images");
    formData.append("folder", `products/${form.category}`);

    // Determine media type
    const isVideo = file.type.startsWith("video/");
    const uploadUrl = isVideo
      ? "https://api.cloudinary.com/v1_1/dksgxa1b3/video/upload"
      : "https://api.cloudinary.com/v1_1/dksgxa1b3/image/upload";

    try {
      const res = await axios.post(uploadUrl, formData);
      const uploadedUrl = res.data.secure_url;
      setMediaUrl(uploadedUrl);

      // Save product data to Firestore
      await addDoc(collection(db, "products"), {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        mediaUrl: uploadedUrl,
        type: isVideo ? "video" : "image",
        category: form.category,
        createdAt: serverTimestamp(),
      });

      setMessage("Upload successful! Product saved.");
      setForm({
        name: "",
        price: "",
        description: "",
        category: "Men's Clothing",
      });
      setFile(null);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Upload New Product</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price (₦)"
          value={form.price}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Product Description"
          value={form.description}
          onChange={handleChange}
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
        </select>

        <input
          type="file"
          accept="image/,video/"
          onChange={handleFileChange}
          className="w-full border px-4 py-2 rounded"
        />

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {uploading ? "Uploading..." : "Upload Product"}
        </button>

        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      </form>

      {mediaUrl && (
        <div className="mt-6">
          <p className="text-sm text-gray-600">Preview:</p>
          {file?.type.startsWith("video/") ? (
            <video
              src={mediaUrl}
              controls
              className="mt-2 w-full rounded shadow"
              style={{ width: "100%", height: "auto" }}
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Uploaded"
              className="mt-2 w-full rounded"
              style={{ width: "200px", height: "auto" }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default UploadProduct;