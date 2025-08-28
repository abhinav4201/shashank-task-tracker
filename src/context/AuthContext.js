// src/context/AuthContext.js
"use client";

import { useContext, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// --- Define your Super Admin's email address here ---
export const SUPER_ADMIN_EMAIL = "abhinav445.aa@gmail.com"; // IMPORTANT: Change this to your email

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

          // SUPER ADMIN LOGIC: If the logged-in user is the super admin,
          // forcefully set their role to 'admin' in the app state.
          if (user.email === SUPER_ADMIN_EMAIL) {
            profileData.role = "admin";
          }
          setUserProfile(profileData);
        } else {
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isSuperAdmin: user?.email === SUPER_ADMIN_EMAIL,
      }}
    >
      {loading ? (
        <div className='flex h-screen items-center justify-center'>
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
