// src/components/AdminDashboard.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { CSVLink } from "react-csv";

export default function AdminDashboard() {
  // State to manage which tab is currently active
  const [activeTab, setActiveTab] = useState("analytics");

  // State for data
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskSummary, setTaskSummary] = useState({});

  // Effect for fetching and filtering SUBMITTED tasks
  useEffect(() => {
    let q = query(
      collection(db, "submitted_tasks"),
      orderBy("timestamp", "desc")
    );
    if (startDate) {
      q = query(q, where("timestamp", ">=", new Date(startDate)));
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      q = query(q, where("timestamp", "<=", endOfDay));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubmittedTasks(tasksList);
      const summary = tasksList.reduce((acc, task) => {
        acc[task.taskTitle] = (acc[task.taskTitle] || 0) + 1;
        return acc;
      }, {});
      setTaskSummary(summary);
    });
    return () => unsubscribe();
  }, [startDate, endDate]);

  // Effect for fetching AVAILABLE tasks
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
    setIsLoading(true);
    try {
      await addDoc(collection(db, "available_tasks"), {
        title: newTaskTitle,
        createdAt: serverTimestamp(),
      });
      setNewTaskTitle("");
    } catch (error) {
      console.error("Error adding task: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler to DELETE an available task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(db, "available_tasks", taskId));
      } catch (error) {
        console.error("Error deleting task: ", error);
      }
    }
  };

  // Prepare data for CSV export
  const csvData = useMemo(() => {
    return submittedTasks.map((task) => ({
      Task: task.taskTitle,
      SubmittedBy: task.submitterName,
      Date: task.timestamp
        ? new Date(task.timestamp.seconds * 1000).toLocaleString()
        : "N/A",
    }));
  }, [submittedTasks]);

  return (
    <div className='w-full text-gray-900 dark:text-gray-100'>
      {/* --- Tab Navigation --- */}
      <div className='flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-700 mb-4'>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`py-3 px-4 text-sm font-medium text-center border-b-2 ${
            activeTab === "analytics"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          📊 Analytics & Reports
        </button>
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

      {/* --- Tab Content --- */}
      <div className='p-1'>
        {activeTab === "analytics" && (
          <div className='p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'>
            <h2 className='text-xl font-bold mb-4'>Analytics & Reporting</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
              <div>
                <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Start Date
                </label>
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                  End Date
                </label>
                <input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md'
                />
              </div>
              <CSVLink
                data={csvData}
                filename={"task_report.csv"}
                className='w-full text-center bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700'
              >
                Download CSV
              </CSVLink>
            </div>
            <div className='mt-6'>
              <h3 className='font-semibold'>
                Task Summary (for selected period)
              </h3>
              {Object.keys(taskSummary).length > 0 ? (
                <ul className='list-disc list-inside text-sm text-gray-600 dark:text-gray-300'>
                  {Object.entries(taskSummary).map(([title, count]) => (
                    <li key={title}>
                      {title}: <strong>{count}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  No data for this period.
                </p>
              )}
            </div>
          </div>
        )}
        {activeTab === "feed" && (
          <div className='p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'>
            <h2 className='text-xl font-bold mb-4'>Submitted Tasks Feed</h2>
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {submittedTasks.length > 0 ? (
                submittedTasks.map((task) => (
                  <div
                    key={task.id}
                    className='p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700'
                  >
                    <p className='font-semibold'>{task.taskTitle}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      Submitted by {task.submitterName} on{" "}
                      {task.timestamp
                        ? new Date(
                            task.timestamp.seconds * 1000
                          ).toLocaleString()
                        : "Just now"}
                    </p>
                  </div>
                ))
              ) : (
                <p className='text-gray-500 dark:text-gray-400'>
                  No tasks have been submitted yet.
                </p>
              )}
            </div>
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
                disabled={isLoading}
                className='bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50'
              >
                {isLoading ? "Adding..." : "Add Task"}
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
                    onClick={() => handleDeleteTask(task.id)}
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
  );
}
