// CreateNotificationModal.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { components } from 'react-select';
import JoditEditor from 'jodit-react';          // ← swap in
import 'jodit/es2018/jodit.min.css';
import axios from '../api/axios';
import dayjs from 'dayjs';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

function ScheduleDialog({ open, onClose, onConfirm, dark }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250); // match duration with animation
    };
    const submit = () => {
        if (!date || !time) return;
        onConfirm(dayjs(`${date}T${time}`).format('YYYY-MM-DD HH:mm:ss'));
    };
    if (!open) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" onMouseDown={handleClose}>
            <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} ${isClosing ? "animate-fade-out-modal" : "animate-fade-in-modal"}  rounded-lg p-6 w-full max-w-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <h2 className="text-md font-semibold mb-4">Schedule Notification</h2>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Date</label>
                        <input type="date" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                            value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Time</label>
                        <input type="time" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                            value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-5">
                    <button className={`px-3 py-2 rounded border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent}`} onClick={handleClose}>Cancel</button>
                    <button
                        className={`px-4 py-2 rounded ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'} `}
                        // onClick={() => {
                        //     if (!date || !time) return;
                        //     const iso = dayjs(`${date}T${time}`).format('YYYY-MM-DD HH:mm:ss');
                        //     onConfirm(iso);
                        // }}
                        onClick={submit}>
                        Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CreateNotificationModal({ onClose, onSuccess, dark }) {
    const [title, setTitle] = useState('');
    const [recipientType, setRecipientType] = useState({ value: 'all', label: 'All' });
    const [recipientOptions, setRecipientOptions] = useState([]);
    const [recipientIds, setRecipientIds] = useState([]); // [{value,label}]
    const [messageHtml, setMessageHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSched, setShowSched] = useState(false);
    const editorRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);
    const typeOptions = useMemo(() => ([
        { value: 'all', label: 'All' },
        { value: 'admin', label: 'Only admin' },
        { value: 'middleman', label: 'Only middleman' },
    ]), []);
    const [recipientsError, setRecipientsError] = useState('');
    // Load recipients when type changes
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await axios.get(`/custom-notifications/recipients?type=${recipientType.value}`);
                if (mounted) setRecipientOptions(data);
            } catch (e) { console.error('Recipients load failed', e); }
        })();
        setRecipientIds([]);
        setRecipientsError('');
        return () => { mounted = false; };
    }, [recipientType]);

    const ensureRecipients = () => {
        if (!recipientIds || recipientIds.length === 0) {
            setRecipientsError('Required field');
            // optional: bring focus to the select
            return false;
        }
        setRecipientsError('');
        return true;
    };


    const sendNow = async () => {
        if (!title.trim()) return alert('Title is required');
        if (!ensureRecipients()) return;
        setLoading(true);
        try {
            await axios.post('/custom-notifications', {
                title,
                messageHtml, // Jodit gives HTML string
                recipientType: recipientType.value,
                // recipientLabels: recipientIds.length ? recipientIds.map(x => x.label) : undefined,
                // recipientIds: recipientIds.length ? recipientIds.map(x => x.value) : [],
                // recipientLabels: recipientIds.length ? recipientIds.map(x => x.label) : [],
                recipientIds: recipientIds.map(x => x.value),
                recipientLabels: recipientIds.map(x => x.label),
            });
            onSuccess?.();
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    const schedule = async (scheduledAt) => {
        if (!title.trim()) return alert('Title is required');
        if (!ensureRecipients()) return;
        setLoading(true);
        try {
            await axios.post('/custom-notifications/schedule', {
                title,
                messageHtml,
                recipientType: recipientType.value,
                // recipientLabels: recipientIds.length ? recipientIds.map(x => x.label) : undefined,
                // recipientIds: recipientIds.length ? recipientIds.map(x => x.value) : [],
                // recipientLabels: recipientIds.length ? recipientIds.map(x => x.label) : [],
                recipientIds: recipientIds.map(x => x.value),
                recipientLabels: recipientIds.map(x => x.label),
                scheduledAt,
            });
            onSuccess?.();
            setShowSched(false);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to schedule notification');
        } finally {
            setLoading(false);
        }
    };

    // Jodit config matches your toolbar requirement (bold, underline, italic, alignment, lists, attach icon shown)
    const joditConfig = useMemo(() => ({
        readonly: false,
        theme: dark ? 'dark' : 'default',
        toolbarAdaptive: false,
        toolbarSticky: false,
        removeButtons: ['about'],
        buttons: 'source,|,bold,underline,italic,|,ul,ol,|,left,center,right,justify,|,link,unlink,|,image,table,|,hr,eraser',
        uploader: { insertImageAsBase64URI: true },
        style: {
            background: dark ? '#1F2937' : '#ffffff',
            color: dark ? '#CBD5E1' : '#0f172a'
        },
        minHeight: 160,
        maxHeight: 320
    }), [dark]);

    <div className="message-editor">
        <JoditEditor
            key={`jodit-${dark ? 'dark' : 'light'}`}
            ref={editorRef}
            value={messageHtml}
            config={joditConfig}
            onBlur={(newContent) => setMessageHtml(newContent)}
        />
    </div>

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250); // match duration with animation
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} ${isClosing ? "animate-fade-out-modal" : "animate-fade-in-modal"}  rounded-lg p-6 w-[752px] max-w-[95vw] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Create New Notification</h2>
                        <button onClick={handleClose} >
                            <XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1">Notification Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter title"
                                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Recipient Type</label>
                                <Select
                                    components={{
                                        IndicatorSeparator: () => null,
                                        DropdownIndicator: (props) => (
                                            <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                        ),
                                    }}
                                    value={recipientType}
                                    onChange={setRecipientType}
                                    options={typeOptions}
                                    classNamePrefix="rs"
                                    placeholder="select recipient type"
                                    className="text-md"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            boxShadow: 'none',
                                            backgroundColor: dark ? '#1F2937' : '#ffffff',
                                            color: dark ? '#99C2FF' : '#1F2937',
                                            borderColor: '#E5E7EB',
                                            '&:hover': {
                                                borderColor: '#CBD5E1',
                                            },
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: dark ? '#1F2937' : '#ffffff',
                                            zIndex: 99,
                                            padding: '4px',
                                            borderRadius: '8px',
                                            overflowX: 'hidden',
                                            maxHeight: 'none', // ⬅️ Controls dropdown height
                                            overflowY: 'visible',
                                        }),
                                        menuList: (provided) => ({
                                            ...provided,
                                            maxHeight: '142px',
                                            overflowY: 'auto',
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused
                                                ? (dark ? '#374151' : '#E0E7FF') // gray-700 or indigo-100
                                                : 'transparent',
                                            color: dark ? '#99C2FF' : '#1e3a8a',
                                            borderRadius: '6px',
                                            margin: '4px 0',
                                            padding: '8px 10px',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: dark ? '#ffffff' : '#1e3a8a',
                                        }),
                                        valueContainer: (base) => ({
                                            ...base,
                                            paddingLeft: 8,
                                            paddingRight: 4, // shrink right padding
                                        }),

                                        placeholder: (base) => ({
                                            ...base,
                                            color: dark ? '#9CA3AF' : '#a3aed0',
                                        }),
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Recipients <span className="text-red-500">*</span> </label>
                                <Select
                                    components={{
                                        IndicatorSeparator: () => null,
                                        DropdownIndicator: (props) => (
                                            <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                        ),
                                    }}
                                    isMulti
                                    value={recipientIds}
                                    onChange={setRecipientIds}
                                    options={recipientOptions}
                                    classNamePrefix="rs"
                                    placeholder="Select Recipients"
                                    className="text-md"
                                    aria-invalid={!!recipientsError}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            boxShadow: 'none',
                                            backgroundColor: dark ? '#1F2937' : '#ffffff',
                                            color: dark ? '#99C2FF' : '#1F2937',
                                            borderColor: '#E5E7EB',
                                            '&:hover': {
                                                borderColor: '#CBD5E1',
                                            },
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: dark ? '#1F2937' : '#ffffff',
                                            zIndex: 99,
                                            padding: '4px',
                                            borderRadius: '8px',
                                            overflowX: 'hidden',
                                            maxHeight: 'none',
                                            overflowY: 'visible',
                                        }),
                                        menuList: (provided) => ({
                                            ...provided,
                                            maxHeight: '142px',
                                            overflowY: 'auto',
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused
                                                ? (dark ? '#374151' : '#E0E7FF') // gray-700 or indigo-100
                                                : 'transparent',
                                            color: dark ? '#99C2FF' : '#1e3a8a',
                                            borderRadius: '6px',
                                            margin: '4px 0',
                                            padding: '8px 10px',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: dark ? '#ffffff' : '#1e3a8a',
                                        }),
                                        valueContainer: (base) => ({
                                            ...base,
                                            paddingLeft: 8,
                                            paddingRight: 4, // shrink right padding
                                        }),

                                        placeholder: (base) => ({
                                            ...base,
                                            color: dark ? '#9CA3AF' : '#a3aed0',
                                        }),
                                    }}
                                />
                                {recipientsError && (
                                    <div className="mt-1 text-sm text-red-500">{recipientsError}</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Message Body</label>
                            <JoditEditor
                                ref={editorRef}
                                value={messageHtml}
                                config={joditConfig}
                                onBlur={newContent => setMessageHtml(newContent)}  // update on blur
                            />
                        </div>

                        {/* <div>
                            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                            <input
                                value={schedulerNotes}
                                onChange={e => setSchedulerNotes(e.target.value)}
                                placeholder="internal notes"
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div> */}

                        <div className="flex items-center justify-center gap-3 pt-2">
                            {/* <button className="px-4 py-2" onClick={onClose}>Cancel</button> */}
                            <button
                                className={`px-4 py-2 rounded border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent}`}
                                onClick={() => setShowSched(true)}
                                disabled={loading}
                            >
                                Schedule
                            </button>
                            <button
                                className={`px-5 py-2 rounded ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'} `}
                                onClick={sendNow}
                                disabled={loading}
                            >
                                {/* {loading ? 'Sending…' : 'Send now'} */}
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                        Sending…
                                    </span>
                                ) : ("Send Now")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ScheduleDialog
                open={showSched}
                onClose={() => setShowSched(false)}
                onConfirm={schedule}
                dark={dark}
                animate
            />
        </>
    );
}
