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
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    columnIndex: null,
  });
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingHeader, setEditingHeader] = useState(null);
  const [newHeaderLabel, setNewHeaderLabel] = useState('');

  const [editingHeaderIndex, setEditingHeaderIndex] = useState(null);
  const [editingHeaderValue, setEditingHeaderValue] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});



  // const handleHeaderContextMenu = (e, index) => {
  //   e.preventDefault();
  //   setContextMenu({
  //     visible: true,
  //     x: e.pageX,
  //     y: e.pageY,
  //     columnIndex: index,
  //   });
  // };


  const handleHeaderContextMenu = (e, index) => {
    e.preventDefault();

    const isCustom = index >= 8 && dynamicColumns[index - 8]?.dbKey?.startsWith('custom_');

    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      columnIndex: index,
      allowDelete: isCustom // 🔥 NEW FLAG
    });
  };

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

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/service-access-users');
      const fetchedUsers = res.data;

      if (fetchedUsers.length === 0) {
        setUsers([]);
        return;
      }

      setUsers(fetchedUsers);

      // Dynamically detect and prepare custom columns
      const sample = fetchedUsers[0];
      const dynamicKeys = Object.keys(sample).filter(k => k.startsWith('custom_'));

      const dynamicCols = dynamicKeys.map(col => ({
        dbKey: col,
        label: col.replace('custom_', '') // Displayed in UI
      }));

      setDynamicColumns(dynamicCols);
      const visibilityObj = {
        name: true,
        role: true,
        is_vps: true,
        is_cerberus: true,
        is_proxy: true,
        is_storage: true,
        is_varys: true,
      };
      dynamicCols.forEach(col => visibilityObj[col.dbKey] = true);
      setColumnVisibility(visibilityObj);

    } catch (error) {
      console.error('Error fetching users with custom columns:', error);
    }
  };

  // const fetchUsers = async () => {
  //   const res = await axios.get('/admin/service-access-users');
  //   setUsers(res.data);

  //   // Dynamically extract custom columns
  //   const user = res.data[0];
  //   if (user) {
  //     const staticCols = ['id', 'name', 'role', 'is_vps', 'is_cerberus', 'is_proxy', 'is_storage', 'is_varys'];
  //     // const dynamic = Object.keys(user).filter(key => !staticCols.includes(key));
  //     const dynamic = Object.keys(user).filter(key => key.startsWith('custom_'));

  //     setDynamicColumns(dynamic);
  //   }
  // };
  const [dynamicColumns, setDynamicColumns] = useState([]);

  const handleDeleteColumn = async (index) => {
    const columnToDelete = dynamicColumns[index - 8]?.dbKey;
    if (!columnToDelete) return;

    const confirmed = window.confirm(`Are you sure you want to delete column "${columnToDelete.replace('custom_', '')}"?`);
    if (!confirmed) return;

    try {
      await axios.delete('/admin/delete-column', { data: { columnName: columnToDelete } });
      showModal("Column deleted successfully.");
      fetchUsers();
    } catch (err) {
      console.error("Delete failed", err);
      showModal("Failed to delete column.");
    }

    setContextMenu({ ...contextMenu, visible: false });
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

  const [editingCell, setEditingCell] = useState({ id: null, key: null, value: '' });

  const renderEditableCell = (user, columnKey) => {
    const isEditing = editingCell.id === user.id && editingCell.key === columnKey;

    const handleStartEdit = () => {
      setEditingCell({ id: user.id, key: columnKey, value: user[columnKey] || '' });
    };

    const handleSaveEdit = async () => {
      const updatedValue = editingCell.value;
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, [columnKey]: updatedValue } : u))
      );
      setEditingCell({ id: null, key: null, value: '' });

      await axios.patch(`/admin/update-service-access/${user.id}`, {
        [columnKey]: updatedValue,
      });
    };

    return (
      <td
        onDoubleClick={handleStartEdit}
        className="px-4 py-2 text-center cursor-pointer"
      >
        {isEditing ? (
          <input
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onBlur={handleSaveEdit}
            autoFocus
            className="w-full text-sm px-1 py-0.5 border rounded"
          />
        ) : (
          user[columnKey] || ''
        )}
      </td>
    );
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

  const handleRenameColumn = async (oldDbKey, newLabel) => {
    const newDbKey = `custom_${newLabel.trim().replace(/\s+/g, '_')}`;
    try {
      await axios.patch('/admin/rename-column', {
        oldColumn: oldDbKey,
        newColumn: newDbKey,
      });
      setEditingHeader(null);
      fetchUsers(); // Refresh to see updated label
    } catch (err) {
      console.error('Rename failed:', err);
      showModal('Failed to rename column. Try another name.');
    }
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
  const handleAddColumn = async () => {
    const trimmed = newColumnName.trim();

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
      showModal("Invalid column name (only letters, numbers, underscores allowed, must not start with number)");
      return;
    }

    const prefixed = `custom_${trimmed}`;
    try {
      await axios.post('/admin/add-column', { columnName: prefixed });
      alert("Column added successfully");
      setShowAddColumnModal(false);
      setNewColumnName('');
      fetchUsers(); // refresh table
    } catch (err) {
      console.error(err);
      showModal("Failed to add column. Try a different name.");
    }
    // try {
    //   const res = await axios.post('/admin/add-column', { columnName: trimmed });
    //   alert(res.data.message || "Column added");
    //   setShowAddColumnModal(false);
    //   setNewColumnName('');
    //   fetchUsers(); // optional: refresh table
    // } catch (err) {
    //   console.error(err);
    //   showModal("Failed to add column. Try a different name.");
    // }
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
    const renderEditableCell = (user, columnKey) => {
      const [editValue, setEditValue] = useState('');
      const [editing, setEditing] = useState(null);

      const startEditing = (id, val) => {
        setEditValue(val || '');
        setEditing(id);
      };

      const saveEdit = async (id) => {
        setUsers(prev =>
          prev.map(user =>
            user.id === id ? { ...user, [columnKey]: editValue } : user
          )
        );
        setEditing(null);
        await axios.patch(`/admin/update-service-access/${id}`, { [columnKey]: editValue });
      };

      return (
        <td
          key={columnKey}
          onDoubleClick={() => startEditing(user.id, user[columnKey])}
          className="px-4 py-2 text-center cursor-pointer"
        >
          {editing === user.id ? (
            <input
              type="text"
              className="w-full text-sm px-1 py-0.5 border rounded"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveEdit(user.id)}
              autoFocus
            />
          ) : (
            user[columnKey] || ''
          )}
        </td>
      );
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
                {columnVisibility['select'] !== false && (
                  <th
                    onContextMenu={(e) => handleHeaderContextMenu(e, 0)}
                    className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.length === users.length}
                      onChange={() => setSelected(selected.length === users.length ? [] : users.map(u => u.id))}
                      className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                    />
                  </th>
                )}

                {columnVisibility['name'] && (
                  <th
                    onContextMenu={(e) => handleHeaderContextMenu(e, 1)}
                    className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}
                  >
                    Name
                  </th>
                )}
                {columnVisibility['role'] && (
                  <th
                    onContextMenu={(e) => handleHeaderContextMenu(e, 2)}
                    className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}
                  >
                    Role
                  </th>
                )}
                {columnVisibility['is_vps'] && (
                  <th onContextMenu={(e) => handleHeaderContextMenu(e, 3)} className="...">Cloud Server</th>
                )}
                {columnVisibility['is_cerberus'] && (
                  <th onContextMenu={(e) => handleHeaderContextMenu(e, 4)} className="...">Cerberus</th>
                )}
                {columnVisibility['is_proxy'] && (
                  <th onContextMenu={(e) => handleHeaderContextMenu(e, 5)} className="...">Proxy</th>
                )}
                {columnVisibility['is_storage'] && (
                  <th onContextMenu={(e) => handleHeaderContextMenu(e, 6)} className="...">Storage Server</th>
                )}
                {columnVisibility['is_varys'] && (
                  <th onContextMenu={(e) => handleHeaderContextMenu(e, 7)} className="...">Varys</th>
                )}

                {dynamicColumns.map(({ dbKey, label }, i) => {
                  const index = 8 + i;
                  const isEditing = editingHeader === dbKey;

                  return columnVisibility[dbKey] && (
                    <th
                      key={`dynamic-${i}`}
                      onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                      className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}
                    >
                      {isEditing ? (
                        <input
                          className="text-sm px-1 py-0.5 border rounded w-28 text-center"
                          value={newHeaderLabel}
                          onChange={(e) => setNewHeaderLabel(e.target.value)}
                          onBlur={() => handleRenameColumn(dbKey, newHeaderLabel)}
                          autoFocus
                        />
                      ) : label}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* <thead>
              <tr>
                
                {['', 'Name', 'Role', 'Cloud Server', 'Cerberus', 'Proxy', 'Storage Server', 'Varys'].map((label, index) => (
                  <th
                    key={index}
                    onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                    style={{ width: columnWidths[index], minWidth: 80 }}
                    className={`relative px-4 py-3 font-semibold border-r group ${dark ? 'border-gray-700' : 'border-gray-300'} text-center whitespace-nowrap`}
                  >
                    <div className="flex justify-center items-center text-center">
                      {label === '' ? (
                        <input
                          type="checkbox"
                          checked={selected.length === users.length}
                          onChange={() => setSelected(selected.length === users.length ? [] : users.map(u => u.id))}
                          className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                        />
                      ) : label}
                    </div>
                    <div
                      onMouseDown={(e) => startResizing(index, e)}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize group-hover:bg-indigo-400 z-10"
                    />
                  </th>
                ))}

                
                {dynamicColumns.map(({ dbKey, label }, i) => {
                  const index = 8 + i; // offset from static columns
                  const isEditing = editingHeader === dbKey;

                  return (
                    <th
                      key={`dynamic-${i}`}
                      onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                      style={{ width: columnWidths[index], minWidth: 80 }}
                      className={`relative px-4 py-3 font-semibold border-r group ${dark ? 'border-gray-700' : 'border-gray-300'} text-center whitespace-nowrap`}
                      onDoubleClick={() => {
                        setEditingHeader(dbKey);
                        setNewHeaderLabel(label);
                      }}
                    >
                      <div className="flex justify-center items-center text-center">
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
                      </div>
                      <div
                        onMouseDown={(e) => startResizing(index, e)}
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize group-hover:bg-indigo-400 z-10"
                      />
                    </th>
                  );
                })}

                
              </tr>
            </thead> */}


            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-6 text-sm text-gray-500">No search result found</td></tr>
              ) : (
                filteredData.map(user => (
                  <tr key={user.id}>
                    {columnVisibility['select'] !== false && (
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(user.id)}
                          onChange={() => handleCheckboxChange(user.id)}
                          className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                        />
                      </td>
                    )}

                    {columnVisibility['name'] && (
                      <td className="px-4 py-2 text-center">{user.name}</td>
                    )}

                    {columnVisibility['role'] && (
                      <td className="px-4 py-2 capitalize text-center">{user.role}</td>
                    )}

                    {columnVisibility['is_vps'] && (
                      <td className="px-4 py-2 text-center">{renderCell(user, 'is_vps')}</td>
                    )}
                    {columnVisibility['is_cerberus'] && (
                      <td className="px-4 py-2 text-center">{renderCell(user, 'is_cerberus')}</td>
                    )}
                    {columnVisibility['is_proxy'] && (
                      <td className="px-4 py-2 text-center">{renderCell(user, 'is_proxy')}</td>
                    )}
                    {columnVisibility['is_storage'] && (
                      <td className="px-4 py-2 text-center">{renderCell(user, 'is_storage')}</td>
                    )}
                    {columnVisibility['is_varys'] && (
                      <td className="px-4 py-2 text-center">{renderCell(user, 'is_varys')}</td>
                    )}

                    {dynamicColumns.map(({ dbKey }) =>
                      columnVisibility[dbKey] && renderEditableCell(user, dbKey)
                    )}
                  </tr>

                  // <tr key={user.id}>
                  //   {[<input type="checkbox" checked={selected.includes(user.id)} onChange={() => handleCheckboxChange(user.id)} className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`} />, user.name, user.role, renderCell(user, 'is_vps'), renderCell(user, 'is_cerberus'), renderCell(user, 'is_proxy'), renderCell(user, 'is_storage'), renderCell(user, 'is_varys'),
                  //   ...dynamicColumns.map(({ dbKey }) => renderEditableCell(user, dbKey))
                  //   ].map((cell, index) => (
                  //     <td key={index} style={{ width: columnWidths[index], minWidth: 80 }} className="px-4 py-2 text-center">{cell}</td>
                  //   ))}
                  // </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {contextMenu.visible && (
        <div
          className={`fixed z-50 rounded-md shadow-lg text-sm ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px`, minWidth: '140px' }}
        >
          <button
            onClick={() => {
              setContextMenu({ ...contextMenu, visible: false });
              setShowAddColumnModal(true);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-700`}
          >
            Add Column
          </button>

          {contextMenu.allowDelete && (
            <button
              onClick={() => handleDeleteColumn(contextMenu.columnIndex)}
              className={`w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-gray-700 text-red-600`}
            >
              Delete Column
            </button>
          )}
          <div className="relative group">
            <button className="w-full text-left px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-700">
              Column Show/Hide ▸
            </button>

            <div className="absolute left-full top-0 mt-[-8px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 hidden group-hover:block min-w-[180px] max-h-[300px] overflow-y-auto">
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
                  className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-indigo-100 dark:hover:bg-gray-700"
                >
                  <span>{col.label}</span>
                  {columnVisibility[col.key] && <span className="text-green-500">✔</span>}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* {contextMenu.visible && (
        <div
          className={`fixed z-50 rounded-md shadow-lg text-sm ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px`, minWidth: '140px' }}
        >
          <button
            onClick={() => {
              setContextMenu({ ...contextMenu, visible: false });
              setShowAddColumnModal(true);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-700`}
          >
            Add Column
          </button>
          <button
            onClick={() => {
              setContextMenu({ ...contextMenu, visible: false });
              // TO DO: implement deletion logic later
              showModal("Delete Column not implemented yet");
            }}
            className={`w-full text-left px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-700`}
          >
            Delete Column
          </button>
        </div>
      )} */}

      <AlertModal isOpen={showAlert} message={alertMessage} onClose={closeModal} dark={dark} />
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
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

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddColumnModal(false)} className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleAddColumn} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Add</button>
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
  );
}
