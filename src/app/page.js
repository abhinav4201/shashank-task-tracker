// src/app/page.js
"use client";

import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import {
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  getRedirectResult, // <-- Import function to catch redirect users
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import QrCodeDisplay from "@/components/QrCodeDisplay"; // <-- Re-import the QR component
import AdminDashboard from "@/components/AdminDashboard"; // Import the new components
// import UserTaskForm from "@/components/UserTaskForm";
import UserDashboard from "@/components/UserDashboard"; 

export default function Home() {
  const { user, userProfile } = useAuth();
  const [baseUrl, setBaseUrl] = useState("");
  const [view, setView] = useState("initial");

  // Helper function to create user profile in Firestore
  const createUserProfile = async (user) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: "user",
      },
      { merge: true }
    );
  };

  useEffect(() => {
    // Set the base URL for QR codes
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }

    // This block "catches" the user when they return from the QR code redirect
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User has successfully signed in via redirect.
          await createUserProfile(result.user);
        }
      } catch (error) {
        console.error("Error during redirect sign-in:", error);
      }
    };
    checkRedirect();
  }, []);

  const handleSignOut = async () => {
    setView("initial");
    await signOut(auth);
  };

  // BUTTON HANDLERS (use signInWithPopup)
  const handleEmployeeLogin = async () => {
    const provider = new OAuthProvider("microsoft.com");
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
    } catch (error) {
      console.error("Error with Microsoft popup sign-in:", error);
    }
  };
  const handleVisitorLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
    } catch (error) {
      console.error("Error with Google popup sign-in:", error);
    }
  };

  // --- JSX REMAINS THE SAME ---
  if (user) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
        <div className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-8 rounded-lg shadow-md w-full max-w-2xl text-center'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold'>Task Tracker</h1>
            <button
              onClick={handleSignOut}
              className='bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors'
            >
              Sign Out
            </button>
          </div>

          <p className='mb-6 text-left'>
            Welcome,{" "}
            <span className='font-semibold'>
              {userProfile?.name || user.email}
            </span>
            ! Your role is:{" "}
            <span className='font-semibold capitalize'>
              {userProfile?.role}
            </span>
          </p>

          {userProfile?.role === "admin" && <AdminDashboard />}
          {/* {userProfile?.role === "user" && <UserTaskForm />} */}
          {userProfile?.role === "user" && <UserDashboard />}
        </div>
      </main>
    );
  }
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4'>
      {" "}
      <div className='w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-md'>
        {" "}
        {view === "initial" && (
          <div className='text-center'>
            {" "}
            <h1 className='text-3xl font-bold mb-2 text-gray-800'>
              Welcome
            </h1>{" "}
            <p className='text-gray-500 mb-8'>
              Please select your role to continue.
            </p>{" "}
            <div className='space-y-4'>
              {" "}
              <button
                onClick={() => setView("employee")}
                className='w-full bg-gray-800 text-white py-4 rounded-lg hover:bg-black transition-colors text-lg font-semibold'
              >
                {" "}
                🏢 Employee{" "}
              </button>{" "}
              <button
                onClick={() => setView("visitor")}
                className='w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold'
              >
                {" "}
                👤 Visitor / User{" "}
              </button>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {view === "employee" && (
          <div className='text-center flex flex-col items-center'>
            {" "}
            <h2 className='text-2xl font-semibold mb-4 text-gray-700'>
              Employee Login
            </h2>{" "}
            <p className='text-gray-500 mb-6'>
              Scan to sign in with your Microsoft account.
            </p>{" "}
            <QrCodeDisplay url={`${baseUrl}/login/microsoft`} />{" "}
            <button
              onClick={handleEmployeeLogin}
              className='w-full mt-6 bg-[#2F2F2F] text-white py-3 rounded-lg hover:bg-black transition-colors text-lg'
            >
              {" "}
              Sign in with Microsoft{" "}
            </button>{" "}
            <button
              onClick={() => setView("initial")}
              className='text-gray-500 hover:underline mt-6'
            >
              {" "}
              &larr; Back{" "}
            </button>{" "}
          </div>
        )}{" "}
        {view === "visitor" && (
          <div className='text-center flex flex-col items-center'>
            {" "}
            <h2 className='text-2xl font-semibold mb-4 text-gray-700'>
              Visitor & User Login
            </h2>{" "}
            <p className='text-gray-500 mb-6'>
              Scan to sign in with your Google account.
            </p>{" "}
            <QrCodeDisplay url={`${baseUrl}/login/google`} />{" "}
            <button
              onClick={handleVisitorLogin}
              className='w-full mt-6 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg'
            >
              {" "}
              Sign in with Google{" "}
            </button>{" "}
            <button
              onClick={() => setView("initial")}
              className='text-gray-500 hover:underline mt-6'
            >
              {" "}
              &larr; Back{" "}
            </button>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </main>
  );
}
