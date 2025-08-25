import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
// import { motion, useInView } from 'framer-motion'; // Add this at the top
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import ApexCharts from 'react-apexcharts';
import 'react-datepicker/dist/react-datepicker.css';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';
import { components } from 'react-select';
import useIsMobile from '../hooks/useIsMobile';
import { useOutletContext } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Search, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const yearsOptions = Array.from({ length: 11 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { label: year.toString(), value: year };
});
yearsOptions.push({ label: 'Custom', value: 'custom' });

const ClientReportPage = () => {
    const [clientData, setClientData] = useState(null);
    const { dark } = useOutletContext();
    const isMobile = useIsMobile();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const role = useSelector(state => state.auth.role);
    const salesRef = useRef(null);
    // const isInView = useInView(salesRef, { once: false, margin: '-100px 0px' });
    // const containerVariants = {
    //     hidden: { opacity: 0, y: 100, scale: 0.95 },
    //     visible: {
    //         opacity: 1,
    //         y: 0,
    //         scale: 1,
    //         transition: {
    //             duration: 0.8,
    //             ease: "easeOut",
    //             when: "beforeChildren",
    //             staggerChildren: 0.15
    //         }
    //     }
    // };

    // const childVariants = {
    //     hidden: { opacity: 0, y: 30 },
    //     visible: { opacity: 1, y: 0 }
    // };

    const [yearFilter, setYearFilter] = useState({ label: new Date().getFullYear().toString(), value: new Date().getFullYear() });
    const [customRange, setCustomRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    });

    const [showCalendar, setShowCalendar] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const [salesRows, setSalesRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { id } = useParams(); // React Router
    const logicalId = id;
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);


    const clientId = localStorage.getItem('selectedClientId'); // Set before redirect
    // const logicalId = localStorage.getItem('selectedLogicalId');
    console.log("Loaded logicalId:", logicalId);
    if (!logicalId) {
        console.error("Missing logical ID");
        return <p className="text-red-500 p-4">Client ID missing. Please select a client again.</p>;
    }
    const clientName = localStorage.getItem('selectedClientName');
    const middlemanName = localStorage.getItem('selectedMiddleman');

    const allColumns = [
        'Created At', 'Service', 'Plan', 'Accounts Count', 'Proxy Count',
        'Price', 'Currency', 'Start Date', 'Expiry Date',
        "Middleman's Share", 'Payment Status', 'Amount Paid', 'Paid To', 'Notes'
    ];

    const visibleColumns = role === 'middleman'
        ? allColumns.filter(col => col !== 'Paid To')
        : allColumns;


    useEffect(() => {
        fetchData();
    }, [yearFilter, customRange]);

    // const fetchData = async () => {
    //     try {
    //         const params = yearFilter.value === 'custom'
    //             ? { from: customRange[0]?.toISOString().slice(0, 10), to: customRange[1]?.toISOString().slice(0, 10) }
    //             : { year: yearFilter.value };

    //         // const res = await axios.get(`/clients/report/${logicalId}`, { params });
    //         const res = await axios.get(`/clients/report/${logicalId}?year=${yearFilter.value}`);
    //         console.log("Fetched report data:", res.data);
    //         setClientData(res.data.summary);
    //         setGraphData(Array.isArray(res.data.graphData) ? res.data.graphData : []);
    //         setSalesRows(res.data.salesData);
    //     } catch (err) {
    //         console.error('Fetch report error:', err);
    //     }
    // };

    //   const filteredRows = salesRows.filter(row =>
    //     Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    //   );

    const fetchData = async () => {
        try {
            let url = `/clients/report/${logicalId}`;
            const params = {};

            if (yearFilter.value === 'custom') {
                if (customRange?.startDate && customRange?.endDate) {
                    params.year = 'custom';
                    params.from = customRange.startDate.toISOString().slice(0, 10);
                    params.to = customRange.endDate.toISOString().slice(0, 10);
                } else {
                    console.warn('Custom date range is invalid');
                    return;
                }
            } else {
                params.year = yearFilter.value;
            }

            const res = await axios.get(url, { params });
            console.log("Fetched report data:", res.data);

            setClientData(res.data.summary);
            setGraphData(Array.isArray(res.data.graphData) ? res.data.graphData : []);
            setSalesRows(res.data.salesData);
        } catch (err) {
            console.error('Fetch report error:', err);
        }
    };

    const filteredRows = (salesRows || []).filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (raw) => {
        if (!raw) return '';
        const date = new Date(raw);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    const handleDeleteClient = async () => {
        try {
            await axios.delete(`/clients/delete-logical/${logicalId}`);
            alert('Client deleted successfully');
            window.location.href = '/clients'; // redirect
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete client');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isMobile) return <div className="p-4">Mobile View Not Yet Implemented</div>;
    return (
        <PageWrapper>
            <div className="p-2">
                {/* Date Filter */}
                <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'flex-row justify-between items-center'} mb-2`}>
                    <h1 className={`text-xl font-semibold ${dark ? "text-blue-300" : "text-indigo-600"}`}>
                        {clientData?.clientName}

                        <span className="text-gray-500">
                            ({clientData?.middleman})
                        </span>

                    </h1>
                    <div className="right-4 top-3 flex items-center gap-2 z-10">
                        <div className="">
                            <Select
                                components={{
                                    IndicatorSeparator: () => null,
                                    DropdownIndicator: (props) => (
                                        <components.DropdownIndicator {...props} style={{ paddingLeft: 1, paddingRight: 1 }} />
                                    )
                                }}
                                options={yearsOptions}
                                value={yearFilter}
                                onChange={(selected) => {
                                    setYearFilter(selected);
                                    setShowCalendar(selected.value === 'custom');
                                }}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        backgroundColor: dark ? '#374151' : '#f3f4f6',
                                        color: dark ? 'white' : '#1f2937',
                                        borderColor: dark ? '#374151' : '#f3f4f6',
                                        minHeight: '34px',
                                        height: '34px',
                                        boxShadow: state.isFocused ? 'none' : undefined,
                                        outline: 'none',
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused
                                            ? dark ? '#374151' : '#E0E7FF'
                                            : 'transparent',
                                        color: dark ? '#F9FAFB' : '#1F2937',
                                        borderRadius: '6px',
                                        margin: '4px 0',
                                        padding: '8px 10px',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        zIndex: 20,
                                        backgroundColor: dark ? '#1f2937' : 'white',
                                        color: dark ? 'white' : '#1f2937',
                                        padding: '4px',
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: dark ? 'white' : '#1f2937',
                                    }),
                                }}
                            />
                        </div>
                        {role === 'superadmin' && (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    className={`p-1.5 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}
                                    onClick={() => setShowMenu(prev => !prev)}
                                >
                                    <MoreVertical size={18} />
                                </button>
                                {showMenu && (
                                    <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
                                        <button
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
                                                }`}
                                            onClick={() => setShowConfirm(true)}
                                        >
                                            <Trash2 size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                                            <span>Permanent Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* {showCalendar && (
                <div className="px-6 pt-4">
                    <DatePicker
                        selectsRange
                        startDate={customRange[0]}
                        endDate={customRange[1]}
                        onChange={(update) => setCustomRange(update)}
                        isClearable
                        className="border px-3 py-2 rounded"
                    />
                </div>
            )} */}
                {showCalendar && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className={`border ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-white"} p-6 rounded-lg shadow-lg`}>
                            <h2 className={`text-lg font-semibold mb-2 text-center ${dark ? "text-slate-300" : "text-blue-900"}`}>
                                Select Date Range
                            </h2>
                            <div className={`${dark ? 'calendar-dark' : ''}`}>
                                <DateRange
                                    editableDateInputs={true}
                                    onChange={({ selection }) =>
                                        setCustomRange({
                                            startDate: selection.startDate,
                                            endDate: selection.endDate,
                                            key: 'selection'
                                        })
                                    }
                                    moveRangeOnFirstSelection={false}
                                    ranges={[customRange]}
                                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 10))}
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-4">
                                <button
                                    onClick={() => setShowCalendar(false)}
                                    className={`border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} px-4 py-2 rounded`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCalendar(false);
                                        setYearFilter({ label: 'Custom', value: 'custom' });
                                        fetchData(logicalId, 'custom', customRange.startDate, customRange.endDate); // trigger filter
                                    }}
                                    className={`border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'} px-4 py-2 rounded`}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto  min-h-[calc(100vh-11em)] ">
                    <div className="h-full max-h-[calc(100vh-14em)]">

                        <div className=" mt-1">
                            {/* Service Cards */}
                            <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 px-2 py-4 `}>
                                {clientData?.services?.map((service, idx) => (
                                    <div key={idx} className={`shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] rounded-xl p-4 text-center transform transition-all duration-300 hover:scale-[1.025] cursor-pointer ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-xl font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{service.count}</p>
                                        <h4 className="text-sm text-slate-400 font-semibold">{service.name}</h4>
                                    </div>
                                ))}
                            </div>

                            {/* Revenue + Graph Section */}
                            {/* <div className="grid md:grid-cols-2 gap-4 px-2 py-6 sticky top-0 z-10 backdrop-blur-md">
                            <div>
                                <div className="bg-indigo-50 p-4 rounded-xl shadow">
                                    <h4 className="text-sm text-gray-500">Total Revenue (USD)</h4>
                                    <p className="text-xl font-bold text-indigo-800">${clientData?.totalRevenueUSD || 0}</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-xl shadow">
                                    <h4 className="text-sm text-gray-500">Pending Payments (USD)</h4>
                                    <p className="text-xl font-bold text-yellow-700">${clientData?.totalDueUSD || 0}</p>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-1 rounded-xl shadow bg-white">
                                <ApexCharts
                                    type="bar"
                                    height={200}
                                    options={{
                                        chart: { id: 'monthly-revenue', toolbar: { show: false } },
                                        xaxis: { categories: graphData.map(g => g.month) },
                                        tooltip: { y: { formatter: val => `$${val}` } }
                                    }}
                                    series={[{ name: 'Revenue', data: graphData.map(g => g.total) }]}
                                />
                            </div>
                        </div> */}

                            <div className="flex flex-col md:flex-row gap-4 px-2 py-4">
                                {/* Left cards (20%) */}
                                <div className="flex flex-col gap-4 w-full md:w-[20%] text-center">
                                    {/* Total Revenue Card */}
                                    <div className={`p-4 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] transform transition-all duration-300 hover:scale-[1.025] cursor-pointer ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-xl font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>${clientData?.totalRevenueUSD || '0.00'}</p>
                                        <h4 className="text-sm text-slate-400 font-semibold">Total Revenue (USD)</h4>
                                        <span className="text-xs text-slate-400 ">Calculated as per today’s Google Rate</span>
                                    </div>

                                    {/* Pending Payments Card */}
                                    <div className={`p-4 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] transform transition-all duration-300 hover:scale-[1.025] cursor-pointer ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-xl font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>${clientData?.totalPaidUSD || '0.00'}</p>
                                        <h4 className="text-sm text-slate-400 font-semibold">Amount Paid (USD)</h4>
                                    </div>
                                    <div className={`p-4 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] transform transition-all duration-300 hover:scale-[1.025] cursor-pointer ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                                        <p className={`text-xl font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>${clientData?.totalDueUSD || '0.00'}</p>
                                        <h4 className="text-sm text-slate-400 font-semibold">Pending Payments (USD)</h4>
                                    </div>
                                </div>

                                {/* Right chart (80%) */}
                                <div className={`w-full md:w-[80%] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                                    <p className={`text-base px-4 pt-4 font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>Monthly Sales Graph</p>
                                    {/* <ApexCharts
                                    type="bar"
                                    height={200}
                                    options={{
                                        chart: {
                                            id: 'monthly-revenue', toolbar: { show: false },
                                            foreColor: dark ? '#e5e7eb' : '#1f2937'
                                        },
                                        xaxis: { categories: graphData.map(g => g.month), },
                                        tooltip: { y: { formatter: val => `$${val}` } }
                                    }}
                                    series={[{ name: 'Revenue', data: graphData.map(g => g.total) }]}
                                /> */}
                                    <ApexCharts
                                        type="bar"
                                        height={235}
                                        options={{
                                            chart: {
                                                id: 'monthly-revenue',
                                                toolbar: { show: false },
                                                foreColor: dark ? '#e5e7eb' : '#1f2937' // 🟢 Make all text visible depending on mode
                                            },
                                            xaxis: {
                                                categories: graphData.map(g => g.month),
                                                labels: {
                                                    style: {
                                                        colors: dark ? '#e5e7eb' : '#1f2937', // x-axis label color
                                                    }
                                                }
                                            },
                                            yaxis: {
                                                labels: {
                                                    style: {
                                                        colors: dark ? '#e5e7eb' : '#1f2937', // y-axis label color
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                theme: dark ? 'dark' : 'light',
                                                y: {
                                                    formatter: val => `$${val}`
                                                }
                                            },
                                            grid: {
                                                borderColor: dark ? '#4b5563' : '#e5e7eb' // grid lines
                                            }
                                        }}
                                        series={[{
                                            name: 'Revenue',
                                            data: graphData.map(g => g.total)
                                        }]}
                                    />
                                </div>
                            </div>


                            {/* Sales Table */}
                            {/* <motion.div
                            ref={salesRef}
                            variants={containerVariants}
                            initial="hidden"
                            // animate={isInView ? "visible" : "hidden"}
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.3 }}
                            className=""
                        > */}
                            <div className={`px-2 py-4  `}>
                                <div className={`p-4 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                                    {/* <motion.div
                                        variants={childVariants}

                                    > */}
                                    <div className="mb-4 flex justify-between items-center">
                                        <h3 className={`text-lg px-2 pt-4 font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>Sales Table</h3>
                                        <div className='relative'>
                                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                                                <Search size={16} />
                                            </span>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                placeholder="Search in Table"
                                                className={`pl-10 pr-3 py-1.5 w-[180px] max-w-xs border rounded-md text-sm ${dark ? 'bg-gray-700 text-white border-gray-700 placeholder-gray-400' : 'bg-gray-100 border-gray-100 text-gray-800 placeholder-gray-500'}`}
                                            />
                                        </div>
                                    </div>
                                    {/* </motion.div> */}
                                    {/* <div className="overflow-auto rounded-xl bg-white shadow max-h-[600px]"> */}
                                    {/* <motion.div variants={childVariants}> */}
                                    <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto  min-h-[calc(100vh-18em)] ">
                                        <div className="h-full max-h-[calc(100vh-20em)]">

                                            <div className=" mt-3">
                                                <div
                                                // style={{ width: `${totalWidth}px`, minWidth: `100%` }}
                                                >
                                                    <table className="table-auto w-full text-sm">
                                                        <thead className={`sticky top-0 text-slate-400 border-b ${dark ? "bg-gray-700 border-gray-500" : "bg-white border-gray-300"}`}>
                                                            <tr>
                                                                {visibleColumns.map((col, idx) => (
                                                                    <th key={idx} className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-500' : 'border-gray-300'}  
        'text-center whitespace-nowrap`}>{col}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className={`${dark ? "text-slate-300" : "text-blue-950"}`}>
                                                            {filteredRows.map((row, idx) => (
                                                                <tr key={idx}
                                                                    className="transition-all duration-300 ease-in-out transform animate-fade-in">
                                                                    <td className="px-2 py-2 text-center">{formatDate(row.created_at)}</td>
                                                                    <td className="px-2 py-2 text-center">{row.service}</td>
                                                                    <td className="px-2 py-2 text-center">{row.plan}</td>
                                                                    <td className="px-2 py-2 text-center">{row.accounts_count}</td>
                                                                    <td className="px-2 py-2 text-center">{row.proxy_count}</td>
                                                                    <td className="px-2 py-2 text-center">{row.price}</td>
                                                                    <td className="px-2 py-2 text-center">{row.currency}</td>
                                                                    <td className="px-2 py-2 text-center">{formatDate(row.start_date)}</td>
                                                                    <td className="px-2 py-2 text-center">{formatDate(row.expiry_date)}</td>
                                                                    <td className="px-2 py-2 text-center">{row.middleman_share}</td>
                                                                    <td className="px-2 py-2 text-center capitalize">
                                                                        <span className={
                                                                            row.payment_status === 'paid' ? 'text-green-600 font-semibold' :
                                                                                row.payment_status === 'unpaid' ? 'text-red-600 font-semibold' :
                                                                                    row.payment_status === 'partially paid' ? 'text-yellow-500 font-semibold' :
                                                                                        ''
                                                                        }>
                                                                            {row.payment_status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-2 py-2 text-center">{row.amount_paid}</td>
                                                                    {role !== 'middleman' && (
                                                                        <td className="px-2 py-2 text-center">{row.paid_to}</td>
                                                                    )}
                                                                    <td className="px-2 py-2 text-center">{row.notes}</td>
                                                                </tr>
                                                            ))}
                                                            {filteredRows.length === 0 && (
                                                                <tr><td colSpan={14} className="text-center py-8 text-sm text-gray-400">No search result found.</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* </motion.div> */}
                                </div>
                            </div>
                            {/* </motion.div> */}
                        </div>
                    </div>
                </div>
                {showConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className={`rounded-lg p-6 max-w-lg w-full shadow-lg ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                            <h3 className="text-lg font-semibold mb-4">Are you sure you want to permanently delete this client?</h3>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className={`px-4 py-2 text-sm border ${dark ? 'border-slate-300 text-slate-300 ' : 'border-indigo-600 text-indigo-600'} rounded `}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteClient}
                                    className={`px-4 py-2 text-sm ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'} rounded`}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </PageWrapper>
    );
};

export default ClientReportPage;
