// src/context/AuthContext.js
"use client";

import { useContext, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const SUPER_ADMIN_EMAIL = "abhinav445.aa@gmail.com"; // Your super admin email

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          if (user.email === SUPER_ADMIN_EMAIL) {
            profileData.role = "admin";
          }
          setUserProfile(profileData);
        } else {
          setUserProfile(null);
        }
        // --- THIS IS THE FIX ---
        // We now set loading to false AFTER the profile is fetched.
        setLoading(false);
      } else {
        setUser(null);
        setUserProfile(null);
        // Also set loading to false if the user is signed out.
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isSuperAdmin: user?.email === SUPER_ADMIN_EMAIL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
