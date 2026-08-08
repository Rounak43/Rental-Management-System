import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchMyProducts, 
  deleteProduct,
  updateProductStatus,
  createProduct
} from '../../services/productService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import VendorSidebar from '../../components/layout/VendorSidebar';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Star,
  Copy,
  Search,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import './PartnerDashboard.css';

// Sub-component for product card with image slider and quick-toggle status controls
const PartnerProductCard = ({ prod, onEdit, onDelete, onTogglePublish, onDuplicate }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const backendBase = 'http://localhost:5000';
    return `${backendBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const imgList = prod.images && prod.images.length > 0 
    ? prod.images.map(getImageUrl)
    : [prod.image ? getImageUrl(prod.image) : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'];

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === imgList.length - 1 ? 0 : prev + 1));
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? imgList.length - 1 : prev - 1));
  };

  const categoryName = prod.category?.name || prod.category || 'Equipment';

  return (
    <div className="glass-card product-manage-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <div className="card-image-slider-wrapper" style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img 
          src={imgList[currentImgIndex]} 
          alt="Product" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {imgList.length > 1 && (
          <>
            <button 
              type="button"
              onClick={prevImg} 
              style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              type="button"
              onClick={nextImg} 
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <ChevronRight size={14} />
            </button>
            <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
              {currentImgIndex + 1}/{imgList.length}
            </span>
          </>
        )}
        <span style={{ position: 'absolute', top: '8px', left: '8px', background: prod.isPublished ? '#10b981' : '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
          {prod.isPublished ? 'Published' : 'Hidden'}
        </span>
      </div>

      <div className="manage-body" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>{categoryName}</span>
          <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>{prod.title || prod.name}</h4>
          
          <div className="flex justify-between items-center my-2">
            <span className="font-bold text-primary" style={{ fontSize: '1.15rem' }}>₹{prod.pricePerDay || prod.price}/day</span>
            <span className="text-xs text-muted" style={{ fontSize: '0.75rem' }}>Deposit: ₹{prod.securityDeposit || 0}</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', margin: '8px 0' }}>
            <span>Qty: <strong>{prod.availableQuantity || prod.quantity || 1}</strong></span>
            <span>Cond: <strong>{prod.condition || 'new'}</strong></span>
            <span style={{ gridColumn: 'span 2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Loc: <strong>{prod.location || 'Unknown'}</strong></span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-surface" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <div className="flex justify-between items-center">
            <span className={`badge ${prod.availability ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
              {prod.availability ? 'Available' : 'Rented Out'}
            </span>
            <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
              <Star size={11} fill="#f59e0b" color="#f59e0b" /> {prod.rating || '4.8'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '6px' }} onClick={() => onEdit(prod)} title="Edit">
              <Edit2 size={12} /> Edit
            </button>
            <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '6px' }} onClick={() => onTogglePublish(prod)}>
              {prod.isPublished ? 'Hide' : 'Publish'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <Link to={`/products/${prod._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }} title="View details">
              <Eye size={12} style={{ marginRight: '4px' }} /> Details
            </Link>
            <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }} onClick={() => onDuplicate(prod)} title="Duplicate">
              <Copy size={12} />
            </button>
            <button type="button" className="btn btn-danger btn-sm" style={{ padding: '6px 12px' }} onClick={() => onDelete(prod._id)} title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PartnerProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // all, published, hidden, rented
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, search, selectedCategory, statusTab]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchMyProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (e) {
      toast.error('Failed to load your products inventory catalog.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let temp = [...products];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      temp = temp.filter(p => 
        (p.title || p.name || '').toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      temp = temp.filter(p => {
        const catName = p.category?.name || p.category || '';
        return catName === selectedCategory;
      });
    }

    // Status Tab filter
    if (statusTab === 'published') {
      temp = temp.filter(p => p.isPublished);
    } else if (statusTab === 'hidden') {
      temp = temp.filter(p => !p.isPublished);
    } else if (statusTab === 'rented') {
      temp = temp.filter(p => !p.availability);
    }

    setFilteredProducts(temp);
  };

  const handleEdit = (prod) => {
    navigate(`/partner/products/edit/${prod._id}`);
  };

  const handleTogglePublish = async (prod) => {
    try {
      const updated = await updateProductStatus(prod._id);
      if (updated) {
        toast.success(`Product is now ${updated.isPublished ? 'published' : 'hidden'}.`);
        loadProducts();
      }
    } catch (err) {
      toast.error('Failed to update listing status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product listing? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product: ' + err.message);
    }
  };

  const handleDuplicate = async (prod) => {
    try {
      const duplicatePayload = {
        title: `${prod.title || prod.name} (Copy)`,
        category: prod.category?.name || prod.category || 'Electronics & Tech',
        description: prod.description || 'No description provided.',
        pricePerDay: prod.pricePerDay || prod.price || 100,
        securityDeposit: prod.securityDeposit || prod.deposit || 0,
        lateFee: prod.lateFee || 10,
        availableQuantity: prod.availableQuantity || prod.quantity || 1,
        condition: prod.condition || 'new',
        location: prod.location || 'Bangalore, Karnataka',
        images: prod.images || [],
        availability: true,
      };

      const newProd = await createProduct(duplicatePayload);
      if (newProd) {
        toast.success('Listing duplicated successfully!');
        loadProducts();
      }
    } catch (err) {
      toast.error('Failed to duplicate listing: ' + err.message);
    }
  };

  // Get unique categories list
  const categoriesList = Array.from(new Set(products.map(p => p.category?.name || p.category || 'Equipment')));

  return (
    <div className="app-container">
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        <VendorSidebar />
        
        <main style={{ flex: 1, padding: '32px', background: 'var(--bg-color)', overflowY: 'auto' }}>
          <div className="partner-dash-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Title & Action button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0 }}>My Rental Catalog</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  Manage your rental inventory listings, verify available stock, prices, and configure images.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/partner/products/add')}>
                <Plus size={16} style={{ marginRight: '6px' }} /> Add Product
              </button>
            </div>

            {/* Filter controls panel */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search listings name or description..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  style={{ paddingLeft: '36px', width: '100%' }}
                />
              </div>

              {/* Category selector dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">All Categories</option>
                  {categoriesList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Status tab selectors */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>
              <button 
                type="button" 
                onClick={() => setStatusTab('all')} 
                className={`vendor-tab-btn ${statusTab === 'all' ? 'active' : ''}`}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: statusTab === 'all' ? 'var(--primary-gradient)' : 'transparent', color: statusTab === 'all' ? 'white' : 'var(--text-secondary)' }}
              >
                All Listings ({products.length})
              </button>
              <button 
                type="button" 
                onClick={() => setStatusTab('published')} 
                className={`vendor-tab-btn ${statusTab === 'published' ? 'active' : ''}`}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: statusTab === 'published' ? 'var(--primary-gradient)' : 'transparent', color: statusTab === 'published' ? 'white' : 'var(--text-secondary)' }}
              >
                Published ({products.filter(p => p.isPublished).length})
              </button>
              <button 
                type="button" 
                onClick={() => setStatusTab('hidden')} 
                className={`vendor-tab-btn ${statusTab === 'hidden' ? 'active' : ''}`}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: statusTab === 'hidden' ? 'var(--primary-gradient)' : 'transparent', color: statusTab === 'hidden' ? 'white' : 'var(--text-secondary)' }}
              >
                Hidden ({products.filter(p => !p.isPublished).length})
              </button>
              <button 
                type="button" 
                onClick={() => setStatusTab('rented')} 
                className={`vendor-tab-btn ${statusTab === 'rented' ? 'active' : ''}`}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: statusTab === 'rented' ? 'var(--primary-gradient)' : 'transparent', color: statusTab === 'rented' ? 'white' : 'var(--text-secondary)' }}
              >
                Rented Out ({products.filter(p => !p.availability).length})
              </button>
            </div>

            {/* List products grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                <div className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
                <div className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
                <div className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Package size={48} style={{ color: 'var(--text-muted)' }} />
                <h3>No Equipment Found</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Create a new product listing or adjust your search filters.</p>
                <button className="btn btn-primary" onClick={() => navigate('/partner/products/add')}>
                  <Plus size={16} /> Add Product
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {filteredProducts.map((p) => (
                  <PartnerProductCard 
                    key={p._id} 
                    prod={p} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete}
                    onTogglePublish={handleTogglePublish}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PartnerProducts;
