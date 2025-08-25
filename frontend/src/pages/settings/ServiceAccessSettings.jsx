import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios';
import AlertModal from '../../components/AlertModal';
import { useOutletContext } from 'react-router-dom';
import { useTableSearch } from '../../hooks/useTableSearch';
import { Search, MoreVertical, PlusCircle, MinusCircle, Plus, Trash2, ChevronRight, Layout, Columns, Check, ArrowUpAZ, ArrowDownAZ, ListFilter, XCircle } from 'lucide-react';
import Select from 'react-select';
import useIsMobile from '../../hooks/useIsMobile';
import MobileServiceAccessUI from './MobileServiceAccessUI';
import { useSelector } from 'react-redux';
import PageWrapper from '../../components/PageWrapper';

export default function ServiceAccessSettings() {
  const [users, setUsers] = useState([]);
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
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, columnIndex: null });
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [visibleForAll, setVisibleForAll] = useState(true);
  const [editingHeader, setEditingHeader] = useState(null);
  const [newHeaderLabel, setNewHeaderLabel] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [editingCell, setEditingCell] = useState({ id: null, key: null, value: '' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const username = useSelector(state => state.auth.username) || 'default';
  const userId = useSelector(state => state.auth.id);
  const role = useSelector(state => state.auth.role);
  const SORT_STORAGE_KEY = `sortConfig_service_access_${username}`;


  const handleHeaderContextMenu = (e, index) => {
    e.preventDefault();

    const menuWidth = 190; // You can also measure this dynamically via ref if needed
    const screenWidth = window.innerWidth;
    const buffer = 10; // Optional gap from edge

    const clickX = e.clientX;
    const clickY = e.clientY;

    const openLeft = (clickX + menuWidth + buffer) > screenWidth;

    const finalX = openLeft ? (clickX - menuWidth) : clickX;

    const isCustom = index >= 8 && dynamicColumns[index - 8]?.dbKey?.startsWith('custom_');

    setContextMenu({
      visible: true,
      x: finalX,
      y: clickY,
      columnIndex: index,
      allowDelete: isCustom,
      openLeft
    });
  };

  const submenuRef = useRef(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [submenuFlipLeft, setSubmenuFlipLeft] = useState(false);
  const submenuTriggerRef = useRef(null);

  useEffect(() => {
    if (submenuRef.current) {
      const rect = submenuRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.left;
      const submenuWidth = 200; // approximate width
      setSubmenuFlipLeft(spaceRight < submenuWidth + 16); // buffer
    }
  }, [contextMenu]);


  const allServiceKeys = [
    { label: 'Cloud Server', key: 'is_vps' },
    { label: 'Cerberus', key: 'is_cerberus' },
    { label: 'Proxy', key: 'is_proxy' },
    { label: 'Storage Server', key: 'is_storage' },
    { label: 'Varys', key: 'is_varys' }
  ];

  // const [columnWidthsState, setColumnWidths] = useState([]);
  const [columnWidths, setColumnWidths] = useState([]);
  const [columnInitDone, setColumnInitDone] = useState(false);

  useEffect(() => {
    if ((8 + dynamicColumns.length) > 0 && !columnInitDone) {
      const totalCols = 7 + dynamicColumns.length;
      const saved = localStorage.getItem('columnWidths_service_access');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length === totalCols) {
            setColumnWidths(parsed);
          } else {
            setColumnWidths(Array(totalCols).fill(150));
          }
        } catch {
          setColumnWidths(Array(totalCols).fill(150));
        }
      } else {
        setColumnWidths(Array(totalCols).fill(150));
      }
      setColumnInitDone(true);
    }
  }, [dynamicColumns.length, columnInitDone]);


  // useEffect(() => {
  //     // total columns = 8 static + dynamic
  //     // setColumnWidths(Array(8 + dynamicColumns.length).fill(150));
  //     setColumnWidths([
  //         40,  // Checkbox column
  //         100, // Name
  //         80, // Role
  //         150, // Cloud Server
  //         150, // Cerberus
  //         150, // Proxy
  //         150, // Storage Server
  //         150, // Varys
  //         ...Array(dynamicColumns.length).fill(150) // dynamic columns
  //     ]);
  // }, [dynamicColumns.length]);


  const useResizableColumns = (columnWidths, setColumnWidths) => {
    // const [columnWidths, setColumnWidths] = useState(initialWidths);

    const startResizing = (index, e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = columnWidths[index];

      const handleMouseMove = (e) => {
        const delta = e.clientX - startX;
        const newWidths = [...columnWidths];
        const next = index + 1;

        newWidths[index] = Math.max(startWidth + delta, 40);

        // Reduce width of next column to preserve layout
        if (next < newWidths.length) {
          // newWidths[next] = Math.max(newWidths[next] - delta, 40);
          newWidths[index] = Math.max(startWidth + delta, 40);

        }

        setColumnWidths(newWidths);
        localStorage.setItem('columnWidths_service_access', JSON.stringify(newWidths));

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

  // const { columnWidths, startResizing, totalWidth } = useResizableColumns([40, 100, 80, 150, 150, 150, 150, 150]);

  // const { columnWidths, startResizing, totalWidth } = useResizableColumns(columnWidthsState, setColumnWidths);
  const { startResizing, totalWidth } = useResizableColumns(columnWidths, setColumnWidths);



  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleColumnVisibility = (key) => {
    setColumnVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const [searchableColumns, setSearchableColumns] = useState(['name', 'role']);
  const { query, setQuery, filteredData } = useTableSearch(users || [], searchableColumns);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/service-access-users');
      const fetchedUsers = res.data;

      setUsers(fetchedUsers);

      const sample = fetchedUsers[0];
      const dynamicKeys = sample ? Object.keys(sample).filter(k => k.startsWith('custom_')) : [];
      const metaRes = await axios.get('/admin/custom-columns?pageKey=serviceAccess');
      const dynamicCols = metaRes.data.map(col => ({
        dbKey: col.column_name,
        label: col.label,
        createdBy: col.created_by,
        isGlobal: col.is_global === 1
      }));

      // const dynamicCols = dynamicKeys.map(col => ({
      //   dbKey: col,
      //   label: col.replace('custom_', '')
      // }));

      setDynamicColumns(dynamicCols);

      const staticSearchableKeys = ['name', 'username', 'email'];

      const dynamicSearchableKeys = dynamicCols.map(col => col.dbKey); // optional: filter some out
      const SEARCHABLE_COLUMNS = [...staticSearchableKeys, ...dynamicSearchableKeys];
      setSearchableColumns(SEARCHABLE_COLUMNS);

      // setColumnInitDone(false); // force localStorage reload after new columns are detected
      setTimeout(() => {
        const totalCols = 8 + dynamicCols.length;
        const saved = localStorage.getItem('columnWidths_service_access');
        // if (saved) {
        //     try {
        //         const parsed = JSON.parse(saved);
        //         if (parsed.length === totalCols) {
        //             setColumnWidths(parsed);
        //         } else {
        //             // Stretch or truncate based on new length
        //             const resized = parsed.concat(Array(totalCols - parsed.length).fill(150)).slice(0, totalCols);
        //             setColumnWidths(resized);
        //             localStorage.setItem('columnWidths_service_access', JSON.stringify(resized));
        //         }
        //     } catch {
        //         setColumnWidths(Array(totalCols).fill(150));
        //     }
        // } else {
        //     setColumnWidths(Array(totalCols).fill(150));
        // }
        // setColumnInitDone(true);

        let newWidths;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.length === totalCols) {
              newWidths = parsed;
            } else {
              newWidths = parsed.concat(Array(totalCols - parsed.length).fill(150)).slice(0, totalCols);
            }
          } catch {
            newWidths = null;
          }
        }

        if (!newWidths) {
          newWidths = [
            40,   // checkbox
            100,  // name
            80,   // role
            150,  // is_vps
            150,  // is_cerberus
            150,  // is_proxy
            150,  // is_storage
            150,  // is_varys
            ...Array(dynamicCols.length).fill(150) // dynamic columns
          ];
        }

        // Finalize
        setColumnWidths(newWidths);
        localStorage.setItem('columnWidths_service_access', JSON.stringify(newWidths));
        setColumnInitDone(true);

      }, 100); // ✅ delay ensures new dynamicCols are set


      const visibilityObj = {
        select: true,
        name: true, role: true,
        is_vps: true, is_cerberus: true, is_proxy: true, is_storage: true, is_varys: true,
      };

      dynamicCols.forEach(col => visibilityObj[col.dbKey] = true);
      setColumnVisibility(visibilityObj);
    } catch (err) {
      console.error('Fetch users failed:', err);
    }
  };


  const handleAddColumn = async () => {
    const trimmed = newColumnName.trim();
    // if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
    //   showModal("Invalid column name.");
    //   return;
    // }
    if (!trimmed || trimmed.length < 2) {
      showModal("Column name must be at least 2 characters.");
      return;
    }

    const prefixed = `custom_${trimmed}`;
    try {
      // await axios.post('/admin/add-column', { columnName: trimmed, pageKey: 'serviceAccess', label: trimmed });
      // localStorage.removeItem('columnWidths_service_access');
      await axios.post('/admin/add-column', {
        pageKey: 'serviceAccess',
        label: newColumnName.trim(),  // e.g. "Facebook Lite"
        isGlobal: visibleForAll
      });

      const existing = localStorage.getItem('columnWidths_service_access');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 8 + (dynamicColumns.length + 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_service_access', JSON.stringify(adjustedWidths));

      showModal("Column added successfully.");
      fetchUsers();
      setShowAddColumnModal(false);
      setNewColumnName('');
    } catch (err) {
      showModal("Failed to add column.");
    }
  };

  const handleDeleteColumn = async (index) => {
    // const columnToDelete = dynamicColumns[index - 8]?.dbKey;
    // if (!columnToDelete) return;
    const column = dynamicColumns[index - 8];
    if (!column) return;

    if (column.isGlobal && role !== 'superadmin' && column.createdBy !== userId) {
      showModal("Only Superadmin or Creator can delete");
      return;
    }

    const columnToDelete = column.dbKey;


    const confirmed = window.confirm(`Delete column "${columnToDelete}"?`);
    if (!confirmed) return;

    try {
      await axios.delete('/admin/delete-column', { data: { columnName: columnToDelete, pageKey: 'serviceAccess' } });
      // localStorage.removeItem('columnWidths_service_access');
      const existing = localStorage.getItem('columnWidths_service_access');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 7 + (dynamicColumns.length - 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_service_access', JSON.stringify(adjustedWidths));

      showModal("Column deleted.");
      fetchUsers();
    } catch (err) {
      const message = err?.response?.data?.error || "Delete failed.";
      showModal(message);
    }

    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRenameColumn = async (oldDbKey, newLabel) => {
    const newDbKey = `custom_serviceAccess_${newLabel.trim().replace(/\s+/g, '_')}`;
    // const newDbKey = `custom_${newLabel.trim().replace(/\s+/g, '_')}`;
    try {
      await axios.patch('/admin/rename-column', {
        oldColumn: oldDbKey,
        newColumn: newDbKey,
        newLabel: newLabel.trim()
      });
      setEditingHeader(null);
      fetchUsers();
    } catch (err) {
      showModal('Rename failed.');
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);



  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);




  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const key = sortConfig.key;
    const direction = sortConfig.direction;

    return [...filteredData].sort((a, b) => {
      const aRaw = key === 'select' ? (selected.includes(a.id) ? 0 : 1) : a[key];
      const bRaw = key === 'select' ? (selected.includes(b.id) ? 0 : 1) : b[key];

      const aNum = parseFloat(aRaw);
      const bNum = parseFloat(bRaw);

      const aIsNum = !isNaN(aNum) && aRaw.toString().trim() === aNum.toString();
      const bIsNum = !isNaN(bNum) && bRaw.toString().trim() === bNum.toString();

      if (aIsNum && bIsNum) {
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const aStr = (aRaw || '').toString().toLowerCase();
      const bStr = (bRaw || '').toString().toLowerCase();

      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, selected]);

  useEffect(() => {
    const savedSort = localStorage.getItem(SORT_STORAGE_KEY);
    if (savedSort) {
      try {
        const parsed = JSON.parse(savedSort);
        setSortConfig(parsed);
      } catch {
        console.warn('Invalid sort config found in localStorage');
      }
    }
  }, []);


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

  const getColumnKeyFromIndex = (index) => {
    const staticKeys = ['select', 'name', 'role', 'is_vps', 'is_cerberus', 'is_proxy', 'is_storage', 'is_varys'];
    if (index < staticKeys.length) return staticKeys[index];
    return dynamicColumns[index - staticKeys.length]?.dbKey;
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

  const autoResizeColumn = (index) => {
    // Get key for the column
    const key = getColumnKeyFromIndex(index);
    if (!key) return;

    let maxWidth = 40; // start with min width

    // Measure width of each cell in this column
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.font = '14px sans-serif';
    document.body.appendChild(tempSpan);

    users.forEach(user => {
      const text = (user[key] || '').toString();
      tempSpan.innerText = text;
      const width = tempSpan.offsetWidth + 24; // add padding/margin buffer
      if (width > maxWidth) maxWidth = width;
    });

    document.body.removeChild(tempSpan);

    // Apply the new width
    const newWidths = [...columnWidths];
    newWidths[index] = Math.max(maxWidth, 60); // Enforce min width
    setColumnWidths(newWidths);
    localStorage.setItem('columnWidths_service_access', JSON.stringify(newWidths));
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
    <PageWrapper>
      <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto  min-h-[calc(100vh-12em)] ">
        <div className="h-full max-h-[calc(100vh-14em)]">
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

          <div className=" mt-3">
            <div style={{ width: `${totalWidth}px`, minWidth: `100%` }}>
              {/* <div className="min-w-max" style={{ width: `${totalWidth}px`, maxWidth: '100%' }}> */}

              <table className="table-auto text-sm w-full ">
                <thead className={`sticky top-0 ${dark ? "bg-gray-800" : "bg-white"}`}>
                  <tr>
                    {['select', 'name', 'role', 'is_vps', 'is_cerberus', 'is_proxy', 'is_storage', 'is_varys'].map((key, index) => {
                      if (!columnVisibility[key]) return null;

                      const labelMap = {
                        select: '',
                        name: 'Name',
                        role: 'Role',
                        is_vps: 'Cloud Server',
                        is_cerberus: 'Cerberus',
                        is_proxy: 'Proxy',
                        is_storage: 'Storage Server',
                        is_varys: 'Varys',
                        '': ''
                      };

                      return (
                        <th
                          key={index}
                          onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                          style={{ width: columnWidths[index] || 40, minWidth: 40 }}
                          className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-700' : 'border-gray-300'}  
        ${index === 0 ? 'text-left' : 'text-center'} whitespace-nowrap`}
                        >
                          <div className={`${index === 0 ? 'flex justify-start' : 'flex justify-center'} items-center`}>
                            {key === 'select' ? (
                              <input
                                type="checkbox"
                                checked={selected.length === users.length}
                                onChange={() => setSelected(selected.length === users.length ? [] : users.map(u => u.id))}
                                className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                              />
                            ) : (
                              labelMap[key]
                            )}
                          </div>
                          <div
                            onMouseDown={(e) => startResizing(index, e)}
                            onDoubleClick={(e) => {
                              e.stopPropagation(); // avoid bubbling to th
                              autoResizeColumn(index);
                            }}
                            // onDoubleClick={() => autoResizeColumn(index)}
                            className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
                          />
                        </th>
                      );
                    })}
                    {dynamicColumns.map(({ dbKey, label }, i) => {
                      const index = 8 + i; // after 8 static columns
                      const isEditing = editingHeader === dbKey;
                      return columnVisibility[dbKey] && (
                        <th
                          key={`dynamic-${i}`}
                          onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                          style={{ width: columnWidths[index] || 40, minWidth: 40 }}
                          className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-700' : 'border-gray-300'} text-center whitespace-nowrap`}
                          onDoubleClick={() => {
                            setEditingHeader(dbKey);
                            setNewHeaderLabel(label);
                          }}
                        >
                          {isEditing ? (
                            <input
                              className="text-sm px-1 py-0.5 border rounded w-28 text-center"
                              value={newHeaderLabel}
                              onChange={(e) => setNewHeaderLabel(e.target.value)}
                              onBlur={() => handleRenameColumn(dbKey, newHeaderLabel)}
                              autoFocus
                            />
                          ) : (
                            label
                          )}
                          <div
                            onMouseDown={(e) => startResizing(index, e)}
                            onDoubleClick={(e) => {
                              e.stopPropagation(); // avoid bubbling to th
                              autoResizeColumn(index);
                            }}
                            // onDoubleClick={() => autoResizeColumn(index)}
                            className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
                          />
                        </th>
                      );
                    })}

                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr><td colSpan={8} className="py-6 text-sm text-gray-500 text-center">No search result found</td></tr>
                  ) : (
                    sortedData.map(user => (
                      <tr key={user.id}
                        className="transition-all duration-300 ease-in-out transform animate-fade-in">
                        {columnVisibility['select'] && (
                          <td className="px-2 py-2 text-left">
                            <input
                              type="checkbox"
                              checked={selected.includes(user.id)}
                              onChange={() => handleCheckboxChange(user.id)}
                              className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                            />
                          </td>
                        )}
                        {['name', 'role'].map((key, i) =>
                          columnVisibility[key] && (
                            <td key={key} style={{ width: columnWidths[i + 1] }} className="px-2 py-2 text-center">
                              <div className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[i + 1] }}>
                                {user[key]}
                              </div>
                            </td>
                          )
                        )}

                        {['is_vps', 'is_cerberus', 'is_proxy', 'is_storage', 'is_varys'].map((key, i) =>
                          columnVisibility[key] && (
                            <td key={key} className="px-2 py-2 text-center">
                              {renderCell(user, key)}
                            </td>
                          )
                        )}

                        {dynamicColumns.map(({ dbKey }, i) => {
                          const index = 8 + i;
                          return columnVisibility[dbKey] && (
                            <td
                              key={dbKey}
                              style={{ width: columnWidths[index], minWidth: 40 }}
                              className="px-2 py-2 text-center cursor-pointer"
                              onDoubleClick={() => setEditingCell({ id: user.id, key: dbKey, value: user[dbKey] || '' })}
                            >
                              {editingCell.id === user.id && editingCell.key === dbKey ? (
                                <input
                                  value={editingCell.value}
                                  onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                  onBlur={async () => {
                                    const updatedValue = editingCell.value;
                                    setUsers(prev =>
                                      prev.map(u => u.id === user.id ? { ...u, [dbKey]: updatedValue } : u)
                                    );
                                    setEditingCell({ id: null, key: null, value: '' });
                                    await axios.patch(`/admin/update-service-access/${user.id}`, {
                                      [dbKey]: updatedValue
                                    });
                                  }}
                                  autoFocus
                                  className="w-full text-sm px-1 py-0.5 border rounded"
                                />
                              ) : (
                                <div className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[index] }}>
                                  {user[dbKey] || ''}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>
          </div>
          {contextMenu.visible && (
            <div
              className={`fixed z-50 rounded-md shadow-lg text-sm ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}
              style={{
                position: 'fixed',
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
                minWidth: '190px',
                zIndex: 1000,
              }}


            >
              <button
                onClick={() => {
                  const col = getColumnKeyFromIndex(contextMenu.columnIndex);
                  const newConfig = { key: col, direction: 'asc' };
                  setSortConfig(newConfig);
                  localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(newConfig));
                  setContextMenu({ ...contextMenu, visible: false });
                  // setSortConfig({ key: col, direction: 'asc' });
                  // setContextMenu({ ...contextMenu, visible: false });
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
              >
                <ArrowUpAZ size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Sort Ascending</span>
              </button>
              <button
                onClick={() => {
                  const col = getColumnKeyFromIndex(contextMenu.columnIndex);
                  const newConfig = { key: col, direction: 'desc' };
                  setSortConfig(newConfig);
                  localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(newConfig));
                  setContextMenu({ ...contextMenu, visible: false });
                  // setSortConfig({ key: col, direction: 'desc' });
                  // setContextMenu({ ...contextMenu, visible: false });
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
              >
                <ArrowDownAZ size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Sort Descending</span>
              </button>
              <button
                onClick={() => {
                  setSortConfig({ key: null, direction: null });
                  localStorage.removeItem(SORT_STORAGE_KEY);
                  setContextMenu({ ...contextMenu, visible: false });
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
              >
                <XCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Cancel Sort</span>
              </button>

              <button
                onClick={() => {
                  setContextMenu({ ...contextMenu, visible: false });
                  setShowAddColumnModal(true);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
              >
                <Plus size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Add Column</span>

              </button>

              {contextMenu.allowDelete && (
                <button
                  onClick={() => handleDeleteColumn(contextMenu.columnIndex)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                >
                  <Trash2 size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                  <span>Delete Column</span>
                </button>
              )}

              <div
                className="relative"
                onMouseEnter={() => {
                  if (submenuTriggerRef.current) {
                    const rect = submenuTriggerRef.current.getBoundingClientRect();
                    const spaceRight = window.innerWidth - rect.right;
                    const submenuWidth = 220;
                    setSubmenuFlipLeft(spaceRight < submenuWidth + 10);
                  }
                  setShowSubmenu(true);
                }}
                onMouseLeave={() => setShowSubmenu(false)}
              >
                <button
                  ref={submenuTriggerRef}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}>
                  <Columns size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                  <span>Column Show/Hide</span>
                  <ChevronRight size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />

                </button>

                {showSubmenu && (
                  <div
                    ref={submenuRef}
                    className={`absolute  ${submenuFlipLeft ? 'right-full pr-2' : 'left-full pl-2'} border left-full top-0 mt-[-8px] min-w-[180px] max-h-[300px] overflow-y-auto z-50 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded shadow-lg`}
                    style={{
                      left: submenuFlipLeft ? 'auto' : '100%',
                      right: submenuFlipLeft ? '100%' : 'auto',
                      paddingLeft: submenuFlipLeft ? '0' : '8px',
                      paddingRight: submenuFlipLeft ? '8px' : '0'
                    }}>
                    {[
                      { key: 'name', label: 'Name' },
                      { key: 'role', label: 'Role' },
                      { key: 'is_vps', label: 'Cloud Server' },
                      { key: 'is_cerberus', label: 'Cerberus' },
                      { key: 'is_proxy', label: 'Proxy' },
                      { key: 'is_storage', label: 'Storage Server' },
                      { key: 'is_varys', label: 'Varys' },
                      ...dynamicColumns.map(col => ({ key: col.dbKey, label: col.label }))
                    ].map(col => (
                      <button
                        key={col.key}
                        onClick={() => toggleColumnVisibility(col.key)}
                        className={`flex items-center justify-between w-full px-4 py-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                      >
                        <span>{col.label}</span>
                        {columnVisibility[col.key] && <span> <Check size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} /> </span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


          <AlertModal isOpen={showAlert} message={alertMessage} onClose={closeModal} dark={dark} />

          {showAddColumnModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className={`rounded-lg p-6 max-w-sm w-96 shadow-lg ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Add New Column</h2>
                  <button onClick={() => setShowAddColumnModal(false)} className="text-xl font-bold">×</button>
                </div>

                <label className="block text-sm font-medium mb-1">Column Name</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md text-sm mb-2 ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g. whatsapp_number"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="visibleForAll"
                    checked={visibleForAll}
                    onChange={(e) => setVisibleForAll(e.target.checked)}
                    className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                  />
                  <label htmlFor="visibleForAll" className="text-sm"> Visible for all users
                  </label>
                </div>


                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddColumnModal(false)} className={`px-4 py-2 text-sm border ${dark ? 'border-slate-300 text-slate-300 ' : 'border-indigo-600 text-indigo-600'} rounded `}>Cancel</button>
                  <button onClick={handleAddColumn} className={`px-4 py-2 text-sm ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'} rounded`}>Add</button>
                </div>
              </div>
            </div>
          )}
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
      </div>
    </PageWrapper>
  );
}
