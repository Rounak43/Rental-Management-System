import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { ShoppingBag, Trash2, Bookmark, Plus, Minus, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    savedItems,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    calculateTotals
  } = useCart();

  const totals = calculateTotals();

  return (
    <div className="app-container">
      <Navbar />
      <div className="cart-page-wrapper">
        <div className="cart-container">
          <div className="cart-header">
            <h2>Your Rental Cart ({totals.itemCount} items)</h2>
            <p>Review items, adjust rental durations, or save items for later</p>
          </div>

          {cartItems.length === 0 && savedItems.length === 0 ? (
            <div className="empty-cart-card glass-card text-center py-12">
              <ShoppingBag size={56} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3>Your Rental Cart is Empty</h3>
              <p className="text-muted mt-1">Browse our catalog to select equipment for temporary lease.</p>
              <Link to="/products" className="btn btn-primary mt-6">
                Browse Equipment Catalog
              </Link>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Active Cart Items */}
              <div className="cart-items-main flex-col gap-4">
                {cartItems.map((item) => {
                  const days = item.duration?.days || 1;
                  const itemConfigExtra = Object.values(item.config || {}).reduce(
                    (acc, val) => acc + (val.extraPrice || 0),
                    0
                  );
                  const dailyPrice = item.dailyRate + itemConfigExtra;
                  const itemTotal = dailyPrice * days * item.quantity;

                  return (
                    <div key={item.id} className="cart-item-card glass-card">
                      <img
                        src={item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200'}
                        alt={item.product?.title}
                        className="cart-item-img"
                      />
                      <div className="cart-item-info">
                        <h3>{item.product?.title || item.product?.name}</h3>
                        <p className="item-meta">
                          Rate: ₹{dailyPrice}/day | Duration: {days} Days (₹{dailyPrice * days})
                        </p>

                        <div className="qty-controls mt-3">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">
                            <Minus size={14} />
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-price-col">
                        <span className="item-total-price">₹{itemTotal}</span>
                        <span className="item-deposit-tag">+ ₹{item.deposit * item.quantity} Deposit</span>

                        <div className="item-action-btns mt-3">
                          <button className="text-btn" onClick={() => saveForLater(item.id)}>
                            <Bookmark size={14} /> Save for later
                          </button>
                          <button className="text-btn danger" onClick={() => removeFromCart(item.id)}>
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Saved for Later Section */}
                {savedItems.length > 0 && (
                  <div className="saved-items-section mt-8">
                    <h3>Saved For Later ({savedItems.length})</h3>
                    <div className="saved-list flex-col gap-3 mt-3">
                      {savedItems.map((item) => (
                        <div key={item.id} className="saved-item-card glass-card">
                          <span>{item.product?.title || item.product?.name}</span>
                          <div className="flex items-center gap-3">
                            <button className="btn btn-secondary btn-sm" onClick={() => moveToCart(item.id)}>
                              Move to Cart
                            </button>
                            <button className="text-btn danger" onClick={() => removeSavedItem(item.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown Sidebar */}
              {cartItems.length > 0 && (
                <aside className="cart-summary-sidebar glass-card">
                  <h3>Price Breakdown</h3>

                  <div className="summary-rows mt-4">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{totals.subtotal}</span>
                    </div>
                    <div className="summary-row">
                      <span>Total Security Deposit</span>
                      <span>₹{totals.totalDeposit}</span>
                    </div>
                    <div className="summary-row">
                      <span>Estimated Taxes (18%)</span>
                      <span>₹{totals.tax}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Fee</span>
                      <span>₹{totals.deliveryFee}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="summary-row text-success">
                        <span>Discount</span>
                        <span>-₹{totals.discount}</span>
                      </div>
                    )}
                    <div className="summary-divider" />
                    <div className="summary-row grand-total-row">
                      <span>Estimated Grand Total</span>
                      <span className="grand-total-val">₹{totals.grandTotal}</span>
                    </div>
                  </div>

                  <button className="btn btn-primary w-full mt-6" onClick={() => navigate('/checkout')}>
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>

                  <Link to="/products" className="btn btn-secondary w-full mt-2 text-center">
                    Continue Shopping
                  </Link>
                </aside>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
