import React, { useState } from 'react';
import { X } from 'lucide-react';
import { saveAs } from 'file-saver';
import { exportClientsAsCSV } from '../utils/exportUtils';
import { NoSymbolIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ExportClientModal({ onClose, data, selectedIds, columns, filters, dark }) {
    const [exportType, setExportType] = useState('selected');
    const [selectedColumns, setSelectedColumns] = useState(columns.map(col => col.key));
    const [isClosing, setIsClosing] = useState(false);

    const handleCheckboxToggle = (colKey) => {
        setSelectedColumns(prev =>
            prev.includes(colKey)
                ? prev.filter(k => k !== colKey)
                : [...prev, colKey]
        );
    };

    const handleExport = async () => {
        const exportData = await exportClientsAsCSV({
            exportType,
            allData: data,
            selectedIds,
            filters,
            selectedColumns
        });

        const blob = new Blob([exportData], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `clients_export_${Date.now()}.csv`);
        handleClose();
    };
const handleClose = () => {
  setIsClosing(true);
  setTimeout(() => {
    onClose();
  }, 250); // match duration with animation
};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} ${isClosing ? "animate-fade-out-modal" : "animate-fade-in-modal"}  rounded-lg p-6 w-full max-w-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Export CSV Section</h2>
                    <button onClick={handleClose}><XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} /></button>
                </div>

                <div className="grid grid-rows-10 gap-4">
                    {/* Export Type */}
                    <div className='row-span-2'>
                        <h3 className="font-medium mb-2">Export Type</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <label className="block text-sm font-medium mb-1">
                                <input type="radio" name="exportType" value="all" checked={exportType === 'all'} onChange={() => setExportType('all')}
                                    className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`} />
                                <span className="ml-2">All Clients</span>
                            </label>
                            <label className="block text-sm font-medium mb-1">
                                <input type="radio" name="exportType" value="filtered" checked={exportType === 'filtered'} onChange={() => setExportType('filtered')} className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`} />
                                <span className="ml-2">Filtered Results</span>
                            </label>
                            <label className="block text-sm font-medium mb-1">
                                <input type="radio" name="exportType" value="selected" checked={exportType === 'selected'} onChange={() => setExportType('selected')} className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`} />
                                <span className="ml-2">Selected Rows</span>
                            </label>
                        </div>
                    </div>

                    {/* Columns to Include */}
                    <div className='row-span-8'>
                        <h3 className="font-medium mb-2">Columns to Include</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {columns.map(col => (
                                <label key={col.key} className="block">
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.includes(col.key)}
                                        onChange={() => handleCheckboxToggle(col.key)}
                                        className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                                    />
                                    <span className="ml-2">{col.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className=" text-center">
                    <button onClick={handleExport} className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}>
                        Export Now
                    </button>
                </div>
            </div>
        </div>
    );
}
