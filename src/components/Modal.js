// src/components/Modal.js
"use client";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center'>
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md'>
        <div className='flex justify-between items-center border-b pb-3 mb-4'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
            {title}
          </h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
        <div className='text-right mt-4'>
          <button
            onClick={onClose}
            className='bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
