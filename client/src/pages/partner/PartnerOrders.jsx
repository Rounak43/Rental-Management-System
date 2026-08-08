import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VendorSidebar from '../../components/layout/VendorSidebar';
import { 
  getVendorRentals, 
  updatePickupStatus, 
  updateReturnStatus,
  updateRentalBookingStatus
} from '../../services/rentalService';
import { useToast } from '../../context/ToastContext';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  RotateCcw, 
  Calendar,
  Eye,
  Phone,
  User,
  MapPin,
  ClipboardList
} from 'lucide-react';
import './PartnerDashboard.css';

const PartnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all'); // all, pending, active, returned
  
  // Inspection Modal details
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [lateFeeInput, setLateFeeInput] = useState('');
  const [damageFeeInput, setDamageFeeInput] = useState('');

  // Details Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getVendorRentals();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      toast.error('Failed to load rental orders.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let temp = [...orders];

    if (statusTab === 'pending') {
      temp = temp.filter(o => o.status === 'pending');
    } else if (statusTab === 'active') {
      temp = temp.filter(o => o.status === 'active');
    } else if (statusTab === 'returned') {
      temp = temp.filter(o => o.status === 'returned');
    }

    setFilteredOrders(temp);
  };

  const handleApprove = async (id) => {
    try {
      const updated = await updateRentalBookingStatus(id, 'active');
      if (updated) {
        toast.success('Rental agreement approved.');
        loadOrders();
      }
    } catch (err) {
      toast.error('Failed to approve rental: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this booking? The deposit will be unlocked.')) {
      return;
    }
    try {
      const updated = await updateRentalBookingStatus(id, 'cancelled');
      if (updated) {
        toast.success('Rental agreement rejected/cancelled.');
        loadOrders();
      }
    } catch (err) {
      toast.error('Failed to reject rental: ' + err.message);
    }
  };

  const handleMarkPickedUp = async (id) => {
    try {
      const updated = await updatePickupStatus(id);
      if (updated) {
        toast.success('Equipment marked as picked up by customer.');
        loadOrders();
      }
    } catch (err) {
      toast.error('Failed to mark pickup: ' + err.message);
    }
  };

  const handleMarkReturned = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;

    try {
      const totalLateFee = Number(lateFeeInput || 0) + Number(damageFeeInput || 0);
      const updated = await updateReturnStatus(selectedOrderForReturn._id, {
        lateFee: totalLateFee,
        status: 'returned'
      });

      if (updated) {
        toast.success('Return inspection completed. Security deposit released.');
        setSelectedOrderForReturn(null);
        setLateFeeInput('');
        setDamageFeeInput('');
        loadOrders();
      }
    } catch (err) {
      toast.error('Failed to complete inspection return: ' + err.message);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const backendBase = 'http://localhost:5000';
    return `${backendBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="app-container">
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <VendorSidebar />
        
        <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)', overflowY: 'auto' }}>
          <div className="partner-dash-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h2 style={{ margin: 0 }}>Rental Orders & Dispatch</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Manage customer pickup confirmation, status validation, and return inspections.
              </p>
            </div>

            {/* Status tab filters */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>
              <button 
                type="button" 
                onClick={() => setStatusTab('all')} 
                className={`vendor-tab-btn ${statusTab === 'all' ? 'active' : ''}`}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: statusTab === 'all' ? 'var(--primary-gradient)' : 'transparent', color: statusTab === 'all' ? 'white' : 'var(--text-secondary)' }}
              >
                All Orders ({orders.length})
              </button>
              <button 
                type="button" 
                onClick={() => setStatusTab('pending')} 
                className={`vendor-tab-btn ${statusTab === 'pending' ? 'active' : ''}`}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: statusTab === 'pending' ? 'var(--primary-gradient)' : 'transparent', color: statusTab === 'pending' ? 'white' : 'var(--text-secondary)' }}
              >
                Pending Approval ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button 
                type="button" 
                onClick={() => setStatusTab('active')} 
                className={`vendor-tab-btn ${statusTab === 'active' ? 'active' : ''}`}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: statusTab === 'active' ? 'var(--primary-gradient)' : 'transparent', color: statusTab === 'active' ? 'white' : 'var(--text-secondary)' }}
              >
                Active Rentals ({orders.filter(o => o.status === 'active').length})
              </button>
              <button 
                type="button" 
                onClick={() => setStatusTab('returned')} 
                className={`vendor-tab-btn ${statusTab === 'returned' ? 'active' : ''}`}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: statusTab === 'returned' ? 'var(--primary-gradient)' : 'transparent', color: statusTab === 'returned' ? 'white' : 'var(--text-secondary)' }}
              >
                Returned / Complete ({orders.filter(o => o.status === 'returned').length})
              </button>
            </div>

            {/* List orders */}
            {loading ? (
              <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
            ) : filteredOrders.length === 0 ? (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <ClipboardList size={48} style={{ color: 'var(--text-muted)' }} />
                <h3>No Orders Found</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Customers bookings will appear here once placed in the store.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredOrders.map((order) => {
                  const startStr = new Date(order.rentStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                  const endStr = new Date(order.rentEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <div key={order._id} className="glass-card" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '80px 1fr 180px', gap: '20px', alignItems: 'center' }}>
                      
                      {/* Product Thumbnail */}
                      <img 
                        src={getImageUrl(order.product?.images?.[0] || order.product?.image)} 
                        alt="Product" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }}
                      />

                      {/* Middle Details */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span className={`badge ${
                            order.status === 'active' ? 'badge-success' : 
                            order.status === 'pending' ? 'badge-warning' : 
                            order.status === 'returned' ? 'badge-info' : 'badge-danger'
                          }`} style={{ fontSize: '10px' }}>
                            {order.status}
                          </span>
                        </div>
                        
                        <h4 style={{ margin: '6px 0 4px 0', fontSize: '1.1rem' }}>{order.product?.title || 'Equipment Item'}</h4>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {startStr} - {endStr}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} /> {order.user?.name || 'Customer'}
                          </span>
                        </div>
                      </div>

                      {/* Right actions and financials */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-color)', display: 'block' }}>
                            ₹{order.totalCost.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Deposit: ₹{order.securityDepositPaid}
                          </span>
                        </div>

                        {/* Interactive Buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '6px 10px' }}
                            onClick={() => setSelectedOrderDetails(order)} 
                            title="View Details"
                          >
                            <Eye size={12} />
                          </button>

                          {order.status === 'pending' && (
                            <>
                              <button 
                                type="button" 
                                className="btn btn-primary btn-sm" 
                                onClick={() => handleApprove(order._id)}
                              >
                                Approve
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm" 
                                onClick={() => handleReject(order._id)}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {order.status === 'active' && order.pickupStatus === 'pending' && (
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleMarkPickedUp(order._id)}
                            >
                              Dispatch Pickup
                            </button>
                          )}

                          {order.status === 'active' && order.pickupStatus === 'picked_up' && (
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm" 
                              onClick={() => setSelectedOrderForReturn(order)}
                            >
                              Inspect Return
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Return Inspection Modal */}
      {selectedOrderForReturn && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelectedOrderForReturn(null)}>
          <div className="modal-container glass-card" style={{ padding: '28px', maxWidth: '450px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>Return Quality Inspection</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Order ID: #{selectedOrderForReturn._id.toUpperCase()}
            </p>

            <form onSubmit={handleMarkReturned} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Late Fee Charge (₹)</label>
                <input 
                  type="number" 
                  placeholder="₹0"
                  min="0"
                  value={lateFeeInput}
                  onChange={(e) => setLateFeeInput(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Physical Damages Charge (₹)</label>
                <input 
                  type="number" 
                  placeholder="₹0"
                  min="0"
                  value={damageFeeInput}
                  onChange={(e) => setDamageFeeInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrderForReturn(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Release Deposit & Finalize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal-container glass-card" style={{ padding: '28px', maxWidth: '550px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Rental Agreement Details</h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>Close</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
              
              {/* Product Info */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img 
                  src={getImageUrl(selectedOrderDetails.product?.images?.[0] || selectedOrderDetails.product?.image)} 
                  alt="item" 
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div>
                  <h4 style={{ margin: 0 }}>{selectedOrderDetails.product?.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Rate: ₹{selectedOrderDetails.product?.pricePerDay || selectedOrderDetails.product?.price}/day</span>
                </div>
              </div>

              {/* Booking Timelines */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--surface-hover)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Rent Start Date</span>
                  <strong>{new Date(selectedOrderDetails.rentStartDate).toDateString()}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Rent End Date</span>
                  <strong>{new Date(selectedOrderDetails.rentEndDate).toDateString()}</strong>
                </div>
              </div>

              {/* Customer Contact Card */}
              <div style={{ border: '1px solid var(--surface-border)', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Customer Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span>Customer Name: <strong>{selectedOrderDetails.user?.name}</strong></span>
                  <span>Direct Email: <strong>{selectedOrderDetails.user?.email}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={14} /> Contact Phone: <strong>{selectedOrderDetails.user?.phone || 'Not available'}</strong>
                  </span>
                </div>
              </div>

              {/* Costs Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rent Cost</span>
                  <span>₹{selectedOrderDetails.totalCost}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Security Deposit</span>
                  <span>₹{selectedOrderDetails.securityDepositPaid}</span>
                </div>
                {selectedOrderDetails.lateFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                    <span>Assessed Late/Damage Fees</span>
                    <span>+₹{selectedOrderDetails.lateFee}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--surface-border)', paddingTop: '8px', fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--primary-color)' }}>
                  <span>Grand Total Paid</span>
                  <span>₹{(selectedOrderDetails.totalCost + selectedOrderDetails.securityDepositPaid).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PartnerOrders;
