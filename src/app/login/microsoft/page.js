// src/app/login/microsoft/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { OAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function MicrosoftLogin() {
  const router = useRouter();

  useEffect(() => {
    const signInWithMicrosoft = async () => {
      const provider = new OAuthProvider("microsoft.com");
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Create user profile in Firestore
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

        // Redirect to homepage after successful sign-in
        router.push("/");
      } catch (error) {
        console.error("Error signing in with Microsoft: ", error);
        // Redirect to homepage even if there's an error
        router.push("/");
      }
    };

    signInWithMicrosoft();
  }, [router]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <p>Signing in with Microsoft, please wait...</p>
    </div>
  );
}
