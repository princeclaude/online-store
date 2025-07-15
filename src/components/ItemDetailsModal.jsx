import React, { useEffect, useState } from "react";
import { FaHeart, FaTimes } from "react-icons/fa";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useBag } from "../contexts/BagContext";

const ItemDetailsModal = ({ item, onClose}) => {
  const { user, userProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const { fetchBagItems } = useBag();

  // Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, "reviews"),
          where("productId", "==", item.id)
        );
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map((doc) => doc.data());

        if (data.length > 5) {
          data = data.sort(() => 0.5 - Math.random()).slice(0, 5); // Shuffle and take 5
        }

        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    if (item?.id) {
      fetchReviews();
    }
  }, [item]);

  const handleChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleGuestSubmit = async () => {
    const { name, email, phone, address } = personalInfo;
    if (!name || !email || !phone || !address) {
      return alert("Please fill out all fields.");
    }

    const guestKey = `${name}-${email}`.toLowerCase().trim();

    try {
      const guestQuery = query(
        collection(db, "guest"),
        where("email", "==", email)
      );
      const guestSnapshot = await getDocs(guestQuery);

      if (guestSnapshot.empty) {
        await addDoc(collection(db, "guest"), {
          name,
          email,
          phone,
          address,
          createdAt: serverTimestamp(),
        });
      }

      await addDoc(collection(db, "guest_purchases"), {
        guestKey,
        guestEmail: email,
        imageUrl: item.imageUrl,
        name: item.name,
        price: item.price,
        status: item.status,
        itemId: item.id || "",
        dateAdded: serverTimestamp(),
      });

      alert("Item added to bag!");
      onClose();
    } catch (err) {
      console.error("Error handling guest bag logic:", err);
      alert("Failed to save item. Try again.");
    }
  };

  const handleSignedInAdd = async () => {
    if (!user || !user.uid) {
      alert("User not signed in.");
      return;
    }

    try {
      await addDoc(collection(db, "bag"), {
        userId: user.uid,
        itemId: item.id,
        imageUrl: item.imageUrl,
        name: item.name,
        price: item.price,
        status: item.status,
        dateAdded: serverTimestamp(),
      });

      alert("Item added to bag!");
      await fetchBagItems();
      onClose();
    } catch (err) {
      console.error("Error adding to bag:", err);
      alert("Failed to add to bag. Check your connection or auth.");
    }
  };

  const handleAddReview = async () => {
    if (!newReview.trim()) return alert("Review cannot be empty");

    try {
      await addDoc(collection(db, "reviews"), {
        productId: item.id,
        name: userProfile?.name || "Anonymous",
        review: newReview,
        timestamp: serverTimestamp(),
      });

      setNewReview("");
      alert("Review added!");

      // Refetch reviews after submit
      const q = query(
        collection(db, "reviews"),
        where("productId", "==", item.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());

      if (data.length > 5) {
        setReviews(data.sort(() => 0.5 - Math.random()).slice(0, 5));
      } else {
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to add review:", err);
      alert("Could not post review.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full h-full rounded-none shadow-lg overflow-y-auto">
        <div className="overflow-y-auto max-h-[90vh] p-6 no-scrollbar relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-red-600 z-10 text-xl"
          >
            <FaTimes />
          </button>

          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-60 object-cover rounded mb-4 mt-6"
          />
          <h2 className="text-xl font-bold mb-2">{item.name}</h2>
          <p className="text-green-600 font-semibold mb-1">
            ₦{item.price.toLocaleString()}
          </p>
          <p
            className={`text-sm font-bold ${
              item.status === "available" ? "text-green-600" : "text-red-500"
            }`}
          >
            {item.status}
          </p>
          <p className="font-semibold">{item.description}</p>

          {user ? (
            <button
              onClick={handleSignedInAdd}
              className="w-full bg-black text-white py-2 mt-4 rounded"
            >
              Add to Bag
            </button>
          ) : (
            <>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-black text-white py-2 mt-4 rounded"
                >
                  Add to Bag
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <input
                    name="name"
                    value={personalInfo.name}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Full Name"
                  />
                  <input
                    name="email"
                    value={personalInfo.email}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Email"
                  />
                  <input
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Phone Number"
                  />
                  <input
                    name="address"
                    value={personalInfo.address}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Home Address"
                  />
                  <button
                    onClick={handleGuestSubmit}
                    className="w-full bg-green-600 text-white py-2 mt-2 rounded"
                  >
                    Confirm and Add
                  </button>
                </div>
              )}
            </>
          )}

          {/* Review Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-bold mb-2">Reviews</h3>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews for this product yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {reviews.map((r, idx) => (
                  <li key={idx} className="border rounded p-2 bg-gray-50">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-gray-700">{r.review}</p>
                    <p className="text-xs text-gray-500">
                      {r.timestamp?.toDate
                        ? formatDistanceToNow(r.timestamp.toDate(), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4">
              {user ? (
                <>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full border p-2 rounded mb-2 text-sm"
                    rows={2}
                  />
                  <button
                    onClick={handleAddReview}
                    className="w-full bg-gray-600 text-white py-2 rounded"
                  >
                    Add Review
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  Sign in to send reviews.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;