import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getVendorDashboard } from '../../services/vendorService';
import { fetchMyProducts } from '../../services/productService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VendorSidebar from '../../components/layout/VendorSidebar';
import {
  DollarSign,
  Package,
  CalendarCheck,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle,
  Eye
} from 'lucide-react';
import './PartnerDashboard.css';

const PartnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    availableProducts: 0,
    totalRentals: 0,
    activeRentals: 0,
    pendingRentals: 0,
    completedRentals: 0,
    totalRevenue: 0,
  });

  const [recentRentals, setRecentRentals] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashData, products] = await Promise.all([
        getVendorDashboard().catch(() => null),
        fetchMyProducts().catch(() => []),
      ]);

      if (dashData?.stats) {
        setStats(dashData.stats);
      }
      if (dashData?.recentRentals) {
        setRecentRentals(dashData.recentRentals);
      }
      if (Array.isArray(products)) {
        setRecentProducts(products.slice(0, 4));
      }
    } catch (err) {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <VendorSidebar />
        
        <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)', overflowY: 'auto' }}>
          <div className="partner-dash-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header / Welcome Row */}
            <div className="partner-welcome-card glass-card">
              <div>
                <h2>Welcome back, {user?.name || 'Partner'}!</h2>
                <p>Monitor your rental metrics, products catalog and check customer agreements from a single view.</p>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/partner/products/add')}>
                <Plus size={16} /> Add New Equipment
              </button>
            </div>

            {loading ? (
              <div className="flex-col gap-4 py-12">
                <div className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
                <div className="skeleton" style={{ height: '350px', borderRadius: '16px' }} />
              </div>
            ) : (
              <>
                {/* Stats Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(255, 102, 0, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
                      <Package size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Total Equipment</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalProducts}</h3>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Available Equipment</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.availableProducts}</h3>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Active Rentals</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.activeRentals}</h3>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Today's Pickups</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.todayPickups || 0}</h3>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
                      <CalendarCheck size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Today's Returns</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.todayReturns || 0}</h3>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Overdue / Late</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.lateRentals || 0}</h3>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
                      <DollarSign size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Late Fee Revenue</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>₹{(stats.lateFeeRevenue || 0).toLocaleString()}</h3>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                      <DollarSign size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Total Revenue</span>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                    </div>
                  </div>

                </div>

                {/* Dashboard Split Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                  
                  {/* Left Column: Revenue Chart & Recent Bookings */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* SVG Analytics Chart */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <h3 style={{ margin: 0 }}>Revenue Trend</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated earnings over past months</span>
                        </div>
                      </div>
                      <div style={{ height: '220px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '2px solid var(--surface-border)' }}>
                        {/* Custom visual bars for premium analytics feeling */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <div style={{ width: '32px', height: '60px', background: 'var(--surface-border)', borderRadius: '6px 6px 0 0' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>May</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <div style={{ width: '32px', height: '90px', background: 'var(--surface-border)', borderRadius: '6px 6px 0 0' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jun</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <div style={{ width: '32px', height: '140px', background: 'var(--primary-gradient)', borderRadius: '6px 6px 0 0', boxShadow: '0 4px 10px var(--primary-glow)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Jul</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <div style={{ width: '32px', height: '120px', background: 'var(--surface-border)', borderRadius: '6px 6px 0 0' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aug</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Bookings Agreement List */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0 }}>Recent Orders</h3>
                        <Link to="/partner/orders" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '600' }}>
                          Manage Orders <ArrowRight size={14} />
                        </Link>
                      </div>
                      
                      {recentRentals.length === 0 ? (
                        <p style={{ py: 6, color: 'var(--text-muted)', textAlign: 'center' }}>No active bookings yet.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="vendor-table">
                            <thead>
                              <tr>
                                <th>Equipment</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentRentals.map((rental) => (
                                <tr key={rental._id}>
                                  <td>{rental.product?.title || 'Rental Equipment'}</td>
                                  <td>{rental.user?.name || 'Customer'}</td>
                                  <td>₹{rental.totalCost}</td>
                                  <td>
                                    <span className={`badge ${
                                      rental.status === 'active' ? 'badge-success' : 
                                      rental.status === 'pending' ? 'badge-warning' : 'badge-info'
                                    }`}>
                                      {rental.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Quick Links & Recent Products */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Quick Link Shortcuts */}
                    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ margin: 0, marginBottom: '4px' }}>Quick Shortcuts</h3>
                      <button className="btn btn-secondary" onClick={() => navigate('/partner/products/add')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <Plus size={16} style={{ marginRight: '8px' }} /> Create Listing
                      </button>
                      <button className="btn btn-secondary" onClick={() => navigate('/partner/products')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <Package size={16} style={{ marginRight: '8px' }} /> View Catalog
                      </button>
                      <button className="btn btn-secondary" onClick={() => navigate('/partner/revenue')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <DollarSign size={16} style={{ marginRight: '8px' }} /> Revenue Overview
                      </button>
                    </div>

                    {/* Recent Products */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0 }}>My Catalog</h3>
                        <Link to="/partner/products" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '600' }}>
                          View All
                        </Link>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentProducts.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No products listed.</p>
                        ) : (
                          recentProducts.map((p) => (
                            <div key={p._id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <img 
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120'} 
                                alt={p.title} 
                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{p.pricePerDay}/day</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </>
            )}

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PartnerDashboard;
