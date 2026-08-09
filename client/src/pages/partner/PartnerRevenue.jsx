import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VendorSidebar from '../../components/layout/VendorSidebar';
import { getVendorPayments } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Clock,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import './PartnerDashboard.css';

const PartnerRevenue = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    pendingPayouts: 0,
    completedCount: 0
  });

  const toast = useToast();

  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    setLoading(true);
    try {
      const data = await getVendorPayments();
      if (Array.isArray(data)) {
        setPayments(data);
        calculateRevenueMetrics(data);
      }
    } catch (e) {
      toast.error('Failed to retrieve financial transactions.');
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueMetrics = (transactions) => {
    let today = 0;
    let weekly = 0;
    let monthly = 0;
    let total = 0;
    let pending = 0;
    let completed = 0;

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    transactions.forEach(txn => {
      const txnDate = new Date(txn.createdAt);
      const daysAgo = (now - txnDate) / oneDay;
      const isCompleted = txn.status === 'completed';
      const isPending = txn.status === 'pending';

      // We only include rental payments or late charges as revenue (deposit refunds represent returned user money)
      const isRevenueItem = txn.type === 'rental_payment' || txn.type === 'late_fee_charge';

      if (isCompleted && isRevenueItem) {
        total += txn.amount;
        completed += 1;

        if (daysAgo <= 1) {
          today += txn.amount;
        }
        if (daysAgo <= 7) {
          weekly += txn.amount;
        }
        if (daysAgo <= 30) {
          monthly += txn.amount;
        }
      } else if (isPending && isRevenueItem) {
        pending += txn.amount;
      }
    });

    setMetrics({
      todayRevenue: today,
      weeklyRevenue: weekly,
      monthlyRevenue: monthly,
      totalRevenue: total,
      pendingPayouts: pending,
      completedCount: completed
    });
  };

  return (
    <div className="app-container">
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <VendorSidebar />
        
        <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)', overflowY: 'auto' }}>
          <div className="partner-dash-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h2 style={{ margin: 0 }}>Earnings & Revenue</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Track your rental revenue distribution, pending escrows, and transaction history logs.
              </p>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: '350px', borderRadius: '16px' }} />
            ) : (
              <>
                {/* Finance Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Today&apos;s Revenue</span>
                    <h3 style={{ margin: '8px 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-color)' }}>₹{metrics.todayRevenue.toLocaleString()}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <ArrowUpRight size={12} /> Live sales
                    </span>
                  </div>

                  <div className="glass-card" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Weekly Revenue</span>
                    <h3 style={{ margin: '8px 0', fontSize: '1.75rem', fontWeight: '800' }}>₹{metrics.weeklyRevenue.toLocaleString()}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 7 days</span>
                  </div>

                  <div className="glass-card" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Monthly Revenue</span>
                    <h3 style={{ margin: '8px 0', fontSize: '1.75rem', fontWeight: '800' }}>₹{metrics.monthlyRevenue.toLocaleString()}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 30 days</span>
                  </div>

                  <div className="glass-card" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Earnings</span>
                    <h3 style={{ margin: '8px 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)' }}>₹{metrics.totalRevenue.toLocaleString()}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{metrics.completedCount} rentals completed</span>
                  </div>

                  <div className="glass-card" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Pending Escrow</span>
                    <h3 style={{ margin: '8px 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-warning)' }}>₹{metrics.pendingPayouts.toLocaleString()}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Held during rentals</span>
                  </div>

                </div>

                {/* Transactions Table */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>Recent Payout & Payer Ledger</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                      <FileSpreadsheet size={14} style={{ marginRight: '6px' }} /> Export Statement
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
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.phone || ''}</span>
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
                                <td style={{ fontWeight: 'bold', color: isDepositRefund ? 'var(--text-muted)' : 'var(--color-success)' }}>
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
