import React from 'react';

const AlertModal = ({ isOpen, message, onClose, dark }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className={`${dark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] max-w-sm w-full`}>
                <div className={`text-md font-medium ${dark ? 'text-white' : 'text-gray-800'} mb-4`}>
                    {message}
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm ${dark ? '' : ''}`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
