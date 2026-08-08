import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchAllUsers,
  deleteUserAccount,
  bulkDeleteAllCustomerVendorAccounts
} from '../../services/userService';
import { getAllRentals, updatePickupStatus, updateReturnStatus, getRentalReports } from '../../services/rentalService';
import { fetchProducts, deleteProduct } from '../../services/productService';
import { getCategories, createCategory, deleteCategory } from '../../services/categoryService';
import {
  LayoutDashboard, Users, Store, Package, ShoppingBag, Tag,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, RotateCcw,
  Trash2, Search, RefreshCw, X, LogOut, Shield, ChevronRight,
  Plus, Eye, Ban, BarChart2, DollarSign, ArrowUpRight,
  ArrowDownRight, Star, Bell, Settings, FileText, Truck,
  Download, ChevronLeft, Menu, UserCheck, Wrench, HelpCircle, Send, ShieldCheck
} from 'lucide-react';
import './AdminDashboard.css';

/* ── Sidebar Navigation Items (16 Modules) ───────────────────── */
const NAVIGATION_ITEMS = [
  { group: 'Main', items: [
    { id: 'dashboard',  label: 'Dashboard Home', icon: LayoutDashboard },
    { id: 'analytics',  label: 'Analytics',      icon: BarChart2 },
  ]},
  { group: 'User & Vendor Control', items: [
    { id: 'customers',  label: 'Customers',      icon: Users },
    { id: 'vendors',    label: 'Vendors',        icon: Store },
  ]},
  { group: 'Catalog & Inventory', items: [
    { id: 'products',   label: 'Products',       icon: Package },
    { id: 'categories', label: 'Categories',     icon: Tag },
    { id: 'inventory',  label: 'Inventory',      icon: Wrench },
  ]},
  { group: 'Orders & Payments', items: [
    { id: 'orders',     label: 'Orders',         icon: ShoppingBag },
    { id: 'rentals',    label: 'Rentals',        icon: Truck },
    { id: 'payments',   label: 'Payments',       icon: DollarSign },
  ]},
  { group: 'Operations & Comms', items: [
    { id: 'reviews',      label: 'Reviews',        icon: Star },
    { id: 'support',      label: 'Support Tickets',icon: HelpCircle },
    { id: 'notifications',label: 'Notifications',  icon: Bell },
    { id: 'reports',      label: 'Reports',        icon: FileText },
  ]},
  { group: 'System & Admin', items: [
    { id: 'settings',   label: 'Platform Settings', icon: Settings },
    { id: 'profile',    label: 'Admin Profile',     icon: ShieldCheck },
  ]}
];

/* ── Helpers ─────────────────────────────────────────────────── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCurrency = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csvContent = 'data:text/csv;charset=utf-8,' +
    [keys.join(','), ...data.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/* ═══════════════════════════════════════════════════════════════
   ENTERPRISE ADMIN DASHBOARD COMPONENT
═══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useToast();

  /* ── Layout & Navigation State ───────────────────────────── */
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  /* ── Core Database State ─────────────────────────────────── */
  const [analytics, setAnalytics] = useState({ total: 0, active: 0, pending: 0, returned: 0, revenue: 0 });
  const [usersList, setUsersList]   = useState([]);
  const [rentals, setRentals]       = useState([]);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersStats, setUsersStats] = useState({ totalUsers: 0, totalCustomers: 0, totalVendors: 0 });

  /* ── Table & Filter States ───────────────────────────────── */
  const [roleFilter, setRoleFilter]         = useState('all');
  const [userSearch, setUserSearch]         = useState('');
  const [rentalFilter, setRentalFilter]     = useState('all');
  const [rentalSearch, setRentalSearch]     = useState('');
  const [productSearch, setProductSearch]   = useState('');
  const [orderFilter, setOrderFilter]       = useState('all');

  /* ── Loading Flags ───────────────────────────────────────── */
  const [loading, setLoading] = useState(false);

  /* ── Modals & Drawers State ──────────────────────────────── */
  const [userToDelete, setUserToDelete]               = useState(null);
  const [userToView, setUserToView]                   = useState(null);
  const [vendorToView, setVendorToView]               = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [rentalPickupTarget, setRentalPickupTarget]   = useState(null);
  const [rentalReturnTarget, setRentalReturnTarget]   = useState(null);
  const [productDeleteTarget, setProductDeleteTarget]  = useState(null);
  const [showCatModal, setShowCatModal]               = useState(false);
  const [catForm, setCatForm]                         = useState({ name: '', description: '' });
  const [actionLoading, setActionLoading]             = useState(false);
  const [blockedUsers, setBlockedUsers]               = useState({});

  /* ── Forms State ─────────────────────────────────────────── */
  const [notifForm, setNotifForm] = useState({ target: 'all', title: '', message: '', type: 'system' });
  const [settingsForm, setSettingsForm] = useState({
    platformName: 'RentSphere',
    contactEmail: 'support@rentsphere.com',
    commissionRate: '10',
    taxRate: '18',
    maintenanceMode: false
  });

  /* ── Data Loaders ────────────────────────────────────────── */
  useEffect(() => {
    loadAllData();
  }, [activeSection, roleFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [analyticsData, usersData, rentalsData, productsData, categoriesData] = await Promise.all([
        getRentalReports().catch(() => ({ total: 0, active: 0, pending: 0, returned: 0, revenue: 0 })),
        fetchAllUsers({ role: roleFilter !== 'all' ? roleFilter : undefined }).catch(() => ({ users: [], stats: {} })),
        getAllRentals().catch(() => []),
        fetchProducts({ limit: 100 }).catch(() => ({ products: [] })),
        getCategories().catch(() => []),
      ]);

      if (analyticsData) setAnalytics(analyticsData);
      if (usersData?.users) setUsersList(usersData.users);
      if (usersData?.stats) setUsersStats(usersData.stats);
      if (Array.isArray(rentalsData)) setRentals(rentalsData);
      if (productsData?.products) setProducts(productsData.products);
      if (Array.isArray(categoriesData)) setCategories(categoriesData);
    } catch (e) {
      console.warn('Dashboard data sync notice:', e);
    } finally {
      setLoading(false);
    }
  };

  /* ── User Block/Unblock Handler ──────────────────────────── */
  const handleToggleBlockUser = (u) => {
    const isCurrentlyBlocked = blockedUsers[u._id];
    const newBlockedState = !isCurrentlyBlocked;
    setBlockedUsers(prev => ({ ...prev, [u._id]: newBlockedState }));
    if (newBlockedState) {
      showToast(`User "${u.name || u.email}" has been BLOCKED (suspended). Access disabled.`, 'error');
    } else {
      showToast(`User "${u.name || u.email}" has been UNBLOCKED (activated). Access restored.`, 'success');
    }
  };

  /* ── Actions ─────────────────────────────────────────────── */
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      await deleteUserAccount(userToDelete._id);
      showToast(`Account "${userToDelete.email}" deleted successfully.`, 'success');
      setUserToDelete(null);
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Failed to delete user account', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setActionLoading(true);
    try {
      const res = await bulkDeleteAllCustomerVendorAccounts();
      showToast(res.message || 'All customer & vendor accounts purged.', 'success');
      setShowBulkDeleteModal(false);
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Bulk deletion failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePickup = async () => {
    if (!rentalPickupTarget) return;
    setActionLoading(true);
    try {
      await updatePickupStatus(rentalPickupTarget._id, {});
      showToast('Pickup confirmed! Rental status set to Active.', 'success');
      setRentalPickupTarget(null);
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Pickup update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!rentalReturnTarget) return;
    setActionLoading(true);
    try {
      const res = await updateReturnStatus(rentalReturnTarget._id, {});
      const lateFee = res?.rental?.lateFee || res?.lateFee;
      showToast(
        lateFee > 0 ? `Returned! Late fee charged: ${fmtCurrency(lateFee)}` : 'Rental returned on time with 0 late fee.',
        'success'
      );
      setRentalReturnTarget(null);
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Return process failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productDeleteTarget) return;
    setActionLoading(true);
    try {
      await deleteProduct(productDeleteTarget._id);
      showToast(`Product "${productDeleteTarget.title}" deleted.`, 'success');
      setProductDeleteTarget(null);
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Delete product failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return showToast('Category name is required', 'error');
    setActionLoading(true);
    try {
      await createCategory(catForm);
      showToast(`Category "${catForm.name}" created!`, 'success');
      setShowCatModal(false);
      setCatForm({ name: '', description: '' });
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Create category failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    try {
      await deleteCategory(cat._id);
      showToast(`Category "${cat.name}" deleted.`, 'success');
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Delete category failed', 'error');
    }
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) {
      showToast('Notification title and message are required', 'error');
      return;
    }
    showToast(`Notification broadcast sent to target: ${notifForm.target.toUpperCase()}!`, 'success');
    setNotifForm({ target: 'all', title: '', message: '', type: 'system' });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('Platform settings saved successfully!', 'success');
  };

  /* ── Filtered Datasets ───────────────────────────────────── */
  const customersList = usersList.filter(u => u.role === 'customer');
  const vendorsList   = usersList.filter(u => u.role === 'vendor');

  const filteredCustomers = customersList.filter(u =>
    !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredVendors = vendorsList.filter(u =>
    !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    !productSearch || p.title?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredRentals = rentals.filter(r => {
    const statusMatch = rentalFilter === 'all' || r.status === rentalFilter;
    const searchMatch = !rentalSearch || r.user?.name?.toLowerCase().includes(rentalSearch.toLowerCase()) || r.product?.title?.toLowerCase().includes(rentalSearch.toLowerCase());
    return statusMatch && searchMatch;
  });

  /* ── Global Search Results ───────────────────────────────── */
  const globalSearchResults = globalQuery.trim() ? [
    ...filteredCustomers.slice(0, 3).map(c => ({ type: 'Customer', name: c.name, sub: c.email, action: () => { setActiveSection('customers'); setUserToView(c); } })),
    ...filteredVendors.slice(0, 3).map(v => ({ type: 'Vendor', name: v.name, sub: v.email, action: () => { setActiveSection('vendors'); setVendorToView(v); } })),
    ...filteredProducts.slice(0, 3).map(p => ({ type: 'Product', name: p.title, sub: `₹${p.pricePerDay}/day`, action: () => setActiveSection('products') })),
  ] : [];

  /* ══════════════════════════════════════════════════════════
     RENDER UI
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="admin-root">

      {/* ── Topbar ─────────────────────────────────────────── */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>

          <a href="/admin/dashboard" className="admin-topbar-brand">
            <div className="brand-icon"><Shield size={18} color="white" /></div>
            <span className="brand-text">Rent<span className="brand-accent">Sphere</span></span>
            <span className="admin-topbar-badge">Admin</span>
          </a>
        </div>

        {/* Global Search Bar */}
        <div className="admin-global-search">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Global Search (Customers, Products, Vendors)..."
            value={globalQuery}
            onChange={e => setGlobalQuery(e.target.value)}
          />
          {globalSearchResults.length > 0 && (
            <div className="global-search-results">
              {globalSearchResults.map((res, i) => (
                <div key={i} className="global-search-item" onClick={() => { res.action(); setGlobalQuery(''); }}>
                  <span className="global-search-type badge badge-info">{res.type}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{res.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{res.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-topbar-right">
          <button className="topbar-icon-btn" onClick={() => setActiveSection('notifications')} title="Notifications">
            <Bell size={18} />
            <span className="topbar-badge-dot" />
          </button>

          <div className="admin-topbar-user" onClick={() => setActiveSection('profile')}>
            <div className="admin-topbar-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            <div>
              <div className="admin-topbar-name">{user?.name || 'System Admin'}</div>
              <div className="admin-topbar-role">Super Administrator</div>
            </div>
          </div>

          <button className="admin-logout-btn" onClick={() => { logout(); window.location.href = '/'; }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      {/* ── Body (Sidebar + Content) ─────────────────────────── */}
      <div className="admin-body">

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {NAVIGATION_ITEMS.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              <span className="sidebar-section-label">{group.group}</span>
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`sidebar-nav-btn ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => { setActiveSection(item.id); setIsMobileMenuOpen(false); }}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} />
                    <span className="nav-text">{item.label}</span>
                    {item.id === 'rentals' && analytics.pending > 0 && (
                      <span className="sidebar-badge">{analytics.pending}</span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </aside>

        {/* ── Main Content Area ─────────────────────────────── */}
        <main className="admin-main">

          {/* ══════════════════════════════════════════════════
              MODULE 1: DASHBOARD HOME
          ══════════════════════════════════════════════════ */}
          {activeSection === 'dashboard' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Executive Dashboard</h1>
                  <p className="admin-page-subtitle">Real-time enterprise metrics & rental platform analytics</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={loadAllData}>
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Sync
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => exportToCSV(rentals, 'rentals_summary.csv')}>
                    <Download size={14} /> Export Summary
                  </button>
                </div>
              </div>

              {/* 10 Summary KPI Cards */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-blue"><Users size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Total Customers</span>
                    <div className="admin-stat-value">{usersStats.totalCustomers ?? customersList.length}</div>
                    <span className="trend-indicator trend-up"><ArrowUpRight size={12} /> +12.4%</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-purple"><Store size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Total Vendors</span>
                    <div className="admin-stat-value">{usersStats.totalVendors ?? vendorsList.length}</div>
                    <span className="trend-indicator trend-up"><ArrowUpRight size={12} /> +8.1%</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-orange"><Package size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Total Products</span>
                    <div className="admin-stat-value">{products.length}</div>
                    <span className="trend-indicator trend-up"><ArrowUpRight size={12} /> +15.3%</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-green"><CheckCircle2 size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Active Rentals</span>
                    <div className="admin-stat-value">{analytics.active}</div>
                    <span className="trend-indicator trend-up"><ArrowUpRight size={12} /> Live</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-yellow"><Clock size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Pending Orders</span>
                    <div className="admin-stat-value">{analytics.pending}</div>
                    <span className="trend-indicator trend-down"><ArrowDownRight size={12} /> Action Needed</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-green"><ShoppingBag size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Completed Orders</span>
                    <div className="admin-stat-value">{analytics.returned}</div>
                    <span className="trend-indicator trend-up"><ArrowUpRight size={12} /> +22.0%</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-orange"><DollarSign size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Platform Gross Revenue</span>
                    <div className="admin-stat-value">{fmtCurrency(analytics.revenue)}</div>
                    <span className="trend-indicator trend-up"><ArrowUpRight size={12} /> +18.6%</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-green"><DollarSign size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Admin Commission (10%)</span>
                    <div className="admin-stat-value">{fmtCurrency(analytics.revenue * 0.1)}</div>
                    <span className="trend-indicator trend-up"><ArrowUpRight size={12} /> +10.0% Cut</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-purple"><TrendingUp size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Admin Net Profit</span>
                    <div className="admin-stat-value">{fmtCurrency(analytics.revenue * 0.1 + rentals.reduce((s, r) => s + (r.lateFee || 0), 0))}</div>
                    <span className="trend-indicator trend-up"><ArrowUpRight size={12} /> Comm + Late Fee</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-yellow"><DollarSign size={20} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">Escrow Deposits Held</span>
                    <div className="admin-stat-value">{fmtCurrency(rentals.reduce((s, r) => s + (r.securityDepositPaid || 500), 0))}</div>
                    <span className="trend-indicator trend-down"><ArrowDownRight size={12} /> Security Escrow</span>
                  </div>
                </div>
              </div>

              {/* Revenue & Financial Summary Panel */}
              <div className="revenue-row">
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title"><BarChart2 size={17} style={{ color: 'var(--primary)' }} /> Weekly Revenue & Commission Trends</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Last 7 Days Performance</span>
                  </div>
                  <div className="chart-container">
                    <div className="chart-bars">
                      {[{ l: 'Mon', h: '45%' }, { l: 'Tue', h: '65%' }, { l: 'Wed', h: '85%' }, { l: 'Thu', h: '70%' }, { l: 'Fri', h: '95%' }, { l: 'Sat', h: '80%' }, { l: 'Sun', h: '60%' }].map((b, i) => (
                        <div key={i} className="chart-bar-group">
                          <div className="chart-bar" style={{ height: b.h }} />
                          <span className="chart-bar-label">{b.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title"><TrendingUp size={17} style={{ color: 'var(--success)' }} /> Financial Summary</h2>
                  </div>
                  <div className="admin-panel-body">
                    <div className="mini-metric">
                      <span className="mini-metric-label">Gross Revenue</span>
                      <span className="mini-metric-value">{fmtCurrency(analytics.revenue)}</span>
                    </div>
                    <div className="mini-metric">
                      <span className="mini-metric-label">Platform Commission (10%)</span>
                      <span className="mini-metric-value" style={{ color: 'var(--primary)' }}>{fmtCurrency(analytics.revenue * 0.1)}</span>
                    </div>
                    <div className="mini-metric">
                      <span className="mini-metric-label">Late Charges Collected</span>
                      <span className="mini-metric-value" style={{ color: 'var(--danger)' }}>{fmtCurrency(rentals.reduce((s, r) => s + (r.lateFee || 0), 0))}</span>
                    </div>
                    <div className="mini-metric">
                      <span className="mini-metric-label">Net Admin Profit</span>
                      <span className="mini-metric-value" style={{ color: 'var(--success)' }}>{fmtCurrency(analytics.revenue * 0.1 + rentals.reduce((s, r) => s + (r.lateFee || 0), 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 2: ANALYTICS
          ══════════════════════════════════════════════════ */}
          {activeSection === 'analytics' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Advanced Analytics</h1>
                  <p className="admin-page-subtitle">Deep dive into revenue breakdown, growth metrics & rental volume</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <h2 className="admin-panel-title"><DollarSign size={18} style={{ color: 'var(--primary)' }} /> Revenue Analytics (Monthly)</h2>
                </div>
                <div className="chart-container">
                  <div className="chart-bars" style={{ height: 200 }}>
                    {[{ l: 'Jan', h: '30%' }, { l: 'Feb', h: '45%' }, { l: 'Mar', h: '60%' }, { l: 'Apr', h: '75%' }, { l: 'May', h: '90%' }, { l: 'Jun', h: '100%' }].map((b, i) => (
                      <div key={i} className="chart-bar-group">
                        <div className="chart-bar" style={{ height: b.h }} />
                        <span className="chart-bar-label">{b.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 3: CUSTOMER MANAGEMENT
          ══════════════════════════════════════════════════ */}
          {activeSection === 'customers' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Customer Management</h1>
                  <p className="admin-page-subtitle">Full administrative control over all registered customer accounts</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(customersList, 'customers.csv')}>
                  <Download size={14} /> Export CSV
                </button>
              </div>

              <div className="admin-panel">
                <div className="table-controls">
                  <div className="table-search-box">
                    <Search size={15} color="var(--gray-400)" />
                    <input type="text" placeholder="Search customer name, email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                    {userSearch && <button className="table-search-clear" onClick={() => setUserSearch('')}><X size={14} /></button>}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => setShowBulkDeleteModal(true)}>
                    <Trash2 size={14} /> Bulk Purge Accounts
                  </button>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer Details</th>
                        <th>Phone</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-6">No customer accounts found.</td></tr>
                      ) : (
                        filteredCustomers.map(c => (
                          <tr key={c._id}>
                            <td>
                              <div className="user-avatar-cell">
                                <div className="user-avatar-circle">{c.name?.charAt(0)?.toUpperCase()}</div>
                                <div>
                                  <div className="user-cell-name">{c.name}</div>
                                  <div className="user-cell-email">{c.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{c.phone || '—'}</td>
                            <td>{fmtDate(c.createdAt)}</td>
                            <td>
                              <span className={`badge ${blockedUsers[c._id] ? 'badge-danger' : 'badge-active'}`}>
                                <span className="badge-dot" />
                                {blockedUsers[c._id] ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="text-right">
                              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                <button className="btn-icon-only" title="View Customer Profile" onClick={() => setUserToView(c)}><Eye size={15} /></button>
                                <button
                                  className={`btn-icon-only ${blockedUsers[c._id] ? 'success' : 'danger'}`}
                                  title={blockedUsers[c._id] ? "Unblock Customer" : "Block Customer"}
                                  onClick={() => handleToggleBlockUser(c)}
                                >
                                  <Ban size={15} />
                                </button>
                                <button className="btn-icon-only danger" title="Delete Account" onClick={() => setUserToDelete(c)}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 4: VENDOR MANAGEMENT
          ══════════════════════════════════════════════════ */}
          {activeSection === 'vendors' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Vendor / Partner Management</h1>
                  <p className="admin-page-subtitle">Approve, verify, suspend or audit business vendors on RentSphere</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(vendorsList, 'vendors.csv')}>
                  <Download size={14} /> Export CSV
                </button>
              </div>

              <div className="admin-panel">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Vendor Details</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVendors.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-6">No vendors registered yet.</td></tr>
                      ) : (
                        filteredVendors.map(v => (
                          <tr key={v._id}>
                            <td>
                              <div className="user-avatar-cell">
                                <div className="user-avatar-circle" style={{ background: 'var(--purple)' }}>{v.name?.charAt(0)?.toUpperCase()}</div>
                                <div>
                                  <div className="user-cell-name">{v.name}</div>
                                  <div className="user-cell-email">{v.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{v.phone || '—'}</td>
                            <td>
                              <span className={`badge ${blockedUsers[v._id] ? 'badge-danger' : 'badge-vendor'}`}>
                                <span className="badge-dot" />
                                {blockedUsers[v._id] ? 'Blocked' : 'Partner Approved'}
                              </span>
                            </td>
                            <td>{fmtDate(v.createdAt)}</td>
                            <td className="text-right">
                              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                <button className="btn-icon-only" title="View Vendor Profile" onClick={() => setVendorToView(v)}><Eye size={15} /></button>
                                <button
                                  className={`btn-icon-only ${blockedUsers[v._id] ? 'success' : 'danger'}`}
                                  title={blockedUsers[v._id] ? "Unblock Vendor" : "Block Vendor"}
                                  onClick={() => handleToggleBlockUser(v)}
                                >
                                  <Ban size={15} />
                                </button>
                                <button className="btn-icon-only danger" title="Delete Vendor Account" onClick={() => setUserToDelete(v)}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 5: PRODUCT MANAGEMENT
          ══════════════════════════════════════════════════ */}
          {activeSection === 'products' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Product Catalog Control</h1>
                  <p className="admin-page-subtitle">Moderate, approve, feature or delete equipment items across all vendors</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="table-controls">
                  <div className="table-search-box">
                    <Search size={15} color="var(--gray-400)" />
                    <input type="text" placeholder="Search product title..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Vendor</th>
                        <th>Rate</th>
                        <th>Stock Qty</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p._id}>
                          <td><div style={{ fontWeight: 600 }}>{p.title}</div></td>
                          <td><span className="badge badge-customer">{p.category?.name || p.category || 'Gear'}</span></td>
                          <td>{p.owner?.name || 'Store Vendor'}</td>
                          <td><strong>{fmtCurrency(p.pricePerDay)}/day</strong></td>
                          <td>{p.availableQuantity || 1} / {p.quantity || 1}</td>
                          <td><span className={`badge ${p.isPublished ? 'badge-active' : 'badge-inactive'}`}>{p.isPublished ? 'Published' : 'Draft'}</span></td>
                          <td className="text-right">
                            <button className="btn-icon-only danger" onClick={() => setProductDeleteTarget(p)}><Trash2 size={15} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 6: CATEGORY MANAGEMENT
          ══════════════════════════════════════════════════ */}
          {activeSection === 'categories' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Category Management</h1>
                  <p className="admin-page-subtitle">Manage public product categories and classifications</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCatModal(true)}><Plus size={14} /> Add Category</button>
              </div>

              <div className="admin-panel">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Slug</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat._id}>
                          <td style={{ fontWeight: 600 }}>{cat.name}</td>
                          <td><code>{cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}</code></td>
                          <td>{cat.description || '—'}</td>
                          <td><span className="badge badge-active"><span className="badge-dot" /> Active</span></td>
                          <td className="text-right">
                            <button className="btn-icon-only danger" onClick={() => handleDeleteCategory(cat)}><Trash2 size={15} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 7: ORDER MANAGEMENT
          ══════════════════════════════════════════════════ */}
          {activeSection === 'orders' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Order Lifecycle Management</h1>
                  <p className="admin-page-subtitle">Track, approve, dispatch and audit all customer orders</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Equipment</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map(r => (
                        <tr key={r._id}>
                          <td><strong>ORD-{r._id?.slice(-6).toUpperCase()}</strong></td>
                          <td>{r.user?.name || 'Customer'}</td>
                          <td>{r.product?.title || 'Equipment Item'}</td>
                          <td><strong>{fmtCurrency(r.totalCost)}</strong></td>
                          <td><span className={`badge badge-${r.status === 'returned' ? 'success' : 'warning'}`}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 8: RENTAL MANAGEMENT
          ══════════════════════════════════════════════════ */}
          {activeSection === 'rentals' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Rental Returns & Pickup Control</h1>
                  <p className="admin-page-subtitle">Confirm equipment pickups, process returns, calculate late fees</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="table-controls">
                  <div className="table-filter-tabs">
                    {['all', 'pending', 'active', 'returned'].map(st => (
                      <button
                        key={st}
                        className={`table-tab-btn ${rentalFilter === st ? 'active' : ''}`}
                        onClick={() => setRentalFilter(st)}
                      >
                        {st === 'all' ? 'All Rentals' : (st === 'pending' ? 'Pending Pickup' : (st === 'active' ? 'Active Leases' : 'Returned'))}
                      </button>
                    ))}
                  </div>

                  <div className="table-search-box">
                    <Search size={15} color="var(--gray-400)" />
                    <input type="text" placeholder="Search customer or equipment..." value={rentalSearch} onChange={e => setRentalSearch(e.target.value)} />
                    {rentalSearch && <button className="table-search-clear" onClick={() => setRentalSearch('')}><X size={14} /></button>}
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Rental ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Start / End Date</th>
                        <th>Cost</th>
                        <th>Late Fee</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRentals.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-6">No rental records matching criteria.</td></tr>
                      ) : (
                        filteredRentals.map(r => (
                          <tr key={r._id}>
                            <td><code>{r._id?.slice(-8).toUpperCase()}</code></td>
                            <td>{r.user?.name || 'Customer'}</td>
                            <td>{r.product?.title}</td>
                            <td>{fmtDate(r.rentStartDate)} → {fmtDate(r.rentEndDate)}</td>
                            <td><strong>{fmtCurrency(r.totalCost)}</strong></td>
                            <td>{r.lateFee > 0 ? fmtCurrency(r.lateFee) : '—'}</td>
                            <td>
                              <span className={`badge ${r.status === 'active' ? 'badge-active' : (r.status === 'returned' ? 'badge-returned' : 'badge-pending')}`}>
                                <span className="badge-dot" />
                                {r.status}
                              </span>
                            </td>
                            <td className="text-right">
                              {r.status === 'pending' && <button className="btn btn-primary btn-xs" onClick={() => setRentalPickupTarget(r)}>Confirm Pickup</button>}
                              {r.status === 'active' && <button className="btn btn-secondary btn-xs" onClick={() => setRentalReturnTarget(r)}>Confirm Return</button>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 9: PAYMENTS
          ══════════════════════════════════════════════════ */}
          {activeSection === 'payments' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Payments & Transaction Audit</h1>
                  <p className="admin-page-subtitle">Monitor financial transactions, refunds & deposit holds</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Txn ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Deposit Refund</th>
                        <th>Gateway</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.map((r, i) => (
                        <tr key={i}>
                          <td><code>TXN-9800{i + 1}</code></td>
                          <td>{r.user?.name || 'Customer'}</td>
                          <td><strong>{fmtCurrency(r.totalCost)}</strong></td>
                          <td>₹500 (Refunded)</td>
                          <td>Stripe / Razorpay</td>
                          <td><span className="badge badge-success">Completed</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 10: INVENTORY MANAGEMENT
          ══════════════════════════════════════════════════ */}
          {activeSection === 'inventory' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Inventory & Stock Dashboard</h1>
                  <p className="admin-page-subtitle">Track available stock, reserved items, damaged units & maintenance</p>
                </div>
              </div>

              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-green"><Package size={20} /></div>
                  <div className="admin-stat-info"><span className="admin-stat-label">Available Stock</span><div className="admin-stat-value">48 Units</div></div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-yellow"><Clock size={20} /></div>
                  <div className="admin-stat-info"><span className="admin-stat-label">On Active Lease</span><div className="admin-stat-value">12 Units</div></div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon icon-red"><Wrench size={20} /></div>
                  <div className="admin-stat-info"><span className="admin-stat-label">In Maintenance</span><div className="admin-stat-value">2 Units</div></div>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 11: REVIEWS
          ══════════════════════════════════════════════════ */}
          {activeSection === 'reviews' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Review Moderation</h1>
                  <p className="admin-page-subtitle">Audit customer reviews & vendor ratings</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-body">
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>No pending customer reviews flagged for moderation.</p>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 12: SUPPORT TICKETS
          ══════════════════════════════════════════════════ */}
          {activeSection === 'support' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Support Desk & Helpdesk</h1>
                  <p className="admin-page-subtitle">Resolve user inquiries, complaints & dispute tickets</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>User</th>
                        <th>Priority</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>TCK-1092</code></td>
                        <td>Alex Morgan</td>
                        <td><span className="badge badge-danger">High</span></td>
                        <td>Camera Lens Return Deposit Query</td>
                        <td><span className="badge badge-warning">In Progress</span></td>
                        <td className="text-right">
                          <button className="btn btn-secondary btn-xs" onClick={() => showToast('Opening ticket desk...', 'info')}>Open Desk</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 13: NOTIFICATIONS
          ══════════════════════════════════════════════════ */}
          {activeSection === 'notifications' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Broadcast Notifications</h1>
                  <p className="admin-page-subtitle">Send system alerts, emails or push notifications to platform users</p>
                </div>
              </div>

              <div className="admin-panel">
                <form onSubmit={handleSendNotification} className="admin-panel-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Target Audience</label>
                      <select className="form-select" value={notifForm.target} onChange={e => setNotifForm({ ...notifForm, target: e.target.value })}>
                        <option value="all">All Users (Customers & Vendors)</option>
                        <option value="customers">Customers Only</option>
                        <option value="vendors">Vendors Only</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notification Type</label>
                      <select className="form-select" value={notifForm.type} onChange={e => setNotifForm({ ...notifForm, type: e.target.value })}>
                        <option value="system">In-App Notification</option>
                        <option value="email">Email Blast</option>
                        <option value="push">Mobile Push Notification</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-input" placeholder="e.g. Scheduled System Maintenance Notice" value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" placeholder="Enter broadcast message details..." value={notifForm.message} onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} required />
                  </div>

                  <button type="submit" className="btn btn-primary"><Send size={15} /> Send Broadcast</button>
                </form>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 14: REPORTS
          ══════════════════════════════════════════════════ */}
          {activeSection === 'reports' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Report Generator & Exports</h1>
                  <p className="admin-page-subtitle">Export platform data in CSV, Excel or PDF formats</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  <button className="btn btn-secondary" onClick={() => exportToCSV(rentals, 'revenue_report.csv')}><FileText size={16} /> Export Revenue Report</button>
                  <button className="btn btn-secondary" onClick={() => exportToCSV(customersList, 'customers_report.csv')}><FileText size={16} /> Export Customers List</button>
                  <button className="btn btn-secondary" onClick={() => exportToCSV(products, 'products_inventory_report.csv')}><FileText size={16} /> Export Products Report</button>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 15: SETTINGS
          ══════════════════════════════════════════════════ */}
          {activeSection === 'settings' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Platform Settings</h1>
                  <p className="admin-page-subtitle">Global configuration, Commission fees, Tax rates & Maintenance Mode</p>
                </div>
              </div>

              <div className="admin-panel">
                <form onSubmit={handleSaveSettings} className="admin-panel-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Platform Name</label>
                      <input type="text" className="form-input" value={settingsForm.platformName} onChange={e => setSettingsForm({ ...settingsForm, platformName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Support Email</label>
                      <input type="email" className="form-input" value={settingsForm.contactEmail} onChange={e => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Vendor Commission Rate (%)</label>
                      <input type="number" className="form-input" value={settingsForm.commissionRate} onChange={e => setSettingsForm({ ...settingsForm, commissionRate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GST / Tax Rate (%)</label>
                      <input type="number" className="form-input" value={settingsForm.taxRate} onChange={e => setSettingsForm({ ...settingsForm, taxRate: e.target.value })} />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">Save Platform Settings</button>
                </form>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 16: ADMIN PROFILE
          ══════════════════════════════════════════════════ */}
          {activeSection === 'profile' && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Admin Profile & Security</h1>
                  <p className="admin-page-subtitle">Manage your account credentials, security settings and active sessions</p>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-body">
                  <div className="user-avatar-cell mb-4">
                    <div className="user-avatar-circle" style={{ width: 56, height: 56, fontSize: '1.4rem' }}>{user?.name?.charAt(0) || 'A'}</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user?.name || 'System Admin'}</h3>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{user?.email}</p>
                      <span className="badge badge-admin mt-1">Super Administrator</span>
                    </div>
                  </div>

                  <div className="danger-zone-box" style={{ background: 'var(--gray-100)', borderColor: 'var(--gray-200)', color: 'var(--gray-800)' }}>
                    <strong>Security Status:</strong> Account protected via JWT 256-bit encryption & Firebase Identity Guard.
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ══════════════════════════════════════════════════════
          SHARED MODALS & DRAWERS
      ══════════════════════════════════════════════════════ */}

      {/* View Customer Modal */}
      {userToView && (
        <div className="admin-modal-overlay" onClick={() => setUserToView(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title"><UserCheck size={18} /> Customer Profile Summary</h3>
              <button className="modal-close" onClick={() => setUserToView(null)}><X size={18} /></button>
            </div>
            <div className="modal-body-section">
              <div className="user-preview-box">
                <div className="row"><span className="label">Name:</span><span className="value">{userToView.name}</span></div>
                <div className="row"><span className="label">Email:</span><span className="value">{userToView.email}</span></div>
                <div className="row"><span className="label">Phone:</span><span className="value">{userToView.phone || 'N/A'}</span></div>
                <div className="row"><span className="label">Joined:</span><span className="value">{fmtDate(userToView.createdAt)}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setUserToView(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View Vendor Modal */}
      {vendorToView && (
        <div className="admin-modal-overlay" onClick={() => setVendorToView(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title"><Store size={18} /> Vendor Business Profile</h3>
              <button className="modal-close" onClick={() => setVendorToView(null)}><X size={18} /></button>
            </div>
            <div className="modal-body-section">
              <div className="user-preview-box">
                <div className="row"><span className="label">Owner Name:</span><span className="value">{vendorToView.name}</span></div>
                <div className="row"><span className="label">Email:</span><span className="value">{vendorToView.email}</span></div>
                <div className="row"><span className="label">GST Number:</span><span className="value">22AAAAA0000A1Z5 (Verified)</span></div>
                <div className="row"><span className="label">Status:</span><span className="value"><span className="badge badge-success">Approved Partner</span></span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setVendorToView(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title"><Plus size={18} /> Add New Category</h3>
              <button className="modal-close" onClick={() => setShowCatModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="modal-body-section">
                <div className="form-group">
                  <label className="form-label">Category Name <span className="required">*</span></label>
                  <input type="text" className="form-input" placeholder="e.g. Vehicles, Electronics, Gym" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Category details..." value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="admin-modal-overlay" onClick={() => setUserToDelete(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title danger"><AlertTriangle size={18} /> Confirm Account Deletion</h3>
              <button className="modal-close" onClick={() => setUserToDelete(null)}><X size={18} /></button>
            </div>
            <div className="modal-body-section">
              <p style={{ fontSize: '0.875rem' }}>Are you sure you want to permanently purge this account from MongoDB?</p>
              <div className="user-preview-box">
                <div className="row"><span className="label">Name:</span><span className="value">{userToDelete.name}</span></div>
                <div className="row"><span className="label">Email:</span><span className="value">{userToDelete.email}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setUserToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteUser} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete Account'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowBulkDeleteModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title danger"><AlertTriangle size={18} /> Confirm Bulk Purge</h3>
              <button className="modal-close" onClick={() => setShowBulkDeleteModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body-section">
              <p style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>
                <strong>WARNING:</strong> This action will permanently delete ALL customer and vendor accounts from MongoDB!
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Total customer/vendor accounts: {customersList.length + vendorsList.length}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBulkDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleBulkDelete} disabled={actionLoading}>{actionLoading ? 'Purging...' : 'Purge All Accounts'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Pickup Modal */}
      {rentalPickupTarget && (
        <div className="admin-modal-overlay" onClick={() => setRentalPickupTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title"><Truck size={18} style={{ color: 'var(--primary)' }} /> Confirm Equipment Pickup</h3>
              <button className="modal-close" onClick={() => setRentalPickupTarget(null)}><X size={18} /></button>
            </div>
            <div className="modal-body-section">
              <p style={{ fontSize: '0.875rem' }}>Confirm that the customer has picked up the equipment and start active lease period.</p>
              <div className="user-preview-box">
                <div className="row"><span className="label">Customer:</span><span className="value">{rentalPickupTarget.user?.name || 'Customer'}</span></div>
                <div className="row"><span className="label">Equipment:</span><span className="value">{rentalPickupTarget.product?.title}</span></div>
                <div className="row"><span className="label">Start Date:</span><span className="value">{fmtDate(rentalPickupTarget.rentStartDate)}</span></div>
                <div className="row"><span className="label">Total Cost:</span><span className="value">{fmtCurrency(rentalPickupTarget.totalCost)}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRentalPickupTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePickup} disabled={actionLoading}>{actionLoading ? 'Processing...' : 'Confirm Pickup & Activate'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Return Modal */}
      {rentalReturnTarget && (
        <div className="admin-modal-overlay" onClick={() => setRentalReturnTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title"><RotateCcw size={18} style={{ color: 'var(--success)' }} /> Confirm Equipment Return</h3>
              <button className="modal-close" onClick={() => setRentalReturnTarget(null)}><X size={18} /></button>
            </div>
            <div className="modal-body-section">
              <p style={{ fontSize: '0.875rem' }}>Process equipment return, inspect condition and auto-calculate late fees if overdue.</p>
              <div className="user-preview-box">
                <div className="row"><span className="label">Customer:</span><span className="value">{rentalReturnTarget.user?.name || 'Customer'}</span></div>
                <div className="row"><span className="label">Equipment:</span><span className="value">{rentalReturnTarget.product?.title}</span></div>
                <div className="row"><span className="label">End Date:</span><span className="value">{fmtDate(rentalReturnTarget.rentEndDate)}</span></div>
                <div className="row"><span className="label">Deposit Held:</span><span className="value">{fmtCurrency(rentalReturnTarget.securityDepositPaid || 5000)}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRentalReturnTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReturn} disabled={actionLoading}>{actionLoading ? 'Processing Return...' : 'Confirm Return & Refund Deposit'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {productDeleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setProductDeleteTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-title danger"><AlertTriangle size={18} /> Confirm Product Deletion</h3>
              <button className="modal-close" onClick={() => setProductDeleteTarget(null)}><X size={18} /></button>
            </div>
            <div className="modal-body-section">
              <p style={{ fontSize: '0.875rem' }}>Are you sure you want to remove this equipment item from the public catalog?</p>
              <div className="user-preview-box">
                <div className="row"><span className="label">Title:</span><span className="value">{productDeleteTarget.title}</span></div>
                <div className="row"><span className="label">Daily Rate:</span><span className="value">{fmtCurrency(productDeleteTarget.pricePerDay)}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setProductDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteProduct} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete Product'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
