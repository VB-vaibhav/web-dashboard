import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios';
import AlertModal from '../../components/AlertModal';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTableSearch } from '../../hooks/useTableSearch';
import useIsMobile from '../../hooks/useIsMobile';
import { usePersistentWidths } from '../../hooks/usePersistentWidths';
import { Search, MoreVertical, PlusCircle, Plus, Trash2, ArrowUpAZ, ArrowDownAZ, XCircle, Columns, ChevronRight, Check } from 'lucide-react';

export default function ManageRoleSettings() {
  const [users, setUsers] = useState([]);
  const { query, setQuery, filteredData } = useTableSearch(users || [], ['name', 'username', 'email']);
  const [selected, setSelected] = useState([]);
  const [editedRoles, setEditedRoles] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });

  const { dark } = useOutletContext();
  const username = useSelector(state => state.auth.username) || 'default';
  const isMobile = useIsMobile();

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, columnIndex: null });

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

    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, columnIndex: index });
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

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/manage-role-users');
      const fetchedUsers = res.data;

      setUsers(fetchedUsers);

      const sample = fetchedUsers[0];
      const dynamicKeys = sample ? Object.keys(sample).filter(k => k.startsWith('custom_')) : [];

      const dynamicCols = dynamicKeys.map(col => ({
        dbKey: col,
        label: col.replace('custom_', '')
      }));
      setDynamicColumns(dynamicCols);
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
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
      showModal("Invalid column name.");
      return;
    }

    const prefixed = `custom_${trimmed}`;
    try {
      await axios.post('/admin/add-column', { columnName: prefixed });
      // localStorage.removeItem('columnWidths_service_access');
      const existing = localStorage.getItem('columnWidths_service_access');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 7 + (dynamicColumns.length + 1); // compute after adding/deleting column
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
    const columnToDelete = dynamicColumns[index - 8]?.dbKey;
    if (!columnToDelete) return;

    const confirmed = window.confirm(`Delete column "${columnToDelete}"?`);
    if (!confirmed) return;

    try {
      await axios.delete('/admin/delete-column', { data: { columnName: columnToDelete } });
      // localStorage.removeItem('columnWidths_service_access');
      const existing = localStorage.getItem('columnWidths_service_access');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 8 + (dynamicColumns.length - 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_service_access', JSON.stringify(adjustedWidths));

      showModal("Column deleted.");
      fetchUsers();
    } catch (err) {
      showModal("Delete failed.");
    }

    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRenameColumn = async (oldDbKey, newLabel) => {
    const newDbKey = `custom_${newLabel.trim().replace(/\s+/g, '_')}`;
    try {
      await axios.patch('/admin/rename-column', {
        oldColumn: oldDbKey,
        newColumn: newDbKey,
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


  const sortTable = (key) => {
    if (!key) return;
    const direction = sortConfig.column === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const sorted = [...users].sort((a, b) => {
      const aVal = a[key] || '';
      const bVal = b[key] || '';
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setUsers(sorted);
    setSortConfig({ column: key, direction });
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const columnKeys = ['select', 'name', 'username', 'email', 'role', 'change', 'action', ...dynamicColumns.map(c => c.dbKey)];

  const columnLabels = {
    select: '', name: 'Name', username: 'Username', email: 'Email',
    role: 'Current Role', change: 'Change Role', action: 'Action',
    ...dynamicColumns.reduce((acc, col) => ({ ...acc, [col.dbKey]: col.label }), {})
  };

  const showModal = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const closeModal = () => setShowAlert(false);

  return (
    <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto min-h-[calc(100vh-190px)]">
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
        // ref={dropdownRef}
        >
          <button
            // onClick={() => setShowDropdown(prev => !prev)} 
            className={`p-1.5 ml-3 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}>
            <MoreVertical size={18} />
          </button>
          {/* {showDropdown && ( */}
          {/* <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
              <button 
              // onClick={() => openServiceActionModal('include')} 
              className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                <PlusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Manage Role</span>
              </button>
            </div> */}
          {/* )} */}
        </div>
      </div>

      <div className=" mt-3">
        <div style={{ width: `${totalWidth}px`, minWidth: `100%` }}>
          <table className="table-auto text-sm w-full">
            <thead>
              <tr>
                {columnKeys.map((key, index) => {
                  if (!columnVisibility[key]) return null;
                  return (
                    <th
                      key={key}
                      onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                      style={{ width: columnWidths[index], minWidth: 40 }}
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
                        className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredData) && filteredData.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-500">No search result found</td></tr>
              ) : (
                Array.isArray(filteredData) && filteredData.map(user => (
                  <tr key={user.id}>
                    {columnKeys.map((key, index) => {
                      if (!columnVisibility[key]) return null;
                      if (key === 'select') {
                        return <td key={key} className="text-left px-2 py-2"><input type="checkbox" checked={selected.includes(user.id)} onChange={() => handleCheckboxChange(user.id)} /></td>;
                      }
                      if (key === 'change') {
                        return (
                          <td key={key} className="text-center px-2 py-2">
                            <select
                              value={editedRoles[user.id] || user.role}
                              onChange={(e) => setEditedRoles(prev => ({ ...prev, [user.id]: e.target.value }))}
                              className="border px-2 py-1 rounded text-sm"
                            >
                              {['admin', 'middleman'].map(opt => (
                                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                        );
                      }
                      if (key === 'action') {
                        return (
                          <td key={key} className="text-center px-2 py-2">
                            <button
                              onClick={() => handleRoleSave(user.id)}
                              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                            >Save</button>
                          </td>
                        );
                      }
                      return <td key={key} className="text-center px-2 py-2">{user[key]}</td>;
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
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px`, minWidth: '200px' }}
        >
          <button onClick={() => sortTable(columnKeys[contextMenu.columnIndex])} className="w-full text-left px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-700">
            Sort Ascending
          </button>
          <button onClick={() => sortTable(columnKeys[contextMenu.columnIndex])} className="w-full text-left px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-700">
            Sort Descending
          </button>
          <div className="border-t my-1" />
          {columnKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => toggleColumnVisibility(key)}
              className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-indigo-100 dark:hover:bg-gray-700`}
            >
              {columnLabels[key]}
              {columnVisibility[key] ? <Check size={16} /> : null}
            </button>
          ))}
        </div>
      )}

      <AlertModal isOpen={showAlert} message={alertMessage} onClose={closeModal} dark={dark} />
    </div>
  );
}