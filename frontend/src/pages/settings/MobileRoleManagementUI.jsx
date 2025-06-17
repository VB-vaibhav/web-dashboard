import React, { useState } from 'react';
import { MoreVertical, Users } from 'lucide-react';
import Select from 'react-select';
import axios from '../../api/axios';

export default function MobileRoleManagementUI({ users = [], selected, setSelected, editedRoles, setEditedRoles, handleRoleSave, dark, showModal, fetchUsers, bulkRoleValue, setBulkRoleValue }) {
    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const [showBulkRoleDropdown, setShowBulkRoleDropdown] = useState(false);
    const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
    // const [bulkRoleValue, setBulkRoleValue] = useState('admin');
    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'middleman', label: 'Middleman' }
    ];
    const toggleSelectAll = () => {
        if (selected.length === users.length) {
            setSelected([]);
        } else {
            setSelected(users.map(u => u.id));
        }
    };

    const isAllSelected = selected.length === users.length && users.length > 0;


    return (
        <div className={`overflow-y-scroll no-scrollbar h-[calc(100vh-100px)]  ${dark ? ' text-slate-400' : ' text-gray-900'}`}>
            {/* Top right: checkbox and 3-dot */}
            <div className="absolute top-6 right-3 flex gap-2 items-center">
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                />
                <button
                    onClick={() => setShowBulkRoleDropdown(prev => !prev)}
                    className={`p-1.5 `}
                >
                    <MoreVertical size={18} className="cursor-pointer text-gray-400" />
                </button>
                {showBulkRoleDropdown && (
                    <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
                        <button
                            onClick={() => {
                                setShowBulkRoleDropdown(false);
                                setShowBulkRoleModal(true);
                            }}
                            className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                            <Users size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                            <span>Manage Role</span>
                        </button>
                    </div>
                )}
            </div>
            {users.map(user => (
                <div
                    key={user.id}
                    className={`border-b rounded-md mb-6 pb-6 shadow-sm ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}
                >




                    {/* Data rows */}
                    <div className={`space-y-3 text-sm `}>
                        <div className="flex justify-between items-center">
                            <div className={`font-medium text-bold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>
                                {user.name}
                            </div>
                            <input
                                type="checkbox"
                                checked={selected.includes(user.id)}
                                onChange={() => toggleSelect(user.id)}
                                className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Username</div>
                            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{user.username}</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Email</div>
                            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{user.email}</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Current Role</div>
                            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{user.role}</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className={`font-medium text-slate-400`}>Change Role</div>
                            <select
                                value={editedRoles[user.id] || user.role}
                                onChange={(e) => setEditedRoles(prev => ({ ...prev, [user.id]: e.target.value }))}
                                className={`border rounded px-2 py-1 text-sm ${dark ? 'bg-gray-700 text-slate-300 border-gray-600' : 'bg-white text-blue-900 border-gray-300'}`}
                            >
                                {['admin', 'middleman'].map(role => (
                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        {/* Action Heading Row */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-medium text-slate-400">Action</div>
                            <button
                                onClick={() => handleRoleSave(user.id)}
                                className={`${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'} text-white text-sm py-1 px-4 rounded`}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {showBulkRoleModal && (
                <div className="fixed inset-0 flex justify-center items-center z-50">
                    <div className={`rounded-md p-5 w-[320px] ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg border ${dark ? 'border-gray-700' : 'border-gray-300'}`}>
                        <h2 className="text-lg font-semibold mb-3">Manage Role</h2>
                        <Select
                            options={roleOptions}
                            value={roleOptions.find(opt => opt.value === bulkRoleValue)}
                            onChange={(opt) => setBulkRoleValue(opt.value)}
                            className="mb-4 text-sm"
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: dark ? '#1F2937' : '#ffffff',
                                    color: dark ? '#E5E7EB' : '#1F2937',
                                    borderColor: dark ? '#4B5563' : '#D1D5DB',
                                    boxShadow: state.isFocused ? (dark ? '0 0 0 1px #9CA3AF' : '0 0 0 1px #6366F1') : 'none',
                                    '&:hover': {
                                        borderColor: dark ? '#6B7280' : '#6366F1'
                                    },
                                    minHeight: '32px',
                                    height: '32px'
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: dark ? '#E5E7EB' : '#1F2937'
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: dark ? '#1F2937' : '#fff',
                                    color: dark ? '#E5E7EB' : '#1F2937',
                                    zIndex: 99
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused
                                        ? (dark ? '#374151' : '#E0E7FF')
                                        : state.isFocused
                                            ? (dark ? '#1F2937' : '#E0E7FF')
                                            : (dark ? '#111827' : '#ffffff'),
                                    color: dark ? '#F3F4F6' : '#111827',
                                    cursor: 'pointer'
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: dark ? '#9CA3AF' : '#6B7280'
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,
                                    color: dark ? '#9CA3AF' : '#6B7280',
                                    '&:hover': {
                                        color: dark ? '#D1D5DB' : '#4F46E5'
                                    }
                                }),
                                indicatorSeparator: () => ({ display: 'none' })
                            }}
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowBulkRoleModal(false)}
                                className={`px-4 py-1.5 rounded text-sm border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'}`}
                            >Cancel</button>
                            <button
                                onClick={async () => {
                                    if (selected.length === 0) {
                                        showModal("No user is selected");
                                        setShowBulkRoleModal(false);
                                        return;
                                    }
                                    try {
                                        await axios.patch('/admin/update-multiple-roles', {
                                            userIds: selected,
                                            newRole: bulkRoleValue
                                        });
                                        showModal("Roles updated successfully");
                                        fetchUsers();
                                    } catch (err) {
                                        showModal("Failed to update roles");
                                    }
                                    setShowBulkRoleModal(false);
                                }}
                                className={`px-4 py-1.5 rounded text-sm ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`}
                            >Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Row({ label, value, dark }) {
    return (
        <div className="flex justify-between items-center">
            <div className={`font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</div>
            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{value}</div>
        </div>
    );
}
