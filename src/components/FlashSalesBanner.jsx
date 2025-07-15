import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const FlashSalesBanner = () => {
  const [endTime, setEndTime] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [productNames, setProductNames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch end time from Firestore
  useEffect(() => {
    const fetchEndTime = async () => {
      const docRef = doc(db, "flashSales", "global");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const end = docSnap.data().endTime?.toDate();
        setEndTime(end);
      }
    };
    fetchEndTime();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        setCountdown("Flash sale ended");
        clearInterval(interval);
        return;
      }

      const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

      setCountdown(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  // Fetch FLASH SALES product names
  useEffect(() => {
    const fetchNames = async () => {
      const q = query(collection(db, "products"), where("category", "==", "FLASH SALES"));
      const snap = await getDocs(q);
      const names = snap.docs.map((doc) => doc.data().name);
      setProductNames(names);
    };
    fetchNames();
  }, []);

  // Rotate product names
  useEffect(() => {
    if (productNames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % productNames.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [productNames]);

  return (
    <div className="bg-red-600 text-white mt-2 py-4 px-4 flex flex-col md:flex-row items-center justify-between">
      {/* Timer */}
      <div className="text-xl md:text-2xl font-bold mb-2 md:mb-0">
        Flash Sale Ends In: <span className="text-yellow-300">{countdown}</span>
      </div>

      {/* Sliding product name */}
      <div className="text-sm md:text-base font-semibold flex items-center space-x-1">
        <span>Buy</span>
        <div className="relative w-[70px] h-[24px] overflow-hidden">
          {productNames.length > 0 && (
            <span
              key={productNames[currentIndex]}
              className="absolute animate-slideUp text-yellow-300 font-bold"
            >
              {productNames[currentIndex]}
            </span>
          )}
        </div>
        <span>at discounted prices</span>
      </div>
    </div>
  );
};

export default FlashSalesBanner;