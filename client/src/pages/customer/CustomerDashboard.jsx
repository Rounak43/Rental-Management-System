import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getCategories } from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import './CustomerDashboard.css';

// ── Skeleton card ──
const SkeletonCard = () => (
  <div className="cd-skeleton">
    <div className="cd-skeleton-img" />
    <div className="cd-skeleton-body">
      <div className="cd-skeleton-line short" />
      <div className="cd-skeleton-line medium" />
      <div className="cd-skeleton-line short" />
    </div>
  </div>
);

// ── Product card ──
const ProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const firstImage = product.images?.[0];
  const categoryName =
    typeof product.category === 'object' ? product.category?.name : product.category;

  return (
    <div className="cd-product-card">
      <div className="cd-product-image">
        {firstImage ? (
          <img src={firstImage} alt={product.title} loading="lazy" />
        ) : (
          <div className="cd-product-image-placeholder">📦</div>
        )}
        <span className={`cd-product-badge ${!product.availability ? 'unavailable' : ''}`}>
          {product.availability ? 'Available' : 'Rented Out'}
        </span>
        <button
          className="cd-wishlist-btn"
          onClick={() => setWishlisted((w) => !w)}
          title="Add to wishlist"
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="cd-product-info">
        {categoryName && <div className="cd-product-cat">{categoryName}</div>}
        <div className="cd-product-title">{product.title}</div>
        {product.location && (
          <div className="cd-product-location">📍 {product.location}</div>
        )}
        <div className="cd-product-bottom">
          <div className="cd-product-price">
            ₹{product.pricePerDay?.toLocaleString()}
            <span>/day</span>
          </div>
          {product.availability ? (
            <Link to={`/products/${product._id}`} className="cd-rent-btn">
              Rent Now
            </Link>
          ) : (
            <span className="cd-rent-btn disabled">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ──
const CustomerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    availability: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    location: '',
  });
  const [pendingFilters, setPendingFilters] = useState({ ...filters });
  const [page, setPage] = useState(1);

  // Load categories once
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Load products when filters / page change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.append('category', activeCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.location) params.append('location', filters.location);
      params.append('page', page);
      params.append('limit', 12);

      // productService.getProducts doesn't accept params yet — call api directly
      const { default: api } = await import('../../services/api');
      const res = await api.get(`/products?${params.toString()}`);
      const data = res.data;

      setProducts(Array.isArray(data.products) ? data.products : []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, filters, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId === activeCategory ? '' : catId);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters({ ...pendingFilters });
    setPage(1);
  };

  const resetFilters = () => {
    const blank = { availability: '', condition: '', minPrice: '', maxPrice: '', location: '' };
    setFilters(blank);
    setPendingFilters(blank);
    setActiveCategory('');
    setSearchQuery('');
    setPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="cd-root">

      {/* ── NAVBAR ── */}
      <nav className="cd-navbar">
        <Link to="/" className="cd-nav-brand">
          <span className="cd-nav-brand-icon">R</span>
          RentSphere
        </Link>

        <div className="cd-nav-search">
          <form onSubmit={handleSearch}>
            <span className="cd-nav-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for products, brands, categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="cd-nav-actions">
          <Link to="/wishlist" className="cd-nav-btn" title="Wishlist">♡</Link>
          <Link to="/cart" className="cd-nav-btn" title="Cart">🛒</Link>
          <Link to="/orders" className="cd-nav-btn" title="My Rentals">📋</Link>
          <button className="cd-nav-user" onClick={handleLogout} title="Logout">
            <div className="cd-nav-avatar">{userInitials}</div>
            <span className="cd-nav-user-name">{user?.name?.split(' ')[0] || 'Me'}</span>
          </button>
        </div>
      </nav>

      {/* ── CATEGORY BAR ── */}
      <div className="cd-cat-bar">
        <div className="cd-cat-inner">
          <button
            className={`cd-cat-chip ${activeCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`cd-cat-chip ${activeCategory === cat._id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="cd-body">

        {/* ── FILTER SIDEBAR ── */}
        <aside className="cd-sidebar">
          <div className="cd-filter-card">
            <div className="cd-filter-title">
              Filters
              <button className="cd-filter-reset" onClick={resetFilters}>
                Reset All
              </button>
            </div>

            {/* Location */}
            <div className="cd-filter-group">
              <div className="cd-filter-group-label">Location</div>
              <input
                type="text"
                name="location"
                placeholder="City or area…"
                value={pendingFilters.location}
                onChange={handleFilterChange}
              />
            </div>

            {/* Price */}
            <div className="cd-filter-group">
              <div className="cd-filter-group-label">Price per Day (₹)</div>
              <div className="cd-filter-price-row">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={pendingFilters.minPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={pendingFilters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="cd-filter-group">
              <div className="cd-filter-group-label">Availability</div>
              <div className="cd-filter-radio">
                <label>
                  <input
                    type="radio"
                    name="availability"
                    value=""
                    checked={pendingFilters.availability === ''}
                    onChange={handleFilterChange}
                  />
                  All Products
                </label>
                <label>
                  <input
                    type="radio"
                    name="availability"
                    value="true"
                    checked={pendingFilters.availability === 'true'}
                    onChange={handleFilterChange}
                  />
                  Available Only
                </label>
              </div>
            </div>

            {/* Condition */}
            <div className="cd-filter-group">
              <div className="cd-filter-group-label">Condition</div>
              <select
                name="condition"
                value={pendingFilters.condition}
                onChange={handleFilterChange}
              >
                <option value="">Any Condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <button className="cd-apply-btn" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </aside>

        {/* ── PRODUCT GRID ── */}
        <main className="cd-main">
          <div className="cd-results-bar">
            <span className="cd-results-count">
              {loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''} found`}
            </span>
            <select className="cd-sort-select" disabled>
              <option>Sort: Newest First</option>
            </select>
          </div>

          <div className="cd-products-grid">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="cd-empty-state">
                <div className="cd-empty-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="cd-empty-state">
                <div className="cd-empty-icon">📭</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query.</p>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="cd-pagination">
              <button
                className="cd-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`cd-page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="cd-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default CustomerDashboard;
