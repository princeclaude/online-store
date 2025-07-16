import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { useBag } from "../contexts/BagContext";
import Spinner from "./Spinner";
import toast from "react-hot-toast";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { user } = useAuth();
  const { fetchBagItems } = useBag();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const productData = { id: docSnap.id, ...docSnap.data() };
      setProduct(productData);
      fetchSuggestions(productData);
    }
  };

  const fetchReviews = async () => {
    const q = query(collection(db, "reviews"), where("productId", "==", id));
    const snap = await getDocs(q);
    const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const shuffled = all.sort(() => 0.5 - Math.random());
    setReviews(shuffled.slice(0, 5));

    const uniqueUserIds = [...new Set(all.map((r) => r.userId).filter(Boolean))];
    const userMapTemp = {};

    await Promise.all(
      uniqueUserIds.map(async (uid) => {
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            userMapTemp[uid] = userDoc.data().name || "Anonymous";
          } else {
            userMapTemp[uid] = "User";
          }
        } catch (err) {
          console.error(Error `fetching user ${uid}:`, err);
          userMapTemp[uid] = "User";
        }
      })
    );

    setUserMap(userMapTemp);
  };

  const fetchSuggestions = async (currentProduct) => {
    const q = query(
      collection(db, "products"),
      where("category", "==", currentProduct.category)
    );
    const snap = await getDocs(q);
    const all = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((p) => p.id !== currentProduct.id);
    const shuffled = all.sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 2));
  };

  const handleAddToBag = async () => {
    if (!user) return toast.success("Please sign in to add items to your bag.");
    await addDoc(collection(db, "bag"), {
      ...product,
      userId: user.uid,
      dateAdded: Timestamp.now(),
    });
    fetchBagItems();
    toast.success("Item added to bag")
    navigate("/home");
  };

  const handleAddReview = async () => {
    if (!newReview.trim()) return alert("Review cannot be empty");
    setLoading(true);

    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        userId: user.uid,
        userEmail: user.email,
        review: newReview,
        helpfulVotes: 0,
        createdAt: Timestamp.now(),
      });

      setNewReview("");
      await fetchReviews(); // Soft refresh reviews
    } catch (err) {
      console.error("Error adding review:", err);
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      helpfulVotes: increment(1),
    });
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 }
          : r
      )
    );
  };

  if (!product) return <Spinner />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm mb-4 text-gray-600">
        <Link to="/home" className="text-blue-600 hover:underline">
          Home
        </Link>{" "}
        / <span className="font-semibold">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-1">
          <img
            src={product.fullImage || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-80 object-cover rounded shadow"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
          <p className="text-gray-600 mb-4">
            {product.description || "No description provided."}
          </p>
          <div className="text-2xl font-semibold mb-2">
            ₦{Number(product.price).toLocaleString()}
          </div>
          <p
            className={`mb-4 font-bold ${
              product.status === "available" ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.status}
          </p>
          <button
            onClick={handleAddToBag}
            className="bg-black text-white py-2 px-5 rounded hover:bg-gray-800 transition"
          >
            Add to Bag
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

        {loading && reviews.length === 0 ? (
          <div className="flex justify-center my-6">
            <Spinner />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet.</p>
        ) : (
          <ul className="space-y-4 mb-6">
            {reviews.map((r) => (
              <li key={r.id} className="bg-gray-100 p-4 rounded shadow">
                <p className="font-medium text-gray-800">{r.review}</p>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                  <span>
                    By{" "}
                    <span className="font-semibold">
                      {userMap[r.userId] || "User"}
                    </span>{" "}
                    —{" "}
                    {r.createdAt?.toDate().toLocaleString() || "Just now"}
                  </span>
                  <button
                    onClick={() => handleVoteHelpful(r.id)}
                    className="text-blue-600 hover:underline"
                  >
                    👍 {r.helpfulVotes || 0} Helpful
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add Review */}
        {user ? (
          <div className="mt-6">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review..."
              rows={3}
              className="w-full border rounded p-3 mb-3 resize-none"
            />
            <button
              onClick={handleAddReview}
              disabled={loading}
              className={`flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-5 rounded hover:bg-blue-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Submit Review
            </button>
          </div>
        ) : (
          <div className="mt-10">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review..."
              rows={3}
              className="w-full border rounded p-3 mb-3 resize-none"
            />
            <button className="text-red-500 font-semibold mt-4">
              <p>Sign in to add a review.</p>
            </button>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {suggestions.map((sugg) => (
              <div
                key={sugg.id}
                onClick={() => navigate(`/product/${sugg.id}`)}
                className="cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-md transition"
              >
                <img
                  src={sugg.fullImage || "/placeholder.jpg"}
                  alt={sugg.name}
                  className="w-full h-52 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1">{sugg.name}</h3>
                  <p className="text-gray-600 mb-1">
                    ₦{Number(sugg.price).toLocaleString()}
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      sugg.status === "available"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {sugg.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;