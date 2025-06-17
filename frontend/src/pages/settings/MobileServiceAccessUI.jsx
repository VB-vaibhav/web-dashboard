import React, { useState } from 'react';
import { MoreVertical, PlusCircle, MinusCircle } from 'lucide-react';
import Select from 'react-select';

export default function MobileServiceAccessUI({
    dark,
    users,
    selected,
    setSelected,
    handleToggle,
    allServiceKeys,
    showModal,
    openServiceActionModal,
    serviceModalType,
    setShowServiceModal,
}) {
    const isAllSelected = selected.length === users.length;

    const handleMasterCheckbox = () => {
        setSelected(isAllSelected ? [] : users.map(user => user.id));
    };

    const handleRowCheckbox = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const [showDropdown, setShowDropdown] = useState(false);

    const renderButtons = (user, key) => {
        const included = user[key] === 1;

        const onClick = (type) => {
            if ((included && type === 'included') || (!included && type === 'excluded')) {
                showModal(included ? "Already Included" : "Already Excluded");
                return;
            }
            handleToggle(user.id, key);
        };

        return (
            <div className="flex gap-2">
                <button
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-all 
            ${included
                            ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`
                            : `${dark ? 'text-slate-300 border-slate-500 hover:bg-gray-500' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent`}`}
                    onClick={() => onClick('included')}
                >
                    {included ? 'Included' : 'Include'}
                </button>
                <button
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-all 
            ${!included
                            ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`
                            : `${dark ? 'text-slate-300 border-slate-500 hover:bg-gray-500' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent`}`}
                    onClick={() => onClick('excluded')}
                >
                    {included ? 'Exclude' : 'Excluded'}
                </button>
            </div>
        );
    };

    return (
        <div className={`overflow-y-scroll no-scrollbar h-[calc(100vh-100px)] rounded-md ${dark ? 'bg-gray-800 text-slate-400' : 'bg-white text-blue-900'}`}>
            {/* Header Row */}
            <div className="absolute right-4 top-5 flex items-center gap-2 z-10">
                {/* <div className="text-lg font-semibold">Access to Service Panels</div> */}

                <div className="flex gap-2 items-center">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleMasterCheckbox}
                        className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                    />
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(prev => !prev)}
                            className={`p-1.5`}
                        >
                            <MoreVertical size={18} />
                        </button>

                        {showDropdown && (
                            <div className={`absolute right-0 mt-2 w-44 z-50 rounded-md p-2 text-sm shadow-lg
      ${dark ? 'bg-gray-800 text-slate-400 border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>

                                {/* <button onClick={handleIncludeAll} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-gray-700">
                                    Include All
                                </button>
                                <button onClick={handleExcludeAll} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-gray-700">
                                    Exclude All
                                </button> */}
                                <button
                                    onClick={() => openServiceActionModal('include')}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                                >
                                    <PlusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                                    <span>Include</span>
                                </button>

                                <button
                                    onClick={() => openServiceActionModal('exclude')}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                                >
                                    <MinusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                                    <span>Exclude</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Users Loop */}
            {users.map(user => (
                <div key={user.id} className={`mb-6 rounded-md pb-6 border-b ${dark ? 'border-gray-700' : 'border-gray-300'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <span className="text-sm font-medium">{user.name}
                            </span>
                            <span className="text-xs capitalize">  ({user.role})
                            </span>
                        </div>

                        <input
                            type="checkbox"
                            checked={selected.includes(user.id)}
                            onChange={() => handleRowCheckbox(user.id)}
                            className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                        />
                    </div>

                    {/* Service Buttons */}
                    <div className="space-y-3">
                        {allServiceKeys.map(service => (
                            <div key={service.key} className="flex justify-between items-center">
                                <div className="text-xs">{service.label}</div>
                                {renderButtons(user, service.key)}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Optional show more/less logic if needed */}
        </div>
    );
}
