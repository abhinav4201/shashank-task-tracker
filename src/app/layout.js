// src/app/layout.js

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // <-- 1. Make sure this import is correct

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Task Tracker",
  description: "Office Task Tracker",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        {/* ▼▼ 2. Make sure AuthProvider wraps {children} like this ▼▼ */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
