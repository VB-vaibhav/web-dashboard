// components/AddClientModal.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { components } from 'react-select';
import axios from '../api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { NoSymbolIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Plus } from "lucide-react";

export default function AddClientModal({ onClose, onClientAdded, dark, contextService = '' }) {
    // State for form fields
    const [clientOptions, setClientOptions] = useState([]);
    const [middlemanOptions, setMiddlemanOptions] = useState([]);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [planOptions, setPlanOptions] = useState([]);
    const [isClosing, setIsClosing] = useState(false);
    const [showAddPlanField, setShowAddPlanField] = useState(false);
    const currencyOptions = [
        { value: 'INR', label: 'INR' },
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
    ];

    const [formData, setFormData] = useState({
        logical_client_id: null,
        client_name: '',
        email_or_phone: '',
        middleman_name: '',
        service: '',
        plan: '',
        ip_address: '',
        instance_no: '',
        proxy_set: '',
        proxy_count: '',
        user_address: '',
        accounts_count: '',
        price: '',
        currency: 'INR',
        middleman_share: '',
        start_date: new Date(),
        expiry_date: new Date(),
        paid_to: '',
        notes: ''
    });
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


    const [allUsers, setAllUsers] = useState([]);
    const [showAddClientField, setShowAddClientField] = useState(false);
    const [showAddMiddlemanField, setShowAddMiddlemanField] = useState(false);
    const [isExistingClient, setIsExistingClient] = useState(false);
    const [errors, setErrors] = useState({});

    // 👇 Fetch dropdown data
    useEffect(() => {
        const fetchInitialData = async () => {
            const [clientsRes, middlemanRes, servicesRes, usersRes] = await Promise.all([
                axios.get('/clients/names'),
                axios.get('/auth/users/middlemen'),
                axios.get('/clients/services'),
                axios.get('/auth/users/all')
            ]);
            // setClientOptions([
            //     ...new Set(clientsRes.data.map(r => ({ label: r.client_name, value: r.client_name, logical_id: r.logical_client_id })))
            // ]);
            setClientOptions([
                ...clientsRes.data.map(c => ({
                    label: `${c.client_name} (${c.email_or_phone || 'no contact'})`,
                    value: c.logical_client_id, // 🚨 Use logical_client_id as value
                    original_name: c.client_name,
                    email_or_phone: c.email_or_phone
                })),
            ]);
            setMiddlemanOptions([
                ...new Set(middlemanRes.data.map(n => ({ label: n, value: n })))
            ]);
            setServiceOptions(servicesRes.data.map(s => ({
                label: s.name,
                value: s.id,
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

        fetchInitialData();
    }, []);

    // 👇 Fetch plans when service changes
    useEffect(() => {
        if (!formData.service) return;
        axios.get(`/clients/plans/${formData.service}`).then(res => {
            setPlanOptions(res.data.map(p => ({ label: p.name, value: p.name })));
        });
    }, [formData.service]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // clear error if corrected
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    // const handleSubmit = async () => {
    //     try {
    //         const newErrors = {};
    //         requiredFields.forEach((field) => {
    //             if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
    //                 newErrors[field] = 'Required';
    //             }
    //         });

    //         setErrors(newErrors);
    //         if (Object.keys(newErrors).length > 0) return;

    //         await axios.post('/clients', {
    //             ...formData,
    //             start_date: formData.start_date.toISOString().split('T')[0],
    //             expiry_date: formData.expiry_date.toISOString().split('T')[0]
    //         });
    //         onClientAdded(); // trigger table reload
    //         onClose(); // close modal
    //     } catch (err) {
    //         alert('Failed to add client.');
    //         console.error(err);
    //     }
    // };

    const handleSubmit = async () => {
        try {
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
                start_date: formData.start_date.toISOString().split('T')[0],
                expiry_date: formData.expiry_date.toISOString().split('T')[0],
            };

            await axios.post('/clients', payload);
            onClientAdded();
            handleClose();
        } catch (err) {
            alert('Failed to add client/service.');
            console.error(err);
        }
    };

    const CustomOption = (props) => {
        const { data, innerRef, innerProps } = props;

        const isClient = data.label === 'Add new client';
        const isMiddleman = data.label === 'Add temporary MM name';
        const isPlan = data.label === 'Add new plan'

        if (isClient || isMiddleman || isPlan) {
            return (
                <div
                    ref={innerRef}
                    {...innerProps}
                    className={`flex items-center sticky bottom-0 gap-1 px-2 py-2 text-md font-md mb-1 rounded-md  ${dark ? 'hover:bg-gray-700 bg-gray-800 text-blue-300' : 'text-indigo-900 hover:bg-indigo-100 bg-white'
                        } cursor-pointer`}
                >
                    <Plus size={16} className={dark ? 'text-blue-300' : 'text-indigo-900'} />
                    <span className="text-md">{data.label}</span>
                </div>
            );
        }

        return <components.Option {...props} />;
    };

    const renderServiceSpecificFields = () => {
        const selectedServiceKey = serviceOptions.find(s => s.value === formData.service)?.service_key;
        const PlanDropdown = (
            <div>
                <label className="block text-sm font-medium mb-1">Plan*</label>
                <Select
                    components={{
                        IndicatorSeparator: () => null,
                        DropdownIndicator: (props) => (
                            <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                        ),
                        Option: CustomOption
                    }}
                    options={[...planOptions, { label: 'Add new plan', value: 'add_new' }]}
                    onChange={(option) => {
                        if (option.value === 'add_new') {
                            setShowAddPlanField(true);
                            handleChange('plan', '');
                        } else {
                            handleChange('plan', option.value);
                            setShowAddPlanField(false);
                        }
                    }}
                    value={planOptions.find(opt => opt.value === formData.plan)}
                    className="text-md"
                    placeholder="Select plan"
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
                {showAddPlanField && (
                    <input
                        type="text"
                        placeholder="Enter new plan name"
                        value={formData.plan}
                        onChange={(e) => handleChange('plan', e.target.value)}
                        onBlur={async () => {
                            if (formData.plan && formData.service) {
                                try {
                                    await axios.post('/clients/plans', {
                                        name: formData.plan,
                                        service_id: formData.service
                                    });
                                    // Refetch updated plan list
                                    const res = await axios.get(`/clients/plans/${formData.service}`);
                                    setPlanOptions(res.data.map(p => ({ label: p.name, value: p.name })));
                                } catch (err) {
                                    console.error('Error adding plan:', err);
                                    alert('Failed to add plan');
                                }
                            }
                        }}
                        className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-md text-sm"
                    />
                )}
                {errors.plan && <p className="text-red-500 text-xs mt-1">{errors.plan}</p>}
            </div>
        );
        switch (selectedServiceKey) {
            case 'vps':
                return <>
                    {PlanDropdown}
                    {/* <Field label="IP Address" name="ip_address" /> */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">IP Address</label>
                        <input
                            type="text"
                            value={formData.ip_address || ''}
                            onChange={(e) => handleChange('ip_address', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                            placeholder='Enter IP Address'
                        />
                    </div>
                </>;
            case 'cerberus':
                return <>
                    {PlanDropdown}
                    {/* <Field label="Instance Number" name="instance_no" /> */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Instance Number</label>
                        <input
                            type="text"
                            value={formData.instance_no || ''}
                            onChange={(e) => handleChange('instance_no', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                            placeholder='Enter Instance Number'
                        />
                    </div>
                </>;
            case 'proxy':
                return <>

                    {PlanDropdown}
                    {/* <Field label="Proxy Set" name="proxy_set" /> */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="w-full">
                            <label className="block text-sm font-medium mb-1">Proxy Set</label>
                            <input
                                type="text"
                                value={formData.proxy_set || ''}
                                onChange={(e) => handleChange('proxy_set', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                placeholder='Enter Proxy Set'
                            />
                        </div>
                        {/* <Field label="Proxy Count" name="proxy_count" /> */}
                        <div className="w-full">
                            <label className="block text-sm font-medium mb-1">Proxy Count</label>
                            <input
                                type="text"
                                value={formData.proxy_count || ''}
                                onChange={(e) => handleChange('proxy_count', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                placeholder='Enter Proxy Count'
                            />
                        </div>
                    </div>
                </>;
            case 'storage':
                return <>
                    {PlanDropdown}
                    {/* <Field label="User Address" name="user_address" /> */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">User Address</label>
                        <input
                            type="text"
                            value={formData.user_address || ''}
                            onChange={(e) => handleChange('user_address', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                            placeholder='Enter User Address'
                        />
                    </div>
                </>;
            case 'varys':
                return <>
                    {/* <Field label="Account Count" name="accounts_count" />; */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Account Count</label>
                        <input
                            type="text"
                            value={formData.accounts_count || ''}
                            onChange={(e) => handleChange('accounts_count', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                            placeholder='Enter Account Count'
                        />
                    </div>
                </>;
            default:
                return null;
        }
    };

    // const Field = ({ label, name }) => (
    //     <div className="w-full">
    //         <label className="block text-sm font-medium mb-1">{label}</label>
    //         <input
    //             type="text"
    //             value={formData[name] || ''}
    //             onChange={(e) => handleChange(name, e.target.value)}
    //             className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
    //         />
    //     </div>
    // );

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250); // match duration with animation
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
            <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} ${isClosing ? "animate-fade-out-modal" : "animate-fade-in-modal"}  rounded-lg p-6 w-full max-w-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Add New Client/Services</h2>
                    <button onClick={handleClose} >
                        <XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                    </button>
                </div>


                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Client Name*</label>
                        <Select
                            components={{
                                IndicatorSeparator: () => null,
                                DropdownIndicator: (props) => (
                                    <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                ),
                                Option: CustomOption
                            }}
                            options={[...clientOptions, { label: 'Add new client', value: 'add_new' }]}
                            onChange={(option) => {
                                if (option.value === 'add_new') {
                                    setShowAddClientField(true);
                                    // handleChange('client_name', '');
                                    setFormData(prev => ({
                                        ...prev,
                                        client_name: '',
                                        email_or_phone: '',
                                        logical_client_id: null
                                    }));
                                    setIsExistingClient(false);
                                } else {
                                    // handleChange('client_name', option.value);
                                    setShowAddClientField(false);
                                    setFormData(prev => ({
                                        ...prev,
                                        client_name: option.original_name,
                                        email_or_phone: option.email_or_phone,
                                        logical_client_id: option.value
                                    }));
                                    setIsExistingClient(true);
                                }
                            }}
                            placeholder="Client Name"
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
                        {showAddClientField && (
                            <input
                                type="text"
                                placeholder="Enter new client name"
                                value={formData.client_name}
                                onChange={(e) => handleChange('client_name', e.target.value)}
                                className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-md text-sm"
                            />
                        )}
                        {errors.client_name && <p className="text-red-500 text-xs mt-1">{errors.client_name}</p>}
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Client Email / Number*</label>
                        <input
                            type="text"
                            value={formData.email_or_phone || ''}
                            onChange={(e) => handleChange('email_or_phone', e.target.value)}
                            className={`w-full px-3 py-2 border border-slate-200 rounded-md text-sm ${isExistingClient ? 'bg-gray-100 text-gray-500' : ''}`}
                            placeholder='Enter email or number'
                            disabled={isExistingClient}
                        />
                        {errors.email_or_phone && <p className="text-red-500 text-xs mt-1">{errors.email_or_phone}</p>}
                    </div>
                    {/* <Field label="Client Email / Number*" name="email_or_phone" /> */}

                    <div>
                        <label className="block text-sm font-medium mb-1">Middleman Name*</label>
                        <Select
                            components={{
                                IndicatorSeparator: () => null,
                                DropdownIndicator: (props) => (
                                    <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                ),
                                Option: CustomOption
                            }}
                            options={[...middlemanOptions, { label: 'Add temporary MM name', value: 'add_new' }]}
                            onChange={(option) => {
                                if (option.value === 'add_new') {
                                    setShowAddMiddlemanField(true);
                                    handleChange('middleman_name', '');
                                } else {
                                    handleChange('middleman_name', option.value);
                                    setShowAddMiddlemanField(false);
                                }
                            }}
                            className="text-md"
                            placeholder="Select Middleman"
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
                        {showAddMiddlemanField && (
                            <input
                                type="text"
                                placeholder="Enter new middleman name"
                                value={formData.middleman_name}
                                onChange={(e) => handleChange('middleman_name', e.target.value)}
                                className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-md text-sm"
                            />
                        )}
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
                                isDisabled={serviceOptions.length === 0}
                                options={serviceOptions}
                                onChange={(option) => handleChange('service', option.value)}
                                className="text-md"
                                placeholder={serviceOptions.length === 0 ? "No services available" : "Select Service"}
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
                            {/* <select
                                value={formData.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className=" px-3 py-2 border border-slate-200 rounded-md text-sm"
                            >
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select> */}
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
                                type="number"
                                className="w-11/16 px-3 py-2 border-l-0 border border-slate-200 rounded-md text-sm"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                placeholder='Enter price'
                            />
                        </div>
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
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
                    {/* <Field label="Middleman Share" name="middleman_share" /> */}

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
                            selected={formData.start_date}
                            onChange={(date) => handleChange('start_date', date)}
                            dateFormat="dd-MM-yyyy"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        />
                        {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-medium mb-1">Expiry Date*</label>
                        <DatePicker
                            selected={formData.expiry_date}
                            onChange={(date) => handleChange('expiry_date', date)}
                            dateFormat="dd-MM-yyyy"
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
                                    maxHeight: '140px',
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
                            type="text"
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                            placeholder='Enter notes'
                        />
                    </div>

                    {/* <Field label="Notes" className="block text-sm font-medium mb-1" name="notes" /> */}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleSubmit}
                        className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}
                    >
                        Add Client/Services
                    </button>
                </div>
            </div>
        </div>
    );
}
