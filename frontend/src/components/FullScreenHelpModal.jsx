// src/components/FullScreenHelpModal.jsx
import React from 'react';

const FullScreenHelpModal = ({ isOpen, onClose, dark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center">
      <div className={`w-full max-w-md h-full overflow-y-auto rounded-none p-6 ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-indigo-600">Help</h2>
          <button onClick={onClose} className="text-lg font-semibold text-gray-400 hover:text-red-500">&times;</button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold">Admin Dashboard - The Earth Ace</p>
            <p className="text-xs text-gray-400">Designed & Developed by: Code Synkz</p>
            <p className="text-xs text-gray-400">Version: 1.0.0.0</p>
            <p className="text-xs text-gray-400">Date Created - 01-04-2025</p>
          </div>
          <div className="border-t pt-3 space-y-2">
            <p className="font-medium">Feature Request</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Have any suggestions?</p>
            <button className="px-4 py-2 w-full text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">Share Your Idea</button>
          </div>
          <div className="border-t pt-3 space-y-2">
            <p className="font-medium">Report an Issue</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Something is broken?</p>
            <button className="px-4 py-2 w-full text-sm rounded bg-red-500 text-white hover:bg-red-600">Report Problem</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenHelpModal;
