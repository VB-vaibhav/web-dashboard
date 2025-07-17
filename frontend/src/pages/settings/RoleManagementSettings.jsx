import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios';
import Select from 'react-select';
import AlertModal from '../../components/AlertModal';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTableSearch } from '../../hooks/useTableSearch';
import useIsMobile from '../../hooks/useIsMobile';
import MobileRoleManagementUI from './MobileRoleManagementUI';
import { components } from 'react-select';
import { usePersistentWidths } from '../../hooks/usePersistentWidths';
import { Search, MoreVertical, PlusCircle, Users, Plus, Trash2, ArrowUpAZ, ArrowDownAZ, XCircle, Columns, ChevronRight, Check } from 'lucide-react';

export default function ManageRoleSettings() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [editedRoles, setEditedRoles] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const [showBulkRoleDropdown, setShowBulkRoleDropdown] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [editingHeader, setEditingHeader] = useState(null);
  const [newHeaderLabel, setNewHeaderLabel] = useState('');
  const [editingCell, setEditingCell] = useState({ id: null, key: null, value: '' });
  const [bulkRoleValue, setBulkRoleValue] = useState('admin');
  const dropdownRef = useRef(null);
  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'middleman', label: 'Middleman' }
  ];
  const { dark } = useOutletContext();
  const username = useSelector(state => state.auth.username) || 'default';
  const userId = useSelector(state => state.auth.id);
  const role = useSelector(state => state.auth.role);
  const SORT_STORAGE_KEY = `sortConfig_service_access_${username}`;
  const isMobile = useIsMobile();

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, columnIndex: null });
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [visibleForAll, setVisibleForAll] = useState(true);


  const handleHeaderContextMenu = (e, index) => {
    e.preventDefault();

    const menuWidth = 190; // You can also measure this dynamically via ref if needed
    const screenWidth = window.innerWidth;
    const buffer = 10; // Optional gap from edge

    const clickX = e.clientX;
    const clickY = e.clientY;

    const openLeft = (clickX + menuWidth + buffer) > screenWidth;

    const finalX = openLeft ? (clickX - menuWidth) : clickX;

    const isCustom = index >= 7 && dynamicColumns[index - 7]?.dbKey?.startsWith('custom_');

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

  // const totalCols = 7 + dynamicColumns.length;
  // const [columnWidths, setColumnWidths] = usePersistentWidths('manage_role', totalCols, 150);

  const [columnWidths, setColumnWidths] = useState([]);
  const [columnInitDone, setColumnInitDone] = useState(false);

  useEffect(() => {
    if ((7 + dynamicColumns.length) > 0 && !columnInitDone) {
      const totalCols = 7 + dynamicColumns.length;
      const saved = localStorage.getItem('columnWidths_manage_role');
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

  const useResizableColumns = (columnWidths, setColumnWidths) => {
    const startResizing = (index, e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = columnWidths[index];

      const handleMouseMove = (e) => {
        const delta = e.clientX - startX;
        const newWidths = [...columnWidths];
        const next = index + 1;

        newWidths[index] = Math.max(startWidth + delta, 40);

        if (next < newWidths.length) {
          // newWidths[next] = Math.max(newWidths[next] - delta, 40);
          newWidths[index] = Math.max(startWidth + delta, 40);

        }
        setColumnWidths(newWidths);
        localStorage.setItem('columnWidths_manage_role', JSON.stringify(newWidths));
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
    return { startResizing, totalWidth };
  };

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
    const handleClickOutside = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const [searchableColumns, setSearchableColumns] = useState(['name', 'username', 'email', 'role']);
  const { query, setQuery, filteredData } = useTableSearch(users || [], searchableColumns);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/manage-role-users');
      const fetchedUsers = res.data;

      setUsers(fetchedUsers);

      const sample = fetchedUsers[0];
      const dynamicKeys = sample ? Object.keys(sample).filter(k => k.startsWith('custom_')) : [];

      // const dynamicCols = dynamicKeys.map(col => ({
      //   dbKey: col,
      //   label: col.replace('custom_', '')
      // }));
      const metaRes = await axios.get('/admin/custom-columns?pageKey=manageRole');
      const dynamicCols = metaRes.data.map(col => ({
        dbKey: col.column_name,
        label: col.label,
        createdBy: col.created_by,
        isGlobal: col.is_global === 1
      }));

      setDynamicColumns(dynamicCols);

      const staticSearchableKeys = ['name', 'username', 'email'];

      const dynamicSearchableKeys = dynamicCols.map(col => col.dbKey); // optional: filter some out
      const SEARCHABLE_COLUMNS = [...staticSearchableKeys, ...dynamicSearchableKeys];
      setSearchableColumns(SEARCHABLE_COLUMNS);

      setTimeout(() => {
        const totalCols = 7 + dynamicCols.length;

        const saved = localStorage.getItem('columnWidths_manage_role');
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
            40, 100, 100, 120, 80, 120, 100,
            ...Array(dynamicCols.length).fill(150)
          ];
        }

        setColumnWidths(newWidths);
        localStorage.setItem('columnWidths_manage_role', JSON.stringify(newWidths));
        setColumnInitDone(true);

      }, 100);


      const visibilityObj = {
        select: true,
        name: true,
        username: true,
        email: true,
        role: true,
        change: true,
        action: true
      };

      dynamicCols.forEach(col => visibilityObj[col.dbKey] = true);
      setColumnVisibility(visibilityObj);
    } catch (err) {
      console.error('Fetch users failed:', err);
    }
  };

  // useEffect(() => {
  //   fetchUsers();
  // }, []);

  // const toggleColumnVisibility = (key) => {
  //   setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  //   setContextMenu(prev => ({ ...prev, visible: false }));
  // };

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
      // await axios.post('/admin/add-column', { columnName: prefixed });
      await axios.post('/admin/add-column', {
        pageKey: 'manageRole',
        label: newColumnName.trim(),  // e.g. "Facebook Lite"
        isGlobal: visibleForAll
      });

      // localStorage.removeItem('columnWidths_service_access');
      const existing = localStorage.getItem('columnWidths_manage_role');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 7 + (dynamicColumns.length + 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_manage_role', JSON.stringify(adjustedWidths));

      showModal("Column added successfully.");
      fetchUsers();
      setShowAddColumnModal(false);
      setNewColumnName('');
    } catch (err) {
      showModal("Failed to add column.");
    }
  };

  const handleDeleteColumn = async (index) => {
    // const columnToDelete = dynamicColumns[index - 7]?.dbKey;
    // if (!columnToDelete) return;

    const column = dynamicColumns[index - 7];
    if (!column) return;

    if (column.isGlobal && role !== 'superadmin' && column.createdBy !== userId) {
      showModal("Only Superadmin or Creator can delete");
      return;
    }

    const columnToDelete = column.dbKey;

    const confirmed = window.confirm(`Delete column "${columnToDelete}"?`);
    if (!confirmed) return;

    try {
      // await axios.delete('/admin/delete-column', { data: { columnName: columnToDelete } });
      await axios.delete('/admin/delete-column', { data: { columnName: columnToDelete, pageKey: 'manageRole' } });
      // localStorage.removeItem('columnWidths_service_access');
      const existing = localStorage.getItem('columnWidths_manage_role');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 7 + (dynamicColumns.length - 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_manage_role', JSON.stringify(adjustedWidths));

      showModal("Column deleted.");
      fetchUsers();
    } catch (err) {
      const message = err?.response?.data?.error || "Delete failed.";
      showModal(message);
    }

    setContextMenu({ ...contextMenu, visible: false });
  };

  // const handleRenameColumn = async (oldDbKey, newLabel) => {
  //   const newDbKey = `custom_${newLabel.trim().replace(/\s+/g, '_')}`;
  //   try {
  //     await axios.patch('/admin/rename-column', {
  //       oldColumn: oldDbKey,
  //       newColumn: newDbKey,
  //     });
  //     setEditingHeader(null);
  //     fetchUsers();
  //   } catch (err) {
  //     showModal('Rename failed.');
  //   }
  // };
  const handleRenameColumn = async (oldDbKey, newLabel) => {
    const newDbKey = `custom_manageRole_${newLabel.trim().replace(/\s+/g, '_')}`;
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  // useEffect(() => {
  //   const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
  //   window.addEventListener('click', handleClickOutside);
  //   return () => window.removeEventListener('click', handleClickOutside);
  // }, [contextMenu]);

  // useEffect(() => {
  //   if (headerCheckboxRef.current) {
  //     const totalVisible = filteredData.map(u => u.id);
  //     const isAllVisibleSelected = totalVisible.every(id => selected.includes(id)) && totalVisible.length > 0;
  //     const isNoneSelected = totalVisible.every(id => !selected.includes(id));
  //     headerCheckboxRef.current.indeterminate = !isAllVisibleSelected && !isNoneSelected;
  //   }
  // }, [selected, filteredData]);


  // const sortTable = (key) => {
  //   if (!key) return;
  //   const direction = sortConfig.column === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
  //   const sorted = [...users].sort((a, b) => {
  //     const aVal = a[key] || '';
  //     const bVal = b[key] || '';
  //     return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  //   });
  //   setUsers(sorted);
  //   setSortConfig({ column: key, direction });
  //   setContextMenu(prev => ({ ...prev, visible: false }));
  // };

  const getColumnKeyFromIndex = (index) => {
    const staticKeys = ['select', 'name', 'username', 'email', 'role', 'change', 'action'];
    if (index < staticKeys.length) return staticKeys[index];
    return dynamicColumns[index - staticKeys.length]?.dbKey;
  };

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
    localStorage.setItem('columnWidths_manage_role', JSON.stringify(newWidths));
  };

  const columnKeys = ['select', 'name', 'username', 'email', 'role', 'change', 'action'];

  const columnLabels = {
    select: '', name: 'Name', username: 'Username', email: 'Email',
    role: 'Current Role', change: 'Change Role', action: 'Action',
  };

  const handleRoleSave = async (userId) => {
    const newRole = editedRoles[userId];
    if (!newRole || newRole === 'superadmin') return;

    try {
      await axios.patch(`/admin/update-user-role/${userId}`, { role: newRole });
      fetchUsers();
      setEditedRoles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (err) {
      showModal('Failed to update role');
    }
  };

  const showModal = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const closeModal = () => setShowAlert(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBulkRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <MobileRoleManagementUI
        users={users}
        selected={selected}
        setSelected={setSelected}
        editedRoles={editedRoles}
        setEditedRoles={setEditedRoles}
        handleRoleSave={handleRoleSave}
        dark={dark}
        showModal={showModal}
        fetchUsers={fetchUsers}
        bulkRoleValue={bulkRoleValue}
        setBulkRoleValue={setBulkRoleValue}
      />
    );
  }

  return (
    <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto min-h-[calc(100vh-12em)]">
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
          <div className="relative"
            // ref={headerCheckboxRef}
            ref={dropdownRef}
          >
            <button
              onClick={() => setShowBulkRoleDropdown(prev => !prev)}
              className={`p-1.5 ml-3 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}>
              <MoreVertical size={18} />
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
        </div>

        <div className=" mt-3">
          <div style={{ width: `${totalWidth}px`, minWidth: `100%` }}>
            <table className="table-auto text-sm w-full">
              <thead className={`sticky top-0 ${dark ? "bg-gray-800" : "bg-white"}`}>
                <tr>
                  {columnKeys.map((key, index) => {
                    if (!columnVisibility[key]) return null;
                    return (
                      <th
                        key={key}
                        onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                        style={{ width: columnWidths[index] || 40, minWidth: 40 }}
                        className={`relative px-2 py-3 font-semibold border-r group ${dark ? 'border-gray-700' : 'border-gray-300'} ${index === 0 ? 'text-left' : 'text-center'} whitespace-nowrap`}
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
                            columnLabels[key]
                          )}
                        </div>
                        <div
                          onMouseDown={(e) => startResizing(index, e)}
                          onDoubleClick={(e) => {
                            e.stopPropagation(); // avoid bubbling to th
                            autoResizeColumn(index);
                          }}
                          className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
                        />
                      </th>
                    );
                  })}
                  {dynamicColumns.map(({ dbKey, label }, i) => {
                    const index = 7 + i; // after 7 static columns
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
                {Array.isArray(filteredData) && filteredData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-6 text-gray-500 text-sm">No search result found</td></tr>
                ) : (
                  // Array.isArray(filteredData) && filteredData.map(user => (
                  sortedData.map(user => (
                    <tr key={user.id}>
                      {columnKeys.map((key, index) => {
                        if (!columnVisibility[key]) return null;
                        if (key === 'select') {
                          return <td key={key} className="text-left px-2 py-2"><input type="checkbox" checked={selected.includes(user.id)} onChange={() => {
                            setSelected(prev => {
                              return prev.includes(user.id)
                                ? prev.filter(id => id !== user.id)
                                : [...prev, user.id];
                            });
                          }} className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`} /></td>;

                        }
                        if (['name', 'username', 'email', 'role'].includes(key)) {
                          return (
                            <td key={key} style={{ width: columnWidths[index] }} className="px-2 py-2 text-center">
                              <div className="w-full whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[index] }}>
                                {user[key]}
                              </div>
                            </td>
                          )
                        }
                        if (key === 'change') {
                          return (
                            <td key={key} className="text-center px-2 py-2">
                              <div className="flex justify-center items-center">
                                <Select
                                  components={{
                                    IndicatorSeparator: () => null,
                                    DropdownIndicator: (props) => (
                                      <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                                    )
                                  }}
                                  options={roleOptions}
                                  value={roleOptions.find(opt => opt.value === (editedRoles[user.id] || user.role))}
                                  onChange={(opt) =>
                                    setEditedRoles((prev) => ({ ...prev, [user.id]: opt.value }))
                                  }
                                  styles={{
                                    control: (base, state) => ({
                                      ...base,
                                      backgroundColor: dark ? '#1F2937' : '#ffffff',
                                      width: '120px',
                                      minHeight: '31px',
                                      height: '31px',
                                      fontSize: '0.85rem',
                                      color: dark ? '#E5E7EB' : '#1F2937',
                                      borderColor: dark ? '#4B5563' : '#D1D5DB',
                                      boxShadow: state.isFocused ? 'none' : undefined,
                                      outline: 'none',
                                      '&:hover': {
                                        borderColor: dark ? '#6B7280' : '#9CA3AF',
                                      }
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
                                      zIndex: 99,
                                      backgroundColor: dark ? '#1F2937' : '#ffffff',
                                      padding: '4px',
                                      borderRadius: '8px',
                                      overflowX: 'hidden'
                                    }),
                                    singleValue: (base) => ({
                                      ...base,
                                      color: dark ? '#BAC4D1' : '#1F2937', // this sets the visible text inside the box
                                    }),
                                    placeholder: (base) => ({
                                      ...base,
                                      color: dark ? '#BAC4D1' : '#6B7280', // optional: if you use placeholder text
                                    }),
                                    indicatorsContainer: (base) => ({
                                      ...base,
                                      height: '30px',
                                    }),
                                  }}
                                />
                              </div>
                            </td>
                          );
                        }
                        if (key === 'action') {
                          return (
                            <td key={key} className="text-center px-2 py-2">
                              <button
                                onClick={() => handleRoleSave(user.id)}
                                className={`px-3 py-1 rounded-sm ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`}
                              >Save</button>
                            </td>
                          );
                        }
                        return <td key={key} className="text-center px-2 py-2">{user[key]}</td>;
                      })}
                      {dynamicColumns.map(({ dbKey }, i) => {
                        const index = 7 + i;
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
            style={{ position: 'fixed', top: `${contextMenu.y}px`, left: `${contextMenu.x}px`, minWidth: '190px', zIndex: 1000, }}
          >
            <button
              onClick={() => {
                const col = getColumnKeyFromIndex(contextMenu.columnIndex)
                const newConfig = { key: col, direction: 'asc' };
                setSortConfig(newConfig);
                localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(newConfig));
                setContextMenu({ ...contextMenu, visible: false });
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}>
              <ArrowUpAZ size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
              <span>Sort Ascending</span>
            </button>
            <button
              onClick={() => {
                const col = getColumnKeyFromIndex(contextMenu.columnIndex)
                const newConfig = { key: col, direction: 'desc' };
                setSortConfig(newConfig);
                localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(newConfig));
                setContextMenu({ ...contextMenu, visible: false });
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
              {/* Submenu */}
              {/* {submenuVisible && (
              <div
                className={`absolute top-0 left-full z-50 ml-1 rounded-md shadow-lg border ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              >
                {Object.keys(columnVisibility).map((key, i) => (
                  <div key={i} className="px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columnVisibility[key]}
                        onChange={() => toggleColumnVisibility(key)}
                        className={`${dark ? 'accent-gray-400' : 'accent-indigo-600'}`}
                      />
                      <span className="capitalize">{key}</span>
                    </label>
                  </div>
                ))}
              </div>
            )} */}
              {showSubmenu && (
                <div
                  ref={submenuRef}
                  className={`absolute  ${submenuFlipLeft ? 'right-full pr-2' : 'left-full pl-2'} border top-28 mt-[-8px] min-w-[180px] max-h-[300px] overflow-y-auto z-50 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded shadow-lg`}
                  style={{
                    left: submenuFlipLeft ? 'auto' : '100%',
                    right: submenuFlipLeft ? '100%' : 'auto',
                    paddingLeft: submenuFlipLeft ? '0' : '8px',
                    paddingRight: submenuFlipLeft ? '8px' : '0'
                  }}>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'username', label: 'Username' },
                    { key: 'email', label: 'Email' },
                    { key: 'role', label: 'Current Role' },
                    { key: 'change', label: 'Change Role' },
                    { key: 'action', label: 'Action' },
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

        {showBulkRoleModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className={`rounded-md p-5 w-[320px] ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg border ${dark ? 'border-gray-700' : 'border-gray-300'}`}>
              <h2 className="text-lg font-semibold mb-3">Manage Role</h2>
              {/* <select
              value={bulkRoleValue}
              onChange={(e) => setBulkRoleValue(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded-md text-sm outline-none focus:ring focus:ring-indigo-300"
            >
              <option value="admin">Admin</option>
              <option value="middleman">Middleman</option>
            </select> */}
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
                className={`w-full px-3 py-2 border rounded-md text-sm mb-4 ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
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
      </div>
    </div>
  );
}