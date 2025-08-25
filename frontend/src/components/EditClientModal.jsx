import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { components } from 'react-select';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function EditClientModal({ clientId, onClose, onClientUpdated, dark, contextService = '' }) {
    const [formData, setFormData] = useState({});
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
    const [errors, setErrors] = useState({});
    const requiredFields = [
        'client_name',
        'email_or_phone',
        'middleman_name',
        'service',
        'plan',
        'price',
        'currency',
        'start_date',
        'expiry_date',
    ];
    // useEffect(() => {
    //     console.log("🔁 FormData loaded:", formData);
    //     console.log("📥 Plan options:", planOptions);
    //     console.log("🧑 Middlemen:", middlemen);
    //     console.log("👥 All Users:", allUsers);
    // }, [formData, planOptions, middlemen, allUsers]);

    useEffect(() => {
        const init = async () => {
            await fetchDropdowns();   // load middlemen, services, allUsers
            await fetchClient();      // now fetch client data
        };
        init();
    }, []);

    const fetchClient = async () => {
        const res = await axios.get(`/clients/${clientId}`);
        setFormData(res.data);

        // fetch plans
        fetchPlans(res.data.service);
    };

    const fetchPlans = () => {
        const selectedService = services.find(s => s.value === formData.service);
        if (selectedService) {
            axios.get(`/clients/plans/${selectedService.id}`).then(res => {
                setPlanOptions(res.data.map(p => ({ label: p.name, value: p.name })));
            });
        }
    }
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250); // match duration with animation
    };

    useEffect(() => {
        if (formData.service && services.length) {
            fetchPlans(formData.service);
        }
    }, [formData.service, services]);


    const fetchDropdowns = async () => {
        const [middlemenRes, servicesRes, usersRes] = await Promise.all([
            axios.get('/auth/users/middlemen'),
            axios.get('/clients/services'),
            axios.get('/auth/users/all')
        ]);
        setMiddlemen(middlemenRes.data.map(m => ({ label: m, value: m })));
        setServices(servicesRes.data.map(s => ({ label: s.name, value: s.service_key, id: s.id, })));
        if (contextService) {
            const matchingService = servicesRes.data.find(s => s.service_key === contextService);
            if (matchingService) {
                setFormData(prev => ({ ...prev, service: matchingService.id }));
            }
        }
        setAllUsers(usersRes.data.map(u => ({ label: u.name, value: u.name })));
    };

    const renderServiceSpecificFields = () => {
        const key = formData.service;

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
                {errors.plan && <p className="text-red-500 text-xs mt-1">{errors.plan}</p>}
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

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // clear error if corrected
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const handleSubmit = async () => {
        const newErrors = {};
        requiredFields.forEach((field) => {
            if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
                newErrors[field] = 'Required';
            }
        });
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const price = parseFloat(formData.price || 0);
        const paid = parseFloat(formData.amount_paid || 0);
        const due = price - paid;
        let payment_status = 'unpaid';
        if (due === 0) payment_status = 'paid';
        else if (due < price) payment_status = 'partially paid';

        const payload = {
            ...formData,
            amount_paid: paid,
            amount_due: due,
            payment_status,

        };

        await axios.put(`/clients/${clientId}`, payload);
        onClientUpdated();
        handleClose();
    };

    // const handleSubmit = async () => {
    //         try {
    //             const newErrors = {};
    //             requiredFields.forEach((field) => {
    //                 if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
    //                     newErrors[field] = 'Required';
    //                 }
    //             });
    //             setErrors(newErrors);
    //             if (Object.keys(newErrors).length > 0) return;

    //             const price = parseFloat(formData.price || 0);
    //             const paid = parseFloat(formData.amount_paid || 0);
    //             const due = price - paid;
    //             let payment_status = 'unpaid';
    //             if (due === 0) payment_status = 'paid';
    //             else if (due < price) payment_status = 'partially paid';

    //             const payload = {
    //                 ...formData,
    //                 amount_paid: paid,
    //                 amount_due: due,
    //                 payment_status,

    //             };

    //             await axios.put('/clients/${clientId}', payload);
    //             onClientUpdated();
    //             onClose();
    //         } catch (err) {
    //             alert('Failed to edit client.');
    //             console.error(err);
    //         }
    //     };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} ${isClosing ? "animate-fade-out-modal" : "animate-fade-in-modal"}  rounded-lg p-6 w-full max-w-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                <div className="flex justify-between mb-4 items-center">
                    <h2 className="text-lg font-semibold">Edit Client</h2>
                    <button onClick={handleClose}>
                        <XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Client Name*</label>
                        <input
                            value={formData.client_name || ''}
                            onChange={e => handleChange('client_name', e.target.value)}
                            placeholder="Client Name"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        />
                        {errors.client_name && <p className="text-red-500 text-xs mt-1">{errors.client_name}</p>}
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Client Email / Number*</label>
                        <input
                            value={formData.email_or_phone || ''}
                            onChange={e => handleChange('email_or_phone', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                            placeholder="Client Email / Number"
                        />
                        {errors.email_or_phone && <p className="text-red-500 text-xs mt-1">{errors.email_or_phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Middleman Name*</label>
                        <Select
                            components={{
                                IndicatorSeparator: () => null,
                                DropdownIndicator: (props) => (
                                    <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                ),
                            }}
                            options={middlemen}
                            value={middlemen.find(m => m.value.trim().toLowerCase() === (formData.middleman_name || '').trim().toLowerCase()) || null}
                            onChange={opt => handleChange('middleman_name', opt.value)}
                            className="text-md"
                            placeholder="Middleman Name"
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
                        {errors.middleman_name && <p className="text-red-500 text-xs mt-1">{errors.middleman_name}</p>}
                    </div>
                    {!contextService && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Service*</label>
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
                            {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
                        </div>
                    )}
                    {renderServiceSpecificFields()}
                    <div>
                        <label className="block text-sm font-medium mb-1">Price*</label>
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
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                    </div>
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
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Start Date*</label>
                        <DatePicker
                            selected={formData.start_date ? new Date(formData.start_date) : null}
                            onChange={date => handleChange('start_date', date)}
                            placeholderText="Start Date"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        />
                        {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Expiry Date*</label>
                        <DatePicker
                            selected={formData.expiry_date ? new Date(formData.expiry_date) : null}
                            onChange={date => handleChange('expiry_date', date)}
                            placeholderText="Expiry Date"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        />
                        {errors.expiry_date && <p className="text-red-500 text-xs mt-1">{errors.expiry_date}</p>}
                    </div>
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
                            value={allUsers.find(u => u.value.trim().toLowerCase() === (formData.paid_to || '').trim().toLowerCase()) || null}
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
                            value={formData.notes || ''}
                            onChange={e => handleChange('notes', e.target.value)}
                            placeholder="Notes"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        />
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleSubmit}
                        className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}>
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}
