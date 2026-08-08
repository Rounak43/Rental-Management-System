import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoredWishlist, toggleWishlistItem } from '../../services/wishlistService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/product/ProductCard';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(getStoredWishlist());
  const { addToCart } = useCart();
  const toast = useToast();

  const handleRemove = (product) => {
    const updated = toggleWishlistItem(product);
    setWishlist(updated);
    toast.info('Item removed from Wishlist');
  };

  const handleMoveToCart = (product) => {
    addToCart(product);
    handleRemove(product);
    toast.success('Moved item to Cart!');
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="wishlist-page-wrapper">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h2>Your Saved Wishlist ({wishlist.length})</h2>
            <p>Saved equipment and gear for future rental bookings</p>
          </div>

          {wishlist.length === 0 ? (
            <div className="glass-card text-center py-12">
              <Heart size={56} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3>Your Wishlist is Empty</h3>
              <p className="text-muted mt-1">Explore equipment catalog and click the heart icon to save items.</p>
              <Link to="/products" className="btn btn-primary mt-6">
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="grid-3">
              {wishlist.map((item) => (
                <div key={item._id} className="wishlist-card-wrapper">
                  <ProductCard product={item} onWishlistToggle={() => setWishlist(getStoredWishlist())} />
                  <div className="wishlist-actions mt-2 flex gap-2">
                    <button className="btn btn-secondary btn-sm flex-1" onClick={() => handleMoveToCart(item)}>
                      <ShoppingBag size={14} /> Move to Cart
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
