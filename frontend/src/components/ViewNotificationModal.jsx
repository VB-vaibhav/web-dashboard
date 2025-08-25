// src/components/ViewNotificationModal.jsx
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import axios from '../api/axios';

export default function ViewNotificationModal({ id, onClose, dark }) {
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await axios.get(`/custom-notifications/${id}`);
                if (mounted) setNotification(data);
            } catch (err) {
                console.error("Failed to load notification", err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false };
    }, [id]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose?.(), 250);
    };

    if (!id) return null;
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className={`${dark ? 'bg-gray-800 text-slate-300' : 'bg-white text-blue-900'} rounded-lg p-6 w-[300px] max-w-[95vw] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className={`${dark ? 'bg-gray-800 text-slate-300' : 'bg-white text-blue-900'} ${isClosing ? 'animate-fade-out-modal' : 'animate-fade-in-modal'} rounded-lg p-6 w-[500px] max-w-[95vw] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Notification Details</h2>
                    <button onClick={handleClose}>
                        <XMarkIcon className={`w-5 h-5 ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium block mb-1">Message Title</label>
                        <div className={`px-3 py-2 border rounded-md border-gray-200 text-sm`}>
                            {notification?.title || "-"}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">Message Body</label>
                        <div
                            className={`px-3 py-2 border rounded-md text-sm  max-w-none ${dark ? 'prose-invert' : 'prose'} border-gray-200`}
                            style={{
                                maxHeight: "250px",   // 👈 limit height
                                overflowY: "auto",    // 👈 enable vertical scrollbar
                            }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification?.messageHtml || '') }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
