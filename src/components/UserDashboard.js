// src/components/UserDashboard.js
"use client";

import { useState } from "react";
import UserTaskFormContent from "./UserTaskFormContent";
import UserTaskHistory from "./UserTaskHistory";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("submit");

  return (
    <div className='w-full text-gray-900 dark:text-gray-100'>
      <div className='flex border-b border-gray-200 dark:border-gray-700 mb-4'>
        <button
          onClick={() => setActiveTab("submit")}
          className={`py-3 px-4 text-sm font-medium text-center border-b-2 ${
            activeTab === "submit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Submit Task
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 px-4 text-sm font-medium text-center border-b-2 ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          My History
        </button>
      </div>
      <div>
        {activeTab === "submit" && <UserTaskFormContent />}
        {activeTab === "history" && <UserTaskHistory />}
      </div>
    </div>
  );
}
