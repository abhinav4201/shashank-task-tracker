/* eslint-disable react-hooks/exhaustive-deps */
// src/components/UserTaskHistory.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";

const TASKS_PER_PAGE = 5;

export default function UserTaskHistory() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchTasks = async (loadMore = false) => {
    if (!user) return;
    setIsLoading(true);

    try {
      let q = query(
        collection(db, "submitted_tasks"),
        where("submitterUid", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(TASKS_PER_PAGE)
      );

      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const documentSnapshots = await getDocs(q);
      const newTasks = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

      setTasks((prevTasks) =>
        loadMore ? [...prevTasks, ...newTasks] : newTasks
      );
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < TASKS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching tasks: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (isLoading && tasks.length === 0) {
    return (
      <p className='text-gray-500 dark:text-gray-400'>Loading your tasks...</p>
    );
  }

  return (
    <div className='w-full text-gray-900 dark:text-gray-100'>
      {tasks.length > 0 ? (
        <div className='space-y-3'>
          {tasks.map((task) => (
            <div
              key={task.id}
              className='p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700'
            >
              <div className='flex justify-between items-center'>
                <p className='font-semibold'>{task.taskTitle}</p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Submitted on{" "}
                {task.timestamp
                  ? new Date(task.timestamp.seconds * 1000).toLocaleString()
                  : "Just now"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-gray-500 dark:text-gray-400'>
          You haven&apos;t submitted any tasks yet.
        </p>
      )}
      {hasMore && (
        <div className='mt-4 text-center'>
          <button
            onClick={() => fetchTasks(true)}
            disabled={isLoading}
            className='bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50'
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
