// src/components/HelpPopover.jsx
import React, { useEffect, useRef } from 'react';

const HelpPopover = ({ isOpen, onClose, anchorRef, dark }) => {
  const popoverRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`absolute z-50 w-[320px] right-0 mt-101 mr-4 rounded-xl shadow-xl border transition-transform duration-200 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
    >
      {/* 🔻 Arrow pointer */}
      {/* <div className="absolute right-6 -top-2 w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 border-t border-l border-gray-300 dark:border-gray-700 z-[-1]" /> */}

      {/* Main content */}
      <div className="p-4 text-sm">
        <h2 className={`text-lg font-semibold mb-2 ${dark ? 'text-white' : 'text-indigo-600' }`}>Help</h2>
        <div className="mb-3">
          <p className="font-medium">Admin Dashboard - The Earth Ace</p>
          <p className="text-xs text-gray-400">Designed & Developed by: Code Synkz</p>
          <p className="text-xs text-gray-400">Version: 1.0.0.0</p>
          <p className="text-xs text-gray-400">Date Created - 01-04-2025</p>
        </div>
        <hr className="my-2" />
        <div className="space-y-2">
          <p className="font-medium">Feature Request</p>
          <p className="text-gray-400">Have any suggestions?</p>
          <button className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Share Your Idea</button>
        </div>
        <hr className="my-3" />
        <div className="space-y-2">
          <p className="font-medium">Report an Issue</p>
          <p className="text-gray-400">Something is broken?</p>
          <button className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600">Report Problem</button>
        </div>
      </div>
    </div>
  );
};

export default HelpPopover;
