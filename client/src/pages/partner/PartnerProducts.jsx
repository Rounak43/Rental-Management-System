import React, { useState, useEffect } from 'react';
import { fetchMyProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Package, DollarSign, ShieldCheck, Image as ImageIcon, X, Sliders } from 'lucide-react';
import './PartnerDashboard.css';

const PartnerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    pricePerDay: '',
    securityDeposit: '',
    description: '',
    availability: true,
    image: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchMyProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([
          {
            _id: 'p1',
            title: 'Sony Alpha A7 IV Camera Kit',
            pricePerDay: 85,
            securityDeposit: 300,
            availability: true,
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
          },
          {
            _id: 'p2',
            title: 'RED V-Raptor 8K Cinema Camera',
            pricePerDay: 280,
            securityDeposit: 1200,
            availability: true,
            image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
          },
        ]);
      }
    } catch (e) {
      setProducts([
        {
          _id: 'p1',
          title: 'Sony Alpha A7 IV Camera Kit',
          pricePerDay: 85,
          securityDeposit: 300,
          availability: true,
          image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      category: '',
      pricePerDay: '',
      securityDeposit: '',
      description: '',
      availability: true,
      image: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title || prod.name || '',
      category: prod.category?.name || '',
      pricePerDay: prod.pricePerDay || prod.price || '',
      securityDeposit: prod.securityDeposit || prod.deposit || '',
      description: prod.description || '',
      availability: prod.availability ?? true,
      image: prod.image || prod.images?.[0] || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product from your vendor catalog?')) {
      try {
        await deleteProduct(id);
        toast.info('Product deleted successfully');
        setProducts(products.filter((p) => p._id !== id));
      } catch (e) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.pricePerDay) {
      toast.error('Product title and daily price are required');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        toast.success('Product updated!');
        setProducts(products.map((p) => (p._id === editingProduct._id ? { ...p, ...formData } : p)));
      } else {
        const created = await createProduct(formData);
        toast.success('Product created!');
        setProducts([{ _id: created._id || `p_${Date.now()}`, ...formData }, ...products]);
      }
      setShowModal(false);
    } catch (err) {
      toast.error('Error saving product');
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="partner-dash-wrapper">
        <div className="partner-dash-container">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2>Vendor Equipment Inventory</h2>
              <p className="text-muted">Manage equipment catalog, rates, security deposit, and availability</p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus size={18} /> Add New Equipment
            </button>
          </div>

          <div className="grid-3">
            {products.map((prod) => (
              <div key={prod._id} className="glass-card product-manage-card">
                <img src={prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'} alt="Item" className="manage-img" />
                <div className="manage-body">
                  <h4>{prod.title || prod.name}</h4>
                  <div className="flex justify-between items-center my-2">
                    <span className="font-bold text-primary">₹{prod.pricePerDay || prod.price}/day</span>
                    <span className="text-xs text-muted">Deposit: ₹{prod.securityDeposit || prod.deposit}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-surface">
                    <span className={`badge ${prod.availability ? 'badge-success' : 'badge-danger'}`}>
                      {prod.availability ? 'Active Available' : 'Rented Out'}
                    </span>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(prod)}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(prod._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Equipment Listing' : 'Add New Equipment'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body flex-col gap-3 mt-4">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Vehicles">Vehicles (Cars & Bikes)</option>
                  <option value="Gym">Gym & Fitness</option>
                  <option value="Gaming">Gaming & Consoles</option>
                  <option value="Clothes">Clothes & Fashion</option>
                  <option value="Electronics">Electronics & Tech</option>
                  <option value="Furniture">Furniture & Home</option>
                  <option value="Tools">Tools & Machinery</option>
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Daily Rental Rate (₹/day) *</label>
                  <input
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    placeholder="899"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    placeholder="3000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group">
                <label>Description & Specs</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features, included accessories, and rental terms..."
                />
              </div>

              <div className="form-group">
                <label className="toggle-container">
                  <span>Available for Lease Immediately</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    />
                    <span className="slider" />
                  </label>
                </label>
              </div>

              <div className="modal-footer flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Listing'}
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

export default PartnerProducts;
