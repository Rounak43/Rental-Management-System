import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { toggleWishlistItem, getStoredWishlist } from '../../services/wishlistService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './ProductCard.css';

const ProductCard = ({ product, onWishlistToggle }) => {
  const toast = useToast();
  const { addToCart } = useCart();

  const prodId = product._id || product.id || `prod_${Date.now()}`;
  const isWishlisted = getStoredWishlist().some((item) => item._id === prodId || item.id === prodId);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistItem({ ...product, _id: prodId });
    if (onWishlistToggle) onWishlistToggle();
    toast.info(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.availability === false || product.availableQuantity === 0) {
      toast.error('This product is sold out.');
      return;
    }
    addToCart(product, {}, { days: 1 }, 1);
    toast.success(`${product.title || product.name || 'Equipment'} added to rental cart!`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
    return `${backendBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const rawImage = product.images?.[0] || product.image || '';
  const image = rawImage
    ? getImageUrl(rawImage)
    : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80';
  const title = product.title || product.name || 'Professional Equipment';
  const price = product.pricePerDay || product.price || 99;
  const deposit = product.securityDeposit || product.deposit || Math.round(price * 3);
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 24;

  return (
    <div className="product-card glass-card">
      {/* Card Image Wrapper */}
      <div className="card-image-wrapper">
        <img src={image} alt={title} className="product-card-img" />
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          title="Toggle Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#fff'} />
        </button>
        {product.availability === false || product.availableQuantity === 0 ? (
          <span className="availability-badge out">Sold Out</span>
        ) : (
          <span className="availability-badge available">Available Now</span>
        )}
      </div>

      {/* Card Content Body */}
      <div className="product-card-body">
        <div className="card-rating">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span>{rating}</span>
          <span className="rating-count">({reviewsCount})</span>
        </div>

        <h3 className="product-card-title">
          <Link to={`/products/${prodId}`}>{title}</Link>
        </h3>

        <div className="product-card-vendor text-xs text-muted" style={{ margin: '2px 0 8px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600 }}>Vendor: </span>
          <span>{product.owner?.name || product.vendor?.companyName || product.vendor?.name || 'Verified Partner'}</span>
        </div>

        <div className="product-card-deposit flex items-center gap-1">
          <ShieldCheck size={14} color="#10b981" />
          <span>Deposit: ₹{deposit}</span>
        </div>

        {/* Pricing & CTA */}
        <div className="product-card-footer">
          <div className="price-box">
            <span className="card-price">₹{price}</span>
            <span className="price-unit">/day</span>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={handleAddToCart} title="Add to Cart">
              <ShoppingBag size={14} /> Add
            </button>
            {product.availability === false || product.availableQuantity === 0 ? (
              <button className="btn btn-primary btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                Sold Out
              </button>
            ) : (
              <Link to={`/products/${prodId}`} className="btn btn-primary btn-sm">
                Rent <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
