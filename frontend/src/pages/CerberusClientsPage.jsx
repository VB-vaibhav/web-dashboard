import React from 'react';
import ClientTable from '../components/ClientTable';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const CerberusClientsPage = () => {
  const isRestricted = useSelector(state => state.auth.isRestricted);
  const navigate = useNavigate();

  useEffect(() => {
    if (isRestricted) {
      navigate('/403');
    }
  }, [isRestricted, navigate]);

  return (
    <div className="p-4">
      <ClientTable service="cerberus" />
    </div>
  );
};

export default CerberusClientsPage;


// import React, { useEffect, useState, useRef } from 'react';
// import { getClientsByService, updateClient } from '../api/clientService';
// import { useSelector } from 'react-redux';
// import useIsMobile from '../hooks/useIsMobile';

// export default function CerberusClientsPage() {
//   const dynamicKeysRef = useRef([]);
//   const [clients, setClients] = useState([]);
//   const role = useSelector(state => state.auth.role);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [showAlert, setShowAlert] = useState(false);
//   const dark = localStorage.getItem('theme') === 'dark';
//   const isMobile = useIsMobile();
//   const [selectedClients, setSelectedClients] = useState([]);
//   const [columnVisibility, setColumnVisibility] = useState({});
//   const [columnWidths, setColumnWidths] = useState([]);
//   const [columnInitDone, setColumnInitDone] = useState(false);
//   const dropdownRef = useRef(null);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [dynamicColumns, setDynamicColumns] = useState([]);

//   const [editingCell, setEditingCell] = useState({ id: null, key: null, value: '' });

//   const [dateFilter, setDateFilter] = useState('last30');
//   const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;
//   const [totalClients, setTotalClients] = useState(0);

//   const pageKey = 'cerberusClients';
//   // const COLUMN_WIDTHS_KEY = `columnWidths_${pageKey}`;
//   const COLUMN_WIDTHS_KEY = `columnWidths_cerberusClients`;
//   const staticColumnWidths = [
//     20, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100
//   ];


//   const COLUMNS = [
//     { key: 'select', label: '' },
//     { key: 'client_name', label: 'Client Name' },
//     { key: 'email_or_phone', label: 'Email/Number' },
//     ...(role !== 'middleman' ? [{ key: 'middleman_name', label: 'Middleman Name' }] : []),
//     { key: 'plan', label: 'Plan' },
//     { key: 'instance_no', label: 'Instance Number' },
//     { key: 'price', label: 'Price' },
//     { key: 'currency', label: 'Currency' },
//     { key: 'start_date', label: 'Start Date' },
//     { key: 'expiry_date', label: 'Expiry Date' },
//     { key: 'payment_status', label: 'Payment Status' },
//     { key: 'amount_paid', label: 'Amount Paid' },
//     { key: 'amount_due', label: 'Amount Due' },
//     { key: 'paid_to', label: 'Paid to Whom' },
//     ...(role !== 'middleman' ? [
//       { key: 'jitesh_share', label: "Jitesh's Share" },
//       { key: 'queen_share', label: "Queen's Share" },
//       { key: 'umang_share', label: "Umang's Share" },
//       { key: 'middleman_share', label: "Middleman's Share" },
//       { key: 'atlas_jitesh', label: "Atlas Jitesh" }
//     ] : []),
//     { key: 'notes', label: 'Notes' }
//   ];
//   const formatDate = (raw) => {
//     if (!raw) return '';
//     const date = new Date(raw);
//     return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
//   };

//   const fetchClients = async () => {
//     try {
//       const data = await getClientsByService('cerberus', {
//         dateFilter,
//         customRange: customRange.startDate && customRange.endDate ? customRange : null,
//         page: currentPage,
//         limit: itemsPerPage
//       });
//       setClients(data.clients);
//       setTotalClients(data.total);
//       setSelectedClients([]);
//       setColumnInitDone(true);
//     } catch (err) {
//       console.error('Failed to fetch cerberus clients:', err);
//     }
//   };

//   useEffect(() => {
//     fetchClients();
//   }, [dateFilter, customRange, currentPage]);

//   const handleEditSave = async () => {
//     const { id, key, value } = editingCell;
//     if (!id || !key) return;

//     try {
//       await updateClient(id, { [key]: value });
//       setClients(prev => prev.map(client =>
//         client.id === id ? { ...client, [key]: value } : client
//       ));
//     } catch (err) {
//       console.error('Failed to save edit:', err);
//     } finally {
//       setEditingCell({ id: null, key: null, value: '' });
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       handleEditSave();
//     }
//   };
//   const useResizableColumns = (columnWidths, setColumnWidths) => {
//     const startResizing = (index, e) => {
//       e.preventDefault();
//       const startX = e.clientX;
//       const startWidth = columnWidths[index];

//       const handleMouseMove = (e) => {
//         const delta = e.clientX - startX;
//         const newWidths = [...columnWidths];
//         const next = index + 1;

//         // newWidths[index] = Math.max(startWidth + delta, 40);
//         const MIN_WIDTHS = [20, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]; // per static column index

//         newWidths[index] = Math.max(startWidth + delta, MIN_WIDTHS[index] || 70);

//         // Reduce width of next column to preserve layout
//         if (next < newWidths.length) {
//           newWidths[index] = Math.max(startWidth + delta, MIN_WIDTHS[index] || 70);

//         }

//         setColumnWidths(newWidths);
//         localStorage.setItem(COLUMN_WIDTHS_KEY, JSON.stringify(newWidths));

//       };

//       const handleMouseUp = () => {
//         window.removeEventListener("mousemove", handleMouseMove);
//         window.removeEventListener("mouseup", handleMouseUp);
//       };

//       window.addEventListener("mousemove", handleMouseMove);
//       window.addEventListener("mouseup", handleMouseUp);
//     };

//     const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
//     return { columnWidths, startResizing, totalWidth };
//   };

//   const { startResizing, totalWidth } = useResizableColumns(columnWidths, setColumnWidths);

//   useEffect(() => {
//     if (!dynamicColumns.length) return;

//     const totalCols = COLUMNS.length + dynamicColumns.length;
//     const saved = localStorage.getItem(COLUMN_WIDTHS_KEY);

//     let newWidths;

//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (parsed.length === totalCols) {
//           newWidths = parsed;
//         } else {
//           // mismatch: use partial + fallback
//           newWidths = parsed.concat(
//             Array(totalCols - parsed.length).fill(150)
//           ).slice(0, totalCols);
//         }
//       } catch {
//         newWidths = null;
//       }
//     }

//     if (!newWidths) {
//       newWidths = Array(totalCols).fill(150);
//     }

//     setColumnWidths(newWidths);
//     localStorage.setItem("cerberusClients_page", JSON.stringify(newWidths));
//     setColumnInitDone(true);
//   }, [dynamicColumns.length]);


//   const autoResizeColumn = (index) => {
//     const key = Object.keys(columnVisibility).filter(k => columnVisibility[k])[index];
//     if (!key) return;
//     let maxWidth = 40;

//     const span = document.createElement("span");
//     span.style.visibility = "hidden";
//     span.style.position = "absolute";
//     span.style.font = "14px sans-serif";
//     document.body.appendChild(span);

//   //   clients.forEach(client => {
//   //   const text = (client[key] || '').toString();
//   //   span.innerText = text;
//   //   const width = span.offsetWidth + 24; // padding buffer
//   //   if (width > maxWidth) maxWidth = width;
//   // });

//     document.body.removeChild(span);

//     const newWidths = [...columnWidths];
//     newWidths[index] = Math.max(maxWidth, 40);
//     setColumnWidths(newWidths);
//     localStorage.setItem("cerberusClients_page", JSON.stringify(newWidths));
//   };

//   useEffect(() => {
//     const visibility = {};
//     COLUMNS.forEach(col => {
//       visibility[col.key] = true;
//     });
//     setColumnVisibility(visibility);
//   }, []);

//   const handleCheckboxChange = (id) => {
//     setSelectedClients(prev =>
//       prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
//     );
//   };

//   const dateFilterOptions = [
//     { label: 'Past 30 Days', value: 'last30' },
//     { label: 'Today', value: 'today' }, { label: 'Yesterday', value: 'yesterday' },
//     { label: 'This Week', value: 'this_week' }, { label: 'Previous Week', value: 'previous_week' },
//     { label: 'This Month', value: 'this_month' }, { label: 'Previous Month', value: 'previous_month' },
//     { label: 'This Quarter', value: 'this_quarter' }, { label: 'Previous Quarter', value: 'previous_quarter' },
//     { label: 'This Year', value: 'this_year' }, { label: 'Previous Year', value: 'previous_year' },
//     { label: 'Custom', value: 'custom' }
//   ];

//   const handleDateFilterChange = (e) => {
//     setDateFilter(e.target.value);
//     setCustomRange({ startDate: '', endDate: '' });
//     setCurrentPage(1);
//   };

//   const handleCustomRangeChange = (field, value) => {
//     setCustomRange(prev => ({ ...prev, [field]: value }));
//     setDateFilter('custom');
//     setCurrentPage(1);
//   };

//   const totalPages = Math.ceil(totalClients / itemsPerPage);

//   if (isMobile) return <div className="p-4">Mobile View Not Yet Implemented</div>;

//   return (
//     <div className="p-4">
//       <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'flex-row justify-between items-center'} mb-2`}>
//         <h1 className={`text-xl font-semibold ${dark ? "text-blue-300" : "text-indigo-600"}`}>Cerberus Clients Table</h1>
//         <div className="right-4 top-3 flex items-center gap-2 z-10">
//           <div className="flex items-center gap-3 mb-4">
//             <label>Date Filter:</label>
//             <select
//               value={dateFilter}
//               onChange={handleDateFilterChange}
//               className="border p-1 rounded"
//             >
//               <option value="last30">Last 30 Days</option>
//               <option value="yesterday">Yesterday</option>
//               <option value="custom">Custom</option>
//             </select>

//             {dateFilter === 'custom' && (
//               <div className="flex gap-2 items-center">
//                 <input
//                   type="date"
//                   value={customRange.startDate}
//                   onChange={(e) => handleCustomRangeChange('startDate', e.target.value)}
//                   className="border p-1 rounded"
//                 />
//                 to
//                 <input
//                   type="date"
//                   value={customRange.endDate}
//                   onChange={(e) => handleCustomRangeChange('endDate', e.target.value)}
//                   className="border p-1 rounded"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto  min-h-[calc(100vh-14em)] ">
//         <div className="h-full max-h-[calc(100vh-16em)]">

//           <div className=" mt-3">
//             <div
//               style={{ width: `${totalWidth}px`, minWidth: `100%` }}
//             >
//               <table className="table-auto w-full text-sm">
//                 <thead className={`sticky top-0 text-slate-400 border-b ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
//                   <tr>
//                     {COLUMNS.map((col, index) => (
//                       <th
//                         key={col.key}
//                         style={{ width: columnWidths[index] || 40, minWidth: 40 }}
//                         className={`relative px-2 py-3 font-semibold border-r group  
//         ${dark ? 'border-gray-700' : 'border-gray-300'}  
//         ${index === 0 ? 'text-left' : 'text-center'} whitespace-nowrap`}
//                       >
//                         <div className={`${index === 0 ? 'flex justify-start' : 'flex justify-center'} items-center`}>
//                           {col.key === 'select' ? (
//                             <input
//                               type="checkbox"
//                               checked={selectedClients.length === clients.length}
//                               onChange={() =>
//                                 setSelectedClients(
//                                   selectedClients.length === clients.length ? [] : clients.map(c => c.id)
//                                 )
//                               }
//                               className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
//                             />
//                           ) : (
//                             col.label
//                           )}
//                         </div>
//                         <div
//                           onMouseDown={(e) => startResizing(index, e)}
//                           onDoubleClick={(e) => {
//                             e.stopPropagation(); // avoid bubbling to th
//                             autoResizeColumn(index);
//                           }}
//                           // onDoubleClick={() => autoResizeColumn(index)}
//                           className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
//                         />
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className={`${dark ? "text-slate-300" : "text-blue-950"}`}>
//                   {clients.length === 0 ? (
//                     <tr>
//                       <td colSpan={COLUMNS.length} className="text-center py-8 text-gray-400 text-sm">
//                         No search result found.
//                       </td>
//                     </tr>
//                   ) : (
//                     clients.map((client) => (
//                       <tr key={client.id}>
//                         {COLUMNS.map((col, index) => (
//                           <td
//                             key={col.key}
//                             style={{ width: columnWidths[index] || 40, minWidth: 40 }}
//                             className={`px-2 py-2 text-center ${index === 0 ? 'text-left' : 'text-center'}`}
//                             onDoubleClick={() => {
//                               if (role !== 'middleman' && col.key !== 'select') {
//                                 setEditingCell({ id: client.id, key: col.key, value: client[col.key] || '' });
//                               }
//                             }}

//                           >
//                             {col.key === 'select' ? (
//                               <input
//                                 type="checkbox"
//                                 checked={selectedClients.includes(client.id)}
//                                 onChange={() => handleCheckboxChange(client.id)}
//                                 className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
//                               />
//                             ) : editingCell.id === client.id && editingCell.key === col.key ? (
//                               <input
//                                 value={editingCell.value}
//                                 onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
//                                 onBlur={handleEditSave}
//                                 onKeyDown={(e) => {
//                                   if (e.key === 'Enter') handleEditSave();
//                                 }}
//                                 autoFocus
//                                 className="w-full border px-1 rounded"
//                               />
//                             ) : (
//                               <div
//                                 className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto"
//                                 style={{ maxWidth: columnWidths[index] }}
//                               >
//                                 {col.key === 'start_date' || col.key === 'expiry_date' ? (
//                                   formatDate(client[col.key])
//                                 ) : col.key === 'payment_status' ? (
//                                   <span className={
//                                     client[col.key] === 'unpaid' ? 'text-red-600 font-semibold' :
//                                       client[col.key] === 'partially paid' ? 'text-yellow-500 font-semibold' :
//                                         client[col.key] === 'paid' ? 'text-green-600 font-semibold' : ''
//                                   }>
//                                     {client[col.key]}
//                                   </span>
//                                 ) : (
//                                   client[col.key] ?? ''
//                                 )}
//                               </div>
//                             )}
//                           </td>
//                         ))}
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Pagination Controls */}
//       <div className="flex items-center justify-between mt-4">
//         <button
//           disabled={currentPage === 1}
//           onClick={() => setCurrentPage(p => p - 1)}
//           className="px-3 py-1 border rounded disabled:opacity-50"
//         >
//           Previous
//         </button>

//         <span>Page {currentPage} of {Math.ceil(totalClients / itemsPerPage)}</span>

//         <button
//           disabled={currentPage === Math.ceil(totalClients / itemsPerPage)}
//           onClick={() => setCurrentPage(p => p + 1)}
//           className="px-3 py-1 border rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     </div >
//   );
// }
