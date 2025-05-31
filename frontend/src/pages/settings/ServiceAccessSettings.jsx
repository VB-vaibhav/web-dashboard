// import React, { useEffect, useState, useRef } from 'react';
// import axios from '../../api/axios';
// import AlertModal from '../../components/AlertModal';
// import { useOutletContext } from 'react-router-dom';
// import { useTableSearch } from '../../hooks/useTableSearch';
// import { Search, MoreVertical, PlusCircle, MinusCircle } from 'lucide-react';
// import Select from 'react-select';
// import useIsMobile from '../../hooks/useIsMobile';
// import MobileServiceAccessUI from './MobileServiceAccessUI';

// export default function ServiceAccessSettings() {
//   const [users, setUsers] = useState([]);
//   const { query, setQuery, filteredData } = useTableSearch(users, ['name', 'role']);
//   const [selected, setSelected] = useState([]);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [showAlert, setShowAlert] = useState(false);
//   const isMobile = useIsMobile();

//   // const dark = document.documentElement.classList.contains('dark');
//   const { dark } = useOutletContext();

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     const res = await axios.get('/admin/service-access-users');
//     setUsers(res.data);
//   };

//   const handleCheckboxChange = (id) => {
//     setSelected(prev =>
//       prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
//     );
//   };

//   const handleToggle = async (id, key) => {
//     const updatedValue = users.find(u => u.id === id)?.[key] ? 0 : 1;

//     // Optimistic UI update
//     setUsers(prev =>
//       prev.map(user =>
//         user.id === id ? { ...user, [key]: updatedValue } : user
//       )
//     );

//     try {
//       await axios.patch(`/admin/update-service-access/${id}`, { [key]: updatedValue });
//     } catch (err) {
//       console.error('Update failed:', err);
//       alert('Failed to save. Try again.');
//     }
//   };

//   const showModal = (message) => {
//     setAlertMessage(message);
//     setShowAlert(true);
//   };

//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);


//   const [showDropdown, setShowDropdown] = useState(false);

//   const handleIncludeAll = () => {
//     if (selected.length === 0) {
//       showModal("No row is selected");
//       return;
//     }

//     const updated = users.map(user => {
//       if (selected.includes(user.id)) {
//         const updatedUser = { ...user };
//         ['is_vps', 'is_cerberus', 'is_proxy', 'is_storage', 'is_varys'].forEach(key => {
//           updatedUser[key] = 1;
//           axios.patch(`/admin/update-service-access/${user.id}`, { [key]: 1 }).catch(console.error);
//         });
//         return updatedUser;
//       }
//       return user;
//     });

//     setUsers(updated);
//     setShowDropdown(false);
//   };

//   const handleExcludeAll = () => {
//     if (selected.length === 0) {
//       showModal("No row is selected");
//       return;
//     }

//     const updated = users.map(user => {
//       if (selected.includes(user.id)) {
//         const updatedUser = { ...user };
//         ['is_vps', 'is_cerberus', 'is_proxy', 'is_storage', 'is_varys'].forEach(key => {
//           updatedUser[key] = 0;
//           axios.patch(`/admin/update-service-access/${user.id}`, { [key]: 0 }).catch(console.error);
//         });
//         return updatedUser;
//       }
//       return user;
//     });

//     setUsers(updated);
//     setShowDropdown(false);
//   };

//   const [serviceModalType, setServiceModalType] = useState(null); // "include" or "exclude"
//   const [showServiceModal, setShowServiceModal] = useState(false);
//   const [selectedServices, setSelectedServices] = useState([]);

//   const allServiceKeys = [
//     { label: 'Cloud Server', key: 'is_vps' },
//     { label: 'Cerberus', key: 'is_cerberus' },
//     { label: 'Proxy', key: 'is_proxy' },
//     { label: 'Storage Server', key: 'is_storage' },
//     { label: 'Varys', key: 'is_varys' }
//   ];

//   const openServiceActionModal = (type) => {
//     if (selected.length === 0) {
//       showModal("No row is selected");
//       return;
//     }
//     setServiceModalType(type);
//     setShowServiceModal(true);
//     setSelectedServices([]); // reset dropdown
//   };

//   const closeServiceModal = () => {
//     setShowServiceModal(false);
//     setSelectedServices([]);
//   };

//   const handleApplyServiceAction = () => {
//     if (selectedServices.length === 0) {
//       showModal("Please select at least one service.");
//       return;
//     }

//     const updated = users.map(user => {
//       if (selected.includes(user.id)) {
//         const updatedUser = { ...user };
//         selectedServices.forEach(serviceKey => {
//           updatedUser[serviceKey] = serviceModalType === 'include' ? 1 : 0;
//           axios.patch(`/admin/update-service-access/${user.id}`, {
//             [serviceKey]: serviceModalType === 'include' ? 1 : 0
//           }).catch(console.error);
//         });
//         return updatedUser;
//       }
//       return user;
//     });

//     setUsers(updated);
//     closeServiceModal();
//     setShowDropdown(false);
//   };

//   const closeModal = () => setShowAlert(false);

//   const renderCell = (user, key) => {
//     const isIncluded = user[key] === 1;

//     const handleClick = (actionType) => {
//       if ((isIncluded && actionType === 'included') || (!isIncluded && actionType === 'excluded')) {
//         const msg = isIncluded
//           ? 'This service is already included for this user.'
//           : 'This service is already excluded for this user.';
//         showModal(msg);
//         return;
//       }
//       handleToggle(user.id, key);
//     };


//     return (
//       <div className="flex gap-2 justify-center items-center">
//         <button
//           className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-all
//             ${!isIncluded
//               ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`
//               : `{ ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent}`
//             }`}
//           onClick={() => handleClick('excluded')}
//         >
//           {isIncluded ? 'Exclude' : 'Excluded'}
//         </button>

//         <button
//           className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all
//             ${isIncluded
//               ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`
//               : `{ ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent}`
//             }`}
//           onClick={() => handleClick('included')}
//         >
//           {isIncluded ? 'Included' : 'Include'}
//         </button>
//       </div>
//     );
//   };

//   return (
//     <>
//       {isMobile ? (
//         <MobileServiceAccessUI
//           dark={dark}
//           users={users}
//           selected={selected}
//           setSelected={setSelected}
//           handleToggle={handleToggle}
//           allServiceKeys={allServiceKeys}
//           openServiceActionModal={openServiceActionModal}
//           showModal={showModal}
//           serviceModalType={serviceModalType}
//           setShowServiceModal={setShowServiceModal}
//         />
//       ) : (
//         <div>
//           <div className="absolute right-4 top-5 flex items-center gap-2 z-10">
//             {/* Search Input */}
//             <div className="relative w-[180px]">
//               <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
//                 <Search size={16} />
//               </span>
//               <input
//                 type="text"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search in Table"
//                 className={`pl-10 pr-3 py-1.5 w-[180px] max-w-xs border rounded-md text-sm
//               ${dark
//                     ? 'bg-gray-700 text-white border-gray-700 placeholder-gray-400'
//                     : 'bg-gray-100 border-gray-100 text-gray-800 placeholder-gray-500'}`}
//               />
//             </div>
//             {/* 3 Dots Button */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setShowDropdown(prev => !prev)}
//                 className={`p-1.5 ml-3 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}
//               >
//                 <MoreVertical size={18} />
//               </button>

//               {showDropdown && (
//                 <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-20 p-2
//         ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
//                   {/* <button
//                     onClick={handleIncludeAll}
//                     className={`w-full text-left px-3 py-1.5 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}
//                   >
//                     Include All
//                   </button>
//                   <button
//                     onClick={handleExcludeAll}
//                     className={`w-full text-left px-3 py-1.5 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}
//                   >
//                     Exclude All
//                   </button> */}
//                   <button
//                     onClick={() => openServiceActionModal('include')}
//                     className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}
//                   >
//                     <PlusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
//                     <span>Include</span>
//                   </button>
//                   <button
//                     onClick={() => openServiceActionModal('exclude')}
//                     className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}
//                   >
//                     <MinusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
//                     <span>Exclude</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className={`overflow-x-auto rounded-sm 
//                 ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>

//             <table className="min-w-full text-sm table-auto">
//               <thead className={`${dark ? 'bg-gray-800 text-slate-400' : 'bg-white text-slate-400'}`}>
//                 <tr className={`border-b ${dark ? 'border-gray-700' : 'border-gray-300'} text-sm font-medium`}>
//                   <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300 '}`}><input type="checkbox" checked={selected.length === users.length} onChange={() =>
//                     setSelected(selected.length === users.length ? [] : users.map(u => u.id))} className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`} /></th>
//                   <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Name</th>
//                   <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Role</th>
//                   <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Cloud Server</th>
//                   <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Cerberus</th>
//                   <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Proxy</th>
//                   <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Storage Server</th>
//                   <th className="px-4 py-3 font-semibold">Varys</th>
//                 </tr>
//               </thead>
//               <tbody>

//                 {filteredData.length === 0 ? (
//                   <tr>
//                     <td colSpan={8} className="text-center py-6 text-sm text-gray-500">
//                       No search result found
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredData.map(user => (
//                     <tr key={user.id}>
//                       <td className="px-4 py-2 text-center">
//                         <input
//                           type="checkbox"
//                           checked={selected.includes(user.id)}
//                           onChange={() => handleCheckboxChange(user.id)}
//                           className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
//                         />
//                       </td>
//                       <td className="px-4 py-2 text-center">{user.name}</td>
//                       <td className="px-4 py-2 capitalize text-center">{user.role}</td>
//                       <td className="px-4 py-2 text-center">{renderCell(user, 'is_vps')}</td>
//                       <td className="px-4 py-2 text-center">{renderCell(user, 'is_cerberus')}</td>
//                       <td className="px-4 py-2 text-center">{renderCell(user, 'is_proxy')}</td>
//                       <td className="px-4 py-2 text-center">{renderCell(user, 'is_storage')}</td>
//                       <td className="px-4 py-2 text-center">{renderCell(user, 'is_varys')}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//       <AlertModal
//         isOpen={showAlert}
//         message={alertMessage}
//         onClose={closeModal}
//         dark={dark}
//       />
//       {showServiceModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center ">
//           <div className={`rounded-lg p-6 max-w-sm w-80 shadow-lg ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Access to Service Panels</h2>
//               <button onClick={closeServiceModal} className="text-xl font-bold">×</button>
//             </div>

//             <label className="text-sm font-medium mb-1 block">Services</label>
//             <Select
//               isMulti
//               options={allServiceKeys.map(service => ({
//                 label: service.label,
//                 value: service.key
//               }))}
//               value={allServiceKeys
//                 .filter(service => selectedServices.includes(service.key))
//                 .map(service => ({ label: service.label, value: service.key }))}
//               onChange={(selectedOptions) => {
//                 const values = selectedOptions.map(opt => opt.value);
//                 setSelectedServices(values);
//               }}
//               className="mb-4 text-sm"
//               classNamePrefix="react-select"
//               placeholder="Select services"
//               styles={{
//                 control: (base) => ({
//                   ...base,
//                   borderRadius: '6px',
//                   padding: '2px 4px',
//                   borderColor: dark ? '#4B5563' : '#CBD5E0',
//                   backgroundColor: dark ? '#374151' : '#fff',
//                   color: dark ? '#E5E7EB' : '#111827'
//                 }),
//                 multiValue: (base) => ({
//                   ...base,
//                   backgroundColor: dark ? '#4B5563' : '#E0E7FF'
//                 }),
//                 menu: (base) => ({
//                   ...base,
//                   zIndex: 99,
//                   backgroundColor: dark ? '#1F2937' : '#fff',
//                   color: dark ? '#E5E7EB' : '#111827'
//                 }),
//                 option: (base, state) => ({
//                   ...base,
//                   backgroundColor: state.isFocused
//                     ? (dark ? '#374151' : '#E0E7FF')
//                     : (dark ? '#1F2937' : '#fff'),
//                   color: dark ? '#E5E7EB' : '#111827',
//                   cursor: 'pointer'
//                 }),
//                 singleValue: (base) => ({
//                   ...base,
//                   color: dark ? '#E5E7EB' : '#1F2937'
//                 }),
//                 placeholder: (base) => ({
//                   ...base,
//                   color: dark ? '#9CA3AF' : '#6B7280'
//                 }),
//                 input: (base) => ({
//                   ...base,
//                   color: dark ? '#F9FAFB' : '#1F2937'
//                 }),
//               }}

//             />


//             <button
//               onClick={handleApplyServiceAction}
//               className={`w-full py-2 rounded-md ${dark ? 'bg-gray-600 text-slate-300 border-gray-600 hover:bg-gray-700' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} text-sm`}
//             >
//               {serviceModalType === 'include' ? 'Include' : 'Exclude'}
//             </button>
//           </div>
//         </div>
//       )}

//     </>
//   );
// }


import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios';
import AlertModal from '../../components/AlertModal';
import { useOutletContext } from 'react-router-dom';
import { useTableSearch } from '../../hooks/useTableSearch';
import { Search, MoreVertical, PlusCircle, MinusCircle } from 'lucide-react';
import Select from 'react-select';
import useIsMobile from '../../hooks/useIsMobile';
import MobileServiceAccessUI from './MobileServiceAccessUI';

export default function ServiceAccessSettings() {
  const [users, setUsers] = useState([]);
  const { query, setQuery, filteredData } = useTableSearch(users, ['name', 'role']);
  const [selected, setSelected] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [serviceModalType, setServiceModalType] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const dropdownRef = useRef(null);
  const isMobile = useIsMobile();
  const { dark } = useOutletContext();

  const allServiceKeys = [
    { label: 'Cloud Server', key: 'is_vps' },
    { label: 'Cerberus', key: 'is_cerberus' },
    { label: 'Proxy', key: 'is_proxy' },
    { label: 'Storage Server', key: 'is_storage' },
    { label: 'Varys', key: 'is_varys' }
  ];

  const useResizableColumns = (initialWidths) => {
    const [columnWidths, setColumnWidths] = useState(initialWidths);

    const startResizing = (index, e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = columnWidths[index];

      const handleMouseMove = (e) => {
        const delta = e.clientX - startX;
        const newWidths = [...columnWidths];
        newWidths[index] = Math.max(startWidth + delta, 80);
        setColumnWidths(newWidths);
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
    return { columnWidths, startResizing, totalWidth };
  };

  const { columnWidths, startResizing, totalWidth } = useResizableColumns([60, 160, 120, 140, 140, 140, 140, 140]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('/admin/service-access-users');
    setUsers(res.data);
  };

  const handleCheckboxChange = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggle = async (id, key) => {
    const updatedValue = users.find(u => u.id === id)?.[key] ? 0 : 1;
    setUsers(prev => prev.map(user => user.id === id ? { ...user, [key]: updatedValue } : user));
    try {
      await axios.patch(`/admin/update-service-access/${id}`, { [key]: updatedValue });
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to save. Try again.');
    }
  };

  const openServiceActionModal = (type) => {
    if (selected.length === 0) {
      showModal("No row is selected");
      return;
    }
    setServiceModalType(type);
    setShowServiceModal(true);
    setSelectedServices([]);
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setSelectedServices([]);
  };

  const handleApplyServiceAction = () => {
    if (selectedServices.length === 0) {
      showModal("Please select at least one service.");
      return;
    }
    const updated = users.map(user => {
      if (selected.includes(user.id)) {
        const updatedUser = { ...user };
        selectedServices.forEach(serviceKey => {
          updatedUser[serviceKey] = serviceModalType === 'include' ? 1 : 0;
          axios.patch(`/admin/update-service-access/${user.id}`, {
            [serviceKey]: serviceModalType === 'include' ? 1 : 0
          }).catch(console.error);
        });
        return updatedUser;
      }
      return user;
    });
    setUsers(updated);
    closeServiceModal();
    setShowDropdown(false);
  };

  const showModal = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const closeModal = () => setShowAlert(false);

  const renderCell = (user, key) => {
    const isIncluded = user[key] === 1;
    const handleClick = (type) => {
      if ((isIncluded && type === 'included') || (!isIncluded && type === 'excluded')) {
        showModal(isIncluded ? 'Already Included' : 'Already Excluded');
        return;
      }
      handleToggle(user.id, key);
    };
    return (
      <div className="flex gap-2 justify-center items-center">
        <button onClick={() => handleClick('excluded')} className={`px-3 py-1.5 text-xs font-medium border rounded ${isIncluded
              ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`
              : `{ ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent}`
            }`}>{isIncluded ? 'Exclude' : 'Excluded'}</button>
        <button onClick={() => handleClick('included')} className={`px-3 py-1.5 text-xs font-medium border rounded ${!isIncluded
              ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`
              : `{ ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent}`
            }`}>{isIncluded ? 'Included' : 'Include'}</button>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <MobileServiceAccessUI
        dark={dark}
        users={users}
        selected={selected}
        setSelected={setSelected}
        handleToggle={handleToggle}
        allServiceKeys={allServiceKeys}
        openServiceActionModal={openServiceActionModal}
        showModal={showModal}
        serviceModalType={serviceModalType}
        setShowServiceModal={setShowServiceModal}
      />
    );
  }

  return (
    <div className="w-full max-w-[calc(100vw-4rem)] overflow-hidden">
      <div className="absolute right-4 top-5 flex items-center gap-2 z-10">
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
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(prev => !prev)} className={`p-1.5 ml-3 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}>
            <MoreVertical size={18} />
          </button>
          {showDropdown && (
            <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
              <button onClick={() => openServiceActionModal('include')} className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                <PlusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Include</span>
              </button>
              <button onClick={() => openServiceActionModal('exclude')} className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                <MinusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Exclude</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto mt-3">
        <div style={{ width: `${totalWidth}px`, minWidth: '100%', paddingRight: '4px' }}>
          <table className="table-auto text-sm min-w-full">
            <thead>
              <tr>
                {['', 'Name', 'Role', 'Cloud Server', 'Cerberus', 'Proxy', 'Storage Server', 'Varys'].map((label, index) => (
                  <th key={index} style={{ width: columnWidths[index], minWidth: 80 }} className={`relative px-4 py-3 font-semibold border-r group ${dark ? 'border-gray-700' : 'border-gray-300'} text-center whitespace-nowrap`}>
                    <div className="flex justify-center items-center text-center">
                      {label === '' ? (
                        <input type="checkbox" checked={selected.length === users.length} onChange={() => setSelected(selected.length === users.length ? [] : users.map(u => u.id))} className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`} />
                      ) : label}
                    </div>
                    <div onMouseDown={(e) => startResizing(index, e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize group-hover:bg-indigo-400 z-10" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-6 text-sm text-gray-500">No search result found</td></tr>
              ) : (
                filteredData.map(user => (
                  <tr key={user.id}>
                    {[<input type="checkbox" checked={selected.includes(user.id)} onChange={() => handleCheckboxChange(user.id)} className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`} />, user.name, user.role, renderCell(user, 'is_vps'), renderCell(user, 'is_cerberus'), renderCell(user, 'is_proxy'), renderCell(user, 'is_storage'), renderCell(user, 'is_varys')].map((cell, index) => (
                      <td key={index} style={{ width: columnWidths[index], minWidth: 80 }} className="px-4 py-2 text-center">{cell}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertModal isOpen={showAlert} message={alertMessage} onClose={closeModal} dark={dark} />

      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className={`rounded-lg p-6 max-w-sm w-80 shadow-lg ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Access to Service Panels</h2>
              <button onClick={closeServiceModal} className="text-xl font-bold">×</button>
            </div>
            <label className="text-sm font-medium mb-1 block">Services</label>
            <Select
              isMulti
              options={allServiceKeys.map(service => ({ label: service.label, value: service.key }))}
              value={allServiceKeys.filter(service => selectedServices.includes(service.key)).map(service => ({ label: service.label, value: service.key }))}
              onChange={(selectedOptions) => setSelectedServices(selectedOptions.map(opt => opt.value))}
              className="mb-4 text-sm"
              classNamePrefix="react-select"
              placeholder="Select services"
              styles={{
                control: (base) => ({ ...base, borderRadius: '6px', padding: '2px 4px', borderColor: dark ? '#4B5563' : '#CBD5E0', backgroundColor: dark ? '#374151' : '#fff', color: dark ? '#E5E7EB' : '#111827' }),
                multiValue: (base) => ({ ...base, backgroundColor: dark ? '#4B5563' : '#E0E7FF' }),
                menu: (base) => ({ ...base, zIndex: 99, backgroundColor: dark ? '#1F2937' : '#fff', color: dark ? '#E5E7EB' : '#111827' }),
                option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? (dark ? '#374151' : '#E0E7FF') : (dark ? '#1F2937' : '#fff'), color: dark ? '#E5E7EB' : '#111827', cursor: 'pointer' }),
                singleValue: (base) => ({ ...base, color: dark ? '#E5E7EB' : '#1F2937' }),
                placeholder: (base) => ({ ...base, color: dark ? '#9CA3AF' : '#6B7280' }),
                input: (base) => ({ ...base, color: dark ? '#F9FAFB' : '#1F2937' })
              }}
            />
            <button onClick={handleApplyServiceAction} className={`w-full py-2 rounded-md ${dark ? 'bg-gray-600 text-slate-300 border-gray-600 hover:bg-gray-700' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} text-sm`}>
              {serviceModalType === 'include' ? 'Include' : 'Exclude'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
