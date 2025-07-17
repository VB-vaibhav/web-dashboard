import React from 'react';
import { Search, MoreVertical, PlusCircle, Users, Plus, Trash2, ArrowUpAZ, ArrowDownAZ, XCircle, Columns, ChevronRight, Check, Pencil, Phone } from 'lucide-react';
import { NoSymbolIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function MobileUserManagementUI({
    users,
    selected,
    setSelected,
    fetchUsers,
    dark,
    handleDeleteUser,
    handleRestrictUser,
    handleMenuOption,
    selectedUser,
}) {
    const isAllSelected = selected.length === users.length;

    const toggleSelectAll = () => {
        setSelected(isAllSelected ? [] : users.map(u => u.id));
    };

    const handleCheckboxToggle = (userId) => {
        setSelected(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const [showDropdown, setShowDropdown] = React.useState(false);

    return (
        <div className={`overflow-y-scroll no-scrollbar px-0.25 h-[calc(100vh-100px)] ${dark ? ' text-slate-400' : ' text-gray-900'}`}>
            <div className="absolute right-3 top-6 flex items-center gap-2 z-10">
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                />
                <button
                    onClick={() => setShowDropdown(prev => !prev)}
                    className="p-0"
                >
                    <MoreVertical size={18} className="text-gray-400" />
                </button>
                {showDropdown && (
                    <div className={`absolute right-0 mt-49 w-40 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
                        <ul>
                            <li onClick={() => {
                                setShowDropdown(false);
                                requestAnimationFrame(() => handleMenuOption('add'));
                            }}
                                className="px-3 py-1.5 hover:bg-gray-700 rounded text-sm flex items-center gap-2">
                                <Plus size={16} />
                                Add New User
                            </li>
                            <li onClick={() => {
                                setShowDropdown(false);
                                requestAnimationFrame(() => handleMenuOption('edit'));
                            }}
                                className="px-3 py-1.5 hover:bg-gray-700 rounded text-sm flex items-center gap-2">
                                <Pencil size={16} />
                                Edit User
                            </li>
                            <li onClick={() => {
                                setShowDropdown(false);
                                requestAnimationFrame(() => handleMenuOption('delete'));
                            }}
                                className="px-3 py-1.5 hover:bg-gray-700 rounded text-sm flex items-center gap-2">
                                <Trash2 size={16} />
                                Delete Users
                            </li>
                            <li onClick={() => {
                                setShowDropdown(false);
                                requestAnimationFrame(() => handleMenuOption('restrict'));
                            }}
                                className="px-3 py-1.5 hover:bg-gray-700 rounded text-sm flex items-center gap-2">
                                <NoSymbolIcon className="w-4 h-4" />
                                Restrict
                            </li>
                            <li onClick={() => {
                                setShowDropdown(false);
                                requestAnimationFrame(() => handleMenuOption('unrestrict'));
                            }}
                                className="px-3 py-1.5 hover:bg-gray-700 rounded text-sm flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                Unrestrict
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {users.map(user => (
                <div
                    key={user.id}
                    className={`border-b rounded-md mb-6 pb-6 ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}
                >
                    <div className={`space-y-3 text-sm `}>
                        <div className="flex justify-between items-center">
                            <div className={`font-medium text-bold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{user.name}</div>
                            <input
                                type="checkbox"
                                checked={selected.includes(user.id)}
                                onChange={() => handleCheckboxToggle(user.id)}
                                className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Username</div>
                            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{user.username}</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-slate-400">Role</div>
                            <div className={`text-right truncate max-w-[60%] ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{user.role}</div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-medium text-slate-400">Action</div>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className={`text-xs px-4 py-1 rounded border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleRestrictUser(user.id)}
                                    className={`text-xs px-4 py-1 rounded border bg-transparent ${dark ? 'text-slate-300 border-slate-300 hover:bg-gray-600' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'}`}
                                >
                                    {user.is_restricted === 1 ? 'Restricted' : 'Restrict'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {users.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10">No users found</div>
            )}
        </div>
    );
}
