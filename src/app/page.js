// src/app/page.js
"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Home() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4'>
      <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center'>
        {user ? (
          // If user is signed in, show the app content
          <div>
            <h1 className='text-2xl font-bold mb-2'>Task Tracker</h1>
            <p className='mb-6'>Welcome, {user.displayName || user.email}!</p>

            {/* We will build the Admin/User view here in the next step */}
            <div className='bg-gray-200 p-10 rounded-lg'>
              <p className='text-gray-500'>Application content will go here.</p>
            </div>

            <button
              onClick={handleSignOut}
              className='w-full mt-6 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors'
            >
              Sign Out
            </button>
          </div>
        ) : (
          // If user is not signed in, show instructions
          <div>
            <h1 className='text-2xl font-bold mb-4'>
              Welcome to the Task Tracker
            </h1>
            <p className='text-gray-600'>
              Please scan a QR code with your mobile to sign in.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
