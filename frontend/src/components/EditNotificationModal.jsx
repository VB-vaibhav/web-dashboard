import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select, { components as RSComponents } from 'react-select';
import JoditEditor from 'jodit-react';
import 'jodit/es2018/jodit.min.css';
import dayjs from 'dayjs';
import axios from '../api/axios';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

function ScheduleDialog({ open, onClose, onConfirm, dark, initial }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (!initial) return;
        const [d, t] = String(initial || '').split(' ');
        setDate(d || '');
        setTime((t || '').slice(0, 5));
    }, [initial]);

    if (!open) return null;
    const handleClose = () => { setClosing(true); setTimeout(onClose, 250); };
    const submit = () => {
        if (!date || !time) return;
        onConfirm(dayjs(`${date}T${time}`).format('YYYY-MM-DD HH:mm:ss'));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[50]" onMouseDown={handleClose}>
            <div
                className={`${dark ? 'bg-gray-800 text-slate-300' : 'bg-white text-blue-900'} ${closing ? 'animate-fade-out-modal' : 'animate-fade-in-modal'} rounded-lg p-6 w-full max-w-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}
                onMouseDown={e => e.stopPropagation()}
            >
                <h2 className="text-md font-semibold mb-4">Schedule Notification</h2>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Date</label>
                        <input type="date" className="w-full border rounded-md px-3 py-2 text-sm"
                            value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Time</label>
                        <input type="time" className="w-full border rounded-md px-3 py-2 text-sm"
                            value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-5">
                    <button className={`px-3 py-2 rounded border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'}`} onClick={handleClose}>Cancel</button>
                    <button className={`px-4 py-2 rounded ${dark ? 'bg-gray-700 text-slate-300' : 'bg-indigo-600 text-white'}`} onClick={submit}>Schedule</button>
                </div>
            </div>
        </div>
    );
}

export default function EditNotificationModal({ id, onClose, onSuccess, dark }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [recipientType, setRecipientType] = useState({ value: 'all', label: 'All' });

    // recipients
    const [recipientOptions, setRecipientOptions] = useState([]);        // [{value: string, label}]
    const [selectedRecipients, setSelectedRecipients] = useState([]);    // [{value: string, label}]
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [recipientsError, setRecipientsError] = useState('');

    const [messageHtml, setMessageHtml] = useState('');
    const [scheduledAt, setScheduledAt] = useState(null);
    const [showSched, setShowSched] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const editorRef = useRef(null);

    // control first prefill only once
    const firstLoadRef = useRef(true);
    const initialRecipientIdsRef = useRef([]); // strings
    const optionsCacheRef = useRef({});        // { all: [..], admin:[..], middleman:[..] }

    const typeOptions = useMemo(() => ([
        { value: 'all', label: 'All' },
        { value: 'admin', label: 'Only admin' },
        { value: 'middleman', label: 'Only middleman' },
    ]), []);

    /* ---------------------- load record (no recipients fetch here) ---------------------- */
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await axios.get(`/custom-notifications/${id}`);
                if (!mounted) return;

                setTitle(data.title || '');
                setMessageHtml(data.messageHtml || '');
                setScheduledAt(data.scheduledAt || null);

                const t = (data.recipientType || 'all').toLowerCase();
                const typeOpt = typeOptions.find(o => o.value === t) || typeOptions[0];
                setRecipientType(typeOpt);

                // remember initial ids as strings
                initialRecipientIdsRef.current = (data.recipientIds || []).map(v => String(v));
                firstLoadRef.current = true;

                setLoading(false);
            } catch (e) {
                console.error(e);
                alert('Failed to load notification.');
                onClose?.();
            }
        })();
        // IMPORTANT: depend only on id (not onClose), otherwise this effect keeps resetting state
    }, [id]); // <-- FIX: removed onClose from deps

    /* ---------------------- fetch recipients when type changes (with cache) ---------------------- */
    useEffect(() => {
        let cancelled = false;

        const loadOptions = async (type) => {
            // cache hit
            if (optionsCacheRef.current[type]) {
                const normalized = optionsCacheRef.current[type];
                setRecipientOptions(normalized);

                if (firstLoadRef.current) {
                    const idsSet = new Set(initialRecipientIdsRef.current);
                    const pre = normalized.filter(o => idsSet.has(o.value));
                    setSelectedRecipients(pre);
                    firstLoadRef.current = false;
                } else {
                    setSelectedRecipients([]); // user changed type
                }
                setRecipientsError('');
                return;
            }

            // fetch
            setLoadingRecipients(true);
            try {
                const { data: opts } = await axios.get(`/custom-notifications/recipients?type=${type}`);
                if (cancelled) return;

                const normalized = (opts || []).map(o => ({ value: String(o.value), label: o.label }));
                optionsCacheRef.current[type] = normalized;
                setRecipientOptions(normalized);

                if (firstLoadRef.current) {
                    const idsSet = new Set(initialRecipientIdsRef.current);
                    const pre = normalized.filter(o => idsSet.has(o.value));
                    setSelectedRecipients(pre);
                    firstLoadRef.current = false;
                } else {
                    setSelectedRecipients([]);
                }
                setRecipientsError('');
            } catch (e) {
                console.error('Recipients load failed', e);
            } finally {
                if (!cancelled) setLoadingRecipients(false);
            }
        };

        loadOptions(recipientType.value);
        return () => { cancelled = true; };
    }, [recipientType]);

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

    const ensureRecipients = () => {
        if (!selectedRecipients || selectedRecipients.length === 0) {
            setRecipientsError('Required field');
            return false;
        }
        setRecipientsError('');
        return true;
    };

    const updateNow = async () => {
        if (!title.trim()) return alert('Title is required');
        if (!ensureRecipients()) return;

        setSaving(true);
        try {
            await axios.patch(`/custom-notifications/${id}`, {
                title,
                messageHtml,
                recipientType: recipientType.value,
                recipientIds: selectedRecipients.map(x => Number(x.value)),
                recipientLabels: selectedRecipients.map(x => x.label),
            });
            onSuccess?.();
            onClose?.();
        } catch (e) {
            console.error(e);
            alert('Failed to update notification');
        } finally {
            setSaving(false);
        }
    };

    const schedule = async (newScheduledAt) => {
        setSaving(true);
        try {
            await axios.patch(`/custom-notifications/${id}/schedule`, {
                scheduledAt: newScheduledAt, 
                title,
                messageHtml,
                recipientType: recipientType.value,
                recipientIds: selectedRecipients.map(x => Number(x.value)),
                recipientLabels: selectedRecipients.map(x => x.label),
            });
            setScheduledAt(newScheduledAt);
            setShowSched(false);
            onSuccess?.();
            onClose?.();
        } catch (e) {
            console.error(e);
            alert('Failed to schedule notification');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose?.(), 250);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className={`${dark ? 'bg-gray-800 text-slate-300' : 'bg-white text-blue-900'} rounded-lg p-6 w-[300px] max-w-[95vw] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        Loading notification…
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className={`${dark ? 'bg-gray-800 text-slate-300' : 'bg-white text-blue-900'} ${isClosing ? 'animate-fade-out-modal' : 'animate-fade-in-modal'} rounded-lg p-6 w-[752px] max-w-[95vw] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Edit Notification</h2>
                        <button onClick={handleClose}><XMarkIcon className={`w-5 h-5 font-bold ${dark ? 'text-slate-300' : 'text-blue-900'} hover:text-red-500 cursor-pointer`} /></button>
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
                                    components={{ IndicatorSeparator: () => null, DropdownIndicator: (p) => <RSComponents.DropdownIndicator {...p} style={{ paddingLeft: 2, paddingRight: 2 }} /> }}
                                    value={recipientType}
                                    onChange={(opt) => setRecipientType(opt)}
                                    options={typeOptions}
                                    classNamePrefix="rs"
                                    placeholder="select recipient type"
                                    menuPortalTarget={document.body}
                                    menuShouldBlockScroll
                                    className="text-md"
                                    styles={{
                                        menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
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
                                <label className="block text-sm font-medium mb-1">
                                    Select Recipients <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    components={{ IndicatorSeparator: () => null, DropdownIndicator: (p) => <RSComponents.DropdownIndicator {...p} style={{ paddingLeft: 2, paddingRight: 2 }} /> }}
                                    isMulti
                                    value={selectedRecipients}
                                    onChange={(vals) => setSelectedRecipients(vals || [])}
                                    options={recipientOptions}
                                    classNamePrefix="rs"
                                    placeholder={loadingRecipients ? 'Loading…' : 'Select Recipients'}
                                    isDisabled={loadingRecipients}
                                    closeMenuOnSelect={false}
                                    getOptionValue={(o) => o.value}
                                    getOptionLabel={(o) => o.label}
                                    menuPortalTarget={document.body}
                                    menuShouldBlockScroll
                                    className="text-md"
                                    styles={{
                                        menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
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
                                {recipientsError && <div className="mt-1 text-sm text-red-500">{recipientsError}</div>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Message Body</label>
                            <div className="message-editor">
                                <JoditEditor
                                    ref={editorRef}
                                    value={messageHtml}
                                    config={joditConfig}
                                    onChange={(html) => setMessageHtml(html)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                className={`px-4 py-2 rounded border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent`}
                                onClick={() => setShowSched(true)}
                                disabled={saving}
                            >
                                Schedule
                            </button>
                            <button
                                className={`px-5 py-2 rounded ${dark ? 'bg-gray-700 text-slate-300' : 'bg-indigo-600 text-white'}`}
                                onClick={updateNow}
                                disabled={saving}
                            >
                                {saving ? <span className="flex items-center gap-2"><ArrowPathIcon className="h-5 w-5 animate-spin" />Saving…</span> : 'Update'}
                            </button>
                        </div>

                        {scheduledAt && (
                            <div className="pt-2 text-xs opacity-70 text-right">
                                Current schedule: {scheduledAt}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ScheduleDialog
                open={showSched}
                onClose={() => setShowSched(false)}
                onConfirm={schedule}
                dark={dark}
                initial={scheduledAt}
            />
        </>
    );
}
