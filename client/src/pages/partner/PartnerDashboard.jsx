import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getVendorDashboard, getMyProducts, getVendorRentals, deleteProduct } from '../../services/vendorService';
import './PartnerDashboard.css';

// ─── Nav items ───
const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: '📊' },
  { id: 'products', label: 'My Products', icon: '📦' },
  { id: 'rentals', label: 'Rental Orders', icon: '🛒' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

// ─── Stat Card ───
const StatCard = ({ icon, iconClass, label, value, trend, trendType }) => (
  <div className="pd-stat-card">
    <div className="pd-stat-header">
      <div className={`pd-stat-icon ${iconClass}`}>{icon}</div>
      {trend && <span className={`pd-stat-trend ${trendType}`}>{trend}</span>}
    </div>
    <div className="pd-stat-value">{value}</div>
    <div className="pd-stat-label">{label}</div>
  </div>
);

// ─── Skeleton rows ───
const SkeletonRows = ({ cols, rows = 4 }) =>
  Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="pd-skeleton-row">
      {Array.from({ length: cols }).map((__, j) => (
        <td key={j}>
          <div className="pd-skeleton-cell" style={{ width: j === 0 ? '80%' : j % 2 === 0 ? '50%' : '70%' }} />
        </td>
      ))}
    </tr>
  ));

// ─── Main Component ───
const PartnerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');
  const [dashStats, setDashStats] = useState(null);
  const [recentRentals, setRecentRentals] = useState([]);
  const [products, setProducts] = useState([]);
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [rentalsLoading, setRentalsLoading] = useState(false);

  // Load overview on mount
  useEffect(() => {
    setLoading(true);
    getVendorDashboard()
      .then((data) => {
        setDashStats(data.stats);
        setRecentRentals(data.recentRentals || []);
      })
      .catch(() => setDashStats(null))
      .finally(() => setLoading(false));
  }, []);

  // Load products when section = products
  useEffect(() => {
    if (activeSection !== 'products') return;
    setProductsLoading(true);
    getMyProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [activeSection]);

  // Load all rentals when section = rentals
  useEffect(() => {
    if (activeSection !== 'rentals') return;
    setRentalsLoading(true);
    getVendorRentals()
      .then((data) => setAllRentals(Array.isArray(data) ? data : []))
      .catch(() => setAllRentals([]))
      .finally(() => setRentalsLoading(false));
  }, [activeSection]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('Failed to delete product.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/partner/login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'V';

  const formatCurrency = (n) =>
    typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="pd-root">

      {/* ── SIDEBAR ── */}
      <aside className="pd-sidebar">
        <Link to="/" className="pd-sidebar-brand">
          <span className="pd-sidebar-brand-icon">R</span>
          RentSphere
          <span className="pd-sidebar-badge">PARTNER</span>
        </Link>

        <nav className="pd-nav">
          <div className="pd-nav-section-label">Main</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`pd-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="pd-nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pd-nav-logout">
          <button className="pd-nav-item" onClick={handleLogout} style={{ width: '100%', color: '#ef4444' }}>
            <span className="pd-nav-item-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="pd-main">

        {/* Top Bar */}
        <div className="pd-topbar">
          <span className="pd-topbar-title">
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label || 'Dashboard'}
          </span>
          <div className="pd-topbar-actions">
            <div className="pd-topbar-avatar">{userInitials}</div>
            <div className="pd-topbar-user">
              <span className="pd-topbar-name">{user?.name || 'Partner'}</span>
              <span className="pd-topbar-role">Rental Partner</span>
            </div>
          </div>
        </div>

        <div className="pd-content">

          {/* ═══════════ OVERVIEW ═══════════ */}
          {activeSection === 'overview' && (
            <>
              <div className="pd-stats-grid">
                <StatCard
                  icon="💰"
                  iconClass="green"
                  label="Total Revenue"
                  value={loading ? '…' : formatCurrency(dashStats?.totalRevenue)}
                  trend={dashStats ? 'All time' : null}
                  trendType="neutral"
                />
                <StatCard
                  icon="📦"
                  iconClass="blue"
                  label="Total Products"
                  value={loading ? '…' : dashStats?.totalProducts ?? 0}
                  trend={dashStats ? `${dashStats.publishedProducts} published` : null}
                  trendType="up"
                />
                <StatCard
                  icon="🔄"
                  iconClass="amber"
                  label="Active Rentals"
                  value={loading ? '…' : dashStats?.activeRentals ?? 0}
                  trend={dashStats ? `${dashStats.pendingRentals} pending` : null}
                  trendType="neutral"
                />
                <StatCard
                  icon="✅"
                  iconClass="purple"
                  label="Completed Rentals"
                  value={loading ? '…' : dashStats?.completedRentals ?? 0}
                  trendType="up"
                />
              </div>

              {/* Recent Rentals */}
              <div className="pd-section-header">
                <span className="pd-section-title">Recent Rental Orders</span>
                <button className="pd-section-action" onClick={() => setActiveSection('rentals')}>
                  View All →
                </button>
              </div>

              <div className="pd-table-card">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Rental Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <SkeletonRows cols={5} rows={4} />
                    ) : recentRentals.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="pd-table-empty">
                            <div className="pd-table-empty-icon">📋</div>
                            <h4>No rental orders yet</h4>
                            <p>Add products to start receiving rental requests.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentRentals.map((r) => (
                        <tr key={r._id}>
                          <td>{r.user?.name || '—'}</td>
                          <td>
                            <div className="pd-product-cell">
                              <div className="pd-product-thumb">
                                {r.product?.images?.[0] ? (
                                  <img src={r.product.images[0]} alt="" />
                                ) : '📦'}
                              </div>
                              <span className="pd-product-name">{r.product?.title || '—'}</span>
                            </div>
                          </td>
                          <td>
                            {formatDate(r.rentStartDate)} — {formatDate(r.rentEndDate)}
                          </td>
                          <td className="pd-revenue">{formatCurrency(r.totalCost)}</td>
                          <td>
                            <span className={`pd-status ${r.status}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ═══════════ PRODUCTS ═══════════ */}
          {activeSection === 'products' && (
            <>
              <div className="pd-section-header">
                <span className="pd-section-title">
                  My Products ({productsLoading ? '…' : products.length})
                </span>
                <button className="pd-add-btn" onClick={() => navigate('/partner/products/new')}>
                  + Add Product
                </button>
              </div>

              <div className="pd-table-card">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price/Day</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <SkeletonRows cols={6} rows={5} />
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="pd-table-empty">
                            <div className="pd-table-empty-icon">📦</div>
                            <h4>No products yet</h4>
                            <p>Add your first product to start renting.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="pd-product-cell">
                              <div className="pd-product-thumb">
                                {p.images?.[0] ? (
                                  <img src={p.images[0]} alt="" />
                                ) : '📦'}
                              </div>
                              <div>
                                <div className="pd-product-name">{p.title}</div>
                                <div className="pd-product-cat">{p.brand || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td>{typeof p.category === 'object' ? p.category?.name : p.category || '—'}</td>
                          <td>{formatCurrency(p.pricePerDay)}</td>
                          <td>{p.availableQuantity} / {p.quantity}</td>
                          <td>
                            <span className={`pd-status ${p.isPublished ? 'active' : 'pending'}`}>
                              {p.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="pd-action-btn primary"
                              onClick={() => navigate(`/partner/products/edit/${p._id}`)}
                            >
                              Edit
                            </button>
                            <button
                              className="pd-action-btn danger"
                              onClick={() => handleDeleteProduct(p._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ═══════════ RENTALS ═══════════ */}
          {activeSection === 'rentals' && (
            <>
              <div className="pd-section-header">
                <span className="pd-section-title">
                  All Rental Orders ({rentalsLoading ? '…' : allRentals.length})
                </span>
              </div>

              <div className="pd-table-card">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentalsLoading ? (
                      <SkeletonRows cols={6} rows={6} />
                    ) : allRentals.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="pd-table-empty">
                            <div className="pd-table-empty-icon">📋</div>
                            <h4>No rental orders yet</h4>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      allRentals.map((r) => (
                        <tr key={r._id}>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.user?.name || '—'}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.user?.email || ''}</div>
                            </div>
                          </td>
                          <td>
                            <div className="pd-product-cell">
                              <div className="pd-product-thumb">
                                {r.product?.images?.[0] ? (
                                  <img src={r.product.images[0]} alt="" />
                                ) : '📦'}
                              </div>
                              <span className="pd-product-name">{r.product?.title || '—'}</span>
                            </div>
                          </td>
                          <td>{formatDate(r.rentStartDate)}</td>
                          <td>{formatDate(r.rentEndDate)}</td>
                          <td className="pd-revenue">{formatCurrency(r.totalCost)}</td>
                          <td>
                            <span className={`pd-status ${r.status}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ═══════════ ANALYTICS ═══════════ */}
          {activeSection === 'analytics' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📈</div>
              <h3 style={{ fontSize: 18, color: '#475569', marginBottom: 8 }}>Analytics Coming Soon</h3>
              <p style={{ fontSize: 14 }}>Revenue charts and rental growth graphs will be available here.</p>
            </div>
          )}

          {/* ═══════════ SETTINGS ═══════════ */}
          {activeSection === 'settings' && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Business Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Owner Name</label>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                      {user?.name || '—'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Business Email</label>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                      {user?.email || '—'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Phone</label>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                      {user?.phone || '—'}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
                  Profile editing will be available in the next update.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
