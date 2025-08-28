 
// src/components/AdminDashboard.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import AnalyticsDashboard from "./AnalyticsDashboard";
import UserManagement from "./UserManagement";
import Modal from "./Modal";

const TASKS_PER_PAGE = 10;

export default function AdminDashboard() {
  // State for UI
  const [activeTab, setActiveTab] = useState("feed");
  const [isFormLoading, setIsFormLoading] = useState(false);

  // State for "Manage Tasks" tab
  const [availableTasks, setAvailableTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // State for paginated "Task Feed" tab
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [lastVisibleTask, setLastVisibleTask] = useState(null);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);

  // Fetch paginated submitted tasks for the feed
 const fetchSubmittedTasks = useCallback(
   async (loadMore = false) => {
     setIsFeedLoading(true);
     try {
       let q = query(
         collection(db, "submitted_tasks"),
         orderBy("timestamp", "desc"),
         limit(TASKS_PER_PAGE)
       );
       if (loadMore && lastVisibleTask) {
         q = query(q, startAfter(lastVisibleTask));
       }
       const docSnapshots = await getDocs(q);
       const newTasks = docSnapshots.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
       }));
       const lastDoc = docSnapshots.docs[docSnapshots.docs.length - 1];

       setSubmittedTasks((prev) =>
         loadMore ? [...prev, ...newTasks] : newTasks
       );
       setLastVisibleTask(lastDoc);
       if (docSnapshots.docs.length < TASKS_PER_PAGE) {
         setHasMoreTasks(false);
       }
     } catch (error) {
       console.error("Error fetching submitted tasks: ", error);
     } finally {
       setIsFeedLoading(false);
     }
   },
   [lastVisibleTask]
 ); // useCallback's dependency

 // 3. Add the function to useEffect's dependency array
 useEffect(() => {
   fetchSubmittedTasks();
 }, [fetchSubmittedTasks]);


  // Real-time listener for the "Manage Tasks" list
  useEffect(() => {
    const tasksCollection = collection(db, "available_tasks");
    const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
      setAvailableTasks(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Handler to ADD a new available task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTaskTitle.trim() === "") {
      alert("Task title cannot be empty.");
      return;
    }
    setIsFormLoading(true);
    try {
      await addDoc(collection(db, "available_tasks"), {
        title: newTaskTitle,
        createdAt: serverTimestamp(),
      });
      setNewTaskTitle("");
    } catch (error) {
      console.error("Error adding task: ", error);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Open the delete confirmation modal
  const openDeleteConfirmation = (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  // Confirm and execute task deletion
  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await deleteDoc(doc(db, "available_tasks", taskToDelete));
      } catch (error) {
        console.error("Error deleting task: ", error);
      } finally {
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
      }
    }
  };

  // Handler to UPDATE a task's status
  const handleStatusUpdate = async (taskId, newStatus) => {
    const taskRef = doc(db, "submitted_tasks", taskId);
    try {
      await updateDoc(taskRef, { status: newStatus });
      setSubmittedTasks(
        submittedTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  return (
    <>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title='Confirm Deletion'
      >
        <p className='text-gray-700 dark:text-gray-300'>
          Are you sure you want to delete this task? This action cannot be
          undone.
        </p>
        <div className='flex justify-end gap-4 mt-6'>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className='bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md hover:opacity-90'
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteTask}
            className='bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700'
          >
            Confirm Delete
          </button>
        </div>
      </Modal>

      <div className='w-full text-gray-900 dark:text-gray-100'>
        <div className='flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-700 mb-4'>
          <button
            onClick={() => setActiveTab("feed")}
            className={`py-3 px-4 text-sm font-medium text-center border-b-2 ${
              activeTab === "feed"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            📥 Task Feed
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 px-4 text-sm font-medium text-center border-b-2 ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            👥 User Management
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-3 px-4 text-sm font-medium text-center border-b-2 ${
              activeTab === "analytics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`py-3 px-4 text-sm font-medium text-center border-b-2 ${
              activeTab === "manage"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            ⚙️ Manage Tasks
          </button>
        </div>

        <div className='p-1'>
          {activeTab === "analytics" && <AnalyticsDashboard />}

          {activeTab === "users" && <UserManagement />}

          {activeTab === "feed" && (
            <div className='p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'>
              <h2 className='text-xl font-bold mb-4'>Submitted Tasks Feed</h2>
              <div className='space-y-3'>
                {submittedTasks.map((task) => (
                  <div
                    key={task.id}
                    className='p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700'
                  >
                    <div className='flex flex-col sm:flex-row justify-between sm:items-center'>
                      <div>
                        <p className='font-semibold'>{task.taskTitle}</p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          By {task.submitterName} on{" "}
                          {task.timestamp
                            ? new Date(
                                task.timestamp.seconds * 1000
                              ).toLocaleString()
                            : ""}
                        </p>
                      </div>
                      <div className='mt-2 sm:mt-0'>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusUpdate(task.id, e.target.value)
                          }
                          className='p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm'
                        >
                          <option value='pending'>Pending</option>
                          <option value='in-progress'>In Progress</option>
                          <option value='completed'>Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {hasMoreTasks && (
                <div className='mt-4 text-center'>
                  <button
                    onClick={() => fetchSubmittedTasks(true)}
                    disabled={isFeedLoading}
                    className='bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50'
                  >
                    {isFeedLoading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "manage" && (
            <div className='p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'>
              <h2 className='text-xl font-bold mb-4'>Manage Available Tasks</h2>
              <form
                onSubmit={handleAddTask}
                className='flex flex-col sm:flex-row gap-2 mb-4'
              >
                <input
                  type='text'
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder='Enter new task title'
                  className='flex-grow p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500'
                />
                <button
                  type='submit'
                  disabled={isFormLoading}
                  className='bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50'
                >
                  {isFormLoading ? "Adding..." : "Add Task"}
                </button>
              </form>
              <div className='space-y-2'>
                {availableTasks.map((task) => (
                  <div
                    key={task.id}
                    className='flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700'
                  >
                    <p>{task.title}</p>
                    <button
                      onClick={() => openDeleteConfirmation(task.id)}
                      className='text-red-500 hover:text-red-700 text-sm font-semibold'
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
