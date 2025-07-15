// src/utils/firestoreHelpers.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Adjust if needed

export const fetchCategoriesFromProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  const allCategories = snapshot.docs.map((doc) => doc.data().category);
  const uniqueCategories = [...new Set(allCategories.filter(Boolean))];
  return uniqueCategories;
};
