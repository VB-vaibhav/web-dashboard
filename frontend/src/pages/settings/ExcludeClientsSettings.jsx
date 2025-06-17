// // Updated ExcludeClientsSettings.jsx with full feature set
// import React, { useEffect, useState, useRef } from 'react';
// import axios from '../../api/axios';
// import { useOutletContext } from 'react-router-dom';
// import AlertModal from '../../components/AlertModal';
// import { useSelector } from 'react-redux';
// import { Search, MoreVertical } from 'lucide-react';
// import useIsMobile from '../../hooks/useIsMobile';
// import { useTableSearch } from '../../hooks/useTableSearch';
// import { usePersistentWidths } from '../../hooks/usePersistentWidths';

// export default function ExcludeClientsSettings() {
//   const [clients, setClients] = useState([]);
//   const [admins, setAdmins] = useState([]);
//   const [selectedAdmin, setSelectedAdmin] = useState({});
//   const [selected, setSelected] = useState([]);
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const { dark } = useOutletContext();
//   const isMobile = useIsMobile();

//   const [columnWidths, setColumnWidths] = useState([]);
//   const [columnInitDone, setColumnInitDone] = useState(false);
//   const defaultWidths = [40, 160, 120, 160, 200, 160, 160];

//   const { columnWidths: persistedWidths, startResizing } = usePersistentWidths('exclude_clients', defaultWidths);

//   useEffect(() => {
//     if (!columnInitDone) {
//       setColumnWidths(persistedWidths);
//       setColumnInitDone(true);
//     }
//   }, [persistedWidths, columnInitDone]);

//   const fetchData = async () => {
//     const [clientRes, adminRes] = await Promise.all([
//       axios.get('/admin/exclusion-settings'),
//       axios.get('/admin/admin-users')
//     ]);
//     setClients(clientRes.data);
//     setAdmins(adminRes.data);
//   };

//   useEffect(() => { fetchData(); }, []);

//   const handleSelect = (clientId, value) => {
//     setSelectedAdmin(prev => ({ ...prev, [clientId]: value }));
//   };

//   const handleAction = async (clientId, action) => {
//     const adminId = selectedAdmin[clientId];
//     if (!adminId) return alert('Select admin first.');
//     try {
//       await axios.patch(`/admin/exclusion-settings/${clientId}`, { action, adminId });
//       setAlertMessage(`${action === 'exclude' ? 'Excluded' : 'Included'} successfully.`);
//       setShowAlert(true);
//       fetchData();
//     } catch (err) {
//       setAlertMessage('Action failed.');
//       setShowAlert(true);
//     }
//   };

//   return (
//     <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto min-h-[calc(100vh-190px)] ">
//       <div className="absolute right-4 top-3 flex items-center gap-2 z-10">
//         <div className="relative w-[180px]">
//           <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
//             <Search size={16} />
//           </span>
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search in Table"
//             className={`pl-10 pr-3 py-1.5 w-[180px] max-w-xs border rounded-md text-sm ${dark ? 'bg-gray-700 text-white border-gray-700 placeholder-gray-400' : 'bg-gray-100 border-gray-100 text-gray-800 placeholder-gray-500'}`}
//           />
//         </div>
//         <div className="relative" ref={dropdownRef}>
//           <button onClick={() => setShowDropdown(prev => !prev)} className={`p-1.5 ml-3 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}>
//             <MoreVertical size={18} />
//           </button>
//           {showDropdown && (
//             <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
//               <button onClick={() => openServiceActionModal('include')} className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
//                 <PlusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
//                 <span>Include</span>
//               </button>
//               <button onClick={() => openServiceActionModal('exclude')} className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
//                 <MinusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
//                 <span>Exclude</span>
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//       <div className=" mt-3">
//         <div style={{ width: `${totalWidth}px`, minWidth: `100%` }}>
//           <table className="table-auto text-sm w-full">
//             <thead>
//               <tr>
//                 {['select', 'client_name', 'service', 'expiry', 'excluded', 'admin', 'action'].map((key, index) => {
//                   if (!columnVisibility[key]) return null;

//                   const labelMap = {
//                     select: '',
//                     client_name: 'Client Name',
//                     service: 'Service',
//                     expiry: 'Expiry Date',
//                     excluded: 'Currently excluded',
//                     admin: 'Admin',
//                     action: 'Acction',
//                     '': ''
//                   };
//                   return (
//                     <th
//                       key={index}
//                       onContextMenu={(e) => handleHeaderContextMenu(e, index)}
//                       style={{ width: columnWidths[index] || 40, minWidth: 40 }}
//                       className={`relative px-2 py-3 font-semibold border-r group  
//         ${dark ? 'border-gray-700' : 'border-gray-300'}  
//         ${index === 0 ? 'text-left' : 'text-center'} whitespace-nowrap`}
//                     >
//                       <div className={`${index === 0 ? 'flex justify-start' : 'flex justify-center'} items-center`}>
//                         {key === 'select' ? (
//                           <input
//                             type="checkbox"
//                             checked={selected.length === users.length}
//                             onChange={() => setSelected(selected.length === users.length ? [] : users.map(u => u.id))}
//                             className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
//                           />
//                         ) : (
//                           labelMap[key]
//                         )}
//                       </div>
//                       <div
//                         onMouseDown={(e) => startResizing(index, e)}
//                         onDoubleClick={(e) => {
//                           e.stopPropagation();
//                           autoResizeColumn(index);
//                         }}
//                         className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
//                       />
//                     </th>
//                   );
//                 })}
//                 {dynamicColumns.map(({ dbKey, label }, i) => {
//                   const index = 7 + i;
//                   const isEditing = editingHeader === dbKey;
//                   return columnVisibility[dbKey] && (
//                     <th
//                       key={`dynamic-${i}`}
//                       onContextMenu={(e) => handleHeaderContextMenu(e, index)}
//                       style={{ width: columnWidths[index] || 40, minWidth: 40 }}
//                       className={`relative px-2 py-3 font-semibold border-r group  
//         ${dark ? 'border-gray-700' : 'border-gray-300'} text-center whitespace-nowrap`}
//                       onDoubleClick={() => {
//                         setEditingHeader(dbKey);
//                         setNewHeaderLabel(label);
//                       }}
//                     >
//                       {isEditing ? (
//                         <input
//                           className="text-sm px-1 py-0.5 border rounded w-28 text-center"
//                           value={newHeaderLabel}
//                           onChange={(e) => setNewHeaderLabel(e.target.value)}
//                           onBlur={() => handleRenameColumn(dbKey, newHeaderLabel)}
//                           autoFocus
//                         />
//                       ) : (
//                         label
//                       )}
//                       <div
//                         onMouseDown={(e) => startResizing(index, e)}
//                         onDoubleClick={(e) => {
//                           e.stopPropagation();
//                           autoResizeColumn(index);
//                         }}
//                         className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
//                       />
//                     </th>
//                   );
//                 })}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.length === 0 ? (
//                 <tr><td colSpan={8} className="py-6 text-sm text-gray-500 text-center">No search result found</td></tr>
//               ) : (
//                 clients.map((client, idx) => (
//                   <tr key={client.client_id}>
//                     {columnVisibility['select'] && (
//                       <td className="px-2 py-2 text-left">
//                         <input
//                           type="checkbox"
//                           checked={selected.includes(client.client_id)}
//                           onChange={(e) => {
//                             const isChecked = e.target.checked;
//                             setSelected(prev => isChecked
//                               ? [...prev, client.client_id]
//                               : prev.filter(id => id !== client.client_id));
//                           }}
//                           className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
//                         />
//                       </td>
//                     )}
//                     {['client_name', 'service', 'expiry', 'excluded'].map((key, i) =>
//                       columnVisibility[key] && (
//                         <td key={key} style={{ width: columnWidths[i + 1] }} className="px-2 py-2 text-center">
//                           <div className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[i + 1] }}>
//                             {user[key]}
//                           </div>
//                         </td>
//                       )
//                     )}
//                     if (key === 'change') {
//                         return (
//                     <td key={key} className="text-center px-2 py-2">
//                       <div className="flex justify-center items-center">
//                         <Select
//                           components={{
//                             IndicatorSeparator: () => null,
//                             DropdownIndicator: (props) => (
//                               <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
//                             )
//                           }}
//                           options={roleOptions}
//                           value={selectedAdmin[client.client_id] || ''}
//                           onChange={e => handleSelect(client.client_id, e.target.value)}
//                           styles={{
//                             control: (base, state) => ({
//                               ...base,
//                               backgroundColor: dark ? '#1F2937' : '#ffffff',
//                               width: '120px',
//                               minHeight: '31px',
//                               height: '31px',
//                               fontSize: '0.85rem',
//                               color: dark ? '#E5E7EB' : '#1F2937',
//                               borderColor: dark ? '#4B5563' : '#D1D5DB',
//                               boxShadow: state.isFocused ? 'none' : undefined,
//                               outline: 'none',
//                               '&:hover': {
//                                 borderColor: dark ? '#6B7280' : '#9CA3AF',
//                               }
//                             }),
//                             option: (base, state) => ({
//                               ...base,
//                               backgroundColor: state.isFocused
//                                 ? dark ? '#374151' : '#E0E7FF'
//                                 : 'transparent',
//                               color: dark ? '#F9FAFB' : '#1F2937',
//                               borderRadius: '6px',
//                               margin: '4px 0',
//                               padding: '8px 10px',
//                               cursor: 'pointer',
//                               overflow: 'hidden',
//                               textOverflow: 'ellipsis',
//                               whiteSpace: 'nowrap',
//                             }),
//                             menu: (base) => ({
//                               ...base,
//                               zIndex: 99,
//                               backgroundColor: dark ? '#1F2937' : '#ffffff',
//                               padding: '4px',
//                               borderRadius: '8px',
//                               overflowX: 'hidden'
//                             }),
//                             singleValue: (base) => ({
//                               ...base,
//                               color: dark ? '#BAC4D1' : '#1F2937', // this sets the visible text inside the box
//                             }),
//                             placeholder: (base) => ({
//                               ...base,
//                               color: dark ? '#BAC4D1' : '#6B7280', // optional: if you use placeholder text
//                             }),
//                             indicatorsContainer: (base) => ({
//                               ...base,
//                               height: '30px',
//                             }),
//                           }}
//                         />
//                       </div>
//                     </td>
//                     );
//                       }
//                     if (key === 'action') {
//                         return (
//                     <td key={key} className="text-center px-2 py-2">
//                       <button
//                         onClick={() => handleAction(client.client_id, 'exclude')}
//                         className={`px-3 py-1 rounded-sm ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`}
//                       >Exclude</button>
//                       <button
//                         onClick={() => handleAction(client.client_id, 'include')}
//                         className={`px-3 py-1 rounded-sm ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`}
//                       >Include</button>
//                     </td>
//                     );
//                     }

//                     // );
//                     //   }
//                     // <td className="p-2 border">{client.client_name}</td>
//                     // <td className="p-2 border">{client.service}</td>
//                     // <td className="p-2 border">{client.expiry_date}</td>
//                     // <td className="p-2 border">{client.excluded_admins || 'None'}</td>
//                     // <td className="p-2 border">
//                     //   <select
//                     //     className={`p-1 border rounded ${dark ? 'bg-gray-800 text-white' : 'bg-white'}`}
//                     //     value={selectedAdmin[client.client_id] || ''}
//                     //     onChange={e => handleSelect(client.client_id, e.target.value)}
//                     //   >
//                     //     <option value="">Select Admin</option>
//                     //     {admins.map(admin => (
//                     //       <option key={admin.id} value={admin.id}>{admin.name}</option>
//                     //     ))}
//                     //   </select>
//                     // </td>
//                     // <td className="p-2 border space-x-2">
//                     //   <button
//                     //     className={`px-2 py-1 border rounded ${dark ? 'border-slate-400' : 'border-indigo-600 text-indigo-600'}`}
//                     //     onClick={() => handleAction(client.client_id, 'exclude')}
//                     //   >Exclude</button>
//                     //   <button
//                     //     className={`px-2 py-1 border rounded ${dark ? 'border-slate-400' : 'border-indigo-600 text-indigo-600'}`}
//                     //     onClick={() => handleAction(client.client_id, 'include')}
//                     //   >Include</button>
//                     // </td>
//                   </tr>
//                 ))}
//       </tbody>
//     </table>
//         </div >

//     <AlertModal
//       isOpen={showAlert}
//       onClose={() => setShowAlert(false)}
//       message={alertMessage}
//       success={alertMessage.includes('successfully')}
//     />
//       </div >
//     </div >
//   );
// }



import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios';
import AlertModal from '../../components/AlertModal';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useIsMobile from '../../hooks/useIsMobile';
import { useTableSearch } from '../../hooks/useTableSearch';
import { usePersistentWidths } from '../../hooks/usePersistentWidths';
import { Search } from 'lucide-react';

export default function ExcludeClientsSettings() {
  const [clients, setClients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState({});
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [editingCell, setEditingCell] = useState({ id: null, key: null, value: '' });
  const [columnVisibility, setColumnVisibility] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const { dark } = useOutletContext();
  const username = useSelector(state => state.auth.username) || 'default';
  const SORT_STORAGE_KEY = `sortConfig_exclude_clients_${username}`;
  const pageKey = 'excludeClients';
  const isMobile = useIsMobile();

  const defaultColumns = ['client_name', 'service', 'expiry_date', 'excluded_admins', 'admin_dropdown', 'actions'];
  const [columnWidths, setColumnWidths] = usePersistentWidths(pageKey, defaultColumns.length, 150);
  const searchableKeys = ['client_name', 'service', 'expiry_date'];
  const { query, setQuery, filteredData } = useTableSearch(clients, searchableKeys);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [clientsRes, adminsRes] = await Promise.all([
      axios.get('/admin/exclusion-settings'),
      axios.get('/admin/admin-users')
    ]);
    const sample = clientsRes.data[0];
    const customKeys = sample ? Object.keys(sample).filter(k => k.startsWith('custom_')) : [];
    const customCols = customKeys.map(k => ({ dbKey: k, label: k.replace('custom_', '') }));
    const visibility = {
      client_name: true,
      service: true,
      expiry_date: true,
      excluded_admins: true,
      admin_dropdown: true,
      actions: true
    };
    customCols.forEach(c => visibility[c.dbKey] = true);
    setClients(clientsRes.data);
    setAdmins(adminsRes.data);
    setDynamicColumns(customCols);
    setColumnVisibility(visibility);
  };

  const showModal = (msg) => {
    setAlertMessage(msg);
    setShowAlert(true);
  };

  const handleAdminSelect = (clientId, value) => {
    setSelectedAdmin(prev => ({ ...prev, [clientId]: value }));
  };

  const handleExclusionAction = async (clientId, action) => {
    const adminId = selectedAdmin[clientId];
    if (!adminId) return showModal('Select admin first');
    await axios.patch(`/admin/exclusion-settings/${clientId}`, { action, adminId });
    fetchData();
  };

  const getColumnKeyFromIndex = (index) => {
    const staticKeys = defaultColumns;
    if (index < staticKeys.length) return staticKeys[index];
    return dynamicColumns[index - staticKeys.length]?.dbKey;
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const aVal = a[key] || '';
      const bVal = b[key] || '';
      return direction === 'asc'
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });
  }, [filteredData, sortConfig]);


  return (
    <div className="w-full overflow-x-auto min-h-[calc(100vh-190px)]">
      <div className="absolute right-4 top-3 flex items-center gap-2 z-10">
        <div className="relative w-[180px]">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in Table"
            className={`pl-10 pr-3 py-1.5 w-[180px] max-w-xs border rounded-md text-sm ${dark ? 'bg-gray-700 text-white border-gray-700 placeholder-gray-400' : 'bg-gray-100 border-gray-100 text-gray-800 placeholder-gray-500'}`}
          />
        </div>
      </div>

      <div className="mt-3">
        <table className="table-auto text-sm w-full">
          <thead>
            <tr>
              {Object.entries(columnVisibility).map(([key, visible]) =>
                visible && <th key={key} className="px-2 py-2 text-center font-semibold">{key.replace('custom_', '').replace('_', ' ').toUpperCase()}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((client) => (
              <tr key={client.client_id}>
                {columnVisibility.client_name && <td className="px-2 py-2 text-center">{client.client_name}</td>}
                {columnVisibility.service && <td className="px-2 py-2 text-center">{client.service}</td>}
                {columnVisibility.expiry_date && <td className="px-2 py-2 text-center">{client.expiry_date}</td>}
                {columnVisibility.excluded_admins && <td className="px-2 py-2 text-center">{client.excluded_admins}</td>}
                {columnVisibility.admin_dropdown && (
                  <td className="px-2 py-2 text-center">
                    <select value={selectedAdmin[client.client_id] || ''} onChange={(e) => handleAdminSelect(client.client_id, e.target.value)}>
                      <option value="">Select Admin</option>
                      {admins.map(admin => <option key={admin.id} value={admin.id}>{admin.name}</option>)}
                    </select>
                  </td>
                )}
                {columnVisibility.actions && (
                  <td className="px-2 py-2 text-center">
                    <button onClick={() => handleExclusionAction(client.client_id, 'exclude')} className="mr-2">Exclude</button>
                    <button onClick={() => handleExclusionAction(client.client_id, 'include')}>Include</button>
                  </td>
                )}
                {dynamicColumns.map(({ dbKey }) => columnVisibility[dbKey] && (
                  <td key={dbKey} className="px-2 py-2 text-center" onDoubleClick={() =>
                    setEditingCell({ id: client.client_id, key: dbKey, value: client[dbKey] || '' })
                  }>
                    {editingCell.id === client.client_id && editingCell.key === dbKey ? (
                      <input
                        value={editingCell.value}
                        onChange={e => setEditingCell({ ...editingCell, value: e.target.value })}
                        onBlur={async () => {
                          await axios.patch(`/admin/update-client-field/${client.client_id}`, {
                            key: dbKey,
                            value: editingCell.value
                          });
                          setEditingCell({ id: null, key: null, value: '' });
                          fetchData();
                        }}
                        autoFocus
                      />
                    ) : client[dbKey] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAlert && <AlertModal message={alertMessage} onClose={() => setShowAlert(false)} />}
    </div>
  );
}
