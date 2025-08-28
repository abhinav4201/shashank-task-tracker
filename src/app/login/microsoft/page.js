// src/app/login/microsoft/page.js
"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { OAuthProvider, signInWithRedirect } from "firebase/auth";

export default function MicrosoftLogin() {
  useEffect(() => {
    const provider = new OAuthProvider("microsoft.com");
    signInWithRedirect(auth, provider);
  }, []);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <p>Redirecting to Microsoft Sign-In...</p>
    </div>
  );
}
