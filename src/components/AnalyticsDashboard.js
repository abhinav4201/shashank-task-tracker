// src/components/AnalyticsDashboard.js
"use client";

import { useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { CSVLink } from "react-csv";

export default function AnalyticsDashboard() {
  // State for the data and filters
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // This function runs when the "Calculate" button is clicked
  const handleCalculateAnalytics = async () => {
    if (!startDate || !endDate) {
      alert("Please select both a start and end date.");
      return;
    }
    setIsLoading(true);

    try {
      // Build the query based on the selected dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end day

      const q = query(
        collection(db, "submitted_tasks"),
        where("timestamp", ">=", start),
        where("timestamp", "<=", end),
        orderBy("timestamp", "desc")
      );

      // Fetch the documents
      const querySnapshot = await getDocs(q);
      const tasksList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Set the tasks for the table display
      setTasks(tasksList);

      // Calculate the summary
      const taskSummary = tasksList.reduce((acc, task) => {
        acc[task.taskTitle] = (acc[task.taskTitle] || 0) + 1;
        return acc;
      }, {});
      setSummary(taskSummary);
    } catch (error) {
      console.error("Error fetching analytics data: ", error);
      alert("Failed to fetch data. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for CSV export
  const csvData = useMemo(() => {
    return tasks.map((task) => ({
      Task: task.taskTitle,
      SubmittedBy: task.submitterName,
      Date: task.timestamp
        ? new Date(task.timestamp.seconds * 1000).toLocaleString()
        : "N/A",
      Status: task.status,
    }));
  }, [tasks]);

  return (
    <div className='p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-6'>
      <div>
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
          <button
            onClick={handleCalculateAnalytics}
            disabled={isLoading}
            className='w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50'
          >
            {isLoading ? "Calculating..." : "Calculate Analytics"}
          </button>
        </div>
      </div>

      {/* --- Results Section --- */}
      {tasks.length > 0 && (
        <div className='space-y-6'>
          {/* Task Summary */}
          <div>
            <h3 className='font-semibold'>Task Summary</h3>
            <div className='p-4 mt-2 bg-gray-50 dark:bg-gray-900 rounded-md'>
              <ul className='list-disc list-inside text-sm text-gray-600 dark:text-gray-300'>
                {Object.entries(summary).map(([title, count]) => (
                  <li key={title}>
                    {title}: <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Data Table */}
          <div>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-semibold'>Filtered Tasks</h3>
              <CSVLink
                data={csvData}
                filename={"task_report.csv"}
                className='text-sm bg-green-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-700'
              >
                Download CSV
              </CSVLink>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>
                  <tr>
                    <th scope='col' className='px-6 py-3'>
                      Task Title
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Submitted By
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Date
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className='bg-white dark:bg-gray-800 border-b dark:border-gray-700'
                    >
                      <th
                        scope='row'
                        className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                      >
                        {task.taskTitle}
                      </th>
                      <td className='px-6 py-4'>{task.submitterName}</td>
                      <td className='px-6 py-4'>
                        {task.timestamp
                          ? new Date(
                              task.timestamp.seconds * 1000
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className='px-6 py-4'>{task.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
