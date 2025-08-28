// src/components/UserManagement.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { SUPER_ADMIN_EMAIL } from "@/context/AuthContext"; // 1. Import the email

const USERS_PER_PAGE = 10;

export default function UserManagement() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = useCallback(
    async (loadMore = false) => {
      setIsLoading(true);
      try {
        let q = query(
          collection(db, "users"),
          orderBy("name"),
          limit(USERS_PER_PAGE)
        );
        if (loadMore && lastVisible) {
          q = query(q, startAfter(lastVisible));
        }
        const docSnapshots = await getDocs(q);
        const newUsers = docSnapshots.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const lastDoc = docSnapshots.docs[docSnapshots.docs.length - 1];

        setUsers((prev) => (loadMore ? [...prev, ...newUsers] : newUsers));
        setLastVisible(lastDoc);
        if (docSnapshots.docs.length < USERS_PER_PAGE) setHasMore(false);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setIsLoading(false);
      }
    },
    [lastVisible]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    const userRef = doc(db, "users", userId);
    try {
      await updateDoc(userRef, { role: newRole });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Error updating role: ", error);
    }
  };

  return (
    <div className='p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'>
      <h2 className='text-xl font-bold mb-4'>User Management</h2>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className='px-6 py-3'>
                Name
              </th>
              <th scope='col' className='px-6 py-3'>
                Email
              </th>
              <th scope='col' className='px-6 py-3'>
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className='bg-white dark:bg-gray-800 border-b dark:border-gray-700'
              >
                <td className='px-6 py-4 font-medium text-gray-900 dark:text-white'>
                  {user.name}
                </td>
                <td className='px-6 py-4'>{user.email}</td>
                <td className='px-6 py-4'>
                  {/* 2. Check if the user in THIS ROW is the super admin */}
                  {user.email === SUPER_ADMIN_EMAIL ? (
                    <span className='font-semibold text-gray-900 dark:text-white'>
                      Admin 🔒
                    </span>
                  ) : isSuperAdmin ? (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className='p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm'
                    >
                      <option value='user'>User</option>
                      <option value='admin'>Admin</option>
                    </select>
                  ) : (
                    <span className='capitalize'>{user.role}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className='mt-4 text-center'>
          <button
            onClick={() => fetchUsers(true)}
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
