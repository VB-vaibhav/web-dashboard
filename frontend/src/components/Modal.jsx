import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Modal({ dark, isOpen, onClose, title, children }) {
    const [isClosing, setIsClosing] = useState(false);

    if (!isOpen) return null;
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250); // match duration with animation
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} ${isClosing ? "animate-fade-out-modal" : "animate-fade-in-modal"} rounded-lg p-6 w-full max-w-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={handleClose}>
                        <XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
