import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useInView } from "react-intersection-observer";
import HeaderComponent from "../components/HeaderComponent";
import VideoBanner from "../components/VideoBanner";
import { FaArrowRight, FaHeart } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import WishlistModal from "../components/WishlistModal";
import FlashSalesBanner from "../components/FlashSalesBanner";
import FooterComponent from "../components/FooterComponent";
import { useNavigate } from "react-router-dom";

const UserHomePage = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fetchBagItems = async () => {
    if (!auth.currentUser) {
      setCartCount(0);
      return [];
    }

    const q = query(
      collection(db, "bag"),
      where("userId", "==", auth.currentUser.uid)
    );
    const snap = await getDocs(q);
    setCartCount(snap.docs.length);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
        }

        const q = query(collection(db, "bag"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        setCartCount(snapshot.size);
      } else {
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth.currentUser) return;
      const snapshot = await getDocs(collection(db, "wishlist"));
      const items = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (item) => item.userId === auth.currentUser.uid && !item.removed
        );
      setWishlist(items);
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchWishlist();
      } else {
        setWishlist([]);
      }
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const grouped = {};
      products.forEach((product) => {
        const category = product.category?.toUpperCase() || "OTHERS";
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(product);
      });

      setProductsByCategory(grouped);
    };

    fetchProducts();
  }, []);

  return (
    <>
      <HeaderComponent cartCount={cartCount} setShowWishlist={setShowWishlist} />
      <VideoBanner />
      <FlashSalesBanner />

      {/* Products Section */}
      <div className="px-4 sm:px-6 py-6 bg-black">
        {productsByCategory["FLASH SALES"] && (
          <div className="mb-12 mt-20">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">
              FLASH SALES
            </h2>
            <div className="flex overflow-x-auto space-x-4 no-scrollbar">
              {productsByCategory["FLASH SALES"].map((item, idx) => (
                <ProductCard
                  key={idx}
                  item={item}
                  index={idx}
                  wishlist={wishlist}
                  setWishlist={setWishlist}
                  fetchBagItems={fetchBagItems}
                />
              ))}
            </div>
          </div>
        )}

        {Object.entries(productsByCategory)
          .filter(([category]) => category !== "FLASH SALES")
          .map(([category, items]) => (
            <div key={category} className="mb-12 mt-20">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">
                {category}
              </h2>
              <div className="flex overflow-x-auto space-x-4 no-scrollbar">
                {items.map((item, idx) => (
                  <ProductCard
                    key={idx}
                    item={item}
                    index={idx}
                    wishlist={wishlist}
                    setWishlist={setWishlist}
                    fetchBagItems={fetchBagItems}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      <FooterComponent />

      {showWishlist && (
        <WishlistModal
          onClose={() => setShowWishlist(false)}
          wishlist={wishlist}
          setWishlist={setWishlist}
        />
      )}
    </>
  );
};

const ProductCard = ({ item, index, wishlist, setWishlist }) => {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWished = wishlist.some(
    (w) => w.name === item.name && w.userId === user?.uid
  );

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) return;

    try {
      if (isWished) {
        const q = query(
          collection(db, "wishlist"),
          where("userId", "==", user.uid),
          where("name", "==", item.name)
        );
        const snap = await getDocs(q);
        snap.forEach(async (docSnap) => {
          await docSnap.ref.delete();
        });
        setWishlist((prev) =>
          prev.filter((w) => !(w.name === item.name && w.userId === user.uid))
        );
      } else {
        const newWish = {
          userId: user.uid,
          name: item.name,
          price: item.price,
          status: item.status,
          imageUrl: item.imageUrl,
          createdAt: new Date(),
        };
        await addDoc(collection(db, "wishlist"), newWish);
        setWishlist((prev) => [...prev, newWish]);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  };

  const isFlashSale = item.category?.toUpperCase() === "FLASH SALES";

  return (
    <div
      onClick={() => navigate(`/product/${item.id}`)}
      ref={ref}
      className={`min-w-[70vw] sm:min-w-[250px] bg-gray-700 shadow p-3 rounded cursor-pointer transition-transform duration-[1200ms] ease-out hover:scale-105 transform ${
        inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
      }`}
      style={{ transitionDelay: `${index * 200}ms `}}
    >
      <img
        src={item.fullImage}
        alt={item.name}
        className="w-full h-48 sm:h-64 object-cover rounded mb-2"
      />
      <h3 className="font-bold text-white text-sm sm:text-base">
        {item.name.toUpperCase()}
      </h3>

      {isFlashSale && item.originalPrice ? (
        <div className="text-white text-sm">
          <span className="line-through text-red-400 mr-2">
            ₦{parseFloat(item.originalPrice).toLocaleString()}
          </span>
          <span className="font-bold text-green-400">
            ₦{parseFloat(item.price).toLocaleString()}
          </span>
        </div>
      ) : (
        <p className="text-sm text-white">
          ₦{parseFloat(item.price).toLocaleString()}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        <p
          className={`text-sm font-bold ${item.status?.toLowerCase().trim() === "available" ? "text-green-700" : "text-red-500"}
            
          `}
        >
          {item.status}
        </p>
        {user && (
          <FaHeart
            onClick={toggleWishlist}
            className={`text-lg cursor-pointer transition-transform duration-200 ${
              isWished ? "text-red-500" : "text-white hover:text-red-500"
            }`}
          />
        )}
      </div>
    </div>
  );
};

export default UserHomePage;