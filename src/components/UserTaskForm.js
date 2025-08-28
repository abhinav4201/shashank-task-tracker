// src/components/UserTaskForm.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Modal from "./Modal"; // 1. Import the Modal component

export default function UserTaskForm() {
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 2. Add state for the modal
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const tasksCollection = collection(db, "available_tasks");
    const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
      const tasksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksList);
      if (tasksList.length > 0 && !selectedTask) {
        setSelectedTask(tasksList[0].title);
      }
    });
    return () => unsubscribe();
  }, [selectedTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask || !user) {
      setModalMessage("Please select a task before submitting.");
      setIsModalOpen(true);
      return;
    }
    setIsLoading(true);

    try {
      await addDoc(collection(db, "submitted_tasks"), {
        taskTitle: selectedTask,
        submitterUid: user.uid,
        submitterName: userProfile?.name || user.email,
        timestamp: serverTimestamp(),
        status: "pending", // Default status
      });
      // 3. Replace alert with modal logic
      setModalMessage(`Task "${selectedTask}" submitted successfully!`);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error submitting task: ", error);
      setModalMessage("Failed to submit task. Please try again.");
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 4. Add the Modal component to the JSX */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Task Submission'
      >
        <p className='text-gray-700 dark:text-gray-300'>{modalMessage}</p>
      </Modal>

      <div className='w-full text-gray-900 dark:text-gray-100'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='task-select'
              className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'
            >
              Select a task from the list
            </label>
            <select
              id='task-select'
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className='w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500'
            >
              {tasks.length === 0 ? (
                <option>Loading tasks...</option>
              ) : (
                tasks.map((task) => (
                  <option key={task.id} value={task.title}>
                    {task.title}
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            type='submit'
            disabled={isLoading || tasks.length === 0}
            className='w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-opacity'
          >
            {isLoading ? "Submitting..." : "Submit Task"}
          </button>
        </form>
      </div>
    </>
  );
}
