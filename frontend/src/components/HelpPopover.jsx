// src/components/HelpPopover.jsx
import React, { useEffect, useRef } from 'react';
import { MessageSquareText, AlertCircle } from 'lucide-react';

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
      className={`absolute z-50 w-[320px] right-0 mt-118 mr-4 rounded-xl shadow-xl border transition-transform duration-200 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
    >
      {/* 🔻 Arrow pointer */}
      {/* <div className="absolute right-6 -top-2 w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 border-t border-l border-gray-300 dark:border-gray-700 z-[-1]" /> */}

      {/* Main content */}
      <div className="p-4 text-sm">
        <h2 className={`text-lg font-semibold mb-2 ml-5 ${dark ? 'text-white' : 'text-blue-900'}`}>Help</h2>
        <div className={`p-4 mb-4 rounded ${dark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
          <p className={`font-medium ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Admin Dashboard - The Earth Ace</p>
          <p className={` ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Designed & Developed by: Code Synkz</p>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Version: 1.0.0.0</p>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Date Created - 01-04-2025</p>
        </div>
        {/* <hr className={`my-2 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`} /> */}
        <div className="space-y-2 ml-3">
          <p className={`font-medium px-10 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Feature Request</p>
          <p className={`text-xs px-10 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Have any suggestions?</p>
          <div className="flex items-center gap-3">
            <MessageSquareText size={25} className={`${dark ? 'text-slate-300' : 'text-indigo-600'}`} />
            <button className={`w-33 h-9 px-3 py-2 text-sm  rounded ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`} >Share Your Idea</button>
          </div>
        </div>
        <hr className={`my-3 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`} />
        <div className="space-y-2 ml-3">
          <p className={`font-medium px-10 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Report an Issue</p>
          <p className={`text-xs px-10 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Something is broken?<br></br> Let us know!</p>
          <div className="flex items-center gap-3">
            <AlertCircle size={25} className={`${dark ? 'text-slate-300' : 'text-indigo-600'}`}/>
            <button className={`w-33 h-9  px-3 py-2 text-sm  rounded ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>Report Problem</button>
          </div>
        </div>
        <hr className={`my-3 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`} />
      </div>
    </div>
  );
};

export default HelpPopover;
