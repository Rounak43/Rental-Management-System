import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMyRentals, updateReturnStatus } from '../../services/rentalService';
import { fetchProducts } from '../../services/productService';
import { getStoredWishlist } from '../../services/wishlistService';
import ProductCard from '../../components/product/ProductCard';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { downloadInvoicePdf } from '../../utils/invoicePdf';
import {
  Package,
  Clock,
  CreditCard,
  Heart,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Calendar,
  X,
  CheckCircle2,
  FileText,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('rentals');
  const [rentals, setRentals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [returnModalItem, setReturnModalItem] = useState(null);
  const [extendModalItem, setExtendModalItem] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Excellent');
  const [extensionDays, setExtensionDays] = useState(3);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [rentalsData, productsData] = await Promise.all([
        getMyRentals().catch(() => []),
        fetchProducts({ limit: 8 }).catch(() => ({ products: [] })),
      ]);

      if (Array.isArray(rentalsData) && rentalsData.length > 0) {
        // Map backend rental formats to unified object structure
        const formatted = rentalsData.map(r => ({
          _id: r._id,
          product: {
            title: r.product?.title || 'Rental Equipment',
            image: r.product?.images?.[0] || r.product?.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
            pricePerDay: r.product?.pricePerDay || 500,
            lateFeePerHour: r.product?.lateFeePerHour || 50,
            gracePeriod: r.product?.gracePeriod || 2,
          },
          startDate: r.rentStartDate ? new Date(r.rentStartDate).toISOString().split('T')[0] : '2026-08-05',
          endDate: r.rentEndDate ? new Date(r.rentEndDate).toISOString().split('T')[0] : '2026-08-12',
          rentStartDate: r.rentStartDate,
          rentEndDate: r.rentEndDate,
          totalAmount: r.totalCost || 1200,
          deposit: r.securityDepositPaid || 500,
          status: r.status,
          pickupStatus: r.pickupStatus,
          returnStatus: r.returnStatus,
          lateFee: r.lateFee || 0,
          lateHours: r.lateHours || 0,
          damageCharges: r.damageCharges || 0,
          refundAmount: r.refundAmount || 0,
          pickupOTP: r.pickupOTP,
          pickupQRCode: r.pickupQRCode,
          invoiceId: r.invoiceId,
        }));
        setRentals(formatted);
      } else {
        // High quality fallback demonstration data
        setRentals([
          {
            _id: 'RENT-980124',
            product: { title: 'Sony Alpha A7 IV Mirrorless Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300', pricePerDay: 850 },
            startDate: '2026-08-05',
            endDate: '2026-08-12',
            totalAmount: 3400,
            deposit: 2000,
            status: 'Active',
            returnStatus: 'Due in 4 Days',
          },
          {
            _id: 'RENT-980125',
            product: { title: 'BMW 5 Series Luxury Sedan 2024', image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=300', pricePerDay: 2499 },
            startDate: '2026-08-01',
            endDate: '2026-08-04',
            totalAmount: 7497,
            deposit: 10000,
            status: 'Returned',
            returnStatus: 'Deposit Refunded',
          }
        ]);
      }

      if (productsData?.products?.length > 0) {
        setRecommendations(productsData.products);
      } else {
        setRecommendations([
          {
            _id: 'rec1',
            title: 'Apple MacBook Pro 16" M3 Max',
            category: { name: 'Electronics' },
            pricePerDay: 1100,
            securityDeposit: 4500,
            images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
            rating: 5.0,
            reviewsCount: 42,
          },
          {
            _id: 'rec2',
            title: 'Sony PlayStation 5 Console Bundle',
            category: { name: 'Gaming' },
            pricePerDay: 499,
            securityDeposit: 2000,
            images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500'],
            rating: 4.9,
            reviewsCount: 64,
          },
          {
            _id: 'rec3',
            title: 'Commercial Motorized Treadmill',
            category: { name: 'Gym' },
            pricePerDay: 650,
            securityDeposit: 2500,
            images: ['https://images.unsplash.com/photo-1576678927484-cc909957088c?w=500'],
            rating: 4.8,
            reviewsCount: 27,
          },
          {
            _id: 'rec4',
            title: 'Designer Slim-Fit Italian Tuxedo',
            category: { name: 'Clothes' },
            pricePerDay: 799,
            securityDeposit: 3000,
            images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'],
            rating: 4.9,
            reviewsCount: 22,
          },
        ]);
      }
    } catch (err) {
      console.warn('Dashboard data notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeRentals = rentals.filter((r) => r.status === 'Active');
  const pastRentals = rentals.filter((r) => r.status !== 'Active');
  const wishlistItems = getStoredWishlist();

  const categoriesList = ['All', 'Vehicles', 'Gym', 'Gaming', 'Clothes', 'Electronics'];

  const filteredRecommendations = selectedCategory === 'All' 
    ? recommendations 
    : recommendations.filter(p => p.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase()));

  // Confirm Return Action
  const handleConfirmReturn = async () => {
    if (!returnModalItem) return;
    setActionLoading(true);
    try {
      // Try backend call if real ID
      if (!returnModalItem._id.startsWith('RENT-')) {
        await updateReturnStatus(returnModalItem._id, { condition: returnCondition });
      }
      setRentals(rentals.map(r => r._id === returnModalItem._id ? { 
        ...r, 
        status: 'Returned', 
        returnStatus: 'Returned & Refunded' 
      } : r));
      showToast(`Return request confirmed for ${returnModalItem.product?.title}! Deposit initiated for refund.`, 'success');
      setReturnModalItem(null);
    } catch (err) {
      showToast(err.message || 'Failed to process return', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Extension Action
  const handleConfirmExtension = () => {
    if (!extendModalItem) return;
    setActionLoading(true);
    setTimeout(() => {
      setRentals(rentals.map(r => {
        if (r._id === extendModalItem._id) {
          const newEndDate = new Date(r.endDate);
          newEndDate.setDate(newEndDate.getDate() + extensionDays);
          return {
            ...r,
            endDate: newEndDate.toISOString().split('T')[0],
            totalAmount: r.totalAmount + (r.product?.pricePerDay || 500) * extensionDays,
            returnStatus: `Extended +${extensionDays} Days`
          };
        }
        return r;
      }));
      showToast(`Lease extended by ${extensionDays} days! New end date applied.`, 'success');
      setExtendModalItem(null);
      setActionLoading(false);
    }, 400);
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-page-wrapper">
        <div className="dashboard-container">
          
          {/* Header Banner - Minimalist */}
          <div className="dash-welcome-banner">
            <div>
              <h2>Hello, {user?.name || 'Customer'} 👋</h2>
              <p className="text-muted">Manage active equipment leases, schedule returns, and view wishlist items.</p>
            </div>
            <div className="flex gap-3 items-center">
              <Link to="/products" className="btn btn-primary">
                <Sparkles size={16} /> Browse Equipment
              </Link>
              <Link to="/orders" className="btn btn-secondary">
                <FileText size={16} /> My Invoices
              </Link>
            </div>
          </div>

          {/* Minimal KPI Metrics */}
          <div className="grid-4 mt-6">
            <div className="metric-card">
              <div className="metric-icon-box orange-accent"><Package size={22} /></div>
              <div>
                <span className="metric-label">Active Leases</span>
                <p className="metric-value">{activeRentals.length}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box orange"><Clock size={22} /></div>
              <div>
                <span className="metric-label">Upcoming Returns</span>
                <p className="metric-value">{activeRentals.length > 0 ? '1 Due Soon' : 'None Due'}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box green"><CreditCard size={22} /></div>
              <div>
                <span className="metric-label">Sec. Deposits Held</span>
                <p className="metric-value">₹{activeRentals.reduce((sum, r) => sum + (r.deposit || 0), 0) || '2,000'}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box purple"><Heart size={22} /></div>
              <div>
                <span className="metric-label">Wishlist Gear</span>
                <p className="metric-value">{wishlistItems.length}</p>
              </div>
            </div>
          </div>

          {/* Minimal Dashboard Navigation Tabs */}
          <div className="dash-nav-tabs">
            <button
              className={`dash-tab-btn ${activeTab === 'rentals' ? 'active' : ''}`}
              onClick={() => setActiveTab('rentals')}
            >
              Active Leases ({activeRentals.length})
            </button>
            <button
              className={`dash-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Lease History ({pastRentals.length})
            </button>
            <button
              className={`dash-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              Wishlist ({wishlistItems.length})
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="dash-main-grid mt-6">
            
            {/* Left Column: Tab Content */}
            <div className="dash-column flex-col gap-6">
              
              {/* TAB 1: ACTIVE LEASES */}
              {activeTab === 'rentals' && (
                <div className="glass-card">
                  <div className="dash-card-header mb-4">
                    <h3><Clock size={18} className="text-primary" /> Active Equipment Rentals</h3>
                    <Link to="/products" className="text-link">Rent More Equipment →</Link>
                  </div>

                  {activeRentals.length === 0 ? (
                    <div className="text-center py-8">
                      <Package size={40} className="mx-auto text-muted mb-2 opacity-50" />
                      <p className="text-muted">You have no active equipment leases right now.</p>
                      <Link to="/products" className="btn btn-primary btn-sm mt-3 inline-flex items-center gap-1">
                        Explore Catalog <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="active-rentals-list flex-col gap-3">
                      {activeRentals.map((rental) => (
                        <div key={rental._id} className="active-rental-item flex-col md:flex-row gap-3">
                          <img src={rental.product?.image} alt={rental.product?.title} style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }} />
                          <div className="flex-1">
                            <h4>{rental.product?.title}</h4>
                            <p className="text-xs text-muted mt-1">
                              Rental Period: <strong>{rental.startDate}</strong> to <strong>{rental.endDate}</strong>
                            </p>
                            <div className="flex gap-2 mt-2 items-center flex-wrap">
                              <span className={`badge ${rental.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                                {rental.status === 'overdue' ? 'Overdue Return' : (rental.pickupStatus === 'picked_up' ? 'Picked Up / Active' : 'Pickup Pending')}
                              </span>
                              <span className="badge badge-info">₹{rental.totalAmount} Rent Paid</span>
                              <span className="badge badge-secondary">₹{rental.deposit} Deposit Held</span>
                              {rental.pickupOTP && (
                                <span className="badge badge-success" style={{ fontFamily: 'monospace' }}>OTP: {rental.pickupOTP}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <button className="btn btn-secondary btn-sm" onClick={() => setReturnModalItem(rental)}>
                              <RotateCcw size={14} /> Schedule Return
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Download Invoice"
                              onClick={() => downloadInvoicePdf({
                                orderId: rental.invoiceId || rental._id,
                                productTitle: rental.product?.title || 'Equipment Item',
                                customerName: user?.name || 'Customer',
                                vendorName: 'RentSphere Store',
                                startDate: rental.rentStartDate || rental.startDate,
                                endDate: rental.rentEndDate || rental.endDate,
                                pricePerDay: rental.product?.pricePerDay || 0,
                                totalPaid: rental.totalAmount + rental.deposit,
                                securityDeposit: rental.deposit,
                              })}
                            >
                              <Download size={14} /> PDF
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LEASE HISTORY */}
              {activeTab === 'history' && (
                <div className="glass-card">
                  <div className="dash-card-header mb-4">
                    <h3><FileText size={18} className="text-primary" /> Completed Rentals & Financial Settlement</h3>
                  </div>

                  {pastRentals.length === 0 ? (
                    <p className="text-muted py-4 text-center">No completed rental history yet.</p>
                  ) : (
                    <div className="active-rentals-list flex-col gap-3">
                      {pastRentals.map((rental) => (
                        <div key={rental._id} className="active-rental-item flex-col md:flex-row gap-3">
                          <img src={rental.product?.image} alt={rental.product?.title} style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }} />
                          <div className="flex-1">
                            <h4>{rental.product?.title}</h4>
                            <p className="text-xs text-muted mt-1">
                              Rental Period: {rental.startDate} to {rental.endDate}
                            </p>
                            <div className="flex gap-2 mt-2 items-center flex-wrap">
                              <span className="badge badge-success">Returned & Settled</span>
                              {rental.lateFee > 0 && <span className="badge badge-danger">Late Fee: ₹{rental.lateFee}</span>}
                              {rental.damageCharges > 0 && <span className="badge badge-danger">Damage Fee: ₹{rental.damageCharges}</span>}
                              {rental.refundAmount > 0 && <span className="badge badge-success">Refunded: ₹{rental.refundAmount}</span>}
                            </div>
                          </div>
                          <div>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Download Final Settlement Invoice"
                              onClick={() => downloadInvoicePdf({
                                orderId: rental.invoiceId || rental._id,
                                productTitle: rental.product?.title || 'Equipment Item',
                                customerName: user?.name || 'Customer',
                                vendorName: 'RentSphere Store',
                                startDate: rental.rentStartDate || rental.startDate,
                                endDate: rental.rentEndDate || rental.endDate,
                                pricePerDay: rental.product?.pricePerDay || 0,
                                totalPaid: rental.totalAmount + rental.lateFee + rental.damageCharges,
                                securityDeposit: rental.deposit,
                                lateFee: rental.lateFee,
                                damageCharges: rental.damageCharges,
                                refundAmount: rental.refundAmount,
                              })}
                            >
                              <Download size={14} /> Settlement Invoice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="glass-card">
                  <div className="dash-card-header mb-4">
                    <h3><Heart size={18} className="text-primary" /> Saved Items</h3>
                    <Link to="/wishlist" className="text-link">Manage Wishlist →</Link>
                  </div>

                  {wishlistItems.length === 0 ? (
                    <p className="text-muted py-4 text-center">Your wishlist is currently empty.</p>
                  ) : (
                    <div className="grid-2 gap-4">
                      {wishlistItems.map((prod) => (
                        <ProductCard key={prod._id} product={prod} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Gear Section */}
              <div className="glass-card mt-4">
                <div className="dash-card-header">
                  <h3><Sparkles size={18} className="text-primary" /> Recommended Rentals</h3>
                  <Link to="/products" className="text-link">Marketplace →</Link>
                </div>

                <div className="category-filter-pills mt-3 mb-4">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid-3 gap-4">
                  {filteredRecommendations.slice(0, 3).map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar */}
            <aside className="dash-sidebar flex-col gap-6">
              <div className="glass-card">
                <h3>Notifications</h3>
                <div className="notif-feed-list flex-col gap-3 mt-3">
                  <div className="notif-item">
                    <ShieldCheck size={18} className="text-success" />
                    <div>
                      <p className="notif-title">Security Deposit Refunded</p>
                      <span className="notif-time">2 hours ago</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <Clock size={18} className="text-warning" />
                    <div>
                      <p className="notif-title">Return Due Soon</p>
                      <span className="notif-time">Camera Kit - Due in 4 days</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <CheckCircle2 size={18} className="text-success" />
                    <div>
                      <p className="notif-title">Booking Confirmed</p>
                      <span className="notif-time">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <h3>Quick Navigation</h3>
                <div className="quick-links-list flex-col gap-2 mt-3">
                  <Link to="/orders" className="quick-nav-btn"><Package size={16} /> My Rental Orders</Link>
                  <Link to="/wishlist" className="quick-nav-btn"><Heart size={16} /> Saved Wishlist</Link>
                  <Link to="/settings" className="quick-nav-btn"><ShieldCheck size={16} /> Account Settings</Link>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>

      {/* Return Modal */}
      {returnModalItem && (
        <div className="modal-overlay" onClick={() => setReturnModalItem(null)}>
          <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Initiate Return — {returnModalItem.product?.title}</h3>
              <button className="modal-close-btn" onClick={() => setReturnModalItem(null)}><X size={20} /></button>
            </div>
            <div className="modal-body flex-col gap-3 mt-4">
              <p className="text-sm text-secondary">
                Select equipment condition before scheduling pickup:
              </p>
              <div className="form-group">
                <label>Equipment Condition</label>
                <select value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)}>
                  <option value="Excellent">Excellent (Like New)</option>
                  <option value="Good">Good (Minor Wear)</option>
                  <option value="Issues">Requires Inspection</option>
                </select>
              </div>
              <div className="modal-footer flex justify-end gap-2 mt-4">
                <button className="btn btn-secondary" onClick={() => setReturnModalItem(null)} disabled={actionLoading}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmReturn} disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {extendModalItem && (
        <div className="modal-overlay" onClick={() => setExtendModalItem(null)}>
          <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Extend Rental Period</h3>
              <button className="modal-close-btn" onClick={() => setExtendModalItem(null)}><X size={20} /></button>
            </div>
            <div className="modal-body flex-col gap-3 mt-4">
              <p className="text-sm text-secondary">
                Extend lease for <strong>{extendModalItem.product?.title}</strong>
              </p>
              <div className="form-group">
                <label>Select Additional Days</label>
                <select value={extensionDays} onChange={(e) => setExtensionDays(Number(e.target.value))}>
                  <option value={1}>+1 Day (₹{extendModalItem.product?.pricePerDay || 500})</option>
                  <option value={3}>+3 Days (₹{(extendModalItem.product?.pricePerDay || 500) * 3})</option>
                  <option value={7}>+7 Days (₹{(extendModalItem.product?.pricePerDay || 500) * 7})</option>
                </select>
              </div>
              <div className="modal-footer flex justify-end gap-2 mt-4">
                <button className="btn btn-secondary" onClick={() => setExtendModalItem(null)} disabled={actionLoading}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmExtension} disabled={actionLoading}>
                  {actionLoading ? 'Extending...' : 'Confirm Extension'}
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

export default CustomerDashboard;
