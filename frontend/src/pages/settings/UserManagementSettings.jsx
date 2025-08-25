import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios';
import Select from 'react-select';
import AlertModal from '../../components/AlertModal';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTableSearch } from '../../hooks/useTableSearch';
import useIsMobile from '../../hooks/useIsMobile';
// import MobileRoleManagementUI from './MobileRoleManagementUI';
import MobileUserManagementUI from './MobileUserManagementUI';
import { components } from 'react-select';
import { usePersistentWidths } from '../../hooks/usePersistentWidths';
import { Search, MoreVertical, PlusCircle, Users, Plus, Trash2, ArrowUpAZ, ArrowDownAZ, XCircle, Columns, ChevronRight, Check, Pencil, Phone } from 'lucide-react';
import { NoSymbolIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/PageWrapper';

export default function UserManagementSettings() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const [showBulkActionMenu, setShowBulkActionMenu] = useState(false);
  const selectedUser = selected.length === 1 ? users.find(u => u.id === selected[0]) : null;

  const [selectedRows, setSelectedRows] = useState([]);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState(null);





  const [editingHeader, setEditingHeader] = useState(null);
  const [newHeaderLabel, setNewHeaderLabel] = useState('');
  const [editingCell, setEditingCell] = useState({ id: null, key: null, value: '' });

  const dropdownRef = useRef(null);

  const { dark } = useOutletContext();
  const username = useSelector(state => state.auth.username) || 'default';
  const userId = useSelector(state => state.auth.id);
  const role = useSelector(state => state.auth.role);

  const SORT_STORAGE_KEY = `sortConfig_users_${username}`;
  const isMobile = useIsMobile();

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, columnIndex: null });
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [visibleForAll, setVisibleForAll] = useState(true);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    is_vps: 0,
    is_cerberus: 0,
    is_proxy: 0,
    is_storage: 0,
    is_varys: 0,
    is_notification: 0,
    is_mail: 0,
    is_reports: 0,
    is_settings: 0
  });
  const [formErrors, setFormErrors] = useState({});

  const labelMap = {
    is_cerberus: 'Cerberus',
    is_vps: 'VPS',
    is_proxy: 'Proxy',
    is_storage: 'Storage',
    is_varys: 'Varys',
    is_notification: 'Notification',
    is_mail: 'Mail Scheduler',
    is_reports: 'Reports',
    is_settings: 'Settings'
  };

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState(null); // holds prefilled user data

  const [editedUser, setEditedUser] = useState(null);

  useEffect(() => {
    if (editUserData) setEditedUser({ ...editUserData, password: '' });
  }, [editUserData]);


  const handleHeaderContextMenu = (e, index) => {
    e.preventDefault();

    const menuWidth = 190; // You can also measure this dynamically via ref if needed
    const screenWidth = window.innerWidth;
    const buffer = 10; // Optional gap from edge

    const clickX = e.clientX;
    const clickY = e.clientY;

    const openLeft = (clickX + menuWidth + buffer) > screenWidth;

    const finalX = openLeft ? (clickX - menuWidth) : clickX;

    const isCustom = index >= 5 && dynamicColumns[index - 5]?.dbKey?.startsWith('custom_');

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
  const confirmModal = (message, onConfirmCallback) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => async () => {
      await onConfirmCallback();   // wait for action to complete
      setShowAlert(false);         // now close the modal
    });
    setShowAlert(true);
  };


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
    if ((5 + dynamicColumns.length) > 0 && !columnInitDone) {
      const totalCols = 5 + dynamicColumns.length;
      const saved = localStorage.getItem('columnWidths_users');
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
        localStorage.setItem('columnWidths_users', JSON.stringify(newWidths));
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

  const [searchableColumns, setSearchableColumns] = useState(['name', 'username', 'role']);
  const { query, setQuery, filteredData } = useTableSearch(users || [], searchableColumns);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/manage-users');
      const fetchedUsers = res.data;

      setUsers(fetchedUsers);

      const sample = fetchedUsers[0];
      const dynamicKeys = sample ? Object.keys(sample).filter(k => k.startsWith('custom_')) : [];

      // const dynamicCols = dynamicKeys.map(col => ({
      //   dbKey: col,
      //   label: col.replace('custom_', '')
      // }));
      const metaRes = await axios.get('/admin/custom-columns?pageKey=users');
      const dynamicCols = metaRes.data.map(col => ({
        dbKey: col.column_name,
        label: col.label,
        createdBy: col.created_by,
        isGlobal: col.is_global === 1
      }));

      setDynamicColumns(dynamicCols);

      const staticSearchableKeys = ['name', 'username', 'role'];

      const dynamicSearchableKeys = dynamicCols.map(col => col.dbKey); // optional: filter some out
      const SEARCHABLE_COLUMNS = [...staticSearchableKeys, ...dynamicSearchableKeys];
      setSearchableColumns(SEARCHABLE_COLUMNS);

      setTimeout(() => {
        const totalCols = 5 + dynamicCols.length;

        const saved = localStorage.getItem('columnWidths_users');
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
            40, 100, 100, 80, 120,
            ...Array(dynamicCols.length).fill(150)
          ];
        }

        setColumnWidths(newWidths);
        localStorage.setItem('columnWidths_users', JSON.stringify(newWidths));
        setColumnInitDone(true);

      }, 100);


      const visibilityObj = {
        select: true,
        name: true,
        username: true,

        role: true,

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
        pageKey: 'users',
        label: newColumnName.trim(),  // e.g. "Facebook Lite"
        isGlobal: visibleForAll
      });

      // localStorage.removeItem('columnWidths_service_access');
      const existing = localStorage.getItem('columnWidths_users');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 5 + (dynamicColumns.length + 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_users', JSON.stringify(adjustedWidths));

      showModal("Column added successfully.");
      fetchUsers();
      setShowAddColumnModal(false);
      setNewColumnName('');
    } catch (err) {
      showModal("Failed to add column.");
    }
  };

  const handleDeleteColumn = async (index) => {
    // const columnToDelete = dynamicColumns[index - 5]?.dbKey;
    // if (!columnToDelete) return;

    const column = dynamicColumns[index - 5];
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
      await axios.delete('/admin/delete-column', { data: { columnName: columnToDelete, pageKey: 'users' } });
      // localStorage.removeItem('columnWidths_service_access');
      const existing = localStorage.getItem('columnWidths_users');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 5 + (dynamicColumns.length - 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_users', JSON.stringify(adjustedWidths));

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
    const newDbKey = `custom_users_${newLabel.trim().replace(/\s+/g, '_')}`;
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

  const handleMenuOption = (action) => {
    setShowBulkActionMenu(false); // Close menu after selection
    switch (action) {
      case 'add':
        setShowAddUserModal(true);
        // console.log("Add user clicked");
        break;
      case 'delete':
        handleBulkDeleteUsers();
        break;
      case 'edit':
        if (selected.length === 0) {
          showModal("No user selected");
          return;
        }
        if (selected.length > 1) {
          showModal("Select only 1 user");
          return;
        }
        const userToEdit = users.find(u => u.id === selected[0]);
        setEditUserData(userToEdit);
        setShowEditUserModal(true);
        break;
      case 'restrict':
        if (selected.length === 0) {
          showModal("No users selected");
          return;
        }

        confirmModal("Are you sure you want to restrict these users?", async () => {
          try {
            await axios.post("/admin/restrict-users", { ids: selected });
            setSelected([]);
            showModal("Users restricted successfully.");
            fetchUsers();
          } catch (err) {
            showModal("Restriction failed.");
          }
        });
        break;

      // case 'restrict':
      //   console.log("Restrict user clicked");
      //   break;
      case 'unrestrict':
        if (selected.length === 0) {
          showModal("No users selected");
          return;
        }
        confirmModal("Are you sure you want to unrestrict these users?", async () => {
          try {
            await axios.post("/admin/unrestrict-users", { ids: selected });
            setSelected([]);
            showModal("Users unrestricted successfully.");
            fetchUsers();
          } catch (err) {
            showModal("Unrestriction failed.");
          }
        });
        break;

      default:
        break;
    }
  };

  const handleAddUserSubmit = async () => {
    const requiredFields = ['name', 'username', 'email', 'role', 'password'];
    const errors = {};

    requiredFields.forEach(field => {
      if (!newUser[field]) errors[field] = 'Required';
    });

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      await axios.post('/admin/create-user', newUser);
      setShowAddUserModal(false);
      setNewUser({
        name: '', username: '', email: '', phone: '', role: '', password: '',
        is_vps: 0, is_cerberus: 0, is_proxy: 0, is_storage: 0, is_varys: 0,
        is_notification: 0, is_mail: 0, is_reports: 0, is_settings: 0
      });
      fetchUsers();
      showModal("User added successfully.");
    } catch (err) {
      console.error("User creation failed", err);
      showModal("User creation failed.");
    }
  };

  const handleEditUserSubmit = async () => {
    try {
      const payload = { ...editedUser };

      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }
      await axios.patch(`/admin/update-user/${editedUser.id}`, payload);
      setShowEditUserModal(false);
      showModal("User updated successfully.");
      fetchUsers(); // Refresh
    } catch (err) {
      console.error("Edit failed", err);
      showModal("Failed to update user.");
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await axios.delete(`/admin/delete-user/${userId}`);
      showModal("User deleted successfully");
      fetchUsers(); // refresh
    } catch (err) {
      console.error("Delete failed", err);
      showModal("Failed to delete user");
    }
  };


  const handleBulkDeleteUsers = async () => {
    if (selected.length === 0) {
      showModal("No users selected");
      return;
    }

    confirmModal("Are you sure you want to delete these users?", async () => {
      try {
        await axios.post("/admin/delete-multiple-users", { ids: selected });
        setSelected([]); // Clear selection
        await fetchUsers();     // Refresh data
        showModal("Users deleted successfully.");
      } catch (err) {
        console.error("Delete failed:", err);
        showModal("Failed to delete selected users.");
      }
    });
  };

  const handleRestrictUser = async (id) => {
    try {
      const res = await axios.patch(`/admin/restrict-user/${id}`); // Assuming toggle logic at backend

      // Update the local user state
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, is_restricted: user.is_restricted ? 0 : 1 } : user
        )
      );
    } catch (err) {
      console.error('Failed to restrict user:', err);
      setAlertMessage('Failed to restrict/unrestrict user');
      setShowAlert(true);
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

  const getColumnKeyFromIndex = (index) => {
    const staticKeys = ['select', 'name', 'username', 'role', 'action'];
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
    localStorage.setItem('columnWidths_users', JSON.stringify(newWidths));
  };

  const columnKeys = ['select', 'name', 'username', 'role', 'action'];
  const columnLabels = {
    select: '', name: 'Full Name', username: 'Username',
    role: 'Role', action: 'Action'
  };




  const showModal = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const closeModal = () => setShowAlert(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowBulkActionMenu(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);



  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setShowBulkRoleDropdown(false);
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

  // if (isMobile) {
  //   return (
  //     <MobileRoleManagementUI
  //       users={users}
  //       selected={selected}
  //       setSelected={setSelected}   
  //       dark={dark}
  //       showModal={showModal}
  //       fetchUsers={fetchUsers}

  //     />
  //   );
  // }

  if (isMobile) {
    return (
      <>
        <MobileUserManagementUI
          users={users}
          selected={selected}
          setSelected={setSelected}
          fetchUsers={fetchUsers}
          dark={dark}
          handleDeleteUser={handleDeleteUser}
          handleRestrictUser={handleRestrictUser}
          handleMenuOption={handleMenuOption}
          selectedUser={selectedUser}
        />
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"}  rounded-lg p-6 w-full max-w-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Add New User</h2>
                <button onClick={() => setShowAddUserModal(false)}><XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['name', 'username', 'email', 'phone', 'password'].map(field => (
                  <div key={field} className="col-span-1">
                    <label className="block text-sm font-medium mb-1 capitalize">
                      {field.replace('_', ' ')}
                      {field !== 'phone' && (
                        <span className={`${dark ? "text-slate-300" : " text-blue-900"}`}>*</span>
                      )}
                    </label>
                    <input
                      type={field === 'password' ? 'password' : 'text'}
                      value={newUser[field]}
                      onChange={e => setNewUser({ ...newUser, [field]: e.target.value })}
                      autoComplete="new-password"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                      placeholder={`Enter ${field}`}
                    />
                    {formErrors[field] && <p className="text-red-500 text-xs">{formErrors[field]}</p>}
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Set Role<span className={`${dark ? "text-slate-300" : " text-blue-900"}`}>*</span></label>
                  <Select
                    components={{
                      IndicatorSeparator: () => null,
                      DropdownIndicator: (props) => (
                        <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                      )
                    }}
                    value={newUser.role ? { label: newUser.role, value: newUser.role } : null}
                    onChange={(opt) => setNewUser({ ...newUser, role: opt.value })}
                    options={[
                      { label: 'Admin', value: 'admin' },
                      { label: 'Middleman', value: 'middleman' }
                    ]}
                    className="text-md"
                    styles={{
                      control: (base) => ({
                        ...base,
                        boxShadow: 'none',
                        backgroundColor: dark ? '#1F2937' : '#ffffff',
                        color: dark ? '#99C2FF' : '#1F2937',
                        borderColor: '#E5E7EB',
                        '&:hover': {
                          borderColor: '#CBD5E1',
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: dark ? '#1F2937' : '#ffffff',
                        zIndex: 99,
                        padding: '4px',
                        borderRadius: '8px',
                        overflowX: 'hidden'
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? (dark ? '#374151' : '#E0E7FF') // gray-700 or indigo-100
                          : 'transparent',
                        color: dark ? '#99C2FF' : '#1e3a8a',
                        borderRadius: '6px',
                        margin: '4px 0',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: dark ? '#ffffff' : '#1e3a8a',
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        paddingLeft: 8,
                        paddingRight: 4, // shrink right padding
                      }),

                      placeholder: (base) => ({
                        ...base,
                        color: dark ? '#9CA3AF' : '#a3aed0',
                      }),
                    }}
                  />
                  {formErrors.role && <p className="text-red-500 text-xs">{formErrors.role}</p>}
                </div>
              </div>

              {/* Conditional toggles */}
              {(newUser.role === 'admin' || newUser.role === 'middleman') && (
                <div className="mt-4 ">
                  <h3 className={`text-sm font-semibold mb-1 ${dark ? "text-slate-300" : "text-blue-900"}`}>
                    {newUser.role === 'admin' ? 'Access to Services and Panel' : 'Access to Panel'}
                  </h3>
                  <div className="grid grid-cols-3 mb-1 gap-2 border border-slate-200 rounded w-full px-3 py-2">
                    {[
                      ...(newUser.role === 'admin' ? ['is_cerberus', 'is_vps', 'is_proxy', 'is_storage', 'is_varys'] : []),
                      'is_notification', 'is_mail', 'is_reports', 'is_settings'
                    ].map(key => (
                      <label key={key} className="text-sm flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newUser[key] === 1}
                          onChange={() => setNewUser({ ...newUser, [key]: newUser[key] ? 0 : 1 })}
                          className={`${dark ? 'accent-slate-200' : 'accent-indigo-600'}`}
                        />
                        <span>{labelMap[key] || key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleAddUserSubmit}
                  className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditUserModal && editedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} rounded-lg p-6 w-full max-w-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Edit User</h2>
                <button onClick={() => setShowEditUserModal(false)}>
                  <XMarkIcon className={`w-5 h-5 ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                </button>
              </div>

              {/* User Form */}
              <div className="grid grid-cols-2 gap-4">
                {['name', 'username', 'email', 'phone', 'password'].map(field => (
                  <div key={field} className="col-span-1">
                    <label className="block text-sm font-medium mb-1 capitalize">{field.replace('_', ' ')}
                      {field !== 'phone' && (
                        <span className={`${dark ? "text-slate-300" : " text-blue-900"}`}>*</span>
                      )}</label>
                    {/* <input
                    type={field === 'password' ? 'password' : 'text'}
                    value={editedUser?.[field] ?? ''}
                    onChange={(e) => setEditedUser({ ...editedUser, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                  /> */}
                    {field === 'password' ? (
                      <input
                        type="password"
                        value={editedUser?.password ?? ''}
                        onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
                        autoComplete="new-password"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        placeholder="Enter new password"
                      />
                    ) : (
                      <input
                        type="text"
                        value={editedUser[field] ?? ''}
                        onChange={(e) => setEditedUser({ ...editedUser, [field]: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Role and toggles */}
              <div className="col-span-2">
                <label className="block text-sm mt-4 font-medium mb-1">Set Role*</label>
                <Select
                  components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: (props) => (
                      <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                    )
                  }}
                  value={{ label: editedUser.role, value: editedUser.role }}
                  onChange={(opt) => setEditedUser({ ...editedUser, role: opt.value })}
                  options={[{ label: 'Admin', value: 'admin' }, { label: 'Middleman', value: 'middleman' }]}
                  className="text-md"
                  styles={{
                    control: (base) => ({
                      ...base,
                      boxShadow: 'none',
                      backgroundColor: dark ? '#1F2937' : '#ffffff',
                      color: dark ? '#99C2FF' : '#1F2937',
                      borderColor: '#E5E7EB',
                      '&:hover': {
                        borderColor: '#CBD5E1',
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: dark ? '#1F2937' : '#ffffff',
                      zIndex: 99,
                      padding: '4px',
                      borderRadius: '8px',
                      overflowX: 'hidden'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? (dark ? '#374151' : '#E0E7FF') // gray-700 or indigo-100
                        : 'transparent',
                      color: dark ? '#99C2FF' : '#1e3a8a',
                      borderRadius: '6px',
                      margin: '4px 0',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: dark ? '#ffffff' : '#1e3a8a',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      paddingLeft: 8,
                      paddingRight: 4, // shrink right padding
                    }),

                    placeholder: (base) => ({
                      ...base,
                      color: dark ? '#9CA3AF' : '#a3aed0',
                    }),
                  }}
                />
              </div>

              {/* Toggles */}
              {(editedUser.role === 'admin' || editedUser.role === 'middleman') && (
                <div className="mt-4">
                  <h3 className={`text-sm font-semibold mb-1 ${dark ? "text-slate-300" : "text-blue-900"}`}>
                    {editedUser.role === 'admin' ? 'Access to Services and Panel' : 'Access to Panel'}
                  </h3>
                  <div className="grid grid-cols-3 gap-2 mb-1 border border-slate-200 rounded w-full px-3 py-2">
                    {[...(editedUser.role === 'admin' ? ['is_cerberus', 'is_vps', 'is_proxy', 'is_storage', 'is_varys'] : []),
                      'is_notification', 'is_mail', 'is_reports', 'is_settings'
                    ].map(key => (
                      <label key={key} className="text-sm flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedUser[key] === 1}
                          onChange={() => setEditedUser({ ...editedUser, [key]: editedUser[key] ? 0 : 1 })}
                          className={`${dark ? 'accent-slate-200' : 'accent-indigo-600'}`}
                        />
                        <span>{labelMap[key]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Save button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleEditUserSubmit}
                  className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <AlertModal
          isOpen={showAlert}
          message={confirmMessage || alertMessage}
          onClose={closeModal}
          onConfirm={onConfirmAction}  // This will show Yes/No only if it's set
          dark={dark}
        />
      </>
    );
  }


  return (
    <PageWrapper>
      <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto min-h-[calc(100vh-12em)] ">
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
              ref={dropdownRef}>
              <button
                onClick={() => setShowBulkActionMenu(prev => !prev)}
                className={`p-1.5 ml-3 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}
              >
                <MoreVertical size={18} />
              </button>

              {showBulkActionMenu && (
                <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>

                  <button onClick={() => handleMenuOption('add')} className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                    <Plus size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                    <span>Add New User</span>
                  </button>
                  <button onClick={() => handleMenuOption('edit')} className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                    <Pencil size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                    <span>Edit User</span>
                  </button>
                  <button onClick={() => handleMenuOption('delete')} className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                    <Trash2 size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                    <span>Delete User</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedUser?.is_restricted) handleMenuOption('restrict');
                    }}
                    className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}
                  >
                    <NoSymbolIcon size={16} className={`w-4 h-4 ${dark ? 'text-white' : 'text-indigo-900'}`} />
                    <span>
                      Restrict User
                    </span>
                  </button>
                  <button
                    onClick={() => handleMenuOption('unrestrict')}
                    className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}
                  >
                    <CheckCircleIcon size={16} className={`w-4 h-4 ${dark ? 'text-white' : 'text-indigo-900'}`} />
                    <span>Unrestrict User</span>
                  </button>



                  {/* <li onClick={() => handleMenuOption('restrict')} className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>Restrict User</li> */}

                </div>
              )}
            </div>

          </div>

          <div className="mt-3">
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
                      const index = 5 + i; // after 7 static columns
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
                    <tr><td colSpan={5} className="text-center py-6 text-gray-500 text-sm">No search result found</td></tr>
                  ) : (
                    // Array.isArray(filteredData) && filteredData.map(user => (
                    sortedData.map(user => (
                      <tr key={user.id}
                        className="transition-all duration-300 ease-in-out transform animate-fade-in">
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
                          if (['name', 'username', 'role'].includes(key)) {
                            return (
                              <td key={key} style={{ width: columnWidths[index] }} className="px-2 py-2 text-center">
                                <div className="w-full whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[index] }}>
                                  {user[key]}
                                </div>
                              </td>
                            )
                          }

                          if (key === 'action') {
                            return (
                              <td key={key} className="text-center px-2 py-2">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className={`px-3 py-1.5 text-xs font-medium border rounded ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`}
                                  >Delete</button>

                                  {/* {user.is_restricted === 1 ? (
                                <button
                                  
                                  className={`px-3 py-1.5 text-xs font-medium border rounded cursor-not-allowed opacity-50 $${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent`}
                                >Restricted</button>
                              ) : (
                                <button
                                  onClick={() => handleRestrictUser(user.id)}
                                  className={`px-3 py-1.5 text-xs font-medium border rounded ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent`}
                                >Restrict</button>
                              )} */}
                                  <button
                                    onClick={() => handleRestrictUser(user.id)}
                                    className={`px-3 py-1.5 text-xs font-medium border rounded 
    ${dark
                                        ? 'hover:bg-gray-500 text-slate-300 border-slate-300'
                                        : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'
                                      } bg-transparent`}
                                  >
                                    {user.is_restricted === 1 ? 'Restricted' : 'Restrict'}
                                  </button>

                                </div>
                              </td>
                            );
                          }

                          return <td key={key} className="text-center px-2 py-2">{user[key]}</td>;
                        })}
                        {dynamicColumns.map(({ dbKey }, i) => {
                          const index = 5 + i;
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

          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center ">
              <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"}  rounded-lg p-6 w-full max-w-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Add New User</h2>
                  <button onClick={() => setShowAddUserModal(false)}><XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['name', 'username', 'email', 'phone', 'password'].map(field => (
                    <div key={field} className="col-span-1">
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {field.replace('_', ' ')}
                        {field !== 'phone' && (
                          <span className={`${dark ? "text-slate-300" : " text-blue-900"}`}>*</span>
                        )}
                      </label>
                      <input
                        type={field === 'password' ? 'password' : 'text'}
                        value={newUser[field]}
                        onChange={e => setNewUser({ ...newUser, [field]: e.target.value })}
                        autoComplete="new-password"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        placeholder={`Enter ${field}`}
                      />
                      {formErrors[field] && <p className="text-red-500 text-xs">{formErrors[field]}</p>}
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Set Role<span className={`${dark ? "text-slate-300" : " text-blue-900"}`}>*</span></label>
                    <Select
                      components={{
                        IndicatorSeparator: () => null,
                        DropdownIndicator: (props) => (
                          <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                        )
                      }}
                      value={newUser.role ? { label: newUser.role, value: newUser.role } : null}
                      onChange={(opt) => setNewUser({ ...newUser, role: opt.value })}
                      options={[
                        { label: 'Admin', value: 'admin' },
                        { label: 'Middleman', value: 'middleman' }
                      ]}
                      className="text-md"
                      styles={{
                        control: (base) => ({
                          ...base,
                          boxShadow: 'none',
                          backgroundColor: dark ? '#1F2937' : '#ffffff',
                          color: dark ? '#99C2FF' : '#1F2937',
                          borderColor: '#E5E7EB',
                          '&:hover': {
                            borderColor: '#CBD5E1',
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: dark ? '#1F2937' : '#ffffff',
                          zIndex: 99,
                          padding: '4px',
                          borderRadius: '8px',
                          overflowX: 'hidden'
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused
                            ? (dark ? '#374151' : '#E0E7FF') // gray-700 or indigo-100
                            : 'transparent',
                          color: dark ? '#99C2FF' : '#1e3a8a',
                          borderRadius: '6px',
                          margin: '4px 0',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: dark ? '#ffffff' : '#1e3a8a',
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          paddingLeft: 8,
                          paddingRight: 4, // shrink right padding
                        }),

                        placeholder: (base) => ({
                          ...base,
                          color: dark ? '#9CA3AF' : '#a3aed0',
                        }),
                      }}
                    />
                    {formErrors.role && <p className="text-red-500 text-xs">{formErrors.role}</p>}
                  </div>
                </div>

                {/* Conditional toggles */}
                {(newUser.role === 'admin' || newUser.role === 'middleman') && (
                  <div className="mt-4 ">
                    <h3 className={`text-sm font-semibold mb-1 ${dark ? "text-slate-300" : "text-blue-900"}`}>
                      {newUser.role === 'admin' ? 'Access to Services and Panel' : 'Access to Panel'}
                    </h3>
                    <div className="grid grid-cols-3 mb-1 gap-2 border border-slate-200 rounded w-full px-3 py-2">
                      {[
                        ...(newUser.role === 'admin' ? ['is_cerberus', 'is_vps', 'is_proxy', 'is_storage', 'is_varys'] : []),
                        'is_notification', 'is_mail', 'is_reports', 'is_settings'
                      ].map(key => (
                        <label key={key} className="text-sm flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newUser[key] === 1}
                            onChange={() => setNewUser({ ...newUser, [key]: newUser[key] ? 0 : 1 })}
                            className={`${dark ? 'accent-slate-200' : 'accent-indigo-600'}`}
                          />
                          <span>{labelMap[key] || key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleAddUserSubmit}
                    className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditUserModal && editedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"} rounded-lg p-6 w-full max-w-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Edit User</h2>
                  <button onClick={() => setShowEditUserModal(false)}>
                    <XMarkIcon className={`w-5 h-5 ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
                  </button>
                </div>

                {/* User Form */}
                <div className="grid grid-cols-2 gap-4">
                  {['name', 'username', 'email', 'phone', 'password'].map(field => (
                    <div key={field} className="col-span-1">
                      <label className="block text-sm font-medium mb-1 capitalize">{field.replace('_', ' ')}
                        {field !== 'phone' && (
                          <span className={`${dark ? "text-slate-300" : " text-blue-900"}`}>*</span>
                        )}</label>
                      {/* <input
                    type={field === 'password' ? 'password' : 'text'}
                    value={editedUser?.[field] ?? ''}
                    onChange={(e) => setEditedUser({ ...editedUser, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                  /> */}
                      {field === 'password' ? (
                        <input
                          type="password"
                          value={editedUser?.password ?? ''}
                          onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
                          autoComplete="new-password"
                          className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                          placeholder="Enter new password"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editedUser[field] ?? ''}
                          onChange={(e) => setEditedUser({ ...editedUser, [field]: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Role and toggles */}
                <div className="col-span-2">
                  <label className="block text-sm mt-4 font-medium mb-1">Set Role*</label>
                  <Select
                    components={{
                      IndicatorSeparator: () => null,
                      DropdownIndicator: (props) => (
                        <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
                      )
                    }}
                    value={{ label: editedUser.role, value: editedUser.role }}
                    onChange={(opt) => setEditedUser({ ...editedUser, role: opt.value })}
                    options={[{ label: 'Admin', value: 'admin' }, { label: 'Middleman', value: 'middleman' }]}
                    className="text-md"
                    styles={{
                      control: (base) => ({
                        ...base,
                        boxShadow: 'none',
                        backgroundColor: dark ? '#1F2937' : '#ffffff',
                        color: dark ? '#99C2FF' : '#1F2937',
                        borderColor: '#E5E7EB',
                        '&:hover': {
                          borderColor: '#CBD5E1',
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: dark ? '#1F2937' : '#ffffff',
                        zIndex: 99,
                        padding: '4px',
                        borderRadius: '8px',
                        overflowX: 'hidden'
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? (dark ? '#374151' : '#E0E7FF') // gray-700 or indigo-100
                          : 'transparent',
                        color: dark ? '#99C2FF' : '#1e3a8a',
                        borderRadius: '6px',
                        margin: '4px 0',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: dark ? '#ffffff' : '#1e3a8a',
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        paddingLeft: 8,
                        paddingRight: 4, // shrink right padding
                      }),

                      placeholder: (base) => ({
                        ...base,
                        color: dark ? '#9CA3AF' : '#a3aed0',
                      }),
                    }}
                  />
                </div>

                {/* Toggles */}
                {(editedUser.role === 'admin' || editedUser.role === 'middleman') && (
                  <div className="mt-4">
                    <h3 className={`text-sm font-semibold mb-1 ${dark ? "text-slate-300" : "text-blue-900"}`}>
                      {editedUser.role === 'admin' ? 'Access to Services and Panel' : 'Access to Panel'}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-1 border border-slate-200 rounded w-full px-3 py-2">
                      {[...(editedUser.role === 'admin' ? ['is_cerberus', 'is_vps', 'is_proxy', 'is_storage', 'is_varys'] : []),
                        'is_notification', 'is_mail', 'is_reports', 'is_settings'
                      ].map(key => (
                        <label key={key} className="text-sm flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editedUser[key] === 1}
                            onChange={() => setEditedUser({ ...editedUser, [key]: editedUser[key] ? 0 : 1 })}
                            className={`${dark ? 'accent-slate-200' : 'accent-indigo-600'}`}
                          />
                          <span>{labelMap[key]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleEditUserSubmit}
                    className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}


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
                      { key: 'role', label: 'Role' },

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


          {/* <AlertModal isOpen={showAlert} message={alertMessage} onClose={closeModal} dark={dark} /> */}
          <AlertModal
            isOpen={showAlert}
            message={confirmMessage || alertMessage}
            onClose={closeModal}
            onConfirm={onConfirmAction}  // This will show Yes/No only if it's set
            dark={dark}
          />


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
                <div className="flex items-center space-x-2 mt-2">
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
    </PageWrapper>
  );
}