import React, { useState } from 'react';
import Modal from './Modal'; // assuming you have a reusable Modal component
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function RenewClientsModal({ isOpen, onClose, onSave, dark }) {
    const [startDate, setStartDate] = useState(new Date());
    const [expiryDate, setExpiryDate] = useState(null);

    const handleSubmit = () => {
        if (!expiryDate) {
            alert("Please select an expiry date.");
            return;
        }
        onSave(startDate, expiryDate);
    };

    if (!isOpen) return null;

    return (
        <Modal dark={dark} isOpen={isOpen} onClose={onClose} title="Renew Clients">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd-MM-yyyy"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <DatePicker
                        selected={expiryDate}
                        onChange={(date) => setExpiryDate(date)}
                        dateFormat="dd-MM-yyyy"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        minDate={startDate}
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5))}
                        placeholderText="Select expiry date"
                    />
                </div>

                <div className="mt-6 text-center">
                    {/* <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded border bg-gray-200 hover:bg-gray-300"
                    >
                        Cancel
                    </button> */}
                    <button
                        onClick={handleSubmit}
                        className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}
                    >
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
}
