// src/app/login/google/page.js
"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

export default function GoogleLogin() {
  useEffect(() => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  }, []);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <p>Redirecting to Google Sign-In...</p>
    </div>
  );
}
