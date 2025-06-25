// src/pages/MobileExcludeClientsUI.jsx
import React, { useState } from 'react';
import { MoreVertical, MinusCircle, PlusCircle } from 'lucide-react';
import Select, { components } from 'react-select';

export default function MobileExcludeClientsUI({
    clients,
    admins,
    selected,
    setSelected,
    dark,
    showModal,
    handleBulkExclusionAction,
    actionType,
    showActionModal,
    setShowActionModal,
    selectedAdminForAction,
    setSelectedAdminForAction,
    handleConfirmBulkAction,
    handleExclusionAction
}) {
    const [selectedAdminMap, setSelectedAdminMap] = useState({});
    const isAllSelected = selected.length === clients.length;
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleSelectAll = () => {
        setSelected(isAllSelected ? [] : clients.map(c => c.client_id));
    };

    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const adminOptions = admins.map((a) => ({
        label: a.name,
        value: a.id,
    }));

    return (
        <div className={`overflow-y-scroll no-scrollbar px-0.25 h-[calc(100vh-100px)] ${dark ? ' text-slate-400' : ' text-gray-900'}`}>
            {/* Top controls */}
            <div className="absolute right-3 top-6 flex items-center gap-2 z-10">
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                />
                <button onClick={() => setShowDropdown(prev => !prev)} className="p-0">
                    <MoreVertical size={18} className="text-gray-400" />
                </button>
                {showDropdown && (
                    <div className={`absolute right-0 mt-27 w-28 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                handleBulkExclusionAction('include');
                            }}
                            className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                            <PlusCircle size={16} />
                            Include
                        </button>
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                handleBulkExclusionAction('exclude');
                            }}
                            className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                            <MinusCircle size={16} />
                            Exclude
                        </button>
                    </div>
                )}
            </div>

            {/* Client cards */}
            {clients.map(client => (
                <div key={client.client_id} className={`border-b rounded-md mb-6 pb-6 ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                    <div className={`space-y-3 text-sm `}>
                        <div className="flex justify-between items-center">
                            <div className={`font-medium text-bold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{client.client_name}</div>
                            <input
                                type="checkbox"
                                checked={selected.includes(client.client_id)}
                                onChange={() => toggleSelect(client.client_id)}
                                className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Service</div>
                            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{client.service}</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Expiry</div>
                            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{client.expiry_date?.slice(0, 10)}</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Currently Excluded</div>
                            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{client.excluded_admins || 'None'}</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Currently Excluded</div>
                            <Select
                                components={{
                                    IndicatorSeparator: () => null,
                                    DropdownIndicator: (props) => (
                                        <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                    )
                                }}
                                placeholder="Select Admin"
                                options={adminOptions}
                                // onChange={(opt) =>
                                //     handleExclusionAction(client.client_id, opt.value)
                                // }
                                value={adminOptions.find(opt => opt.value === selectedAdminMap[client.client_id]) || null}
                                onChange={(opt) => {
                                    setSelectedAdminMap(prev => ({ ...prev, [client.client_id]: opt.value }));
                                }}
                                className="text-sm"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: dark ? '#1F2937' : '#ffffff',
                                        color: dark ? '#BAC4D1' : '#2B3674',
                                        borderColor: dark ? '#4B5563' : '#D1D5DB',
                                        minHeight: '31px',
                                        height: '31px',
                                        fontSize: '0.85rem',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        zIndex: 99,
                                        backgroundColor: dark ? '#1F2937' : '#ffffff'
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: dark ? '#BAC4D1' : '#2B3674',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        width: '100%',
                                    }),
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-medium text-slate-400">Action</div>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => {
                                        const adminId = selectedAdminMap[client.client_id];
                                        if (!adminId) {
                                            showModal("Please select an admin first.");
                                            return;
                                        }
                                        handleExclusionAction(client.client_id, "exclude", adminId);
                                    }}
                                    className={`${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'} text-sm py-1 px-4 rounded`}>
                                    Exclude
                                </button>
                                <button
                                    onClick={() => {
                                        const adminId = selectedAdminMap[client.client_id];
                                        if (!adminId) {
                                            showModal("Please select an admin first.");
                                            return;
                                        }
                                        handleExclusionAction(client.client_id, "include", adminId);
                                    }}
                                    className={`text-sm px-4 py-1 border rounded ${dark ? 'border-gray-700 text-slate-300' : 'border-indigo-600 text-indigo-600'}`}>
                                    Include
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Bulk Action Modal */}
            {showActionModal && (
                <div className="fixed inset-0 flex justify-center items-center z-50">
                    <div className={`rounded-md p-5 w-[320px] ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg border ${dark ? 'border-gray-700' : 'border-gray-300'}`}>
                        <h2 className="text-lg font-semibold mb-3 capitalize">{actionType} selected clients</h2>
                        <Select
                            options={adminOptions}
                            isMulti
                            value={adminOptions.filter(opt => selectedAdminForAction.includes(opt.value))}
                            onChange={(opts) => setSelectedAdminForAction(opts.map(o => o.value))}
                            className="mb-4 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowActionModal(false)} className={`px-4 py-1.5 rounded text-sm border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'}`}>
                                Cancel
                            </button>
                            <button onClick={handleConfirmBulkAction} className={`px-4 py-1.5 rounded text-sm ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
