import React, { useState, useEffect } from 'react';
import { getMyRentals, updateReturnStatus } from '../../services/rentalService';
import ReturnModal from '../../components/product/ReturnModal';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useToast } from '../../context/ToastContext';
import { Package, Calendar, RefreshCcw, Download, RotateCcw, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import './Orders.css';

const MOCK_ORDERS = [
  {
    _id: 'RENT-980124',
    product: {
      _id: 'prod1',
      title: 'Sony Alpha A7 IV Mirrorless Camera',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
    },
    startDate: '2026-08-05',
    endDate: '2026-08-12',
    totalAmount: 340,
    securityDeposit: 300,
    status: 'Active',
    paymentStatus: 'Paid',
    returnStatus: 'Not Returned',
    createdAt: '2026-08-04',
  },
  {
    _id: 'RENT-871239',
    product: {
      _id: 'prod2',
      title: 'Apple MacBook Pro 16" M3 Max',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
    },
    startDate: '2026-07-20',
    endDate: '2026-07-25',
    totalAmount: 550,
    securityDeposit: 450,
    status: 'Returned',
    paymentStatus: 'Paid',
    returnStatus: 'Completed & Deposit Refunded',
    createdAt: '2026-07-19',
  },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRentalForReturn, setSelectedRentalForReturn] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyRentals();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (err) {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (returnData) => {
    try {
      await updateReturnStatus(returnData.rentalId, { returnStatus: 'Requested', ...returnData });
      toast.success('Return request submitted!');
      setOrders(
        orders.map((o) =>
          o._id === returnData.rentalId ? { ...o, status: 'Return Scheduled', returnStatus: 'Pending Pickup' } : o
        )
      );
    } catch (e) {
      toast.error('Failed to submit return request.');
    }
  };

  const handleDownloadInvoice = (order) => {
    const text = `RENTALHUB INVOICE\nOrder ID: ${order._id}\nProduct: ${order.product?.title || 'Equipment'}\nTotal Paid: $${order.totalAmount}\nDeposit: $${order.securityDeposit}\nStatus: ${order.status}`;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice_${order._id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="orders-page-wrapper">
        <div className="orders-container">
          <div className="orders-header">
            <h2>Rental Order History</h2>
            <p>Track active equipment leases, download invoices, or schedule return pickups</p>
          </div>

          {loading ? (
            <div className="flex-col gap-4">
              <div className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
              <div className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card text-center py-12">
              <Package size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3>No Rental Orders Yet</h3>
              <p className="text-muted">You have no past or active equipment rental bookings.</p>
            </div>
          ) : (
            <div className="orders-list flex-col gap-4">
              {orders.map((order) => (
                <div key={order._id} className="order-card glass-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-tag">Agreement #{order._id}</span>
                      <span className="order-date text-sm text-muted ml-3">
                        Booked on {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="order-badges">
                      <span
                        className={`badge ${
                          order.status === 'Active'
                            ? 'badge-warning'
                            : order.status === 'Returned'
                            ? 'badge-success'
                            : 'badge-info'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="badge badge-success">{order.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <img
                      src={order.product?.image || order.product?.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200'}
                      alt="Product"
                      className="order-img"
                    />
                    <div className="order-details">
                      <h3>{order.product?.title || order.product?.name || 'Leased Equipment'}</h3>
                      <p className="order-duration">
                        <Calendar size={14} /> Rental Dates: {new Date(order.startDate).toLocaleDateString()} –{' '}
                        {new Date(order.endDate).toLocaleDateString()}
                      </p>
                      <p className="order-deposit text-sm text-muted">
                        Deposit Status: <strong>{order.returnStatus}</strong> (₹{order.securityDeposit})
                      </p>
                    </div>

                    <div className="order-price-col">
                      <span className="order-total">₹{order.totalAmount}</span>
                      <small className="text-muted">Total Amount</small>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadInvoice(order)}>
                      <Download size={14} /> Invoice
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast.info(`Tracking Order #${order._id}`)}>
                      <Truck size={14} /> Track Delivery
                    </button>

                    {order.status === 'Active' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedRentalForReturn(order)}
                      >
                        <RotateCcw size={14} /> Request Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Return Request Modal */}
      <ReturnModal
        rental={selectedRentalForReturn}
        isOpen={!!selectedRentalForReturn}
        onClose={() => setSelectedRentalForReturn(null)}
        onSubmitReturn={handleReturnSubmit}
      />

      <Footer />
    </div>
  );
};

export default Orders;
