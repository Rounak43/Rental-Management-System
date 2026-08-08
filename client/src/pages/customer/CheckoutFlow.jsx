import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createRental } from '../../services/rentalService';
import { processPayment } from '../../services/paymentService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  FileText,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Building,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Wallet,
  Landmark
} from 'lucide-react';
import './CheckoutFlow.css';

const CheckoutFlow = () => {
  const navigate = useNavigate();
  const { cartItems, calculateTotals, clearCart } = useCart();
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1); // 1: Summary, 2: Address, 3: Delivery, 4: Payment

  // Address state
  const [addresses, setAddresses] = useState([
    {
      id: 'addr1',
      name: user?.name || 'Jane Doe',
      phone: user?.phone || '+1 (555) 234-5678',
      pincode: '10001',
      state: 'NY',
      city: 'New York',
      street: '742 Evergreen Terrace',
      landmark: 'Near Central Park',
      isDefault: true,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState('addr1');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    pincode: '',
    state: '',
    city: '',
    street: '',
    landmark: '',
  });

  // Delivery options state
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'pickup' or 'delivery'
  const deliveryCharge = deliveryType === 'delivery' ? 150 : 0;
  const expectedDate = new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking', 'cash'
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('Chase Bank');
  const [isProcessing, setIsProcessing] = useState(false);

  const totals = calculateTotals();
  const grandTotal = totals.subtotal + totals.totalDeposit + totals.tax + deliveryCharge - totals.discount;

  // Add Address Handler
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.street || !newAddr.city) {
      toast.error('Please complete required address fields.');
      return;
    }
    const created = {
      id: `addr_${Date.now()}`,
      ...newAddr,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, created]);
    setSelectedAddressId(created.id);
    setShowAddAddressModal(false);
    setNewAddr({ name: '', phone: '', pincode: '', state: '', city: '', street: '', landmark: '' });
    toast.success('New delivery address saved!');
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.info('Address removed');
  };

  // Final Payment Submission
  const handleProceedToPay = async () => {
    if (cartItems.length === 0) {
      toast.error('Your rental cart is empty.');
      return;
    }

    setIsProcessing(true);
    try {
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

      // 1. Process payment via Axios payment service
      const paymentRes = await processPayment({
        amount: grandTotal,
        paymentMethod,
        transactionId: `TXN_${Date.now()}`,
      });

      // 2. Create rental agreement orders in backend
      let createdRentalId = `RENT_${Date.now()}`;
      try {
        const rentalPayload = {
          product: cartItems[0]?.product?._id || 'prod1',
          startDate: cartItems[0]?.duration?.startDate || new Date().toISOString(),
          endDate: cartItems[0]?.duration?.endDate || new Date(Date.now() + 86400000 * 3).toISOString(),
          totalAmount: grandTotal,
          securityDeposit: totals.totalDeposit,
          shippingAddress: selectedAddr,
        };
        const rentalRes = await createRental(rentalPayload);
        if (rentalRes?._id) createdRentalId = rentalRes._id;
      } catch (err) {
        console.warn('Backend rental record note:', err);
      }

      // 3. Navigate to Payment Success screen
      clearCart();
      toast.success('Payment completed successfully!');
      navigate('/payment-success', {
        state: {
          orderId: `ORD-${Date.now().toString().slice(-6)}`,
          rentalId: createdRentalId,
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          estimatedDelivery: expectedDate,
          totalPaid: grandTotal,
        },
      });
    } catch (err) {
      toast.error(err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="checkout-wrapper">
        <div className="checkout-container">
          {/* Stepper Navigation Bar */}
          <div className="stepper-bar glass-card">
            <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Rental Summary</span>
            </div>
            <div className="step-line" />
            <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Address</span>
            </div>
            <div className="step-line" />
            <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Delivery</span>
            </div>
            <div className="step-line" />
            <div className={`step-item ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <span>Payment</span>
            </div>
          </div>

          <div className="checkout-grid">
            {/* Step Content Area */}
            <main className="checkout-main glass-card">
              {/* STEP 1: RENTAL SUMMARY */}
              {currentStep === 1 && (
                <div className="step-pane">
                  <h3>Review Rental Summary</h3>
                  <p className="tab-desc">Verify equipment configuration, duration, and deposit details</p>

                  <div className="rental-items-list">
                    {cartItems.length === 0 ? (
                      <p className="py-4 text-muted">No items in cart. Please browse catalog first.</p>
                    ) : (
                      cartItems.map((item) => (
                        <div key={item.id} className="checkout-item-card">
                          <img
                            src={item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200'}
                            alt="Item"
                            className="checkout-item-img"
                          />
                          <div className="checkout-item-details">
                            <h4>{item.product?.title || item.product?.name}</h4>
                            <p className="text-sm text-muted">
                              Duration: {item.duration?.days || 1} Days | Rate: ₹{item.dailyRate}/day
                            </p>
                            {item.config && Object.keys(item.config).length > 0 && (
                              <div className="item-config-chips">
                                {item.config.ram && <span className="chip">{item.config.ram.label}</span>}
                                {item.config.storage && <span className="chip">{item.config.storage.label}</span>}
                                {item.config.protection && <span className="chip">{item.config.protection.label}</span>}
                              </div>
                            )}
                          </div>
                          <div className="checkout-item-price">
                            <span>₹{(item.dailyRate + (item.config?.extraPerDay || 0)) * (item.duration?.days || 1)}</span>
                            <small>+ ₹{item.deposit} Deposit</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="step-actions justify-end mt-6">
                    <button
                      className="btn btn-primary"
                      disabled={cartItems.length === 0}
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue to Address Selection <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS SELECTION */}
              {currentStep === 2 && (
                <div className="step-pane">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3>Select Delivery Address</h3>
                      <p className="tab-desc">Choose an existing address or add a new location</p>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowAddAddressModal(true)}>
                      <Plus size={14} /> Add New Address
                    </button>
                  </div>

                  <div className="address-grid">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <div className="address-card-header">
                          <span className="font-bold">{addr.name}</span>
                          {addr.isDefault && <span className="badge badge-info">Default</span>}
                        </div>
                        <p className="address-text">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="address-phone">Phone: {addr.phone}</p>
                        <button className="address-delete-btn" onClick={() => handleDeleteAddress(addr.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="step-actions justify-between mt-6">
                    <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft size={16} /> Back to Summary
                    </button>
                    <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                      Continue to Delivery <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DELIVERY OPTIONS */}
              {currentStep === 3 && (
                <div className="step-pane">
                  <h3>Choose Delivery Option</h3>
                  <p className="tab-desc">Select how you want to receive your rental equipment</p>

                  <div className="delivery-options-grid">
                    <div
                      className={`delivery-option-card ${deliveryType === 'delivery' ? 'selected' : ''}`}
                      onClick={() => setDeliveryType('delivery')}
                    >
                      <Truck size={32} color="#6366f1" />
                      <div>
                        <h4>Home / Site Doorstep Delivery</h4>
                        <p>Delivered to your address by {expectedDate}</p>
                        <span className="delivery-fee-badge">₹150 Express Shipping</span>
                      </div>
                    </div>

                    <div
                      className={`delivery-option-card ${deliveryType === 'pickup' ? 'selected' : ''}`}
                      onClick={() => setDeliveryType('pickup')}
                    >
                      <Building size={32} color="#10b981" />
                      <div>
                        <h4>Self Store Pickup</h4>
                        <p>Collect from nearest vendor hub free of cost</p>
                        <span className="delivery-fee-badge free">FREE (₹0)</span>
                      </div>
                    </div>
                  </div>

                  <div className="step-actions justify-between mt-6">
                    <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft size={16} /> Back to Address
                    </button>
                    <button className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                      Proceed to Payment <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT PAGE */}
              {currentStep === 4 && (
                <div className="step-pane">
                  <h3>Payment Method</h3>
                  <p className="tab-desc">Select payment option to authorize rental & deposit</p>

                  <div className="payment-methods-tabs">
                    <button
                      className={`pay-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <Smartphone size={16} /> UPI & GPay
                    </button>
                    <button
                      className={`pay-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard size={16} /> Credit / Debit Card
                    </button>
                    <button
                      className={`pay-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('netbanking')}
                    >
                      <Landmark size={16} /> Net Banking
                    </button>
                    <button
                      className={`pay-tab ${paymentMethod === 'cash' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <Wallet size={16} /> Cash on Delivery
                    </button>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="pay-form-pane">
                      <label>Enter UPI Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        placeholder="username@okaxis or username@ybl"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="pay-form-pane flex-col gap-3">
                      <div className="form-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8901"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        />
                      </div>
                      <div className="grid-2">
                        <div className="form-group">
                          <label>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="08/28"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>CVV / CVC</label>
                          <input
                            type="password"
                            placeholder="•••"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="pay-form-pane">
                      <label>Select Bank</label>
                      <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                        <option value="Chase Bank">Chase Bank</option>
                        <option value="Bank of America">Bank of America</option>
                        <option value="Wells Fargo">Wells Fargo</option>
                        <option value="Citibank">Citibank</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="pay-form-pane">
                      <p className="text-muted">
                        Pay cash upon doorstep equipment delivery. Deposit will be verified on-site.
                      </p>
                    </div>
                  )}

                  <div className="step-actions justify-between mt-6">
                    <button className="btn btn-secondary" onClick={() => setCurrentStep(3)}>
                      <ArrowLeft size={16} /> Back to Delivery
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={handleProceedToPay} disabled={isProcessing}>
                      {isProcessing ? 'Processing Payment...' : `Proceed To Pay ₹${grandTotal}`}
                    </button>
                  </div>
                </div>
              )}
            </main>

            {/* Billing Summary Sidebar (Live Calculation) */}
            <aside className="billing-summary-sidebar glass-card">
              <h3>Billing Summary</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Rental Subtotal</span>
                  <span>₹{totals.subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Security Deposit (Refundable)</span>
                  <span>₹{totals.totalDeposit}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Tax (18% GST)</span>
                  <span>₹{totals.tax}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="summary-row text-success">
                    <span>Promotional Discount</span>
                    <span>-₹{totals.discount}</span>
                  </div>
                )}
                <div className="summary-divider" />
                <div className="summary-row grand-total-row">
                  <span>Grand Total</span>
                  <span className="grand-total-val">₹{grandTotal}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddAddressModal(false)}>
          <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Address</h3>
            <form onSubmit={handleSaveAddress} className="flex-col gap-3 mt-4">
              <div className="grid-2">
                <input
                  placeholder="Full Name"
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Phone"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                />
              </div>
              <input
                placeholder="Street Address"
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                required
              />
              <div className="grid-3">
                <input
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  required
                />
                <input
                  placeholder="State"
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                />
                <input
                  placeholder="Pincode / Zip"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddAddressModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CheckoutFlow;
