import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import AddClientModal from '../components/AddClientModal';
import EditClientModal from '../components/EditClientModal';
import BulkEditClientModal from '../components/BulkEditClientModal';
import axios from '../api/axios';
import dayjs from 'dayjs';
import AlertModal from '../components/AlertModal';
import ExportClientModal from '../components/ExportClientModal';
import ImportClientModal from '../components/ImportClientModal';
import useIsMobile from '../hooks/useIsMobile';
import { useOutletContext } from 'react-router-dom';
import { useTableSearch } from '../hooks/useTableSearch';
import { getClients, updateClient } from '../api/clientService';
import { Search, MoreVertical, PlusCircle, Download, Upload, MinusCircle, Plus, Pencil, Trash2, ChevronRight, Layout, Columns, Check, ArrowUpAZ, ArrowDownAZ, ListFilter, XCircle, ChevronLeft } from 'lucide-react';
import Select from 'react-select';
import { components } from 'react-select';
import { DateRange } from 'react-date-range';
import { getDateRangeForFilter } from '../utils/dateUtils';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function ClientsPage() {
  const dynamicKeysRef = useRef([]);
  const { dark } = useOutletContext();
  const [clients, setClients] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selected, setSelected] = useState([]);
  const [editingCell, setEditingCell] = useState({ id: null, key: null, value: '' });
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnWidths, setColumnWidths] = useState([]);
  const [columnInitDone, setColumnInitDone] = useState(false);
  const isMobile = useIsMobile();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const role = useSelector(state => state.auth.role);

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [showSingleEditModal, setShowSingleEditModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20); // Page size
  const [total, setTotal] = useState(0);  // Total client count

  const [dateFilter, setDateFilter] = useState('last30');
  const [customRange, setCustomRange] = useState({ startDate: new Date(), endDate: new Date(), key: 'selection' });
  const [showCalendar, setShowCalendar] = useState(false);

  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [visibleForAll, setVisibleForAll] = useState(true);
  const [dynamicColumns, setDynamicColumns] = useState([]); // populated from DB
  const [editingHeader, setEditingHeader] = useState(null);
  const [newHeaderLabel, setNewHeaderLabel] = useState('');


  const pageKey = 'clients';
  const COLUMN_WIDTHS_KEY = `columnWidths_${pageKey}`;
  const staticColumnWidths = [
    20, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100
  ];

  const baseColumns = [
    'select', 'client_name', 'email_or_phone', 'middleman_name', 'service', 'plan',
    'instance_no', 'ip_address', 'proxy_set', 'proxy_count',
    'accounts_count', 'user_address', 'price', 'currency', 'start_date', 'expiry_date',
    'middleman_share', 'payment_status', 'amount_paid', 'amount_due', 'paid_to', 'notes'
  ];

  const filteredColumns = role === 'middleman'
    ? baseColumns.filter(col => col !== 'middleman_name' && col !== 'paid_to')
    : baseColumns;

  const requiredColumns = filteredColumns;


  const [searchableColumns, setSearchableColumns] = useState(['client_name', 'email_or_phone', 'middleman_name']);

  const columnLabels = {
    select: '',
    client_name: 'Client Name',
    email_or_phone: 'Email/Number',
    middleman_name: 'Middleman Name',
    service: 'Service',
    plan: 'Plan',
    instance_no: 'Instance No.',
    ip_address: 'IP Address',
    proxy_set: 'Proxy Set',
    proxy_count: 'Proxy Count',
    accounts_count: 'Accounts Count',
    user_address: 'User Address',
    price: 'Price',
    currency: 'Currency',
    start_date: 'Start Date',
    expiry_date: 'Expiry Date',
    middleman_share: "MM's Share",
    payment_status: 'Payment Status',
    amount_paid: 'Amount Paid',
    amount_due: 'Amount Due',
    paid_to: 'Paid To',
    notes: 'Notes'
  };

  const formatDate = (raw) => {
    if (!raw) return '';
    const date = new Date(raw);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, columnIndex: null });
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [submenuFlipLeft, setSubmenuFlipLeft] = useState(false);
  const submenuRef = useRef(null);
  const submenuTriggerRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const username = useSelector(state => state.auth.username);
  const SORT_STORAGE_KEY = `sortConfig_clients_${username}`;
  const SORT_KEY = `sortConfig_${pageKey}_${username}`;
  const VISIBILITY_KEY = `columnVisibility_${pageKey}`;

  // const handleHeaderContextMenu = (e, index) => {
  //   e.preventDefault();
  //   const menuWidth = 190;
  //   const screenWidth = window.innerWidth;
  //   const buffer = 10;
  //   const clickX = e.clientX;
  //   const clickY = e.clientY;
  //   const openLeft = (clickX + menuWidth + buffer) > screenWidth;
  //   const finalX = openLeft ? (clickX - menuWidth) : clickX;

  //   // ✅ Recompute visible keys
  //   const visibleKeys = [
  //     ...requiredColumns,
  //     ...dynamicColumns.map(c => c.column_name)
  //   ].filter(key => columnVisibility[key]);

  //   // ✅ Get actual key
  //   const columnKey = visibleKeys[index];

  //   // ✅ Determine if dynamic
  //   const isDynamic = !!dynamicColumns.find(col => col.column_name === columnKey);
  //   const allowDelete = isDynamic === true;


  //   // ✅ Show menu
  //   setContextMenu({
  //     visible: true,
  //     x: finalX,
  //     y: clickY,
  //     columnIndex: index,
  //     allowDelete: allowDelete,
  //     openLeft
  //   });
  // };

  const handleHeaderContextMenu = (e, index) => {
    e.preventDefault();

    const menuWidth = 190;
    const screenWidth = window.innerWidth;
    const buffer = 10;
    const clickX = e.clientX;
    const clickY = e.clientY;
    const openLeft = (clickX + menuWidth + buffer) > screenWidth;
    const finalX = openLeft ? (clickX - menuWidth) : clickX;

    // ✅ Build correct visibleKeys list
    const allKeys = [
      ...requiredColumns,
      ...dynamicColumns.map(col => col.column_name)
    ];
    const visibleKeys = allKeys.filter(key => columnVisibility[key]);

    // ✅ Get the actual column key that was clicked
    const columnKey = visibleKeys[index];

    // ✅ FINAL FIX: Check directly if this columnKey exists in dynamicColumns
    const isDynamic = dynamicColumns.some(col => col.column_name === columnKey);

    setContextMenu({
      visible: true,
      x: finalX,
      y: clickY,
      columnIndex: index,
      allowDelete: isDynamic,
      openLeft
    });

    // console.log("visibleKeys:", visibleKeys);
    // console.log("columnKey:", columnKey);
    // console.log("dynamicColumns:", dynamicColumns.map(d => d.column_name));
    // console.log("isDynamic:", isDynamic);

  };


  const columns = requiredColumns
    .filter(k => k !== 'select') // optional: exclude select checkbox
    .map(key => ({
      key,
      label: columnLabels[key] || key
    }));

  const getColumnKeyFromIndex = (index) => {
    const visibleKeys = requiredColumns.filter(k => columnVisibility[k]);
    return visibleKeys[index] || '';
  };

  const handleSort = (key, direction) => {
    const config = { key, direction };
    setSortConfig(config);
    localStorage.setItem(SORT_KEY, JSON.stringify(config));
  };


  const toggleColumnVisibility = (key) => {
    setColumnVisibility(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(VISIBILITY_KEY, JSON.stringify(updated));
      return updated;
    });
  };


  const fetchClients = async (dynamicKeys = []) => {
    try {
      let params = {
        dateFilter,
        page,
        limit,
        service: serviceFilter
      };
      if (dateFilter === 'custom') {
        const startDate = customRange.startDate;
        let endDate = customRange.endDate;

        // 🧠 If same day selected, don't add extra day
        const isSameDay =
          startDate.toDateString() === endDate.toDateString();

        if (!isSameDay) {
          endDate = new Date(endDate.getTime() + 86400000); // include full end day
        }

        params.customRange = { startDate, endDate };
      }

      // const data = await getClients(params);
      const response = await getClients(params);
      const data = response.clients || [];
      const totalCount = response.total || 0;

      setTotal(totalCount);  // 👈 for page count


      const filteredData = data.map(client => {
        const filtered = {};
        [...requiredColumns, ...dynamicKeys].forEach(col => {
          if (col === 'select') return;
          filtered[col] = client[col];
        });
        filtered.id = client.id;
        return filtered;
      });
      setClients(filteredData);

      // const visObj = {};
      // requiredColumns.forEach(k => visObj[k] = true);
      // dynamicKeys.forEach(k => visObj[k] = true);
      // setColumnVisibility(visObj);


      const validKeys = [...requiredColumns, ...dynamicKeysRef.current];
      const current = JSON.parse(localStorage.getItem(VISIBILITY_KEY) || '{}');

      // Add new keys as visible
      validKeys.forEach(k => {
        if (!(k in current)) current[k] = true;
      });

      // Remove invalid keys
      const cleaned = Object.fromEntries(
        Object.entries(current).filter(([k]) => validKeys.includes(k))
      );

      localStorage.setItem(VISIBILITY_KEY, JSON.stringify(cleaned));
      setColumnVisibility(cleaned);


      setColumnInitDone(true);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const fetchCustomColumns = async () => {
    try {
      const res = await axios.get('/admin/custom-columns?pageKey=clients');
      const dynamicKeys = res.data.map(col => col.column_name);

      dynamicKeysRef.current = dynamicKeys;
      setDynamicColumns(res.data);

      const validKeys = new Set([...requiredColumns, ...dynamicKeys]);
      const currentVisibility = JSON.parse(localStorage.getItem(VISIBILITY_KEY) || '{}');

      dynamicKeys.forEach(k => {
        if (!(k in currentVisibility)) currentVisibility[k] = true;
      });

      // const cleanedVisibility = Object.fromEntries(
      //   Object.entries(currentVisibility).filter(([k]) => validKeys.has(k))
      // );

      // localStorage.setItem(VISIBILITY_KEY, JSON.stringify(cleanedVisibility));
      // setColumnVisibility(cleanedVisibility);


      const updatedVisibility = {};

      // Ensure all required/static columns are visible
      requiredColumns.forEach(col => {
        updatedVisibility[col] = currentVisibility[col] ?? true;
      });

      // Ensure all dynamic columns are visible if not present
      dynamicKeys.forEach(col => {
        updatedVisibility[col] = currentVisibility[col] ?? true;
      });

      // Save & apply
      localStorage.setItem(VISIBILITY_KEY, JSON.stringify(updatedVisibility));
      setColumnVisibility(updatedVisibility);


      return dynamicKeys;
    } catch (err) {
      console.error("Failed to fetch custom columns", err);
      return [];
    }
  };

  //   useEffect(() => {
  //   const loadData = async () => {
  //     await fetchCustomColumns(); // ✅ first
  //     await fetchClients();       // ✅ then
  //   };
  //   loadData();
  // }, [dateFilter, customRange]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await axios.get('/admin/custom-columns?pageKey=clients');
        setDynamicColumns(res.data); // ✅ will be reflected visually

        const dynamicKeys = res.data.map(col => col.column_name);
        setSearchableColumns([
          'client_name', 'email_or_phone', 'middleman_name',
          ...dynamicKeys
        ]);
        await fetchClients(dynamicKeys);
      } catch (err) {
        console.error("Load failed:", err);
      }
    };

    loadAll();
  }, [dateFilter, customRange]);

  useEffect(() => {
    fetchClients(dynamicKeysRef.current);
  }, [page, limit]);


  useEffect(() => {
    const savedSort = localStorage.getItem(SORT_KEY);
    if (savedSort) {
      try {
        const parsed = JSON.parse(savedSort);
        if (parsed.key && ['asc', 'desc'].includes(parsed.direction)) {
          setSortConfig(parsed);
        }
      } catch {
        console.warn("Invalid sort config in localStorage");
      }
    }

    // const savedVisibility = localStorage.getItem(VISIBILITY_KEY);
    // if (savedVisibility) {
    //   try {
    //     const parsed = JSON.parse(savedVisibility);
    //     setColumnVisibility(parsed);
    //   } catch {
    //     console.warn("Invalid visibility data in localStorage");
    //   }
    // }
  }, []);

  useEffect(() => {
    const loadEverything = async () => {
      try {
        // ✅ First: fetch dynamic columns
        const res = await axios.get('/admin/custom-columns?pageKey=clients');
        const dynamicCols = res.data;
        const dynamicKeys = dynamicCols.map(col => col.column_name);
        setDynamicColumns(dynamicCols);
        dynamicKeysRef.current = dynamicKeys;

        // ✅ Build full visibility set
        const saved = localStorage.getItem(VISIBILITY_KEY);
        const current = saved ? JSON.parse(saved) : {};

        const defaultVisibility = {};

        [...requiredColumns, ...dynamicKeys].forEach(k => {
          if (k !== 'select') {
            defaultVisibility[k] = current[k] !== undefined ? current[k] : true;
          }
        });

        localStorage.setItem(VISIBILITY_KEY, JSON.stringify(defaultVisibility));
        setColumnVisibility(defaultVisibility);

        // ✅ Fetch clients after visibility is finalized
        await fetchClients(dynamicKeys);
      } catch (err) {
        console.error("Failed to load clients or columns:", err);
      }
    };

    loadEverything();
  }, [dateFilter, customRange]);


  // const handleEdit = async (id, key, value) => {
  //   try {
  //     await updateClient(id, { [key]: value });
  //   } catch (err) {
  //     console.error('Update failed:', err);
  //   }
  // };

  const handleEdit = async (id, key, value) => {
    try {
      let payload = { [key]: value };

      if (key === 'price' || key === 'amount_paid') {
        const client = clients.find(c => c.id === id);
        const newPrice = key === 'price' ? parseFloat(value) : parseFloat(client.price || 0);
        const newPaid = key === 'amount_paid' ? parseFloat(value) : parseFloat(client.amount_paid || 0);
        const amount_due = newPrice - newPaid;
        let payment_status = 'unpaid';
        if (amount_due === 0) payment_status = 'paid';
        else if (amount_due < newPrice) payment_status = 'partially paid';

        payload = {
          ...payload,
          amount_due,
          payment_status
        };
      }

      await updateClient(id, payload);

      await fetchClients(dynamicKeysRef.current);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };


  // useEffect(() => {
  //   if ((21 + dynamicColumns.length) > 0 && !columnInitDone) {
  //     const totalCols = 21 + dynamicColumns.length;
  //     const saved = localStorage.getItem('clients_page');
  //     if (saved) {
  //       try {
  //         const parsed = JSON.parse(saved);
  //         if (parsed.length === totalCols) {
  //           setColumnWidths(parsed);
  //         } else {
  //           setColumnWidths(Array(totalCols).fill(150));
  //         }
  //       } catch {
  //         setColumnWidths(Array(totalCols).fill(150));
  //       }
  //     } else {
  //       setColumnWidths(Array(totalCols).fill(150));
  //     }
  //     setColumnInitDone(true);
  //   }
  // }, [dynamicColumns.length, columnInitDone]);

  const useResizableColumns = (columnWidths, setColumnWidths) => {
    const startResizing = (index, e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = columnWidths[index];

      const handleMouseMove = (e) => {
        const delta = e.clientX - startX;
        const newWidths = [...columnWidths];
        const next = index + 1;

        // newWidths[index] = Math.max(startWidth + delta, 40);
        const MIN_WIDTHS = [20, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]; // per static column index

        newWidths[index] = Math.max(startWidth + delta, MIN_WIDTHS[index] || 70);

        // Reduce width of next column to preserve layout
        if (next < newWidths.length) {
          newWidths[index] = Math.max(startWidth + delta, MIN_WIDTHS[index] || 70);

        }

        setColumnWidths(newWidths);
        localStorage.setItem('clients_page', JSON.stringify(newWidths));

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
    if (!dynamicColumns.length) return;

    const totalCols = requiredColumns.length + dynamicColumns.length;
    const saved = localStorage.getItem("clients_page");

    let newWidths;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length === totalCols) {
          newWidths = parsed;
        } else {
          // mismatch: use partial + fallback
          newWidths = parsed.concat(
            Array(totalCols - parsed.length).fill(150)
          ).slice(0, totalCols);
        }
      } catch {
        newWidths = null;
      }
    }

    if (!newWidths) {
      newWidths = Array(totalCols).fill(150);
    }

    setColumnWidths(newWidths);
    localStorage.setItem("clients_page", JSON.stringify(newWidths));
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

    // sortedClients.forEach((client) => {
    //   const text = (client[key] || "").toString();
    //   span.innerText = text;
    //   const width = span.offsetWidth + 24;
    //   if (width > maxWidth) maxWidth = width;
    // });

    document.body.removeChild(span);

    const newWidths = [...columnWidths];
    newWidths[index] = Math.max(maxWidth, 40);
    setColumnWidths(newWidths);
    localStorage.setItem("clients_page", JSON.stringify(newWidths));
  };

  const handleCheckboxChange = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const { query, setQuery, filteredData: textFilteredData } = useTableSearch(clients, searchableColumns);

  const [serviceFilter, setServiceFilter] = useState('all');

  // const finalData = serviceFilter === 'all'
  //   ? textFilteredData
  //   : textFilteredData.filter(client => (client.service || '').toLowerCase() === serviceFilter);

  const stableSort = (array, compareFn) => {
    return array
      .map((el, index) => ({ el, index }))
      .sort((a, b) => {
        const order = compareFn(a.el, b.el);
        return order !== 0 ? order : a.index - b.index;
      })
      .map(({ el }) => el);
  };

  const serviceFiltered = serviceFilter === 'all'
    ? textFilteredData
    : textFilteredData.filter(client => (client.service || '').toLowerCase() === serviceFilter);

  const sortedData = stableSort(serviceFiltered, (a, b) => {
    const { key, direction } = sortConfig;
    if (!key || !direction) return 0;

    if (key === 'select') {
      const aSelected = selected.includes(a.id);
      const bSelected = selected.includes(b.id);

      if (aSelected === bSelected) return 0;
      return (aSelected ? -1 : 1) * (direction === 'asc' ? 1 : -1);
    }

    let aVal = a[key] ?? '';
    let bVal = b[key] ?? '';

    // Try to parse numbers
    const numA = parseFloat(aVal);
    const numB = parseFloat(bVal);
    const isNumber = !isNaN(numA) && !isNaN(numB);

    if (isNumber) {
      aVal = numA;
      bVal = numB;
    } else {
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const finalData = sortedData;



  const serviceOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'cerberus', label: 'Cerberus' },
    { value: 'vps', label: 'VPS' },
    { value: 'proxy', label: 'Proxy' },
    { value: 'storage', label: 'Storage' },
    { value: 'varys', label: 'Varys' },
  ];

  const dateFilterOptions = [
    { label: 'Past 30 Days', value: 'last30' },
    { label: 'Today', value: 'today' }, { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' }, { label: 'Previous Week', value: 'previous_week' },
    { label: 'This Month', value: 'this_month' }, { label: 'Previous Month', value: 'previous_month' },
    { label: 'This Quarter', value: 'this_quarter' }, { label: 'Previous Quarter', value: 'previous_quarter' },
    { label: 'This Year', value: 'this_year' }, { label: 'Previous Year', value: 'previous_year' },
    { label: 'Custom', value: 'custom' }
  ];

  const handleDateFilterChange = (val) => {
    setDateFilter(val);
    if (val === 'custom') setShowCalendar(true);
  };

  const handleAddColumn = async () => {
    const trimmed = newColumnName.trim();
    if (!trimmed || trimmed.length < 2) {
      alert("Column name must be at least 2 characters");
      return;
    }

    try {
      await axios.post('/admin/add-column', {
        pageKey: 'clients',
        label: trimmed,
        isGlobal: visibleForAll
      });

      setShowAddColumnModal(false);
      setNewColumnName('');
      // ✅ Wait for updated dynamic columns
      const dynamicKeys = await fetchCustomColumns();

      // ✅ Then use updated keys to reload clients
      await fetchClients(dynamicKeys);
      const totalCols = requiredColumns.length + dynamicKeysRef.current.length;
      const newWidths = [...columnWidths, 150];
      if (newWidths.length === totalCols) {
        setColumnWidths(newWidths);
        localStorage.setItem("clients_page", JSON.stringify(newWidths));
      }

    } catch (err) {
      if (err?.response?.status === 409) {
        alert('A column with this name already exists.');
      } else {
        alert('Failed to add column.');
      }
      console.error(err);
    }
  };

  const handleRenameColumn = async (col) => {
    const newDbKey = `custom_clients_${newHeaderLabel.trim().toLowerCase().replace(/\s+/g, '_')}`;
    try {
      await axios.patch('/admin/rename-column', {
        oldColumn: col.column_name,
        newColumn: newDbKey,
        newLabel: newHeaderLabel,
        pageKey: 'clients'
      });
      setEditingHeader(null);
      // ✅ Wait for updated dynamic columns
      const dynamicKeys = await fetchCustomColumns();

      // ✅ Then use updated keys to reload clients
      await fetchClients(dynamicKeys);
    } catch (err) {
      alert('Rename failed.');
    }
  };

  const handleDeleteColumn = async (index) => {
    const visibleKeys = [
      ...requiredColumns,
      ...dynamicColumns.map(c => c.column_name)
    ].filter(k => columnVisibility[k]);

    const columnKey = visibleKeys[index];
    const column = dynamicColumns.find(c => c.column_name === columnKey);
    if (!column) return;

    // ✅ Role & creator check
    if (column.isGlobal && role !== 'superadmin' && column.createdBy !== userId) {
      setAlertMessage("Only Superadmin or Creator can delete this column");
      setShowAlert(true);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete column "${column.label}"?`);
    if (!confirmed) return;

    try {
      await axios.delete('/admin/delete-column', {
        data: {
          columnName: column.column_name,
          pageKey: 'clients',
        }
      });

      // ✅ Adjust localStorage widths
      const saved = localStorage.getItem('clients_page');
      let parsed = saved ? JSON.parse(saved) : [];
      const totalCols = requiredColumns.length + dynamicColumns.length - 1;
      const newWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);
      localStorage.setItem('clients_page', JSON.stringify(newWidths));

      const dynamicKeys = await fetchCustomColumns();
      await fetchClients(dynamicKeys);

      setAlertMessage("Column deleted.");
      setShowAlert(true);
    } catch (err) {
      const message = err?.response?.data?.error || "Delete failed.";
      setAlertMessage(message);
      setShowAlert(true);
    }

    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleDynamicCellSave = async () => {
    const { id, key, value } = editingCell;
    if (!id || !key) return;

    setClients(prev =>
      prev.map(c => c.id === id ? { ...c, [key]: value } : c)
    );

    setEditingCell({ id: null, key: null, value: '' });

    try {
      await axios.patch(`/admin/update-client-field/${id}`, {
        [key]: value
      });
    } catch (err) {
      console.error("Failed to update dynamic field:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const closeModal = () => setShowAlert(false);

  const handleDeleteClients = async () => {
    if (selected.length === 0) {
      setAlertMessage("Select at least one client to delete");
      setShowAlert(true);
      return;
    }
    const confirmed = window.confirm("Are you sure you want to delete the selected client(s)?");
    if (!confirmed) return;
    try {
      await Promise.all(
        selected.map((id) =>
          axios.delete(`/clients/${id}`)
        )
      );
      setAlertMessage("Selected clients deleted successfully");
      setShowAlert(true);
      fetchClients(); // Refresh table
      setSelected([]);
    } catch (err) {
      console.error("Delete error:", err);
      setAlertMessage("Error deleting clients");
      setShowAlert(true);
    }
  };

  const range = dateFilter === 'custom'
    ? {
      from: dayjs(customRange.startDate).format('YYYY-MM-DD'),
      to: dayjs(customRange.endDate).format('YYYY-MM-DD')
    }
    : getDateRangeForFilter(dateFilter); // this returns { start, end }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClient = () => {
    if (selected.length === 0) {
      setAlertMessage("No client selected");
      setShowAlert(true);
    } else if (selected.length === 1) {
      setSelectedClientId(selected[0]);
      setShowSingleEditModal(true);
    } else {
      setSelectedClientIds(selected);
      setShowBulkEditModal(true);
    }
  };

  if (isMobile) return <div className="p-4">Mobile View Not Yet Implemented</div>;

  return (
    <div className="p-4 ">
      <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'flex-row justify-between items-center'} mb-2`}>
        <h1 className={`text-xl font-semibold ${dark ? "text-blue-300" : "text-indigo-600"}`}>Clients Table</h1>

        <div className="right-4 top-3 flex items-center gap-2 z-10">
          {/* <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className={`py-1.5 px-3 rounded-md text-sm border ${dark ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-100'
                }`}
            >
              {serviceOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div> */}

          <div className="">
            <Select
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: (props) => (
                  <components.DropdownIndicator {...props} style={{ paddingLeft: 1, paddingRight: 1 }} />
                )
              }}
              value={serviceOptions.find(opt => opt.value === serviceFilter)}
              onChange={(selectedOption) => setServiceFilter(selectedOption.value)}
              options={serviceOptions}
              isSearchable={false}
              classNamePrefix="react-select"
              className="text-sm"
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

          <div>
            <Select
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: (props) => (
                  <components.DropdownIndicator {...props} style={{ paddingLeft: 1, paddingRight: 1 }} />
                )
              }}
              value={dateFilterOptions.find(opt => opt.value === dateFilter)}
              onChange={(selected) => handleDateFilterChange(selected.value)}
              options={dateFilterOptions}
              className="text-sm w-[10em]"
              isSearchable={false}
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

          <div className="relative">
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

          {role !== 'middleman' && (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setShowDropdown(prev => !prev)} className={`p-1.5 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}>
                <MoreVertical size={18} />
              </button>
              {showDropdown && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
                  <>
                    <button
                      onClick={() => setShowAddClientModal(true)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
                        }`}
                    >
                      <PlusCircle size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                      <span>Add Client/Services</span>
                    </button>
                    <button
                      onClick={handleEditClient}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-indigo-100"
                    >
                      <Pencil size={16} />
                      <span>Edit Client</span>
                    </button>
                    {role !== 'admin' && (
                      <button
                        onClick={handleDeleteClients}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
                          }`}
                      >
                        <Trash2 size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                        <span>Delete Client</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowImportModal(true)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                    >
                      <Upload size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                      <span>Import Clients</span>
                    </button>
                    <button
                      onClick={() => setShowExportModal(true)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
                        }`}
                    >
                      <Download size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                      <span>Export Clients</span>
                    </button>
                  </>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className={`border ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-white"}  p-6 rounded-lg shadow-lg`}>
            <h2 className={`text-lg font-semibold mb-2 text-center ${dark ? "text-slate-300" : "text-blue-900"}`}>Select Date Range</h2>
            <div className={`${dark ? 'calendar-dark' : ''}`}>
              <DateRange
                editableDateInputs={true}
                onChange={({ selection }) => setCustomRange({
                  startDate: selection.startDate,
                  endDate: selection.endDate,
                  key: 'selection'
                })}
                moveRangeOnFirstSelection={false}
                ranges={[customRange]}
                // maxDate={new Date()}
                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 10))}
              />
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setShowCalendar(false)} className={`border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} px-4 py-2 rounded`}>Cancel</button>
              <button onClick={() => setShowCalendar(false)} className={`border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'} px-4 py-2 rounded`}>Apply</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto  min-h-[calc(100vh-14em)] ">
        <div className="h-full max-h-[calc(100vh-16em)]">

          <div className=" mt-3">
            <div style={{ width: `${totalWidth}px`, minWidth: `100%` }}>
              <table className="table-auto w-full text-sm">
                <thead className={`sticky top-0 text-slate-400 border-b ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
                  <tr>
                    {requiredColumns.map((key, index) => columnVisibility[key] && (
                      <th
                        key={key}
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
                              checked={selected.length === textFilteredData.length}
                              onChange={() =>
                                setSelected(selected.length === textFilteredData.length ? [] : textFilteredData.map(c => c.id))
                              }
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
                          // onDoubleClick={() => autoResizeColumn(index)}
                          className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
                        />
                      </th>
                    ))}
                    {dynamicColumns.map((col, index) => {
                      const i = staticColumnWidths.length + index;
                      if (!columnVisibility[col.column_name]) return null;
                      return (
                        <th
                          key={col.column_name}
                          onContextMenu={(e) => {
                            const visibleKeys = [...requiredColumns, ...dynamicColumns.map(c => c.column_name)].filter(k => columnVisibility[k]);
                            const dynamicKey = col.column_name;
                            const visibleIndex = visibleKeys.indexOf(dynamicKey);
                            handleHeaderContextMenu(e, visibleIndex);
                          }}
                          style={{ width: columnWidths[i] || 40, minWidth: 40 }}
                          className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-700' : 'border-gray-300'} text-center whitespace-nowrap`}
                          onDoubleClick={() => {
                            setEditingHeader(col.column_name);
                            setNewHeaderLabel(col.label);
                          }}
                        >
                          {editingHeader === col.column_name ? (
                            <input
                              value={newHeaderLabel}
                              onChange={(e) => setNewHeaderLabel(e.target.value)}
                              onBlur={() => handleRenameColumn(col)}
                              autoFocus
                              className="text-sm px-1 py-0.5 border rounded w-28 text-center"
                            />
                          ) : (
                            col.label
                          )}
                          <div
                            onMouseDown={(e) => startResizing(i, e)}
                            onDoubleClick={(e) => {
                              e.stopPropagation(); // avoid bubbling to th
                              autoResizeColumn(i);
                            }}
                            className={`absolute -right-[1px] top-0 h-full w-1 cursor-col-resize ${dark ? 'group-hover:bg-slate-400' : 'group-hover:bg-indigo-400'} z-10`}
                          />
                        </th>
                      );
                    })}
                  </tr>
                </thead>


                <tbody className={`${dark ? "text-slate-300" : "text-blue-950"}`}>
                  {finalData.length === 0 ? (
                    <tr>
                      <td colSpan={requiredColumns.length} className="text-center py-8 text-gray-400 text-sm">
                        No search result found.
                      </td>
                    </tr>
                  ) : (
                    finalData.map((client, idx) => (
                      <tr key={idx}>
                        {requiredColumns.map((key, index) => columnVisibility[key] && (
                          <td
                            key={key}
                            style={{ width: columnWidths[index] || 40, minWidth: 40 }}
                            className={`px-2 py-2 text-center ${index === 0 ? 'text-left' : 'text-center'}`}
                            onDoubleClick={() => {
                              if (role !== 'middleman' && key !== 'select') {
                                setEditingCell({ id: idx, key, value: client[key] });
                              }
                            }}
                          >
                            {key === 'select' ? (
                              <input
                                type="checkbox"
                                checked={selected.includes(client.id)}
                                onChange={() => handleCheckboxChange(client.id)}
                                className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                              />
                            ) : editingCell.id === idx && editingCell.key === key ? (
                              <input
                                value={editingCell.value}
                                autoFocus
                                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                onBlur={() => {
                                  const updated = editingCell.value;
                                  setClients(prev => prev.map((c, i) => i === idx ? { ...c, [key]: updated } : c));
                                  handleEdit(client.id, key, updated);
                                  setEditingCell({ id: null, key: null, value: '' });
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                className="w-full border px-1 rounded"
                              />
                            ) : (
                              <div
                                className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto"
                                style={{ maxWidth: columnWidths[index] }}
                              >
                                {key === 'start_date' || key === 'expiry_date' ? (
                                  formatDate(client[key])
                                ) : key === 'payment_status' ? (
                                  <span className={
                                    client[key] === 'unpaid' ? 'text-red-600 font-semibold' :
                                      client[key] === 'partially paid' ? 'text-yellow-500 font-semibold' :
                                        client[key] === 'paid' ? 'text-green-600 font-semibold' : ''
                                  }>
                                    {client[key]}
                                  </span>
                                ) : (
                                  client[key] ?? ''
                                )}
                              </div>
                            )}
                          </td>
                        ))}
                        {dynamicColumns.map((col, index) => {
                          const i = staticColumnWidths.length + index;
                          if (!columnVisibility[col.column_name]) return null;
                          return (
                            <td
                              key={col.column_name}
                              style={{ width: columnWidths[i], minWidth: 40 }}
                              className="px-2 py-2 text-center cursor-pointer"
                              onDoubleClick={() => setEditingCell({ id: client.id, key: col.column_name, value: client[col.column_name] || '' })}
                            >
                              {editingCell.id === client.id && editingCell.key === col.column_name ? (
                                <input
                                  value={editingCell.value}
                                  autoFocus
                                  onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                  onBlur={handleDynamicCellSave}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.target.blur(); // This triggers onBlur
                                    }
                                  }}
                                  className="w-full text-sm px-1 py-0.5 border rounded"
                                />
                              ) : (
                                <div className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto" style={{ maxWidth: columnWidths[i] }}>{client[col.column_name] || ''}</div>
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
        </div>
      </div>

      {total > limit && (
        <>


          <div className="flex justify-between  gap-3 mt-2">
            <div className="">
              <label htmlFor="limitSelect" className="mr-2 text-sm">
                Rows per page:
              </label>
              <select
                id="limitSelect"
                value={limit}
                onChange={(e) => {
                  setPage(1); // reset to page 1
                  setLimit(Number(e.target.value)); // update how many rows per page
                }}
                className={`border rounded px-2 py-1 text-sm ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={100}>200</option>
              </select>
            </div>
            <div>
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={20} className={`cursor-pointer ${dark ? 'text-white' : 'text-indigo-900'}`}/>
              </button>
              <span className="text-sm">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <button
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage(prev => prev + 1)}
                
              >
                <ChevronRight size={20} className={`cursor-pointer ${dark ? 'text-white' : 'text-indigo-900'}`}/>
              </button>
            </div>
          </div>
        </>
      )}

      <AlertModal isOpen={showAlert} message={alertMessage} onClose={closeModal} dark={dark} />

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

          {/* TEMP DEBUG: show whether allowDelete is true or undefined */}
          {/* {typeof contextMenu.allowDelete !== 'undefined' && (
            <div className="text-xs p-1 italic text-gray-500">
              allowDelete: {String(contextMenu.allowDelete)}
            </div>
          )} */}

          <button
            onClick={() => {
              const col = getColumnKeyFromIndex(contextMenu.columnIndex);
              handleSort(col, 'asc');
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
              handleSort(col, 'desc');
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
          >
            <ArrowDownAZ size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
            <span>Sort Descending</span>
          </button>

          <button
            onClick={() => {
              handleSort(null, null);
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
          >
            <XCircle size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />
            <span>Cancel Sort</span>
          </button>

          <button
            onClick={() => {
              setShowAddColumnModal(true);
              setContextMenu({ ...contextMenu, visible: false });
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
                className={`absolute ${submenuFlipLeft ? 'right-full pr-2' : 'left-full pl-2'} border top-0 mt-[-8px] min-w-[180px] max-h-[300px] overflow-y-auto z-50 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded shadow-lg`}
              >
                {[
                  ...requiredColumns.map(key => ({
                    key,
                    label: columnLabels[key] || key
                  })),
                  ...dynamicColumns.map(col => ({
                    key: col.column_name,
                    label: col.label
                  }))
                ].filter(col => col.key !== 'select')  // optional
                  .map(col => (
                    <button
                      key={col.key}
                      onClick={() => toggleColumnVisibility(col.key)}
                      className={`flex items-center justify-between w-full px-4 py-2 text-sm ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                    >
                      <span>{col.label}</span>
                      {columnVisibility[col.key] && <Check size={16} className={`${dark ? 'text-white' : 'text-indigo-900'}`} />}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

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
              <label htmlFor="visibleForAll" className="text-sm">Visible for all users</label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAddColumnModal(false)} className={`px-4 py-2 text-sm border ${dark ? 'border-slate-300 text-slate-300 ' : 'border-indigo-600 text-indigo-600'} rounded `}>Cancel</button>
              <button onClick={handleAddColumn} className={`px-4 py-2 text-sm ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'} rounded`}>Add</button>
            </div>
          </div>
        </div>
      )}
      {showAddClientModal && (
        <AddClientModal
          onClose={() => setShowAddClientModal(false)}
          onClientAdded={() => {
            fetchClients(dynamicKeysRef.current); // reload data
            setShowAddClientModal(false);
          }}
          dark={dark}
        />
      )}
      {showSingleEditModal && (
        <EditClientModal
          clientId={selectedClientId}
          onClose={() => setShowSingleEditModal(false)}
          onClientUpdated={() => {
            fetchClients(dynamicKeysRef.current);
            setShowSingleEditModal(false);
          }}
          dark={dark}
        />
      )}
      {showBulkEditModal && (
        <BulkEditClientModal
          selectedClientIds={selectedClientIds}
          onClose={() => setShowBulkEditModal(false)}
          onUpdated={() => {
            fetchClients(dynamicKeysRef.current);
            setShowBulkEditModal(false);
          }}
          dark={dark}
        />
      )}
      {showImportModal && (
        <ImportClientModal
          onClose={() => setShowImportModal(false)}
          onImport={() => fetchClients(dynamicKeysRef.current)}
          dark={dark}
        />
      )}
      {showExportModal && (
        <ExportClientModal
          onClose={() => setShowExportModal(false)}
          data={clients} // all client rows loaded in table
          selectedIds={selected}
          filters={{
            from: range.from || range.start, // support both key names
            to: range.to || range.end,
            service: serviceFilter?.toLowerCase() || 'all'
          }}
          columns={[
            { key: 'client_name', label: 'Client Name' },
            { key: 'email_or_phone', label: 'Email / Number' },
            { key: 'middleman_name', label: 'Middleman Name' },
            { key: 'service', label: 'Service' },
            { key: 'plan', label: 'Plan' },
            { key: 'instance_no', label: 'Instance Number' },
            { key: 'ip_address', label: 'IP Address' },
            { key: 'proxy_set', label: 'Proxy Set' },
            { key: 'proxy_count', label: 'Proxy Count' },
            { key: 'accounts_count', label: 'Account Count' },
            { key: 'user_address', label: 'User Address' },
            { key: 'price', label: 'Price' },
            { key: 'currency', label: 'Currency' },
            { key: 'start_date', label: 'Start Date' },
            { key: 'expiry_date', label: 'Expiry Date' },
            { key: 'middleman_share', label: "Middleman's Share" },
            { key: 'payment_status', label: 'Payment Status' },
            { key: 'amount_paid', label: 'Amount Paid' },
            { key: 'paid_to', label: 'Paid To Whom' },
            { key: 'notes', label: 'Notes' }
          ]}
          dark={dark}
        />
      )}
    </div>
  );
}
