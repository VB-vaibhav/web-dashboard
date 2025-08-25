import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Select from 'react-select';
import { components } from 'react-select';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function BulkEditClientModal({ selectedClientIds, onClose, onUpdated, dark, contextService = '' }) {
    const [formData, setFormData] = useState({});
    const [fieldsToUpdate, setFieldsToUpdate] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [middlemen, setMiddlemen] = useState([]);
    const [planOptions, setPlanOptions] = useState([]);
    const [isClosing, setIsClosing] = useState(false);
    const [services, setServices] = useState([]);
    const currencyOptions = [
        { value: 'INR', label: 'INR' },
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
    ];
    useEffect(() => {
        fetchDropdowns();
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250); // match duration with animation
    };

    useEffect(() => {
        if (!formData.service) return;
        axios.get(`/clients/plans/${formData.service}`).then(res => {
            setPlanOptions(res.data.map(p => ({ label: p.name, value: p.name })));
        });
    }, [formData.service]);

    const fetchDropdowns = async () => {
        const [middlemenRes, servicesRes, usersRes] = await Promise.all([
            axios.get('/auth/users/middlemen'),
            axios.get('/clients/services'),
            axios.get('/auth/users/all')
        ]);
        setMiddlemen(middlemenRes.data.map(m => ({ label: m, value: m })));
        setServices(servicesRes.data.map(s => ({
            label: s.name,
            value: s.id,             // numeric id
            service_key: s.service_key
        })));
        if (contextService) {
            const matchingService = servicesRes.data.find(s => s.service_key === contextService);
            if (matchingService) {
                setFormData(prev => ({ ...prev, service: matchingService.id }));
            }
        }
        setAllUsers(usersRes.data.map(u => ({ label: u.name, value: u.name })));
    };
    useEffect(() => {
        // Automatically check 'service' if contextService is set
        if (contextService) {
            setFieldsToUpdate(prev => ({ ...prev, service: true }));
        }
    }, [contextService]);

    const renderServiceSpecificFields = () => {
        // const key = formData.service;
        const key = services.find(s => s.value === formData.service)?.service_key;


        const planDropdown = (
            <div className="w-full">
                <label className="block text-sm font-medium mb-1">Plan</label>
                <Select
                    components={{
                        IndicatorSeparator: () => null,
                        DropdownIndicator: (props) => (
                            <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                        ),
                    }}
                    options={planOptions}
                    value={planOptions.find(p => p.value === formData.plan) || null}
                    onChange={(opt) => handleChange('plan', opt.value)}
                    placeholder="Select Plan"
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
                            maxHeight: '120px',
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
        );

        switch (key) {
            case 'vps':
                return <>
                    {planDropdown}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">IP Address</label>
                        <input value={formData.ip_address || ''} onChange={(e) => handleChange('ip_address', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    </div>
                </>;
            case 'cerberus':
                return <>
                    {planDropdown}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Instance Number</label>
                        <input value={formData.instance_no || ''} onChange={(e) => handleChange('instance_no', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    </div>
                </>;
            case 'proxy':
                return <>
                    {planDropdown}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Proxy Set</label>
                        <input value={formData.proxy_set || ''} onChange={(e) => handleChange('proxy_set', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Proxy Count</label>
                        <input value={formData.proxy_count || ''} onChange={(e) => handleChange('proxy_count', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    </div>
                </>;
            case 'storage':
                return <>
                    {planDropdown}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">User Address</label>
                        <input value={formData.user_address || ''} onChange={(e) => handleChange('user_address', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    </div>
                </>;
            case 'varys':
                return (
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Accounts Count</label>
                        <input value={formData.accounts_count || ''} onChange={(e) => handleChange('accounts_count', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    </div>
                );
            default:
                return null;
        }
    };

    // const handleChange = (field, value) => {
    //     setFormData(prev => ({ ...prev, [field]: value }));
    // };
    const handleChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            if (field === 'price' || field === 'amount_paid') {
                const price = parseFloat(updated.price || 0);
                const paid = parseFloat(updated.amount_paid || 0);
                const due = price - paid;
                let payment_status = 'unpaid';
                if (due === 0) payment_status = 'paid';
                else if (due < price) payment_status = 'partially paid';

                updated.amount_due = due;
                updated.payment_status = payment_status;
            }

            return updated;
        });
    };


    const toggleFieldUpdate = (field) => {
        setFieldsToUpdate(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // const handleSubmit = async () => {
    //     const updates = {};
    //     Object.keys(fieldsToUpdate).forEach(field => {
    //         if (fieldsToUpdate[field]) {
    //             updates[field] = formData[field];
    //         }
    //     });

    //     const price = parseFloat(formData.price || 0);
    //     const paid = parseFloat(formData.amount_paid || 0);
    //     const due = price - paid;
    //     let payment_status = 'unpaid';
    //     if (due === 0) payment_status = 'paid';
    //     else if (due < price) payment_status = 'partially paid';

    //     await axios.patch('/clients/bulk-update', {
    //         clientIds: selectedClientIds,
    //         amount_paid: paid,
    //         amount_due: due,
    //         payment_status,
    //         updates
    //     });

    //     onUpdated();
    // };

    const handleSubmit = async () => {
        const updates = {};
        Object.keys(fieldsToUpdate).forEach(field => {
            if (fieldsToUpdate[field]) {
                updates[field] = formData[field];
            }
        });

        // ✅ Check if any form field is filled but its checkbox is not selected
        const filledFields = Object.keys(formData).filter(key => formData[key] !== '' && formData[key] !== null && formData[key] !== undefined);
        // const missingCheckbox = filledFields.find(field => formData[field] && !fieldsToUpdate[field]);
        const missingCheckbox = filledFields.find(field => {
            if (field === 'service' && contextService) return false; // allow hidden + auto-checked
            return formData[field] && !fieldsToUpdate[field];
        });

        if (missingCheckbox) {
            alert("Please select checkbox for the fields you have filled.");
            return;
        }

        if (Object.keys(updates).length === 0) {
            alert("No fields selected for update.");
            return;
        }

        // Add amount_due and payment_status if price or amount_paid is selected for update
        if (fieldsToUpdate.price || fieldsToUpdate.amount_paid) {
            updates.amount_due = formData.amount_due;
            updates.payment_status = formData.payment_status;
        }

        await axios.patch('/clients/bulk-update', {
            clientIds: selectedClientIds,
            updates
        });

        onUpdated();
        handleClose();
    };


    let editableFields = ['middleman_name', 'service', 'plan', 'ip_address', 'instance_no', 'proxy_set', 'proxy_count',
        'accounts_count', 'user_address', 'currency', 'price', 'middleman_share', 'amount_paid', 'start_date', 'expiry_date', 'paid_to', 'notes'];

    // ✅ Exclude irrelevant fields based on contextService
    if (contextService === 'vps') {
        editableFields = editableFields.filter(field =>
            !['service', 'instance_no', 'proxy_set', 'proxy_count', 'accounts_count', 'user_address'].includes(field)
        );
    }
    else if (contextService === 'proxy') {
        editableFields = editableFields.filter(field =>
            !['service', 'instance_no', 'ip_address', 'accounts_count', 'user_address'].includes(field)
        );
    }
    else if (contextService === 'cerberus') {
        editableFields = editableFields.filter(field =>
            !['service', 'proxy_set', 'proxy_count', 'ip_address', 'accounts_count', 'user_address'].includes(field)
        );
    }
    else if (contextService === 'storage') {
        editableFields = editableFields.filter(field =>
            !['service', 'instance_no', 'ip_address', 'proxy_set', 'proxy_count', 'accounts_count'].includes(field)
        );
    }
    else if (contextService === 'varys') {
        editableFields = editableFields.filter(field =>
            !['plan', 'service', 'instance_no', 'ip_address', 'proxy_set', 'proxy_count', 'user_address'].includes(field)
        );
    }

    const fieldLabels = {
        middleman_name: "Middleman Name",
        service: "Service",
        plan: "Plan",
        ip_address: "IP Address",
        instance_no: "Instance Number",
        proxy_set: "Proxy Set",
        proxy_count: "Proxy Count",
        accounts_count: "Accounts Count",
        user_address: "User Address",
        currency: "Currency",
        price: "Price",
        middleman_share: "Middleman Share",
        amount_paid: "Amount Paid",
        start_date: "Start Date",
        expiry_date: "Expiry Date",
        paid_to: "Paid To",
        notes: "Notes"
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} ${isClosing ? "animate-fade-out-modal" : "animate-fade-in-modal"} rounded-lg p-6 w-full max-w-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Bulk Edit Clients</h2>
                    <button onClick={handleClose}>
                        <XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 min-h-[calc(100vh-22em)]">
                    <div className="col-span-2 pl-2 space-y-2 max-h-[calc(100vh-23em)]">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Middleman Name</label>
                                <Select
                                    components={{
                                        IndicatorSeparator: () => null,
                                        DropdownIndicator: (props) => (
                                            <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                        ),
                                    }}
                                    options={middlemen}
                                    // value={middlemen.find(m => m.value.trim().toLowerCase() === (formData.middleman_name || '').trim().toLowerCase()) || null}
                                    onChange={opt => handleChange('middleman_name', opt.value)}
                                    // onChange={e => handleChange('middleman_name', e.target.value)}
                                    className="text-md"
                                    placeholder="MM's Name"
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
                                            maxHeight: '120px',
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
                            {!contextService && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Service</label>
                                    {/* <input placeholder="Service" onChange={e => handleChange('service', e.target.value)} /> */}
                                    <Select
                                        components={{
                                            IndicatorSeparator: () => null,
                                            DropdownIndicator: (props) => (
                                                <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                            )
                                        }}
                                        options={services}
                                        value={services.find(s => s.value === formData.service)}
                                        onChange={opt => handleChange('service', opt.value)}
                                        placeholder="Service"
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
                                                maxHeight: 'none',
                                                overflowY: 'visible',
                                            }),
                                            menuList: (provided) => ({
                                                ...provided,
                                                maxHeight: '120px',
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
                            )}
                            {renderServiceSpecificFields()}
                            {/* <input placeholder="Plan" onChange={e => handleChange('plan', e.target.value)} /> */}
                            {/* <input placeholder="Price" type="number" onChange={e => handleChange('price', e.target.value)} /> */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Price</label>
                                <div className="flex">
                                    <Select
                                        components={{
                                            IndicatorSeparator: () => null,
                                            DropdownIndicator: (props) => (
                                                <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                            )
                                        }}
                                        options={currencyOptions}
                                        value={currencyOptions.find(option => option.value === formData.currency)}
                                        onChange={(selectedOption) => handleChange('currency', selectedOption.value)}
                                        className="text-md"
                                        placeholder="INR"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                boxShadow: 'none',
                                                backgroundColor: dark ? '#1F2937' : '#ffffff',
                                                color: dark ? '#99C2FF' : '#1F2937',
                                                borderColor: '#E5E7EB',
                                                width: '85px',
                                                maxWidth: '85px',
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
                                                maxHeight: '100px',
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
                                    <input
                                        value={formData.price || ''}
                                        onChange={e => handleChange('price', e.target.value)}
                                        placeholder="Price"
                                        type="number"
                                        className="w-full px-3 py-2 border-l-0 border border-slate-200 rounded-md text-sm"
                                    />
                                </div>
                            </div>
                            {/* <input placeholder="Middleman Share" onChange={e => handleChange('middleman_share', e.target.value)} /> */}
                            <div className="w-full">
                                <label className="block text-sm font-medium mb-1">Middleman Share</label>
                                <input
                                    type="text"
                                    value={formData.middleman_share || ''}
                                    onChange={(e) => handleChange('middleman_share', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                    placeholder="Enter Middleman's share"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium mb-1">Amount Paid</label>
                                <input
                                    type="number"
                                    value={formData.amount_paid || ''}
                                    onChange={(e) => handleChange('amount_paid', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                    placeholder='Enter amount paid'
                                />
                            </div>
                            {/* <input placeholder="Start Date" onChange={e => handleChange('start_date', e.target.value)} />
                            <input placeholder="Expiry Date" onChange={e => handleChange('expiry_date', e.target.value)} /> */}
                            <div className="w-full">
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <DatePicker
                                    selected={formData.start_date}
                                    onChange={date => handleChange('start_date', date)}
                                    placeholderText="Start Date"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                                <DatePicker
                                    selected={formData.expiry_date}
                                    onChange={date => handleChange('expiry_date', date)}
                                    placeholderText="Expiry Date"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                />
                            </div>
                            {/* <input placeholder="Paid To" onChange={e => handleChange('paid_to', e.target.value)} />
                            <input placeholder="Notes" onChange={e => handleChange('notes', e.target.value)} /> */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Paid to whom</label>
                                <Select
                                    components={{
                                        IndicatorSeparator: () => null,
                                        DropdownIndicator: (props) => (
                                            <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                        )
                                    }}
                                    options={allUsers}
                                    // value={allUsers.find(u => u.value.trim().toLowerCase() === (formData.paid_to || '').trim().toLowerCase()) || null}
                                    onChange={(option) => handleChange('paid_to', option.value)}
                                    className="text-md"
                                    placeholder="Paid to whom"
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
                                            maxHeight: '120px',
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
                            <div className="w-full">
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <input
                                    // value={formData.notes || ''}
                                    onChange={e => handleChange('notes', e.target.value)}
                                    placeholder="Notes"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-l border-gray-300 pl-2 overflow-y-auto max-h-[calc(100vh-23em)]">
                        {editableFields.map(field => (
                            <div key={field} className="flex items-center mb-2">
                                <input type="checkbox" checked={fieldsToUpdate[field] || false} onChange={() => toggleFieldUpdate(field)} className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'} mr-2`}
                                />
                                <span className="text-sm">{fieldLabels[field] || field}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center mt-4">
                    <button onClick={handleSubmit} className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}>Update</button>
                </div>
            </div>
        </div>
    );
}
