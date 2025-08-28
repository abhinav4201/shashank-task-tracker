// src/app/login/google/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function GoogleLogin() {
  const router = useRouter();

  useEffect(() => {
    const signInWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
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
        console.error("Error signing in with Google: ", error);
        // Redirect to homepage even if there's an error
        router.push("/");
      }
    };

    signInWithGoogle();
  }, [router]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <p>Signing in with Google, please wait...</p>
    </div>
  );
}
