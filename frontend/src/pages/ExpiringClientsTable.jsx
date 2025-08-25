import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import Select from 'react-select';
import { components } from 'react-select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { getExpiringClients } from '../api/clientService';
import useIsMobile from '../hooks/useIsMobile';
import { useSelector } from 'react-redux';
import { MoreVertical, RefreshCcw, XCircle, ArrowUpAZ, ArrowDownAZ, Check, Plus, Trash2, Columns, BarChart2 } from 'lucide-react';
import RenewClientsModal from '../components/RenewClientsModal'; // to be created
import { useTableSearch } from '../hooks/useTableSearch';
import AlertModal from '../components/AlertModal';
import { bulkRenewClients } from '../api/clientService';
import { bulkCancelClients } from '../api/clientService';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

export default function ExpiringClientsPage() {
    const dynamicKeysRef = useRef([]);
    const { dark } = useOutletContext();
    const isMobile = useIsMobile();
    const role = useSelector(state => state.auth.role);
    const [contextClosing, setContextClosing] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [serviceFilter, setServiceFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [columnWidths, setColumnWidths] = useState([]);
    const [total, setTotal] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const dropdownRef = useRef(null);
    const [columnInitDone, setColumnInitDone] = useState(false);

    const [columnVisibility, setColumnVisibility] = useState({});
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, columnIndex: null });
    const [showSubmenu, setShowSubmenu] = useState(false);
    const [submenuFlipLeft, setSubmenuFlipLeft] = useState(false);
    const submenuRef = useRef(null);
    const submenuTriggerRef = useRef(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const pageKey = 'expiring_clients';
    const username = useSelector(state => state.auth.username);
    const SORT_KEY = `sortConfig_${pageKey}_${username}`;
    const VISIBILITY_KEY = `columnVisibility_expiring_clients`;

    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [dynamicColumns, setDynamicColumns] = useState([]);  // to track dynamic columns
    const [visibleForAll, setVisibleForAll] = useState(true);
    const [editingHeader, setEditingHeader] = useState(null);
    const [newHeaderLabel, setNewHeaderLabel] = useState('');
    const [expiryRangeFilter, setExpiryRangeFilter] = useState('none');

    const [editingCell, setEditingCell] = useState({ id: null, key: null, value: '' });

    const staticColumnWidths = [
        20, 100, 100, 100, 100, 100, 100, 100
    ];

    const baseColumns = ['select', 'client_name', 'service', 'middleman_name', 'price', 'currency', 'expiry_date', 'status', 'logical_client_id'];
    const filteredColumns = role === 'middleman'
        ? baseColumns.filter(col => col !== 'middleman_name')
        : baseColumns;

    const requiredColumns = filteredColumns;

    const columnLabels = {
        select: '',
        client_name: 'Client Name',
        service: 'Service',
        middleman_name: 'Middleman Name',
        price: 'Price',
        currency: 'Currency',
        expiry_date: 'Expiry Date',
        status: 'Status',
        logical_client_id: 'Logical ID',
    };
    const handleContextMenuClose = () => {
        setContextClosing(true);
        setTimeout(() => {
            setContextClosing(false);
            setContextMenu(prev => ({ ...prev, visible: false }));
        }, 200); // match animation duration
    };
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setShowAddColumnModal(false);
            onClose();
        }, 200);
    };
    // const columns = [
    //     { key: 'select', label: '' },
    //     { key: 'client_name', label: 'Client Name' },
    //     { key: 'service', label: 'Service' },
    //     { key: 'middleman_name', label: 'Middleman Name' },
    //     { key: 'price', label: 'Price' },
    //     { key: 'currency', label: 'Currency' },
    //     { key: 'expiry_date', label: 'Expiry Date' },
    //     { key: 'status', label: 'Status' },
    //     ...dynamicColumns.map(dc => ({ key: dc.column_name, label: dc.label }))
    // ]

    // const STATIC_COLUMNS_COUNT = columns.length;  // which is 8

    const SERVICE_OPTIONS = [
        { value: 'all', label: 'All Services' },
        { value: 'cerberus', label: 'Cerberus' },
        { value: 'vps', label: 'VPS' },
        { value: 'proxy', label: 'Proxy' },
        { value: 'storage', label: 'Storage' },
        { value: 'varys', label: 'Varys' }
    ];

    const EXPIRY_RANGE_OPTIONS = [
        { value: 'none', label: 'None' },
        { value: 'next_3_days', label: 'Next 3 Days' },
        { value: 'next_7_days', label: 'Next 7 Days' },
    ];

    const formatDate = (raw) => {
        if (!raw) return '';
        const date = new Date(raw);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    const handleHeaderContextMenu = (e, index) => {
        e.preventDefault();
        const menuWidth = 190;
        const screenWidth = window.innerWidth;
        const buffer = 10;
        const clickX = e.clientX;
        const clickY = e.clientY;
        const openLeft = (clickX + menuWidth + buffer) > screenWidth;
        const finalX = openLeft ? (clickX - menuWidth) : clickX;

        // const isDynamic = index >= STATIC_COLUMNS_COUNT; // STATIC_COLUMNS_COUNT = count of static columns
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
    };

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

    const fetchClients = async (dynamicKeys = [], expiryRangeParam = expiryRangeFilter) => {
        try {
            const response = await getExpiringClients({ page, limit, expiryRange: expiryRangeParam });
            const data = response.clients || [];
            const totalCount = response.total || 0;
            setTotal(totalCount);

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
            console.error('Failed to fetch clients:', err);
        }
    };


    const fetchCustomColumns = async () => {
        try {
            const res = await axios.get('/admin/custom-columns?pageKey=expiring_clients');
            const dynamicKeys = res.data.map(col => col.column_name);

            dynamicKeysRef.current = dynamicKeys;
            setDynamicColumns(res.data);

            const validKeys = new Set([...requiredColumns, ...dynamicKeys]);
            const currentVisibility = JSON.parse(localStorage.getItem(VISIBILITY_KEY) || '{}');

            dynamicKeys.forEach(k => {
                if (!(k in currentVisibility)) currentVisibility[k] = true;
            });

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


    useEffect(() => {
        const loadAll = async () => {
            try {
                const res = await axios.get('/admin/custom-columns?pageKey=expiring_clients');
                setDynamicColumns(res.data); // ✅ will be reflected visually

                const dynamicKeys = res.data.map(col => col.column_name);
                // setSearchableColumns([
                //   'client_name', 'email_or_phone', 'middleman_name',
                //   ...dynamicKeys
                // ]);
                await fetchClients(dynamicKeys);
            } catch (err) {
                console.error("Load failed:", err);
            }
        };

        loadAll();
    }, []);

    useEffect(() => {
        fetchClients(dynamicKeysRef.current, expiryRangeFilter);
    }, [page, limit]);


    // useEffect(() => {
    //     const initVisibility = () => {
    //         const staticKeys = ['select', 'client_name', 'service', 'middleman_name', 'price', 'currency', 'expiry_date', 'status'];
    //         const dynamicKeys = dynamicColumns.map(dc => dc.column_name);
    //         const allKeys = [...staticKeys, ...dynamicKeys];

    //         const saved = localStorage.getItem(VISIBILITY_KEY);
    //         let visibilityObj = {};
    //         if (saved) {
    //             try {
    //                 visibilityObj = JSON.parse(saved);
    //             } catch {
    //                 console.warn("Invalid visibility data, resetting.");
    //             }
    //         }

    //         allKeys.forEach(key => {
    //             if (!(key in visibilityObj)) visibilityObj[key] = true;
    //         });

    //         localStorage.setItem(VISIBILITY_KEY, JSON.stringify(visibilityObj));
    //         setColumnVisibility(visibilityObj);
    //     };

    //     if (dynamicColumns.length) {
    //         initVisibility();
    //     }
    // }, [dynamicColumns]);

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
    }, []);

    useEffect(() => {
        const loadEverything = async () => {
            try {
                // ✅ First: fetch dynamic columns
                const res = await axios.get('/admin/custom-columns?pageKey=expiring_clients');
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
                        // defaultVisibility[k] = current[k] !== undefined ? current[k] : true;
                        defaultVisibility[k] = (k === 'logical_client_id')
                            ? false  // 👈 hidden by default
                            : (current[k] !== undefined ? current[k] : true);
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
    }, []);

    const handleEdit = async (id, key, value) => {
        try {
            let payload = { [key]: value };

            await updateClient(id, payload);

            await fetchClients(dynamicKeysRef.current);
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

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
                    newWidths[index] = Math.max(startWidth + delta, 40);
                }
                setColumnWidths(newWidths);
                localStorage.setItem('expiring_clients_widths', JSON.stringify(newWidths));
            };

            const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        };

        const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
        return { columnWidths, startResizing, totalWidth };
    };

    const { startResizing, totalWidth } = useResizableColumns(columnWidths, setColumnWidths);

    useEffect(() => {
        if (!dynamicColumns.length) return;

        const totalCols = requiredColumns.length + dynamicColumns.length;
        const saved = localStorage.getItem("expiring_clients_widths");

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
        localStorage.setItem("expiring_clients_widths", JSON.stringify(newWidths));
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
        localStorage.setItem("expiring_clients_widths", JSON.stringify(newWidths));
    };

    const handleCheckboxChange = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        filterClients();
    }, [searchQuery, serviceFilter, clients]);

    const filterClients = () => {
        let data = [...clients];

        if (serviceFilter !== 'all') {
            data = data.filter(client => client.service?.toLowerCase() === serviceFilter);
        }

        if (searchQuery.trim() !== '') {
            data = data.filter(client =>
                client.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.middleman_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredClients(data);
    };

    useEffect(() => {
        const savedWidths = localStorage.getItem('expiring_clients_widths');
        if (savedWidths) {
            try {
                setColumnWidths(JSON.parse(savedWidths));
            } catch {
                setColumnWidths([40, 150, 100, 150, 100, 100, 150, 120]); // default widths
            }
        } else {
            setColumnWidths([40, 150, 100, 150, 100, 100, 150, 120]); // default widths
        }
    }, []);



    const isAllSelected = selected.length === filteredClients.length;

    const [searchableColumns, setSearchableColumns] = useState(['client_name', 'email_or_phone', 'middleman_name']);

    const { query, setQuery, filteredData: textFilteredData } = useTableSearch(clients, searchableColumns);

    const handleRenew = () => {
        if (selected.length === 0) {
            setAlertMessage("No client selected");
        } else {
            setShowRenewModal(true);
        }
        setShowDropdown(false);
    };

    const handleCancel = async () => {
        if (selected.length === 0) {
            setAlertMessage("No client selected");
        } else {
            try {
                await bulkCancelClients(selected); // define this in clientService.js
                await fetchClients();
                setAlertMessage("Client is cancelled.");
            } catch (err) {
                console.error('Cancel failed', err);
            }
        }
        setShowDropdown(false);
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

    const handleRenewSave = async (startDate, expiryDate) => {
        try {
            await bulkRenewClients(selected, startDate, expiryDate);
            setShowRenewModal(false);
            setSelected([]);
            await fetchClients();  // ✅ Refresh data so renewed ones get filtered out
            setAlertMessage("Client is renewed successfully.");
        } catch (err) {
            console.error('Renew clients failed:', err);
        }
    };

    // const handleSort = (direction) => {
    //     const columnKey = columns[contextMenu.columnIndex]?.key;
    //     if (!columnKey) return;

    //     setSortConfig({ key: columnKey, direction });
    //     localStorage.setItem(SORT_KEY, JSON.stringify({ key: columnKey, direction }));
    //     setContextMenu({ ...contextMenu, visible: false });
    // };

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

    const handleAddColumn = async () => {
        const trimmed = newColumnName.trim();
        if (!trimmed || trimmed.length < 2) {
            setAlertMessage("Column name must be at least 2 characters.");
            return;
        }

        try {
            await axios.post('/admin/add-column', {
                pageKey: 'expiring_clients',
                label: trimmed,
                isGlobal: visibleForAll
            });  // Assuming global for now
            // await fetchDynamicColumns();   // refresh columns
            // await fetchClients();          // refresh data
            // setShowAddColumnModal(false);
            handleClose()
            setNewColumnName('');

            // ✅ Wait for updated dynamic columns
            const dynamicKeys = await fetchCustomColumns();

            // ✅ Then use updated keys to reload clients
            await fetchClients(dynamicKeys);
            const totalCols = requiredColumns.length + dynamicKeysRef.current.length;
            const newWidths = [...columnWidths, 40];
            if (newWidths.length === totalCols) {
                setColumnWidths(newWidths);
                localStorage.setItem("expiring_clients_widths", JSON.stringify(newWidths));
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
                    pageKey: 'expiring_clients',
                }
            });

            // ✅ Adjust localStorage widths
            const saved = localStorage.getItem('expiring_clients_widths');
            let parsed = saved ? JSON.parse(saved) : [];
            const totalCols = requiredColumns.length + dynamicColumns.length - 1;
            const newWidths = parsed.concat(Array(totalCols).fill(150)).slice(0, totalCols);
            localStorage.setItem('expiring_clients_widths', JSON.stringify(newWidths));

            const dynamicKeys = await fetchCustomColumns();
            await fetchClients(dynamicKeys);

            setAlertMessage("Column deleted.");
            setShowAlert(true);
        } catch (err) {
            const message = err?.response?.data?.error || "Delete failed.";
            setAlertMessage(message);
            setShowAlert(true);
        }

        // setContextMenu(prev => ({ ...prev, visible: false }));
        handleContextMenuClose()
    };
    const handleRenameColumn = async (col) => {
        const newDbKey = `custom_clients_${newHeaderLabel.trim().toLowerCase().replace(/\s+/g, '_')}`;
        try {
            await axios.patch('/admin/rename-column', {
                oldColumn: col.column_name,
                newColumn: newDbKey,
                newLabel: newHeaderLabel,
                pageKey: 'expiring_clients'
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

    const cancelSort = () => {
        setSortConfig({ key: null, direction: null });
        localStorage.removeItem(SORT_KEY);
        setContextMenu({ ...contextMenu, visible: false });
    };

    useEffect(() => {
        // const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });
        const handleClickOutside = () => handleContextMenuClose()
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);

    const closeModal = () => setShowAlert(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDeleteClients = async () => {
        if (selected.length === 0) {
            setAlertMessage("No client selected");
            setShowAlert(true);
            return;
        }
        const confirmed = window.confirm("Are you sure you want to delete the selected client(s)?");
        if (!confirmed) return;

        try {
            await Promise.all(
                selected.map(id => axios.delete(`/clients/${id}`))
            );
            setAlertMessage("Selected client(s) deleted successfully");
            await fetchClients();
            setSelected([]);
        } catch (err) {
            console.error("Delete error:", err);
            setAlertMessage("Error deleting clients");
        } finally {
            setShowAlert(true);
            setShowDropdown(false);
        }
    };
    const navigate = useNavigate();
    const handleClientReport = () => {
        if (selected.length === 0) {
            window.alert("No client selected");
            return;
        }
        if (selected.length > 1) {
            window.alert("Please select only 1 client");
            return;
        }

        const selectedRow = finalData.find(row => row.id === selected[0]);
        console.log("Selected row:", selectedRow);

        if (!selectedRow?.logical_client_id) {
            console.error("Selected client has no logical ID");
            return;
        }

        localStorage.setItem("selectedLogicalId", selectedRow.logical_client_id);
        localStorage.setItem("selectedClientName", selectedRow.client_name);
        localStorage.setItem("selectedMiddleman", selectedRow.middleman_name);

        // navigate('/client-report');
        navigate(`/client-report/${selectedRow.logical_client_id}`);

    };

    return (
        <PageWrapper>
            <div className="p-2">
                <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
                    <div className="absolute right-4 top-3 flex items-center gap-2 z-10">
                        <Select
                            components={{
                                IndicatorSeparator: () => null,
                                DropdownIndicator: (props) => (
                                    <components.DropdownIndicator {...props} style={{ paddingLeft: 1, paddingRight: 1 }} />
                                )
                            }}
                            options={EXPIRY_RANGE_OPTIONS}
                            value={EXPIRY_RANGE_OPTIONS.find(opt => opt.value === expiryRangeFilter)}
                            onChange={(option) => {
                                setExpiryRangeFilter(option.value);
                                fetchClients(dynamicKeysRef.current, option.value); // Trigger refetch with new range
                            }}
                            className="w-[135px] text-sm"
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
                        <Select
                            components={{
                                IndicatorSeparator: () => null,
                                DropdownIndicator: (props) => (
                                    <components.DropdownIndicator {...props} style={{ paddingLeft: 1, paddingRight: 1 }} />
                                )
                            }}
                            options={SERVICE_OPTIONS}
                            value={SERVICE_OPTIONS.find(opt => opt.value === serviceFilter)}
                            onChange={(option) => setServiceFilter(option.value)}
                            className="w-[130px] text-sm"
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

                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                                <Search size={16} />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search in Table"
                                className={`pl-10 pr-3 py-1.5 w-[180px] max-w-xs border rounded-md text-sm ${dark ? 'bg-gray-700 text-white border-gray-700 placeholder-gray-400' : 'bg-gray-100 border-gray-100 text-gray-800 placeholder-gray-500'}`}
                            />
                        </div>
                        {role !== 'middleman' && (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(prev => !prev)}
                                    className={`p-1.5 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}>
                                    <MoreVertical size={18} />
                                </button>

                                {showDropdown && (
                                    <div className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
                                        <button
                                            onClick={handleRenew}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
                                                }`}>
                                            <RefreshCcw size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                                            <span>Renew</span>
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
                                                }`}>
                                            <XCircle size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                                            <span>Cancel</span>
                                        </button>
                                        {role === 'superadmin' && (
                                            <button onClick={handleDeleteClients} className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
                                                }`}>
                                                <Trash2 size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                                                <span>Delete</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={handleClientReport}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
                                                }`}
                                        >
                                            <BarChart2 size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                                            <span>Client Report</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full max-w-[calc(100vw-4rem)] overflow-x-auto  min-h-[calc(100vh-15em)] ">
                    <div className="h-full max-h-[calc(100vh-16em)]">

                        <div className=" mt-3">
                            <div
                                style={{ width: `${totalWidth}px`, minWidth: `100%` }}
                            >
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
                                                <tr key={idx}
                                                    className="transition-all duration-300 ease-in-out transform animate-fade-in">
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
                                                            )
                                                                // : editingCell.id === idx && editingCell.key === key ? (
                                                                //   <input
                                                                //     value={editingCell.value}
                                                                //     autoFocus
                                                                //     onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                                                // onBlur={() => {
                                                                //   const updated = editingCell.value;
                                                                //   setClients(prev => prev.map((c, i) => i === idx ? { ...c, [key]: updated } : c));
                                                                //   handleEdit(client.id, key, updated);
                                                                //   setEditingCell({ id: null, key: null, value: '' });
                                                                // }}
                                                                // onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                                                //     className="w-full border px-1 rounded"
                                                                //   />
                                                                // ) 
                                                                : (
                                                                    <div
                                                                        className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto"
                                                                        style={{ maxWidth: columnWidths[index] }}
                                                                    >
                                                                        {key === 'expiry_date' ? (
                                                                            formatDate(client[key])
                                                                        ) :
                                                                            key === 'status' ? (
                                                                                <span className={client.status === 'Expired'
                                                                                    ? 'text-red-500 font-semibold'
                                                                                    : client.status === 'Expiring Today'
                                                                                        ? 'text-blue-500 font-semibold'
                                                                                        : 'text-yellow-600 font-semibold'}>
                                                                                    {client.status}
                                                                                </span>
                                                                            ) :
                                                                                (
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

                {/* {total > limit && ( */}
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <label htmlFor="limit" className="mr-2 text-sm">Rows per page:</label>
                        <select
                            id="limit"
                            value={limit}
                            onChange={e => {
                                setPage(1);
                                setLimit(Number(e.target.value));
                            }}
                            className={`border rounded px-2 py-1 text-sm ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
                        >
                            {[10, 20, 50, 100, 200].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            className={`p-1 ${page === 1 ? 'opacity-50  cursor-not-allowed' : ''}`}
                        >
                            <ChevronLeft />
                        </button>
                        <span>Page {page} of {Math.ceil(total / limit)}</span>
                        <button
                            disabled={page >= Math.ceil(total / limit)}
                            onClick={() => setPage(p => p + 1)}
                            className={`p-1 ${page >= Math.ceil(total / limit) ? 'opacity-50  cursor-not-allowed' : ''}`}
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>
                {/* )} */}

                {contextMenu.visible && (
                    <div
                        className={`fixed z-50 rounded-md shadow-lg text-sm ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'} ${contextClosing ? 'animate-slide-out opacity-0' : 'animate-menu-pop'}`}
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
                                    className={`absolute ${submenuFlipLeft ? 'right-full pr-2' : 'left-full pl-2'} border top-0 mt-[-8px] min-w-[180px] max-h-[300px] overflow-y-auto z-50 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded shadow-lg ${contextClosing ? 'animate-slide-out opacity-0' : 'animate-menu-pop'}`}
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
                                    ].filter(col => col.key !== 'select' && col.key !== 'logical_client_id')  // optional
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
                        <div className={`rounded-lg p-6 max-w-sm w-96 shadow-lg ${isClosing ? 'animate-slide-out' : 'animate-fade-up'} ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Add New Column</h2>
                                <button onClick={() => handleClose()} className="text-xl font-bold">×</button>
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
                                <button onClick={() => handleClose()} className={`px-4 py-2 text-sm border ${dark ? 'border-slate-300 text-slate-300 ' : 'border-indigo-600 text-indigo-600'} rounded `}>Cancel</button>
                                <button onClick={handleAddColumn} className={`px-4 py-2 text-sm ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'} rounded`}>Add</button>
                            </div>
                        </div>
                    </div>
                )}
                <RenewClientsModal
                    isOpen={showRenewModal}
                    onClose={() => setShowRenewModal(false)}
                    onSave={handleRenewSave}
                    dark={dark}
                    animate
                />

                <AlertModal
                    isOpen={!!alertMessage}
                    message={alertMessage}
                    onClose={() => setAlertMessage('')}
                />
            </div>
        </PageWrapper>
    );
}
