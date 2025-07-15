// BagContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "./AuthContext";

const BagContext = createContext();
export const useBag = () => useContext(BagContext);

export const BagProvider = ({ children }) => {
  const { user } = useAuth();
  const [bagCount, setBagCount] = useState(0);

  const fetchBagItems = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, "bag"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      setBagCount(snap.size); // ✅ Updates the count globally
    } catch (err) {
      console.error("Error fetching bag count:", err);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchBagItems();
    else setBagCount(0);
  }, [user?.uid]);

  return (
    <BagContext.Provider value={{ bagCount, fetchBagItems }}>
      {children}
    </BagContext.Provider>
  );
};
