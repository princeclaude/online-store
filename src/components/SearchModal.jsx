import { useState, useEffect, useRef } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


const SearchModal = ({ onClose, item}) => {
  const modalRef = useRef(null);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("WATCH");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const [selectedItem, setSelectedItem] = useState(null); // ✅ New state for item modal

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "products"));
      const productList = snap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const uniqueCategories = [
        ...new Set(
          productList.map((p) => p.category?.toUpperCase() || "OTHERS")
        ),
      ];
      setCategories(uniqueCategories);
      setAllProducts(productList);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      const results = allProducts.filter((item) =>
        item.name.toLowerCase().startsWith(q)
      );
      setFilteredProducts(results);
    } else if (activeCategory) {
      const filtered = allProducts.filter(
        (item) => item.category?.toUpperCase() === activeCategory
      );
      setFilteredProducts(filtered.slice(0, 6));
    } else {
      setFilteredProducts([]);
    }
  }, [query, allProducts, activeCategory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % categories.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [categories]);

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
    <>
      <div
        onClick={handleOutsideClick}
        className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-start pt-16"
      >
        <div
          ref={modalRef}
          className="w-full max-w-3xl max-h-[90vh] bg-white rounded-md shadow-lg p-6 relative transform translate-x-full animate-slide-in-right overflow-y-auto no-scrollbar"
        >
          <button
            onClick={onClose}
            className="absolute top-1 right-4 text-gray-600 hover:text-red-500 text-xl"
          >
            <FaTimes />
          </button>

         

          <div className="flex items-center mb-6 border rounded px-4 py-2 shadow-sm">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                categories.length
                  ? `Classic Royal Search ${categories[placeholderIndex]}`
                  : "Search items"
              }
              className="w-full outline-none text-gray-800"
            />
          </div>

          <div className="flex space-x-3 overflow-x-auto no-scrollbar mb-6">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveCategory(cat);
                  setQuery("");
                }}
                className={`px-4 py-1 border rounded-full text-sm whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((item, idx) => (
              <div
                key={idx}
                onClick={() =>navigate(`/product/${item.id}`)}
                className="cursor-pointer flex gap-4 p-3 bg-gray-100 rounded shadow hover:bg-gray-200 transition"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    ₦{Number(item.price).toLocaleString()}
                  </p>
                  <span
                    className={`text-xs font-bold ${
                      item.status === "available"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tailwind Animation Utility */}
        <style jsx>{`
          @keyframes slide-in-right {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-slide-in-right {
            animation: slide-in-right 0.7s ease-out forwards;
          }

          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>

      {/* ✅ ItemDetailsModal shown if item is clicked */}
      {/* {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )} */}
    </>
  );
};

export default SearchModal;
