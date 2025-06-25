import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import useIsMobile from "../../hooks/useIsMobile";
import { useTableSearch } from "../../hooks/useTableSearch";
import AlertModal from "../../components/AlertModal";
import Select from 'react-select';
import { components } from 'react-select';
import MobileExcludeClientsUI from './MobileExcludeClientsUI';
import {
  Search, MoreVertical, Plus, PlusCircle, MinusCircle, Trash2, ChevronRight, Layout, Columns, Check,
  ArrowUpAZ, ArrowDownAZ, ListFilter, XCircle
} from "lucide-react";

export default function ExcludeClientsSettings() {
  const [clients, setClients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState({});
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);
  const [editingCell, setEditingCell] = useState({ id: null, key: null, value: "" });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const tableRef = useRef(null);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const { dark } = useOutletContext();
  const username = useSelector(state => state.auth.username) || "default";
  const SORT_STORAGE_KEY = `sortConfig_exclude_clients_${username}`;
  const pageKey = "excludeClients";
  const isMobile = useIsMobile();
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const contextMenuRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, columnIndex: null });
  const staticColumns = ['select', 'client_name', 'service', 'expiry_date', 'excluded_admins', 'admin_dropdown', 'actions'];
  const [columnWidths, setColumnWidths] = useState([]);
  const [columnInitDone, setColumnInitDone] = useState(false);
  const searchableKeys = ['client_name', 'service', 'expiry_date'];
  const { query, setQuery, filteredData } = useTableSearch(clients, searchableKeys);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeIndex, setResizeIndex] = useState(null);
  const [editingHeader, setEditingHeader] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [actionType, setActionType] = useState(null); // "exclude" or "include"
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAdminForAction, setSelectedAdminForAction] = useState([]);
  const dropdownRef = useRef(null);


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

  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if ((7 + dynamicColumns.length) > 0 && !columnInitDone) {
      const totalCols = 7 + dynamicColumns.length;
      const saved = localStorage.getItem('columnWidths_exclude_clients');
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

        const MIN_WIDTHS = [20, 60, 50, 60, 70, 70, 120]; // per static column index

        newWidths[index] = Math.max(startWidth + delta, MIN_WIDTHS[index] || 70);

        // newWidths[index] = Math.max(startWidth + delta, 40);

        if (next < newWidths.length) {
          // newWidths[index] = Math.max(startWidth + delta, 40);
          newWidths[index] = Math.max(startWidth + delta, MIN_WIDTHS[index] || 70);
        }

        setColumnWidths(newWidths);
        localStorage.setItem("columnWidths_exclude_clients", JSON.stringify(newWidths));
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

  const { startResizing, totalWidth } = useResizableColumns(columnWidths, setColumnWidths);

  useEffect(() => {
    const totalCols = 7 + dynamicColumns.length;
    const saved = localStorage.getItem("columnWidths_exclude_clients");
    // const defaultWidths = [
    //   40,   // Checkbox
    //   100,  // Client Name
    //   80,
    //   100,
    //   120,
    //   120,
    //   120,
    //   ...Array(dynamicColumns.length).fill(150),
    // ];

    let newWidths;
    // if (saved) {
    //   try {
    //     const parsed = JSON.parse(saved);
    //     const padded = parsed.concat(Array(defaultWidths.length - parsed.length).fill(150)).slice(0, defaultWidths.length);
    //     setColumnWidths(padded);
    //   } catch {
    //     setColumnWidths(defaultWidths);
    //   }
    // } else {
    //   setColumnWidths(defaultWidths);
    // }
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
        // 40,   // Checkbox
        // 100,  // Client Name
        // 80,
        // 100,
        // 120,
        // 120,
        // 150,
        40,   // Checkbox
        90,   // Client Name ↓ reduced
        80,   // Service
        90,   // Expiry Date ↓ reduced
        90,   // Currently Excluded ↓ reduced
        90,   // Admin ↓ reduced
        150,  // Actions ↑ increased
        ...Array(dynamicColumns.length).fill(150),
      ];
    }

    setColumnWidths(newWidths);
    localStorage.setItem('columnWidths_exclude_clients', JSON.stringify(newWidths));
    setColumnInitDone(true);
  }, [dynamicColumns.length]);


  const autoResizeColumn = (index) => {
    const key = Object.keys(columnVisibility).filter(k => columnVisibility[k])[index];
    let maxWidth = 40;

    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.font = "14px sans-serif";
    document.body.appendChild(span);

    sortedClients.forEach((client) => {
      const text = (client[key] || "").toString();
      span.innerText = text;
      const width = span.offsetWidth + 24;
      if (width > maxWidth) maxWidth = width;
    });

    document.body.removeChild(span);

    const newWidths = [...columnWidths];
    // newWidths[index] = Math.max(maxWidth, 60);
    const minSafeWidth = (key === 'actions') ? 150 : 60;
    newWidths[index] = Math.max(maxWidth, minSafeWidth);
    setColumnWidths(newWidths);
    localStorage.setItem("columnWidths_exclude_clients", JSON.stringify(newWidths));
  };

  // const fetchData = async () => {
  //   // const [clientsRes, adminsRes, fieldRes] = await Promise.all([
  //   //   axios.get('/admin/exclusion-settings'),
  //   //   axios.get('/admin/admin-users'),
  //   //   // axios.get('/admin/exclude-clients/fields')
  //   // ]);
  //   // const sample = clientsRes.data[0];
  //   // const customKeys = sample ? Object.keys(sample).filter(k => k.startsWith("custom_")) : [];
  //   // const customCols = customKeys.map(k => ({ dbKey: k, label: k.replace("custom_", "") }));
  //   // const visibility = Object.fromEntries([...staticColumns, ...customKeys].map(k => [k, true]));
  //   // setClients(clientsRes.data);
  //   // setAdmins(adminsRes.data);
  //   // setDynamicColumns(customCols);
  //   // setColumnVisibility(visibility);
  //   // setCustomColumns(dynamic);

  //   try {
  //     const [clientsRes, adminsRes, fieldsRes] = await Promise.all([
  //       axios.get('/admin/exclusion-settings'),
  //       axios.get('/admin/admin-users'),
  //       // axios.get('/admin/exclude-clients/fields')
  //     ]);

  //     const sample = clientsRes.data[0] || {};
  //     const customKeys = Object.keys(sample).filter(k => k.startsWith('custom_'));
  //     const customCols = customKeys.map(k => ({
  //       dbKey: k,
  //       label: k.replace('custom_', '').replace(/_/g, ' ')
  //     }));

  //     const visibility = {
  //       client_name: true,
  //       service: true,
  //       expiry_date: true,
  //       excluded_admins: true,
  //       admin_dropdown: true,
  //       actions: true
  //     };
  //     customCols.forEach(c => visibility[c.dbKey] = true);

  //     setClients(clientsRes.data);
  //     setAdmins(adminsRes.data);
  //     setDynamicColumns(customCols);
  //     setColumnVisibility(visibility);
  //   } catch (err) {
  //     setAlertMessage('Error loading data');
  //     setShowAlert(true);
  //   }
  // };

  // const fetchData = async () => {
  //   try {
  //     const [clientsRes, adminsRes] = await Promise.all([
  //       axios.get('/admin/exclusion-settings'),
  //       axios.get('/admin/admin-users'),
  //       // axios.get('/admin/custom-columns?pageKey=excludeClients')
  //     ]);

  //     if (!clientsRes.data || clientsRes.data.length === 0) {
  //       setClients([]);
  //       setAdmins(adminsRes.data || []);
  //       setDynamicColumns([]);
  //       return;
  //     }

  //     const sample = clientsRes.data[0];
  //     // const customKeys = Object.keys(sample).filter(k => k.startsWith('custom_'));
  //     // const customCols = customKeys.map(k => ({
  //     //   dbKey: k,
  //     //   label: k.replace('custom_', '').replace(/_/g, ' ')
  //     // }));

  //     // const uniqueCustomKeys = [...new Set(Object.keys(sample).filter(k => k.startsWith('custom_')))];
  //     // const customCols = uniqueCustomKeys.map(k => ({
  //     //   dbKey: k,
  //     //   label: k.replace('custom_', '').replace(/_/g, ' ')
  //     // }));



  //     // const keys = Object.keys(sample).filter(k => k.startsWith('custom_'));
  //     // const seen = new Set();
  //     // const customCols = [];

  //     // keys.forEach(k => {
  //     //   if (!seen.has(k)) {
  //     //     seen.add(k);
  //     //     customCols.push({
  //     //       dbKey: k,
  //     //       label: k.replace('custom_excludeClients_', '').replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase())
  //     //     });
  //     //   }
  //     // });

  //     const fieldRes = await axios.get('/admin/custom-columns?pageKey=excludeClients');
  //     const customCols = fieldRes.data.map(col => ({
  //       dbKey: col.column_name,
  //       label: col.label
  //     }));

  //     setDynamicColumns(customCols);


  //     const visibility = {
  //       select: true,
  //       client_name: true,
  //       service: true,
  //       expiry_date: true,
  //       excluded_admins: true,
  //       admin_dropdown: true,
  //       actions: true
  //     };
  //     customCols.forEach(c => visibility[c.dbKey] = true);

  //     setClients(clientsRes.data);
  //     setAdmins(adminsRes.data);
  //     setDynamicColumns(customCols);
  //     setColumnVisibility(visibility);
  //   } catch (err) {
  //     console.error('Fetch Error:', err);
  //     setAlertMessage('Error loading data');
  //     setShowAlert(true);
  //   }
  // };


  const fetchData = async () => {
    try {
      const [clientsRes, adminsRes, fieldRes] = await Promise.all([
        axios.get('/admin/exclusion-settings'),
        axios.get('/admin/admin-users'),
        axios.get('/admin/custom-columns?pageKey=excludeClients')
      ]);

      const customCols = fieldRes.data.map(col => ({
        dbKey: col.column_name,
        label: col.label
      }));

      const visibility = {
        select: true,
        client_name: true,
        service: true,
        expiry_date: true,
        excluded_admins: true,
        admin_dropdown: true,
        actions: true,
      };
      customCols.forEach(col => {
        visibility[col.dbKey] = true;
      });

      setClients(clientsRes.data);
      setAdmins(adminsRes.data);
      // setDynamicColumns(customCols); // ✅ ONLY from metadata
      setColumnVisibility(visibility);
    } catch (err) {
      console.error('Fetch Error:', err);
      setAlertMessage('Error loading data');
      setShowAlert(true);
    }
  };


  const handleExclusionAction = async (clientId, action, adminId) => {
    // const adminId = selectedAdmin[clientId];
    if (!adminId) return showModal("Select admin first.");
    try {
      await axios.patch(`/admin/exclusion-settings/${clientId}`, { action, adminId });
      setAlertMessage(`${action} successful`);
      setShowAlert(true);
      fetchData();
    } catch (err) {
      setAlertMessage('Action failed');
      setShowAlert(true);
    }
  };

  const handleBulkExclusionAction = (type) => {
    if (selected.length === 0) {
      setAlertMessage("No client is selected");
      setShowAlert(true);
      setShowDropdown(false);
      return;
    }
    setActionType(type); // 'exclude' or 'include'
    setShowActionModal(true);
    setShowDropdown(false);
  };

  const handleConfirmBulkAction = async () => {
    if (!selectedAdminForAction.length) {
      setAlertMessage("Please select at least one admin");
      setShowAlert(true);
      return;
    }

    try {
      // await Promise.all(
      //   selected.map(clientId =>
      //     axios.patch(`/admin/exclusion-settings/${clientId}`, {
      //       action: actionType,
      //       adminId: selectedAdminForAction
      //     })
      //   )
      // );
      const requests = [];

      selected.forEach(clientId => {
        selectedAdminForAction.forEach(adminId => {
          requests.push(
            axios.patch(`/admin/exclusion-settings/${clientId}`, {
              action: actionType,
              adminId
            })
          );
        });
      });

      await Promise.all(requests);
      setAlertMessage(`Clients ${actionType}d successfully`);
      setShowAlert(true);
      fetchData(); // refresh table
    } catch (err) {
      console.error(err);
      setAlertMessage("Action failed");
      setShowAlert(true);
    }
    setShowActionModal(false);
    setSelectedAdminForAction([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSelectAllVisible = () => {
    const visibleIds = filteredData.map(row => row.client_id);
    const allSelected = visibleIds.every(id => selectedRows.includes(id));
    setSelectedRows(allSelected ? [] : visibleIds);
  };

  const handleInputBlur = async (clientId, key, value) => {
    try {
      await axios.patch(`/admin/update-client-field/${clientId}`, { key, value });
      fetchData();
      setAlert({ show: true, message: "Field updated", type: "success" });
    } catch {
      setAlert({ show: true, message: "Update failed", type: "error" });
    }
    setEditingCell({});
  };

  const isColumnVisible = key => visibleColumns.includes(key);

  const getColumnKeyFromIndex = (index) => {
    const allKeys = [...staticColumns, ...dynamicColumns.map(col => col.dbKey)];
    return allKeys[index];
  };

  const handleCheckboxChange = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleColumnVisibility = (key) => {
    setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const closeModal = () => setShowAlert(false);
  const showModal = (msg) => {
    setAlertMessage(msg);
    setShowAlert(true);
  };
  const adminOptions = admins.map((admin) => ({
    label: admin.name,
    value: admin.id,
  }));

  const formatHeader = (key) => {
    const formatted = key.replace('custom_', '').replace(/_/g, ' ').toLowerCase();

    if (formatted === 'admin dropdown') return 'Admin';
    if (formatted === 'excluded admins') return 'Currently Excluded';

    return formatted.replace(/\b\w/g, l => l.toUpperCase());
  };


  const renderCell = (client, key) => {
    if (key === "excluded_admins") {
      return <span className="text-xs text-center">{client[key] || "None"}</span>;
    }
    if (key === "admin_dropdown") {
      return (
        <div className="flex justify-center items-center">

          <Select
            components={{
              IndicatorSeparator: () => null,
              DropdownIndicator: (props) => (
                <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
              )
            }}
            options={adminOptions}
            value={adminOptions.find((opt) => opt.value === selectedAdmin[client.client_id])}
            onChange={(opt) =>
              setSelectedAdmin((prev) => ({ ...prev, [client.client_id]: opt.value }))
            }
            placeholder={
              client.excluded_admins !== "None"
                ? client.excluded_admins.split(',')[0]?.trim()
                : "Select"
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
                color: dark ? '#BAC4D1' : '#1F2937',
              }),
              placeholder: (base) => ({
                ...base,
                color: dark ? '#BAC4D1' : '#6B7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: '30px',
              }),
            }}
          />
        </div>
        // </td >
      );
    }
    if (key === "actions") {
      return (
        <div className="flex gap-2 justify-center items-center">
          <button
            onClick={() => {
              const adminId = selectedAdmin[client.client_id];
              if (!adminId) {
                showModal("Select admin first.");
                return;
              }
              handleExclusionAction(client.client_id, "exclude", adminId);
            }}
            className={`px-3 py-1.5 text-xs font-medium border rounded ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'} bg-transparent}`}>Exclude</button>
          <button
            onClick={() => {
              const adminId = selectedAdmin[client.client_id];
              if (!adminId) {
                showModal("Select admin first.");
                return;
              }
              handleExclusionAction(client.client_id, "include", adminId);
            }}
            className={`px-3 py-1.5 text-xs font-medium border rounded 
          ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent`}>Include</button>
        </div>
      );
    }
    if (key.startsWith('custom_')) {
      return editingCell.id === client.client_id && editingCell.key === key ? (
        <input
          value={editingCell.value}
          onChange={e => setEditingCell({ ...editingCell, value: e.target.value })}
          onBlur={async () => {
            try {
              await axios.patch(`/admin/update-client-field/${client.client_id}`, {
                key,
                value: editingCell.value
              });
              setEditingCell({ id: null, key: null, value: '' });
              fetchData();
            } catch (err) {
              setAlertMessage('Field update failed');
              setShowAlert(true);
            }
          }}
          autoFocus
        />
      ) : (
        <span onDoubleClick={() =>
          setEditingCell({ id: client.client_id, key, value: client[key] || '' })
        }>
          {client[key] || ''}
        </span>
      );
    }
    // if (key === 'expiry_date') {
    //   return (client[key] || '').slice(0, 10);
    // }
    return client[key];
  };

  const sortedClients = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key] || "";
    const valB = b[sortConfig.key] || "";
    return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const handleToggleColumn = (key) => {
    setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    setContextMenu({ visible: false, x: 0, y: 0, columnIndex: null });
  };

  const stopResizing = () => {
    setIsResizing(false);
    setResizeIndex(null);
    localStorage.setItem(`columnWidths_${pageKey}_${username}`, JSON.stringify(columnWidths));
  };

  const handleAddColumn = async () => {
    const trimmed = newColumnName.trim();
    if (!trimmed || trimmed.length < 2) {
      showModal("Column name must be at least 2 characters.");
      return;
    }

    const prefixed = `custom_${trimmed}`;
    try {
      // await axios.post('/admin/add-column', { columnName: trimmed, pageKey: 'serviceAccess', label: trimmed });
      // localStorage.removeItem('columnWidths_service_access');
      await axios.post('/admin/add-column', {
        pageKey: 'excludeClients',
        label: newColumnName.trim()  // e.g. "Facebook Lite"
      });

      const existing = localStorage.getItem('columnWidths_exclude_clients');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 7 + (dynamicColumns.length + 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_exclude_clients', JSON.stringify(adjustedWidths));

      showModal("Column added successfully.");
      fetchData();
      setShowAddColumnModal(false);
      setNewColumnName('');
    } catch (err) {
      showModal("Failed to add column.");
    }
  };

  const handleDeleteColumn = async (index) => {
    const columnToDelete = dynamicColumns[index - 6]?.dbKey;
    if (!columnToDelete) return;

    const confirmed = window.confirm(`Delete column "${columnToDelete}"?`);
    if (!confirmed) return;

    try {
      await axios.delete('/admin/delete-column', { data: { columnName: columnToDelete, pageKey: 'excludeClients' } });
      // localStorage.removeItem('columnWidths_service_access');
      const existing = localStorage.getItem('columnWidths_exclude_clients');
      let parsed = [];
      try {
        parsed = existing ? JSON.parse(existing) : [];
      } catch { parsed = []; }

      const totalCols = 6 + (dynamicColumns.length - 1); // compute after adding/deleting column
      const adjustedWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);

      localStorage.setItem('columnWidths_exclude_clients', JSON.stringify(adjustedWidths));

      showModal("Column deleted.");
      fetchData();
    } catch (err) {
      showModal("Delete failed.");
    }

    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRenameColumn = async (oldDbKey, newLabel) => {
    const newDbKey = `custom_excludeClients_${newLabel.trim().replace(/\s+/g, '_')}`;
    // const newDbKey = `custom_${newLabel.trim().replace(/\s+/g, '_')}`;
    try {
      await axios.patch('/admin/rename-column', {
        oldColumn: oldDbKey,
        newColumn: newDbKey,
        newLabel: newLabel.trim()
      });
      setEditingHeader(null);
      fetchData();
    } catch (err) {
      showModal('Rename failed.');
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  // const handleMouseMove = (e) => {
  //   if (!isResizing || resizeIndex === null) return;
  //   const updatedWidths = [...columnWidths];
  //   const tableLeft = tableRef.current?.getBoundingClientRect().left || 0;
  //   updatedWidths[resizeIndex] = Math.max(60, e.clientX - tableLeft);
  //   setColumnWidths(updatedWidths);
  // };

  //   const handleMouseMove = (e) => {
  //   const delta = e.clientX - startX;
  //   const newWidths = [...columnWidths];
  //   newWidths[index] = Math.max(startWidth + delta, 40);
  //   setColumnWidths(newWidths);
  //   localStorage.setItem("columnWidths_exclude_clients", JSON.stringify(newWidths));
  // };


  if (isMobile) {
    return (
      <MobileExcludeClientsUI
        clients={clients}
        admins={admins}
        selected={selected}
        setSelected={setSelected}
        dark={dark}
        handleExclusionAction={handleExclusionAction}
        handleBulkExclusionAction={handleBulkExclusionAction}
        showModal={showModal}
        actionType={actionType}
        showActionModal={showActionModal}
        setShowActionModal={setShowActionModal}
        selectedAdminForAction={selectedAdminForAction}
        setSelectedAdminForAction={setSelectedAdminForAction}
        handleConfirmBulkAction={handleConfirmBulkAction}
      />
    );
  }
// min-h-[calc(100vh-190px)]
  return (
    <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto  min-h-[calc(100vh-190px)] ">
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
              <button onClick={() => handleBulkExclusionAction('include')} className={`w-full flex items-center px-3 py-1.5 gap-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                <PlusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Include</span>
              </button>
              <button onClick={() => handleBulkExclusionAction('exclude')} className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} rounded-md`}>
                <MinusCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
                <span>Exclude</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className=" mt-3"
      // ref={tableRef}
      // onMouseMove={handleMouseMove}
      // onMouseUp={stopResizing}
      >
        <div
          style={{ width: `${totalWidth}px`, minWidth: `100%` }}
        >
          <table className="table-auto text-sm w-full ">
            {/* <thead>
              <tr>
                {['select', 'client_name', 'service', 'expiry_date', 'excluded_admins', 'admin_dropdown', 'actions'].map((key, index) => {
                  if (!columnVisibility[key]) return null;

                  const labelMap = {
                    select: '',
                    client_name: 'Client Name',
                    service: 'Service',
                    expiry_date: 'Expiry Date',
                    excluded_admins: 'Currently Excluded',
                    admin_dropdown: 'Admin',
                    actions: 'Action',
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
                            // checked={selected.length === users.length}
                            // onChange={() => setSelected(selected.length === users.length ? [] : users.map(u => u.id))}
                            checked={selected.includes(client.client_id)}
                            onChange={() => handleCheckboxChange(client.client_id)}
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
                  const index = 7 + i; // after 8 static columns
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
              {/* <tr>
                {[...staticColumns, ...dynamicColumns.map(c => c.dbKey)].map((key, index) => (
                  columnVisibility[key] && (
                    <th
                      key={key}
                      onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                      className="px-4 py-2 border text-left font-semibold cursor-pointer whitespace-nowrap"
                    >
                      {key.replace("custom_", "").replace(/_/g, " ")}
                      {sortConfig.key === key && (
                        sortConfig.direction === "asc" ? <ArrowUpAZ size={14} className="inline ml-1" /> : <ArrowDownAZ size={14} className="inline ml-1" />
                      )}
                    </th>
                  )
                ))}
              </tr> */}
            {/* </thead> */}
            <thead>
              <tr>
                {Object.entries(columnVisibility).map(([key, visible], index) =>
                  visible && (
                    <th
                      key={key}
                      onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                      // onMouseDown={(e) => startResizing(index, e)}   // ✅ Add this
                      // onDoubleClick={() => autoResizeColumn(index)}   // ✅ Add this
                      style={{ width: columnWidths[index] || 40, minWidth: 40 }}
                      className={`px-2 py-3 font-semibold border-r group relative ${dark ? 'border-gray-700' : 'border-gray-300'} ${index === 0 ? 'text-left' : 'text-center'} whitespace-nowrap`}
                    >
                      <div className={`${index === 0 ? 'flex justify-start' : 'flex justify-center'} items-center`}>
                        {key === 'select' ? (
                          <input
                            type="checkbox"
                            checked={selected.length === filteredData.length}
                            onChange={() => setSelected(selected.length === clients.length ? [] : clients.map(u => u.client_id))}
                            className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                          />
                        ) : formatHeader(key)}
                      </div>
                      <div
                        className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
                        onMouseDown={(e) => startResizing(index, e)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          autoResizeColumn(index);
                        }}

                      />
                    </th>
                  )
                )}
                {dynamicColumns.map(({ dbKey, label }, i) => {
                  const index = 7 + i;
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
                          e.stopPropagation();
                          autoResizeColumn(index);
                        }}
                        className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* <tbody>
              {sortedClients.length === 0 ? (
                <tr>
                  <td colSpan={Object.keys(columnVisibility).length} className="text-center py-6 text-gray-500">
                    No clients found.
                  </td>
                </tr>
              ) : (
                sortedClients.map((client) => (
                  <tr key={client.client_id}>
                    {columnVisibility['select'] && (
                      <td className="px-2 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={selected.includes(client.client_id)}
                          onChange={() => handleCheckboxChange(client.client_id)}
                          className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                        />
                      </td>
                    )}
                    {['client_name', 'service', 'expiry_date'].includes((key, i) => columnVisibility[key] && (
                      <td key={key} style={{ width: columnWidths[i + 1] }} className="px-2 py-2 text-center">
                        <div className="w-full whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[i + 1] }}>
                          {client[key]}
                        </div>
                      </td>
                    )
                    )}
                    {['excluded_admins', 'admin_dropdown', 'actions'].includes((key, i) => columnVisibility[key] && (
                      <td key={key}
                        style={{ width: columnWidths[i + 1] }}
                        className="px-2 py-2 text-center">
                        <div className="w-full whitespace-nowrap overflow-hidden text-ellipsis mx-auto"
                          style={{ maxWidth: columnWidths[i + 1] }}
                        >
                          {renderCell(client, key)}
                        </div>
                      </td>
                    )
                    )}
                  </tr>
                )
                )
              )
              }
            </tbody> */}
            <tbody>
              {sortedClients.length === 0 ? (
                <tr>
                  <td colSpan={Object.keys(columnVisibility).length} className="text-center py-6 text-sm text-gray-500">
                    No search result found
                  </td>
                </tr>
              ) : (
                sortedClients.map((client) => (
                  <tr key={client.client_id}>
                    {Object.keys(columnVisibility).map((key, index) => {
                      if (!columnVisibility[key]) return null;
                      return (
                        <td key={index} style={{ width: columnWidths[index] }} className={`px-2 py-2 ${index === 0 ? 'text-left' : 'text-center'}`}>
                          {key === 'select' ? (
                            <input
                              type="checkbox"
                              checked={selected.includes(client.client_id)}
                              onChange={() => handleCheckboxChange(client.client_id)}
                              className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                            />
                          ) : key === 'admin_dropdown' ? (
                            <div className="w-full flex justify-center items-center">
                              {renderCell(client, key)}
                            </div>
                          ) : (
                            <div className="w-full whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[index] }}>
                              {renderCell(client, key)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {/* {dynamicColumns.map(({ dbKey }, i) => {
                      const index = 7 + i;
                      return columnVisibility[dbKey] && (
                        <td
                          key={dbKey}
                          style={{ width: columnWidths[index], minWidth: 40 }}
                          className="px-2 py-2 text-center cursor-pointer"
                          onDoubleClick={() => setEditingCell({ id: client.client_id, key: dbKey, value: client[dbKey] || '' })}
                        >
                          {editingCell.id === client.client_id && editingCell.key === dbKey ? (
                            <input
                              value={editingCell.value}
                              onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                              onBlur={async () => {
                                try {
                                  await axios.patch(`/admin/update-client-field/${client.client_id}`, {
                                    key: dbKey,
                                    value: editingCell.value
                                  });
                                  setEditingCell({ id: null, key: null, value: '' });
                                  fetchData();  // Refresh data
                                } catch (err) {
                                  setAlertMessage('Field update failed');
                                  setShowAlert(true);
                                }
                              }}
                              autoFocus
                              className="w-full text-sm px-1 py-0.5 border rounded"
                            />
                          ) : (
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[index] }}>
                              {client[dbKey] || ''}
                            </div>
                          )}
                        </td>
                      );
                    })} */}
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
            onMouseEnter={() => setShowSubmenu(true)}
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
                className={`absolute ${submenuFlipLeft ? 'right-full pr-2' : 'left-full pl-2'} border top-0 mt-[-8px] min-w-[180px] max-h-[300px] overflow-y-auto z-50 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded shadow-lg`}
                style={{
                  left: submenuFlipLeft ? 'auto' : '100%',
                  right: submenuFlipLeft ? '100%' : 'auto',
                  paddingLeft: submenuFlipLeft ? '0' : '8px',
                  paddingRight: submenuFlipLeft ? '8px' : '0'
                }}
              >
                {[...staticColumns, ...dynamicColumns.map(col => col.dbKey)].filter(key => key !== 'select').map((key) => (
                  <button
                    key={key}
                    onClick={() => toggleColumnVisibility(key)}
                    className={`flex items-center justify-between w-full px-4 py-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                  >
                    <span>{formatHeader(key)}</span>
                    {columnVisibility[key] && <Check size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />}
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
          <div className={`rounded-lg p-6 max-w-sm w-96 shadow-lg ${dark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
            <h2 className="text-lg font-semibold mb-4">Add New Column</h2>
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Enter column name"
              className={`w-full px-3 py-2 border rounded-md mb-4 text-sm ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"}`}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddColumnModal(false)} className={`px-4 py-2 text-sm border ${dark ? 'border-slate-300 text-slate-300 ' : 'border-indigo-600 text-indigo-600'} rounded `}>Cancel</button>
              <button onClick={handleAddColumn} className={`px-4 py-2 text-sm ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'} rounded`}>Add</button>
            </div>
          </div>
        </div>
      )}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className={`${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-lg max-w-sm`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {actionType === 'exclude' ? 'Exclude Clients from Admin' : 'Include Clients for Admin'}
              </h2>
              <button onClick={() => setShowActionModal(false)} className="text-xl font-bold ml-2">&times;</button>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Admin</label>
              <Select
                isMulti
                // options={admins.map(admin => ({ label: admin.name, value: admin.id }))}
                // value={admins.find(a => a.id === selectedAdminForAction)}
                // onChange={(opt) => setSelectedAdminForAction(opt.value)}
                options={adminOptions}
                value={adminOptions.filter(opt => selectedAdminForAction.includes(opt.value))}
                onChange={(opts) => setSelectedAdminForAction(opts.map(opt => opt.value))}
                className="mb-4 text-sm"
                classNamePrefix="react-select"
                placeholder="Select admin(s)"
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
            </div>
            <button
              onClick={handleConfirmBulkAction}
              className={`w-full py-2 rounded-md ${dark ? 'bg-gray-600 text-slate-300 border-gray-600 hover:bg-gray-700' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} text-sm`}>
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  );
}




