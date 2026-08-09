import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VendorSidebar from '../../components/layout/VendorSidebar';
import { getVendorPayments } from '../../services/paymentService';
import { getVendorAnalytics } from '../../services/vendorService';
import { useToast } from '../../context/ToastContext';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Package,
  Users,
  PieChart,
  Tag,
  AlertTriangle,
  Award,
  BarChart3
} from 'lucide-react';
import './PartnerDashboard.css';

const PartnerRevenue = () => {
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [paymentsData, analyticsData] = await Promise.all([
        getVendorPayments().catch(() => []),
        getVendorAnalytics().catch(() => null),
      ]);

      if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
      }
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
    } catch (e) {
      toast.error('Failed to retrieve analytics and revenue data.');
    } finally {
      setLoading(false);
    }
  };

  const cards = analytics?.cards || {};
  const monthlyTrends = analytics?.monthlyTrends || [];
  const topProducts = analytics?.topProducts || [];
  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const topCustomers = analytics?.topCustomers || [];

  const maxMonthlyRevenue = Math.max(...monthlyTrends.map(m => m.revenue), 1);
  const totalCategoryProducts = categoryBreakdown.reduce((sum, c) => sum + c.count, 0) || 1;
  const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#ec4899','#14b8a6','#f97316','#84cc16'];

  // Calculate Pie Slices
  let cumAngle = -90;
  const pieSlices = categoryBreakdown.map((cat, i) => {
    const pct = cat.count / totalCategoryProducts;
    const angle = pct * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    cumAngle += angle;
    const endRad = (cumAngle * Math.PI) / 180;
    const r = 70; const cx = 90; const cy = 90;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
    return { d, color: PIE_COLORS[i % PIE_COLORS.length], name: cat.name, count: cat.count, pct };
  });

  return (
    <div className="app-container">
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <VendorSidebar />
        
        <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)', overflowY: 'auto' }}>
          <div className="partner-dash-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0 }}>Vendor Analytics & Revenue Reports</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  Real-time database analytics for rental revenue, late fees, category performance, and top customer accounts.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadAnalyticsData}>
                Refresh Reports
              </button>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
            ) : (
              <>
                {/* Metrics Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
                  
                  <div className="glass-card" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Today's Revenue</span>
                    <h3 style={{ margin: '6px 0', fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                      ₹{(cards.todayRevenue || 0).toLocaleString()}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <ArrowUpRight size={12} /> Real-time
                    </span>
                  </div>

                  <div className="glass-card" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Weekly Revenue</span>
                    <h3 style={{ margin: '6px 0', fontSize: '1.6rem', fontWeight: '800' }}>
                      ₹{(cards.weeklyRevenue || 0).toLocaleString()}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 7 days</span>
                  </div>

                  <div className="glass-card" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Monthly Revenue</span>
                    <h3 style={{ margin: '6px 0', fontSize: '1.6rem', fontWeight: '800' }}>
                      ₹{(cards.monthlyRevenue || 0).toLocaleString()}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 30 days</span>
                  </div>

                  <div className="glass-card" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Earnings</span>
                    <h3 style={{ margin: '6px 0', fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>
                      ₹{(cards.totalRevenue || 0).toLocaleString()}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cards.completedRentals || 0} completed rentals</span>
                  </div>

                  <div className="glass-card" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Late Fee Earned</span>
                    <h3 style={{ margin: '6px 0', fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>
                      ₹{(cards.lateFeeEarned || 0).toLocaleString()}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto hourly charges</span>
                  </div>

                  <div className="glass-card" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Sec. Deposit Held</span>
                    <h3 style={{ margin: '6px 0', fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b' }}>
                      ₹{(cards.securityDepositHeld || 0).toLocaleString()}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active rentals deposit</span>
                  </div>

                </div>

                {/* Revenue Trend Chart & Category Pie Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  
                  {/* Dynamic Bar Chart driven by MongoDB monthlyTrends */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BarChart3 size={18} style={{ color: 'var(--primary-color)' }} /> Monthly Revenue & Late Fee Growth
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculated directly from MongoDB rental database</span>
                      </div>
                    </div>

                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 10px', borderBottom: '1px solid var(--surface-border)' }}>
                      {monthlyTrends.map((m, idx) => {
                        const heightPct = maxMonthlyRevenue > 0 ? Math.max((m.revenue / maxMonthlyRevenue) * 100, m.revenue > 0 ? 8 : 0) : 0;
                        return (
                          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                              {m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(1)}k` : '₹0'}
                            </div>
                            <div 
                              style={{ 
                                width: '100%', 
                                maxWidth: '36px', 
                                height: `${heightPct}%`, 
                                background: 'linear-gradient(180deg, var(--primary-color), #f97316)', 
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.4s ease'
                              }} 
                              title={`Revenue: ₹${m.revenue} | Late Fees: ₹${m.lateFees} | Rentals: ${m.rentals}`}
                            />
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{m.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Distribution Donut Chart */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={18} style={{ color: 'var(--primary-color)' }} /> Category Distribution
                    </h3>

                    {categoryBreakdown.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No catalog categories found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <svg viewBox="0 0 180 180" width="150" height="150">
                          {pieSlices.map((slice, i) => (
                            <path key={i} d={slice.d} fill={slice.color} stroke="var(--surface)" strokeWidth="2">
                              <title>{slice.name}: {slice.count} equipment items</title>
                            </path>
                          ))}
                          <circle cx="90" cy="90" r="40" fill="var(--surface)" />
                          <text x="90" y="86" textAnchor="middle" style={{ fontSize: '10px', fill: 'var(--text-muted)' }}>Total</text>
                          <text x="90" y="102" textAnchor="middle" style={{ fontSize: '14px', fill: 'var(--text)', fontWeight: 700 }}>{totalCategoryProducts}</text>
                        </svg>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', fontSize: '0.78rem' }}>
                          {pieSlices.map((slice, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-hover)', padding: '4px 8px', borderRadius: '6px', flex: '1 1 40%' }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: slice.color }} />
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slice.name}</span>
                              <strong>{slice.count}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Top Performing Equipment & Customer Insights Split */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Top Equipment Performance Table */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18} style={{ color: 'var(--primary-color)' }} /> Top 10 Rented Equipment
                    </h3>
                    {topProducts.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No equipment rental history yet.</p>
                    ) : (
                      <table className="vendor-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Equipment Title</th>
                            <th>Rental Count</th>
                            <th>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((p, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{p.title}</td>
                              <td><span className="badge badge-info">{p.count} rentals</span></td>
                              <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{p.revenue.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Customer Insights Table */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} style={{ color: 'var(--primary-color)' }} /> Top Customer Insights
                    </h3>
                    {topCustomers.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No customer analytics data.</p>
                    ) : (
                      <table className="vendor-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Total Rentals</th>
                            <th>Total Spent</th>
                            <th>Late Returns</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topCustomers.map((c, idx) => (
                            <tr key={idx}>
                              <td>
                                <div><strong>{c.name}</strong></div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                              </td>
                              <td>{c.totalRentals}</td>
                              <td style={{ fontWeight: 'bold', color: '#10b981' }}>₹{c.revenue.toLocaleString()}</td>
                              <td>
                                {c.lateReturns > 0 ? (
                                  <span className="badge badge-danger">{c.lateReturns} Late</span>
                                ) : (
                                  <span className="badge badge-success">0 On-time</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>

                {/* Ledger Transactions Table */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>Recent Payout & Payer Ledger</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                      <FileSpreadsheet size={14} style={{ marginRight: '6px' }} /> Export Ledger
                    </button>
                  </div>

                  {payments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No billing transactions registered yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="vendor-table">
                        <thead>
                          <tr>
                            <th>Transaction ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Payment Method</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p) => {
                            const dateStr = new Date(p.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            });
                            const isDepositRefund = p.type === 'deposit_refund';

                            return (
                              <tr key={p._id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary-color)' }}>{p.transactionId}</td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>{p.user?.name || 'Customer'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.email || ''}</span>
                                  </div>
                                </td>
                                <td>{dateStr}</td>
                                <td style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{p.paymentMethod}</td>
                                <td>
                                  <span style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                                    {p.type?.replace(/_/g, ' ') || 'payment'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    p.status === 'completed' ? 'badge-success' : 
                                    p.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 'bold', color: isDepositRefund ? 'var(--text-muted)' : '#10b981' }}>
                                  {isDepositRefund ? '-' : ''}₹{p.amount.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
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

export default PartnerRevenue;

