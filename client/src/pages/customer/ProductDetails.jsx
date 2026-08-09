import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProductById } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import ProductConfigModal from '../../components/product/ProductConfigModal';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  Star,
  ShieldCheck,
  Calendar,
  Sliders,
  ShoppingBag,
  Zap,
  Building,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  ChevronRight
} from 'lucide-react';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [customConfig, setCustomConfig] = useState(null);

  // Rental duration state
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
  );
  const [quantity, setQuantity] = useState(1);

  // Calculate rental days
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const daysDiff = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));

  useEffect(() => {
    loadProduct();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
    return `${backendBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await fetchProductById(id);
      if (data.images && data.images.length > 0) {
        data.images = data.images.map(getImageUrl);
      }
      if (data.image) {
        data.image = getImageUrl(data.image);
      }
      setProduct(data);
      const img = data.images?.[0] || data.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80';
      setSelectedImage(img);
    } catch (err) {
      // Catalog fallback lookup for all categories
      const catalog = {
        prod_veh1: { _id: 'prod_veh1', title: 'BMW 5 Series Luxury Sedan 2024 (Auto)', category: { name: 'Vehicles' }, pricePerDay: 2499, securityDeposit: 10000, images: ['https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800'] },
        prod_veh2: { _id: 'prod_veh2', title: 'Royal Enfield Himalayan 450 Adventure Bike', category: { name: 'Vehicles' }, pricePerDay: 899, securityDeposit: 3000, images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800'] },
        prod_gym1: { _id: 'prod_gym1', title: 'Commercial Heavy Duty Motorized Treadmill 4.0 HP', category: { name: 'Gym' }, pricePerDay: 599, securityDeposit: 2500, images: ['https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800'] },
        prod_gym2: { _id: 'prod_gym2', title: 'Bowflex SelectTech Adjustable Dumbbells (5-52 lbs)', category: { name: 'Gym' }, pricePerDay: 299, securityDeposit: 1200, images: ['https://images.unsplash.com/photo-1638558010764-9225786792c2?w=800'] },
        prod_game1: { _id: 'prod_game1', title: 'Sony PlayStation 5 Console + 2 DualSense Controllers', category: { name: 'Gaming' }, pricePerDay: 499, securityDeposit: 2000, images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800'] },
        prod_game2: { _id: 'prod_game2', title: 'Meta Quest 3 All-in-One VR Headset 512GB', category: { name: 'Gaming' }, pricePerDay: 450, securityDeposit: 1800, images: ['https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=800'] },
        prod_cloth1: { _id: 'prod_cloth1', title: 'Designer Italian Slim-Fit Tuxedo Suit (Black Tie Event)', category: { name: 'Clothes' }, pricePerDay: 799, securityDeposit: 3000, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'] },
        prod_cloth2: { _id: 'prod_cloth2', title: 'Luxury Designer Silk Evening Party Dress', category: { name: 'Clothes' }, pricePerDay: 899, securityDeposit: 3500, images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'] },
        prod1: { _id: 'prod1', title: 'Sony Alpha A7 IV Full-Frame Mirrorless Camera', category: { name: 'Electronics' }, pricePerDay: 999, securityDeposit: 4000, images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'] },
        prod2: { _id: 'prod2', title: 'Apple MacBook Pro 16" M3 Max 36GB RAM 1TB SSD', category: { name: 'Electronics' }, pricePerDay: 1299, securityDeposit: 5000, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'] },
        prod3: { _id: 'prod3', title: 'DJI Mavic 3 Pro Drone Combo 4K Hasselblad', category: { name: 'Electronics' }, pricePerDay: 899, securityDeposit: 3500, images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800'] },
        prod_furn1: { _id: 'prod_furn1', title: 'Herman Miller Aeron Ergonomic Executive Chair', category: { name: 'Furniture' }, pricePerDay: 399, securityDeposit: 1500, images: ['https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800'] },
        prod5: { _id: 'prod5', title: 'DeWalt 20V Max XR Brushless Power Tool Set', category: { name: 'Tools' }, pricePerDay: 349, securityDeposit: 1200, images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800'] }
      };

      const matched = catalog[id] || {
        _id: id || 'prod1',
        title: 'Sony Alpha A7 IV Full-Frame Mirrorless Camera',
        name: 'Sony Alpha A7 IV Full-Frame Mirrorless Camera',
        category: { name: 'Electronics' },
        pricePerDay: 999,
        securityDeposit: 4000,
        availability: true,
        rating: 4.9,
        reviewsCount: 38,
        description: 'High performance equipment available for flexible daily and weekly lease.',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800']
      };

      setProduct(matched);
      setSelectedImage(matched.images[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigConfirm = (configData) => {
    setCustomConfig(configData);
    toast.success('Hardware configuration applied!');
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.availability === false || product.availableQuantity === 0) {
      toast.error('This product is sold out.');
      return;
    }
    addToCart(
      product,
      customConfig || {},
      { startDate, endDate, days: daysDiff },
      quantity
    );
    toast.success(`${product.title || product.name} added to cart!`);
  };

  const handleBookNow = () => {
    if (product.availability === false || product.availableQuantity === 0) {
      toast.error('This product is sold out.');
      return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="p-8 max-w-6xl mx-auto">
          <div className="skeleton" style={{ height: '500px', borderRadius: '24px' }} />
        </div>
      </div>
    );
  }

  const dailyRate = customConfig?.totalDailyRate || product.pricePerDay || product.price || 85;
  const deposit = customConfig?.calculatedDeposit || product.securityDeposit || product.deposit || 300;

  return (
    <div className="app-container">
      <Navbar />
      <div className="product-details-wrapper">
        <div className="details-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <Link to="/">Home</Link> <ChevronRight size={14} />
            <Link to="/products">Products</Link> <ChevronRight size={14} />
            <span>{product.title || product.name}</span>
          </div>

          <div className="details-grid">
            {/* Gallery Section */}
            <div className="gallery-section">
              <div className="main-image-box glass-card">
                <img src={selectedImage} alt={product.title} className="main-img" />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="thumbnail-list">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className={`thumbnail-card ${selectedImage === img ? 'active' : ''}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`Thumb ${i}`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Vendor Card */}
              <div className="vendor-card glass-card">
                <div className="vendor-info-header">
                  <div className="vendor-badge">
                    <Building size={20} color="#6366f1" />
                  </div>
                  <div>
                    <h4>{product.vendor?.companyName || product.vendor?.name || 'Verified Vendor'}</h4>
                    <span className="badge badge-success flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified Equipment Provider
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Summary & Specs Section */}
            <div className="info-section glass-card">
              <div className="info-header">
                <span className="badge badge-info">{product.category?.name || 'Equipment'}</span>
                <h2>{product.title || product.name}</h2>
                <div className="rating-row">
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span className="font-bold">{product.rating || 4.9}</span>
                  <span className="text-muted">({product.reviewsCount || 24} customer reviews)</span>
                </div>
              </div>

              {/* Price & Deposit Summary Box */}
              <div className="price-summary-box">
                <div>
                  <span className="price-label">Rental Price</span>
                  <div className="price-val">
                    ₹{dailyRate}<small>/day</small>
                  </div>
                </div>

                <div className="deposit-val-box">
                  <ShieldCheck size={20} color="#10b981" />
                  <div>
                    <span className="deposit-label">Refundable Security Deposit</span>
                    <p className="deposit-amount">₹{deposit}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="desc-box">
                <h4>Description</h4>
                <p>{product.description}</p>
              </div>

              {/* Specs Table */}
              {product.specifications && (
                <div className="specs-box">
                  <h4>Specifications</h4>
                  <div className="specs-table">
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className="spec-row">
                        <span className="spec-key">{spec.key}</span>
                        <span className="spec-val">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Configuration Trigger */}
              <div className="config-trigger-box">
                <div>
                  <h4>Custom Configuration</h4>
                  <p className="text-muted text-sm">
                    {customConfig
                      ? `Selected: ${customConfig.ram?.label}, ${customConfig.storage?.label}`
                      : 'Customize RAM, Storage, Accessories, and Insurance'}
                  </p>
                </div>
                <button className="btn btn-outline" onClick={() => setIsConfigModalOpen(true)}>
                  <Sliders size={16} /> {customConfig ? 'Modify Specs' : 'Configure Item'}
                </button>
              </div>

              {/* Rental Duration & Dates */}
              <div className="rental-options-box">
                <h4>Select Rental Duration</h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label><Calendar size={14} /> Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label><Calendar size={14} /> End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                  </div>
                </div>

                <div className="duration-summary">
                  <span>Duration: <strong>{daysDiff} Days</strong></span>
                  <span>Calculated Rental Total: <strong>₹{dailyRate * daysDiff * quantity}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="details-actions">
                {product.availability === false || product.availableQuantity === 0 ? (
                  <button className="btn btn-secondary w-full" disabled style={{ opacity: 0.6, cursor: 'not-allowed', width: '100%' }}>
                    Sold Out
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={handleAddToCart}>
                      <ShoppingBag size={18} /> Add To Cart
                    </button>
                    <button className="btn btn-primary" onClick={handleBookNow}>
                      <Zap size={18} /> Book Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      <ProductConfigModal
        product={product}
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfirm={handleConfigConfirm}
      />

      <Footer />
    </div>
  );
};

export default ProductDetails;
