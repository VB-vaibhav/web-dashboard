// src/components/HelpModal.jsx
import React from 'react';

const HelpModal = ({ isOpen, onClose, dark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`w-[90%] max-w-xl mx-auto rounded-lg p-6 shadow-lg border ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-bold text-indigo-600">Help</h2>
          <button onClick={onClose} className="text-lg font-semibold text-gray-400 hover:text-red-500">&times;</button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold">Admin Dashboard - The Earth Ace</p>
            <p className="text-xs text-gray-500">Designed & Developed by: Code Synkz</p>
            <p className="text-xs text-gray-500">Version: 1.0.0.0</p>
            <p className="text-xs text-gray-500">Date Created - 01-04-2025</p>
          </div>
          <div className="border-t pt-3 space-y-2">
            <p className="text-base font-medium">Feature Request</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Have any suggestions?</p>
            <button className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 w-full">Share Your Idea</button>
          </div>
          <div className="border-t pt-3 space-y-2">
            <p className="text-base font-medium">Report an Issue</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Something is broken?</p>
            <button className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600 w-full">Report Problem</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
