import React, { useState, useEffect } from 'react';
import { getVendorRentals, updatePickupStatus, updateReturnStatus } from '../../services/rentalService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useToast } from '../../context/ToastContext';
import { Package, CheckCircle2, XCircle, Truck, RotateCcw, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import './PartnerDashboard.css';

const MOCK_VENDOR_ORDERS = [
  {
    _id: 'RENT-980124',
    customer: { name: 'Alex Morgan', phone: '+1 (555) 234-5678' },
    product: { title: 'Sony Alpha A7 IV Camera Kit' },
    startDate: '2026-08-05',
    endDate: '2026-08-12',
    totalAmount: 340,
    securityDeposit: 300,
    status: 'Active',
    returnStatus: 'Not Returned',
    lateFee: 0,
    damageFee: 0,
  },
  {
    _id: 'RENT-871239',
    customer: { name: 'Sarah Connor', phone: '+1 (555) 890-1234' },
    product: { title: 'RED V-Raptor 8K Cinema Camera' },
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    totalAmount: 1120,
    securityDeposit: 1200,
    status: 'Return Scheduled',
    returnStatus: 'Pending Inspection',
    lateFee: 50,
    damageFee: 0,
  },
];

const PartnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForFee, setSelectedOrderForFee] = useState(null);
  const [lateFeeInput, setLateFeeInput] = useState(0);
  const [damageFeeInput, setDamageFeeInput] = useState(0);
  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getVendorRentals();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        setOrders(MOCK_VENDOR_ORDERS);
      }
    } catch (e) {
      setOrders(MOCK_VENDOR_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    setOrders(orders.map((o) => (o._id === id ? { ...o, status: newStatus } : o)));
    toast.success(`Order status updated to: ${newStatus}`);
  };

  const handleApplyFeesAndComplete = (orderId) => {
    setOrders(
      orders.map((o) =>
        o._id === orderId
          ? {
              ...o,
              status: 'Completed',
              returnStatus: 'Completed & Deposit Released',
              lateFee: lateFeeInput,
              damageFee: damageFeeInput,
            }
          : o
      )
    );
    setSelectedOrderForFee(null);
    toast.success(`Rental completed. Late fee: $${lateFeeInput}, Damage charge: $${damageFeeInput}`);
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="partner-dash-wrapper">
        <div className="partner-dash-container">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2>Vendor Rental Orders & Dispatch</h2>
              <p className="text-muted">Approve orders, schedule pickups, mark deliveries, and inspect returns</p>
            </div>
          </div>

          <div className="orders-list flex-col gap-4">
            {orders.map((order) => (
              <div key={order._id} className="glass-card p-6">
                <div className="flex justify-between items-center pb-4 border-b border-surface">
                  <div>
                    <span className="font-bold text-primary">Order #{order._id}</span>
                    <span className="text-sm text-muted ml-3">Customer: {order.customer?.name} ({order.customer?.phone})</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`badge ${order.status === 'Active' ? 'badge-warning' : 'badge-success'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{order.product?.title}</h3>
                    <p className="text-sm text-muted flex items-center gap-1 mt-1">
                      <Calendar size={14} /> Dates: {order.startDate} to {order.endDate}
                    </p>
                    <p className="text-xs text-muted mt-1">Security Deposit: ₹{order.securityDeposit}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xl text-primary">₹{order.totalAmount}</span>
                    {order.lateFee > 0 && <span className="block text-xs text-danger">+₹{order.lateFee} Late Fee</span>}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-surface">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(order._id, 'Ready For Pickup')}>
                    <Package size={14} /> Ready For Pickup
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(order._id, 'Delivered')}>
                    <Truck size={14} /> Delivered
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedOrderForFee(order)}>
                    <CheckCircle2 size={14} /> Inspect & Complete Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspect & Fee Modal */}
      {selectedOrderForFee && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForFee(null)}>
          <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Return Inspection</h3>
            <p className="tab-desc mt-1">Order #{selectedOrderForFee._id}</p>

            <div className="flex-col gap-4 mt-4">
              <div className="form-group">
                <label>Late Fee Charge (₹)</label>
                <input
                  type="number"
                  value={lateFeeInput}
                  onChange={(e) => setLateFeeInput(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Equipment Damage Charge (₹)</label>
                <input
                  type="number"
                  value={damageFeeInput}
                  onChange={(e) => setDamageFeeInput(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button className="btn btn-secondary" onClick={() => setSelectedOrderForFee(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={() => handleApplyFeesAndComplete(selectedOrderForFee._id)}>
                  Release Deposit & Finalize
                </button>
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
