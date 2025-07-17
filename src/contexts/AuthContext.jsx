// src/contexts/AuthContext.jsx
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "../firebase/firebaseConfig"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  const [user, setUser] = useState(null); 
  const [userProfile, setUserProfile] = useState(null); 
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          setUserProfile(null);
        }

       
        localStorage.setItem("token", "loggedin");
      } else {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem("token");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // 🔐 Auth actions
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem("token");
  };

  const isAdmin = user?.email === "admin@email.com";

  const value = {
    user,
    currentUser: user,
    userProfile,
    isAdmin,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
