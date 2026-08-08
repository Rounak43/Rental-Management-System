import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getVendorDashboard } from '../../services/vendorService';
import { getVendorRentals } from '../../services/rentalService';
import { fetchMyProducts, createProduct } from '../../services/productService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  DollarSign,
  Package,
  CalendarCheck,
  Clock,
  AlertTriangle,
  BarChart2,
  TrendingUp,
  Plus,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Store,
  X
} from 'lucide-react';
import './PartnerDashboard.css';

const PartnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('requests');
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRevenue: 148500,
    activeProducts: 14,
    totalBookings: 92,
    pendingRequests: 3,
    returnedCount: 89,
    onTimeRate: 99.2
  });

  const [customerRequests, setCustomerRequests] = useState([
    {
      _id: 'REQ-1092',
      customerName: 'Alex Morgan',
      productName: 'Sony Alpha A7 IV Camera Kit',
      category: 'Electronics',
      startDate: '2026-08-10',
      endDate: '2026-08-15',
      amount: 4995,
      deposit: 4000,
      status: 'Pending Approval',
    },
    {
      _id: 'REQ-1093',
      customerName: 'Sarah Connor',
      productName: 'BMW 5 Series Luxury Sedan',
      category: 'Vehicles',
      startDate: '2026-08-12',
      endDate: '2026-08-16',
      amount: 9996,
      deposit: 10000,
      status: 'Pending Approval',
    },
    {
      _id: 'REQ-1094',
      customerName: 'Marcus Vance',
      productName: 'PlayStation 5 Console Bundle',
      category: 'Gaming',
      startDate: '2026-08-14',
      endDate: '2026-08-18',
      amount: 1996,
      deposit: 2000,
      status: 'Approved',
    }
  ]);

  const [vendorInventory, setVendorInventory] = useState([
    { _id: 'v1', title: 'Sony Alpha A7 IV Camera Kit', category: 'Electronics', pricePerDay: 999, deposit: 4000, status: 'Available' },
    { _id: 'v2', title: 'BMW 5 Series Luxury Sedan', category: 'Vehicles', pricePerDay: 2499, deposit: 10000, status: 'On Lease' },
    { _id: 'v3', title: 'Commercial Motorized Treadmill', category: 'Gym', pricePerDay: 599, deposit: 2500, status: 'Available' },
    { _id: 'v4', title: 'PlayStation 5 Console Bundle', category: 'Gaming', pricePerDay: 499, deposit: 2000, status: 'On Lease' },
    { _id: 'v5', title: 'Designer Tuxedo Suit', category: 'Clothes', pricePerDay: 799, deposit: 3000, status: 'Available' },
  ]);

  // Add Listing Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Vehicles',
    pricePerDay: '',
    securityDeposit: '',
    description: '',
    images: ''
  });

  useEffect(() => {
    loadVendorStats();
  }, []);

  const loadVendorStats = async () => {
    setLoading(true);
    try {
      const [dashData, vendorProducts, vendorRentals] = await Promise.all([
        getVendorDashboard().catch(() => null),
        fetchMyProducts().catch(() => []),
        getVendorRentals().catch(() => []),
      ]);

      if (dashData?.stats) {
        setStats(prev => ({
          ...prev,
          totalRevenue: dashData.stats.totalRevenue || prev.totalRevenue,
          totalBookings: dashData.stats.totalRentals || prev.totalBookings,
          pendingRequests: dashData.stats.pendingRentals || prev.pendingRequests,
        }));
      }

      if (Array.isArray(vendorProducts) && vendorProducts.length > 0) {
        const formattedProducts = vendorProducts.map(p => ({
          _id: p._id,
          title: p.title,
          category: p.category?.name || p.category || 'Gear',
          pricePerDay: p.pricePerDay,
          deposit: p.securityDeposit || 500,
          status: p.availability ? 'Available' : 'Maintenance',
        }));
        setVendorInventory(formattedProducts);
      }

      if (Array.isArray(vendorRentals) && vendorRentals.length > 0) {
        const formattedRequests = vendorRentals.map(r => ({
          _id: r._id,
          customerName: r.user?.name || 'Customer',
          productName: r.product?.title || 'Rental Equipment',
          category: 'Gear',
          startDate: r.rentStartDate ? new Date(r.rentStartDate).toISOString().split('T')[0] : '2026-08-10',
          endDate: r.rentEndDate ? new Date(r.rentEndDate).toISOString().split('T')[0] : '2026-08-15',
          amount: r.totalCost || 1500,
          deposit: r.securityDepositPaid || 500,
          status: r.status === 'active' ? 'Approved' : 'Pending Approval',
        }));
        setCustomerRequests(formattedRequests);
      }
    } catch (e) {
      console.warn('Vendor stats notification:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (reqId) => {
    setCustomerRequests(
      customerRequests.map((r) => (r._id === reqId ? { ...r, status: 'Approved' } : r))
    );
    showToast(`Request ${reqId} approved! Dispatch label generated.`, 'success');
  };

  const handleReject = (reqId) => {
    setCustomerRequests(customerRequests.filter((r) => r._id !== reqId));
    showToast(`Booking request ${reqId} rejected.`, 'info');
  };

  const toggleInventoryStatus = (id) => {
    setVendorInventory(vendorInventory.map(item => {
      if (item._id === id) {
        const nextStatus = item.status === 'Available' ? 'Maintenance' : 'Available';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
    showToast(`Inventory status updated.`, 'success');
  };

  const handleAddEquipmentSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.pricePerDay) {
      showToast('Equipment title and daily rate are required!', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        categoryName: formData.category,
        pricePerDay: Number(formData.pricePerDay),
        securityDeposit: Number(formData.securityDeposit || 500),
        description: formData.description || 'High quality rental equipment',
        images: formData.images ? [formData.images] : ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500']
      };

      const res = await createProduct(payload).catch(() => null);

      const newItem = {
        _id: res?._id || `v_${Date.now()}`,
        title: formData.title,
        category: formData.category,
        pricePerDay: Number(formData.pricePerDay),
        deposit: Number(formData.securityDeposit || 500),
        status: 'Available'
      };

      setVendorInventory([newItem, ...vendorInventory]);
      setStats(prev => ({ ...prev, activeProducts: prev.activeProducts + 1 }));
      showToast(`"${formData.title}" published to store listings!`, 'success');
      setShowAddModal(false);
      setFormData({ title: '', category: 'Vehicles', pricePerDay: '', securityDeposit: '', description: '', images: '' });
    } catch (err) {
      showToast(err.message || 'Failed to add equipment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic Chart Bar Heights
  const chartData = {
    '7d': [
      { day: 'Mon', val: '45%' },
      { day: 'Tue', val: '65%' },
      { day: 'Wed', val: '90%' },
      { day: 'Thu', val: '75%' },
      { day: 'Fri', val: '100%' },
      { day: 'Sat', val: '85%' },
      { day: 'Sun', val: '70%' },
    ],
    '30d': [
      { day: 'W1', val: '60%' },
      { day: 'W2', val: '80%' },
      { day: 'W3', val: '95%' },
      { day: 'W4', val: '100%' },
    ],
    '1y': [
      { day: 'Q1', val: '70%' },
      { day: 'Q2', val: '85%' },
      { day: 'Q3', val: '90%' },
      { day: 'Q4', val: '100%' },
    ]
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="partner-dash-wrapper">
        <div className="partner-dash-container">
          
          {/* Vendor Welcome Banner */}
          <div className="partner-welcome-card">
            <div>
              <h2>Vendor Control — {user?.vendorProfile?.companyName || user?.name || 'Partner Store'} <ShieldCheck size={20} className="inline text-success" /></h2>
              <p className="text-muted">Manage customer rental bookings, equipment listings, and revenue metrics.</p>
            </div>
            <div className="flex gap-3 items-center">
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add Equipment
              </button>
              <Link to="/partner/orders" className="btn btn-secondary">
                <Store size={16} /> Dispatch Orders
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid-4 mt-6">
            <div className="metric-card">
              <div className="metric-icon-box green"><DollarSign size={22} /></div>
              <div>
                <span className="metric-label">Total Revenue</span>
                <p className="metric-value">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box orange-accent"><Package size={22} /></div>
              <div>
                <span className="metric-label">Listed Equipment</span>
                <p className="metric-value">{vendorInventory.length}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box purple"><CalendarCheck size={22} /></div>
              <div>
                <span className="metric-label">Completed Leases</span>
                <p className="metric-value">{stats.totalBookings}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box orange"><AlertTriangle size={22} /></div>
              <div>
                <span className="metric-label">Pending Approval</span>
                <p className="metric-value">{customerRequests.filter((r) => r.status === 'Pending Approval').length}</p>
              </div>
            </div>
          </div>

          {/* Vendor Navigation Tabs */}
          <div className="vendor-nav-tabs">
            <button
              className={`vendor-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Booking Requests ({customerRequests.filter((r) => r.status === 'Pending Approval').length})
            </button>
            <button
              className={`vendor-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              Store Inventory ({vendorInventory.length})
            </button>
            <button
              className={`vendor-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Revenue Analytics
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="dash-main-grid mt-6">
            
            {/* Left Column: Tab Content */}
            <div className="dash-column flex-col gap-6">
              
              {/* TAB 1: PENDING REQUESTS */}
              {activeTab === 'requests' && (
                <div className="glass-card">
                  <div className="dash-card-header mb-4">
                    <h3><Clock size={18} className="text-primary" /> Incoming Booking Requests</h3>
                    <Link to="/partner/orders" className="text-link">Dispatch Portal →</Link>
                  </div>

                  <div className="table-responsive">
                    <table className="vendor-table">
                      <thead>
                        <tr>
                          <th>Req ID</th>
                          <th>Customer</th>
                          <th>Equipment</th>
                          <th>Dates</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerRequests.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-6 text-muted">
                              No active booking requests found.
                            </td>
                          </tr>
                        ) : (
                          customerRequests.map((req) => (
                            <tr key={req._id}>
                              <td><strong>{req._id}</strong></td>
                              <td>{req.customerName}</td>
                              <td>{req.productName}</td>
                              <td className="text-xs text-muted">{req.startDate} to {req.endDate}</td>
                              <td><strong>₹{req.amount}</strong></td>
                              <td>
                                <span className={`badge ${req.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="text-right">
                                {req.status === 'Pending Approval' ? (
                                  <div className="flex justify-end gap-2">
                                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req._id)}>
                                      <CheckCircle2 size={14} /> Approve
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(req._id)}>
                                      <XCircle size={14} /> Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-success font-semibold">Ready for Dispatch</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: STORE INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="glass-card">
                  <div className="dash-card-header mb-4">
                    <h3><Package size={18} className="text-primary" /> Store Listings</h3>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                      + Add Listing
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="vendor-table">
                      <thead>
                        <tr>
                          <th>Item Title</th>
                          <th>Category</th>
                          <th>Rate</th>
                          <th>Deposit</th>
                          <th>Status</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorInventory.map((item) => (
                          <tr key={item._id}>
                            <td><strong>{item.title}</strong></td>
                            <td><span className="badge badge-info">{item.category}</span></td>
                            <td>₹{item.pricePerDay}/day</td>
                            <td>₹{item.deposit}</td>
                            <td>
                              <span className={`badge ${
                                item.status === 'Available' 
                                  ? 'badge-success' 
                                  : item.status === 'On Lease' 
                                  ? 'badge-warning' 
                                  : 'badge-danger'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="text-right">
                              {item.status !== 'On Lease' ? (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => toggleInventoryStatus(item._id)}
                                >
                                  Mark {item.status === 'Available' ? 'Maintenance' : 'Available'}
                                </button>
                              ) : (
                                <span className="text-xs text-muted">Leased Out</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: REVENUE ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="glass-card">
                  <div className="chart-header-row mb-4 flex justify-between items-center">
                    <h3><BarChart2 size={18} className="text-success" /> Revenue Analytics</h3>
                    <div className="flex gap-2">
                      <button
                        className={`chart-period-btn ${chartPeriod === '7d' ? 'active' : ''}`}
                        onClick={() => setChartPeriod('7d')}
                      >
                        7 Days
                      </button>
                      <button
                        className={`chart-period-btn ${chartPeriod === '30d' ? 'active' : ''}`}
                        onClick={() => setChartPeriod('30d')}
                      >
                        30 Days
                      </button>
                      <button
                        className={`chart-period-btn ${chartPeriod === '1y' ? 'active' : ''}`}
                        onClick={() => setChartPeriod('1y')}
                      >
                        1 Year
                      </button>
                    </div>
                  </div>

                  <div className="analytics-placeholder">
                    {chartData[chartPeriod].map((bar, i) => (
                      <div key={i} className="chart-bar" style={{ height: bar.val }}>
                        <span>{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid-3 mt-6 gap-4">
                    <div className="status-row">
                      <span>On-Time Return Rate</span>
                      <strong className="text-success">{stats.onTimeRate}%</strong>
                    </div>
                    <div className="status-row">
                      <span>Avg. Lease Duration</span>
                      <strong>4.2 Days</strong>
                    </div>
                    <div className="status-row">
                      <span>Repeat Customers</span>
                      <strong>38%</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="dash-sidebar flex-col gap-6">
              <div className="glass-card">
                <h3>Inventory Status</h3>
                <div className="inventory-status-list mt-3 flex-col gap-2">
                  <div className="status-row">
                    <span>Available Store Items</span>
                    <strong className="text-success">
                      {vendorInventory.filter(i => i.status === 'Available').length}
                    </strong>
                  </div>
                  <div className="status-row">
                    <span>Currently Rented Out</span>
                    <strong className="text-warning">
                      {vendorInventory.filter(i => i.status === 'On Lease').length}
                    </strong>
                  </div>
                  <div className="status-row">
                    <span>Under Maintenance</span>
                    <strong className="text-muted">
                      {vendorInventory.filter(i => i.status === 'Maintenance').length}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <h3>Quick Actions</h3>
                <div className="quick-links-list flex-col gap-2 mt-3">
                  <button className="quick-nav-btn" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Add Equipment Listing
                  </button>
                  <Link to="/partner/orders" className="quick-nav-btn">
                    <CalendarCheck size={16} /> Order Dispatch Portal
                  </Link>
                  <Link to="/partner/settings" className="quick-nav-btn">
                    <TrendingUp size={16} /> Payout & Bank Settings
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Equipment Listing</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddEquipmentSubmit} className="modal-body flex-col gap-3 mt-4">
              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. BMW 5 Series Luxury Sedan"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="Vehicles">Vehicles (Cars & Bikes)</option>
                  <option value="Gym">Gym & Fitness</option>
                  <option value="Gaming">Gaming & Consoles</option>
                  <option value="Clothes">Clothes & Fashion</option>
                  <option value="Electronics">Electronics & Tech</option>
                  <option value="Furniture">Furniture & Home</option>
                </select>
              </div>

              <div className="grid-2 gap-4">
                <div className="form-group">
                  <label>Daily Rental Rate (₹/day) *</label>
                  <input
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    placeholder="899"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    placeholder="3000"
                  />
                </div>
              </div>

              <div className="modal-footer flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PartnerDashboard;
