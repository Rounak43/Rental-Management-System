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
import { downloadInvoicePdf } from '../../utils/invoicePdf';
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
  ClipboardList,
  AlertTriangle,
  FileText,
  Download,
  ShieldAlert,
  Wrench,
  Clock
} from 'lucide-react';
import './PartnerDashboard.css';

const PartnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all'); // all, pending, pickups, active, overdue, returned
  
  // Return Inspection Modal State
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnCondition, setReturnCondition] = useState('good');
  const [damageFeeInput, setDamageFeeInput] = useState('0');
  const [missingAccessoriesInput, setMissingAccessoriesInput] = useState('');
  const [inspectionNotesInput, setInspectionNotesInput] = useState('');
  const [repairRequiredToggle, setRepairRequiredToggle] = useState(false);
  const [checkList, setCheckList] = useState({
    conditionVerified: true,
    functionalTested: true,
    accessoriesChecked: true,
    packagingVerified: true,
  });

  // Pickup Verification Modal State
  const [selectedOrderForPickup, setSelectedOrderForPickup] = useState(null);
  const [pickupChecklist, setPickupChecklist] = useState({
    productVerified: true,
    accessoriesVerified: true,
    customerIdentityVerified: true,
  });

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

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    if (statusTab === 'pending') {
      temp = temp.filter(o => o.status === 'pending');
    } else if (statusTab === 'pickups') {
      temp = temp.filter(o => {
        const start = new Date(o.rentStartDate);
        return (start >= todayStart && start <= todayEnd) || (o.status === 'pending');
      });
    } else if (statusTab === 'active') {
      temp = temp.filter(o => o.status === 'active');
    } else if (statusTab === 'overdue') {
      temp = temp.filter(o => o.status === 'overdue' || (o.status === 'active' && new Date(o.rentEndDate) < new Date()));
    } else if (statusTab === 'returned') {
      temp = temp.filter(o => o.status === 'returned');
    }

    setFilteredOrders(temp);
  };

  const handleApprove = async (id) => {
    try {
      const updated = await updateRentalBookingStatus(id, 'active');
      toast.success('Rental agreement approved.');
      // Optimistic state update
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'active', ...(updated || {}) } : o));
    } catch (err) {
      toast.error('Failed to approve rental: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this booking? The deposit will be unlocked.')) {
      return;
    }
    try {
      await updateRentalBookingStatus(id, 'cancelled');
      toast.success('Rental agreement rejected/cancelled.');
      // Optimistic state update
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      toast.error('Failed to reject rental: ' + err.message);
    }
  };

  const handleConfirmPickup = async () => {
    if (!selectedOrderForPickup) return;
    try {
      const updated = await updatePickupStatus(selectedOrderForPickup._id, {});
      toast.success('Pickup confirmed! Equipment dispatched to customer.');
      setOrders(prev => prev.map(o => o._id === selectedOrderForPickup._id ? { ...o, status: 'active', pickupStatus: 'picked_up', ...(updated || {}) } : o));
      setSelectedOrderForPickup(null);
    } catch (err) {
      toast.error('Failed to confirm pickup: ' + err.message);
    }
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;

    try {
      const damageCharges = Number(damageFeeInput || 0);
      const updated = await updateReturnStatus(selectedOrderForReturn._id, {
        damageCharges,
        returnCondition,
        inspectionNotes: inspectionNotesInput,
        missingAccessories: missingAccessoriesInput,
        repairRequired: repairRequiredToggle,
        status: 'returned',
      });

      toast.success('Return inspection completed & deposit settled automatically.');
      setOrders(prev => prev.map(o => o._id === selectedOrderForReturn._id ? { ...o, status: 'returned', returnStatus: 'returned', ...(updated || {}) } : o));
      setSelectedOrderForReturn(null);
      setDamageFeeInput('0');
      setInspectionNotesInput('');
      setMissingAccessoriesInput('');
      setRepairRequiredToggle(false);
    } catch (err) {
      toast.error('Failed to complete inspection return: ' + err.message);
    }
  };

  // Helper to calculate estimated late fee for return inspection view
  const calculateEstimatedLateFee = (order) => {
    if (!order) return 0;
    const now = new Date();
    const endDate = new Date(order.rentEndDate);
    if (now <= endDate) return 0;

    const diffMs = now - endDate;
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const product = order.product || {};
    const gracePeriod = product.gracePeriod !== undefined ? product.gracePeriod : 2;
    const lateFeePerHour = product.lateFeePerHour || product.lateFee || 50;
    const maxLateFee = product.maximumLateFee !== undefined ? product.maximumLateFee : 500;

    if (hours <= gracePeriod) return 0;
    return Math.min(hours * lateFeePerHour, maxLateFee);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
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
              <h2 style={{ margin: 0 }}>Rental Orders, Pickups & Return Control</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Verify customer pickups, perform return quality inspections with auto late-fee calculation & deposit settlement.
              </p>
            </div>

            {/* Status tab filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>
              {[
                { key: 'all', label: `All Orders (${orders.length})` },
                { key: 'pending', label: `Pending Approval (${orders.filter(o => o.status === 'pending').length})` },
                { key: 'pickups', label: `Today's Pickups (${orders.filter(o => o.status === 'pending' || (new Date(o.rentStartDate) <= new Date() && o.pickupStatus === 'pending')).length})` },
                { key: 'active', label: `Active Rentals (${orders.filter(o => o.status === 'active').length})` },
                { key: 'overdue', label: `Overdue / Late (${orders.filter(o => o.status === 'overdue' || (o.status === 'active' && new Date(o.rentEndDate) < new Date())).length})` },
                { key: 'returned', label: `Returned / Settled (${orders.filter(o => o.status === 'returned').length})` },
              ].map(tab => (
                <button 
                  key={tab.key}
                  type="button" 
                  onClick={() => setStatusTab(tab.key)} 
                  className={`vendor-tab-btn ${statusTab === tab.key ? 'active' : ''}`}
                  style={{ 
                    padding: '8px 16px', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background: statusTab === tab.key ? 'var(--primary-gradient)' : 'transparent', 
                    color: statusTab === tab.key ? 'white' : 'var(--text-secondary)' 
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List orders */}
            {loading ? (
              <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
            ) : filteredOrders.length === 0 ? (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <ClipboardList size={48} style={{ color: 'var(--text-muted)' }} />
                <h3>No Orders Found in this Category</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Customer rental orders will automatically appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredOrders.map((order) => {
                  const startStr = new Date(order.rentStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                  const endStr = new Date(order.rentEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  const isOverdue = order.status === 'overdue' || (order.status === 'active' && new Date(order.rentEndDate) < new Date());

                  return (
                    <div key={order._id} className="glass-card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '80px 1fr 220px', gap: '20px', alignItems: 'center' }}>
                      
                      {/* Product Thumbnail */}
                      <img 
                        src={getImageUrl(order.product?.images?.[0] || order.product?.image)} 
                        alt="Product" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }}
                      />

                      {/* Middle Details */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span className={`badge ${
                            isOverdue ? 'badge-danger' :
                            order.status === 'active' ? 'badge-success' : 
                            order.status === 'pending' ? 'badge-warning' : 
                            order.status === 'returned' ? 'badge-info' : 'badge-danger'
                          }`} style={{ fontSize: '10px' }}>
                            {isOverdue ? 'Overdue Return' : order.status}
                          </span>
                          {order.pickupStatus === 'picked_up' && (
                            <span className="badge badge-success" style={{ fontSize: '10px' }}>Dispatched</span>
                          )}
                          {order.repairRequired && (
                            <span className="badge badge-warning" style={{ fontSize: '10px' }}><Wrench size={10} /> Maintenance</span>
                          )}
                        </div>
                        
                        <h4 style={{ margin: '4px 0 4px 0', fontSize: '1.05rem' }}>{order.product?.title || 'Equipment Item'}</h4>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {startStr} - {endStr}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={13} /> {order.user?.name || 'Customer'} ({order.user?.phone || 'No phone'})
                          </span>
                        </div>
                      </div>

                      {/* Right actions and financials */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-color)', display: 'block' }}>
                            ₹{(order.totalCost || 0).toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Deposit: ₹{order.securityDepositPaid || 0}
                          </span>
                          {order.lateFee > 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', display: 'block' }}>
                              Late Fee: ₹{order.lateFee}
                            </span>
                          )}
                        </div>

                        {/* Interactive Action Buttons */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '6px 10px' }}
                            onClick={() => setSelectedOrderDetails(order)} 
                            title="View Agreement Details"
                          >
                            <Eye size={13} />
                          </button>

                          {order.status === 'returned' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              title="Download Invoice"
                              onClick={() => downloadInvoicePdf({
                                orderId: order.invoiceId || order._id,
                                productTitle: order.product?.title || 'Rental Item',
                                customerName: order.user?.name || 'Customer',
                                vendorName: 'RentSphere Vendor',
                                startDate: order.rentStartDate,
                                endDate: order.rentEndDate,
                                pricePerDay: order.product?.pricePerDay || 0,
                                totalPaid: (order.totalCost || 0) + (order.lateFee || 0) + (order.damageCharges || 0),
                                securityDeposit: order.securityDepositPaid || 0,
                                lateFee: order.lateFee || 0,
                                damageCharges: order.damageCharges || 0,
                                refundAmount: order.refundAmount || 0,
                              })}
                            >
                              <Download size={13} /> Invoice
                            </button>
                          )}

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

                          {(order.status === 'pending' || order.status === 'active') && order.pickupStatus !== 'picked_up' && (
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm" 
                              onClick={() => setSelectedOrderForPickup(order)}
                            >
                              <Truck size={13} /> Confirm Pickup
                            </button>
                          )}

                          {(order.status === 'active' || order.status === 'overdue') && order.pickupStatus === 'picked_up' && (
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm" 
                              onClick={() => {
                                setSelectedOrderForReturn(order);
                                setDamageFeeInput('0');
                                setReturnCondition('good');
                              }}
                            >
                              <RotateCcw size={13} /> Inspect Return
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

      {/* Dispatch Pickup Verification Modal */}
      {selectedOrderForPickup && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelectedOrderForPickup(null)}>
          <div className="modal-container glass-card" style={{ padding: '28px', maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} style={{ color: 'var(--primary-color)' }} /> Dispatch Pickup Checklist
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Order ID: #{selectedOrderForPickup._id.toUpperCase()} | Customer: <strong>{selectedOrderForPickup.user?.name}</strong>
            </p>

            <div style={{ background: 'var(--surface-hover)', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Pickup OTP:</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--primary-color)' }}>{selectedOrderForPickup.pickupOTP || '782910'}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={pickupChecklist.productVerified} onChange={e => setPickupChecklist({ ...pickupChecklist, productVerified: e.target.checked })} />
                <span>Product Verified & Working</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={pickupChecklist.accessoriesVerified} onChange={e => setPickupChecklist({ ...pickupChecklist, accessoriesVerified: e.target.checked })} />
                <span>All Accessories Handed Over</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={pickupChecklist.customerIdentityVerified} onChange={e => setPickupChecklist({ ...pickupChecklist, customerIdentityVerified: e.target.checked })} />
                <span>Customer Identity Verified</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrderForPickup(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmPickup}>
                Confirm Pickup Dispatched
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Inspection Modal with Auto Late Fee & Settlement */}
      {selectedOrderForReturn && (() => {
        const estLateFee = calculateEstimatedLateFee(selectedOrderForReturn);
        const damageFee = Number(damageFeeInput || 0);
        const depositPaid = Number(selectedOrderForReturn.securityDepositPaid || selectedOrderForReturn.product?.securityDeposit || 0);
        const estRefund = Math.max(0, depositPaid - estLateFee - damageFee);

        return (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelectedOrderForReturn(null)}>
            <div className="modal-container glass-card" style={{ padding: '28px', maxWidth: '520px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: 'var(--primary-color)' }} /> Return Inspection & Settlement
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Order ID: #{selectedOrderForReturn._id.toUpperCase()} | Product: <strong>{selectedOrderForReturn.product?.title}</strong>
              </p>

              {/* Automatic Late Fee Summary Alert */}
              <div style={{ background: estLateFee > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', border: `1px solid ${estLateFee > 0 ? '#ef4444' : '#10b981'}`, borderRadius: '10px', padding: '12px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: estLateFee > 0 ? '#ef4444' : '#10b981' }}>
                  {estLateFee > 0 ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                  {estLateFee > 0 ? `Auto Late Fee Calculated: ₹${estLateFee}` : 'Returned On-Time (0 Late Fee)'}
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                  Rate: ₹{selectedOrderForReturn.product?.lateFeePerHour || 50}/hr | Grace Period: {selectedOrderForReturn.product?.gracePeriod || 2} hrs
                </div>
              </div>

              <form onSubmit={handleConfirmReturn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Return Condition *</label>
                  <select value={returnCondition} onChange={e => setReturnCondition(e.target.value)} required>
                    <option value="good">Good (Normal Condition)</option>
                    <option value="like-new">Like New (Mint Condition)</option>
                    <option value="fair">Fair (Minor Scuffs)</option>
                    <option value="damaged">Damaged (Requires Repair)</option>
                    <option value="missing-parts">Missing Accessories / Parts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Physical Damage / Repair Charge (₹)</label>
                  <input 
                    type="number" 
                    placeholder="₹0"
                    min="0"
                    value={damageFeeInput}
                    onChange={(e) => setDamageFeeInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Inspection Notes / Missing Accessories (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Returned without charger cable, minor scratch on lens"
                    value={inspectionNotesInput}
                    onChange={(e) => setInspectionNotesInput(e.target.value)}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={repairRequiredToggle || returnCondition === 'damaged' || returnCondition === 'missing-parts'} 
                    onChange={e => setRepairRequiredToggle(e.target.checked)} 
                  />
                  <span style={{ color: repairRequiredToggle ? '#ef4444' : 'var(--text)' }}>
                    Mark Equipment as "Under Maintenance" (Removes from store for repair)
                  </span>
                </label>

                {/* Settlement Calculation Preview Box */}
                <div style={{ background: 'var(--surface-hover)', padding: '12px 16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Security Deposit Held:</span>
                    <strong>₹{depositPaid}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                    <span>Late Fee + Damage Charges:</span>
                    <span>-₹{estLateFee + damageFee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--surface-border)', paddingTop: '6px', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                    <span>Final Refund to Customer:</span>
                    <span>₹{estRefund}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrderForReturn(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Finalize Return & Settle Deposit
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

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

              {/* Costs & Settlement Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rental Charge</span>
                  <span>₹{selectedOrderDetails.totalCost}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Security Deposit</span>
                  <span>₹{selectedOrderDetails.securityDepositPaid}</span>
                </div>
                {selectedOrderDetails.lateFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 'bold' }}>
                    <span>Late Fee Charged</span>
                    <span>+₹{selectedOrderDetails.lateFee}</span>
                  </div>
                )}
                {selectedOrderDetails.damageCharges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 'bold' }}>
                    <span>Damage Penalty Charged</span>
                    <span>+₹{selectedOrderDetails.damageCharges}</span>
                  </div>
                )}
                {selectedOrderDetails.refundAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold' }}>
                    <span>Deposit Refunded</span>
                    <span>₹{selectedOrderDetails.refundAmount}</span>
                  </div>
                )}
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

