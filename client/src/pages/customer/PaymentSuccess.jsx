import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { CheckCircle2, Download, ShoppingBag, Package, Calendar, FileText } from 'lucide-react';
import { downloadInvoicePdf } from '../../utils/invoicePdf';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const state = location.state || {};

  const orderId = state.orderId || 'ORD-892341';
  const rentalId = state.rentalId || 'RENT-90218';
  const invoiceNumber = state.invoiceNumber || 'INV-2026-8812';
  const estimatedDelivery = state.estimatedDelivery || 'Tue, Aug 11';
  const totalPaid = state.totalPaid || 490;

  const handleDownloadInvoice = () => {
    downloadInvoicePdf({
      invoiceNumber,
      orderId,
      rentalId,
      productTitle: state.productTitle || 'Equipment Rental Leased Item',
      totalPaid: Number(totalPaid),
      securityDeposit: Number(state.securityDeposit || Math.round(totalPaid * 0.3)),
      startDate: state.startDate || new Date().toLocaleDateString(),
      endDate: state.endDate || new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
      estimatedDelivery,
    });
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="success-page-wrapper">
        <div className="success-card glass-card">
          <div className="success-icon-badge">
            <CheckCircle2 size={64} color="#10b981" />
          </div>

          <h2>Thank You! Payment Successful</h2>
          <p className="success-subtitle">
            Your rental agreement and deposit authorization have been processed successfully.
          </p>

          <div className="invoice-summary-box">
            <div className="summary-col">
              <span className="col-label">Order ID</span>
              <span className="col-val">{orderId}</span>
            </div>
            <div className="summary-col">
              <span className="col-label">Rental Agreement ID</span>
              <span className="col-val">{rentalId}</span>
            </div>
            <div className="summary-col">
              <span className="col-label">Invoice Number</span>
              <span className="col-val">{invoiceNumber}</span>
            </div>
            <div className="summary-col">
              <span className="col-label">Estimated Delivery</span>
              <span className="col-val flex items-center gap-1"><Calendar size={14} /> {estimatedDelivery}</span>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-outline" onClick={handleDownloadInvoice}>
              <Download size={18} /> Download Invoice PDF
            </button>
            <Link to="/orders" className="btn btn-secondary">
              <Package size={18} /> View My Orders
            </Link>
            <Link to="/products" className="btn btn-primary">
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
