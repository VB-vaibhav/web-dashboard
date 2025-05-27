// src/pages/HelpPage.jsx
import React from 'react';
import { MessageSquareText, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const HelpPage = () => {
    const { dark } = useOutletContext();

    return (
        <div className={`flex flex-col min-h-[calc(100vh-140px)] p-4 max-w-xl mx-auto mt-6 px-4 py-6 rounded duration-300 ease-in-out shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>

            <div className={`p-4 mb-4 rounded ${dark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                <p className={`font-medium ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Admin Dashboard - The Earth Ace</p>
                <p className={` ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Designed & Developed by: Code Synkz</p>
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Version: 1.0.0.0</p>
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Date Created – 01-04-2025</p>
            </div>
            {/* <hr className={`my-2 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`} /> */}
            <div className="space-y-6">
                {/* Feature Request */}
                <div>
                    <p className={`font-medium px-7 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Feature Request</p>
                    <p className={`text-xs px-7 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Have any suggestions?</p>
                    <div className="mt-2 flex items-center gap-2">
                        <MessageSquareText size={18} className={`${dark ? 'text-slate-300' : 'text-indigo-600'}`} />
                        <button className={`w-33 px-3 py-2 text-sm  rounded ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                            Share Your Idea
                        </button>
                    </div>
                </div>

                {/* Report an Issue */}
                <hr className={`my-3 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`} />
                <div className="space-y-2">
                    <p className={`font-medium px-6 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Report an Issue</p>
                    <p className={`text-xs px-6 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>Something is broken?</p>
                    <div className="mt-2 flex items-center gap-2">
                        <AlertCircle size={18} className={`${dark ? 'text-slate-300' : 'text-indigo-600'}`} />
                        <button className={`w-33 px-3 py-2 text-sm  rounded ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                            Report Problem
                        </button>
                    </div>
                </div>
                <hr className={`my-3 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`} />
            </div>
        </div>
    );
};

export default HelpPage;
