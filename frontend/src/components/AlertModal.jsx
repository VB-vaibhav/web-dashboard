import React from 'react';

const AlertModal = ({ isOpen, message, onClose, onConfirm, dark }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center ">
            <div className={`${dark ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] max-w-sm w-fit`}>
                <div className={`text-md font-medium ${dark ? 'text-white' : 'text-gray-800'} mb-4`}>
                    {message}
                </div>
                <div className="flex justify-end">
                    {onConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 rounded text-sm ${dark ? 'bg-gray-600 text-slate-100 hover:bg-gray-500' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                            >
                                No
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2 rounded text-sm ${dark ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
                            >
                                Yes
                            </button>
                        </>
                    ) : (
                    <button
                        onClick={onClose}
                        className={`px-4 py-2  rounded  text-sm ${dark ? 'bg-gray-600 text-slate-100 hover:bg-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        OK
                    </button>
                     )}
                </div>
            </div>
        </div>
    );
};

export default AlertModal;




