import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, X } from 'lucide-react';
import './ProductBrowse.css';

const MOCK_FALLBACK_PRODUCTS = [
  {
    _id: 'prod_veh1',
    title: 'BMW 5 Series Luxury Sedan 2024 (Auto)',
    category: { name: 'Vehicles' },
    pricePerDay: 2499,
    securityDeposit: 10000,
    availability: true,
    rating: 4.9,
    reviewsCount: 45,
    images: ['https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod_veh2',
    title: 'Royal Enfield Himalayan 450 Adventure Bike',
    category: { name: 'Vehicles' },
    pricePerDay: 899,
    securityDeposit: 3000,
    availability: true,
    rating: 4.8,
    reviewsCount: 32,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod_gym1',
    title: 'Commercial Heavy Duty Motorized Treadmill 4.0 HP',
    category: { name: 'Gym' },
    pricePerDay: 599,
    securityDeposit: 2500,
    availability: true,
    rating: 4.9,
    reviewsCount: 27,
    images: ['https://images.unsplash.com/photo-1576678927484-cc909957088c?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod_gym2',
    title: 'Bowflex SelectTech Adjustable Dumbbells (5-52 lbs)',
    category: { name: 'Gym' },
    pricePerDay: 299,
    securityDeposit: 1200,
    availability: true,
    rating: 4.8,
    reviewsCount: 51,
    images: ['https://images.unsplash.com/photo-1638558010764-9225786792c2?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod_game1',
    title: 'Sony PlayStation 5 Console + 2 DualSense Controllers',
    category: { name: 'Gaming' },
    pricePerDay: 499,
    securityDeposit: 2000,
    availability: true,
    rating: 4.9,
    reviewsCount: 64,
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod_game2',
    title: 'Meta Quest 3 All-in-One VR Headset 512GB',
    category: { name: 'Gaming' },
    pricePerDay: 450,
    securityDeposit: 1800,
    availability: true,
    rating: 4.8,
    reviewsCount: 39,
    images: ['https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod_cloth1',
    title: 'Designer Italian Slim-Fit Tuxedo Suit (Black Tie Event)',
    category: { name: 'Clothes' },
    pricePerDay: 799,
    securityDeposit: 3000,
    availability: true,
    rating: 4.9,
    reviewsCount: 22,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod_cloth2',
    title: 'Luxury Designer Silk Evening Party Dress',
    category: { name: 'Clothes' },
    pricePerDay: 899,
    securityDeposit: 3500,
    availability: true,
    rating: 4.8,
    reviewsCount: 18,
    images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod1',
    title: 'Sony Alpha A7 IV Mirrorless Camera + 24-70mm GM Lens',
    category: { name: 'Electronics' },
    pricePerDay: 999,
    securityDeposit: 4000,
    availability: true,
    rating: 4.9,
    reviewsCount: 38,
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod2',
    title: 'Apple MacBook Pro 16" M3 Max 36GB RAM 1TB SSD',
    category: { name: 'Electronics' },
    pricePerDay: 1299,
    securityDeposit: 5000,
    availability: true,
    rating: 5.0,
    reviewsCount: 42,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod3',
    title: 'DJI Mavic 3 Pro Drone Combo 4K Hasselblad',
    category: { name: 'Electronics' },
    pricePerDay: 899,
    securityDeposit: 3500,
    availability: true,
    rating: 4.8,
    reviewsCount: 19,
    images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod_furn1',
    title: 'Herman Miller Aeron Ergonomic Executive Chair',
    category: { name: 'Furniture' },
    pricePerDay: 399,
    securityDeposit: 1500,
    availability: true,
    rating: 4.9,
    reviewsCount: 31,
    images: ['https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=600&auto=format&fit=crop&q=80']
  },
  {
    _id: 'prod5',
    title: 'DeWalt 20V Max XR Brushless Power Tool Set',
    category: { name: 'Tools' },
    pricePerDay: 349,
    securityDeposit: 1200,
    availability: true,
    rating: 4.7,
    reviewsCount: 29,
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80']
  }
];

const ProductBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCat = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCat);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('newest');

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter, availabilityOnly, maxPrice, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        search: searchQuery,
        category: categoryFilter,
        availability: availabilityOnly ? 'true' : undefined,
        maxPrice,
      });

      if (data?.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        // Fallback filter over mock catalog
        let filtered = MOCK_FALLBACK_PRODUCTS.filter((p) => {
          const matchQuery =
            !searchQuery ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchCat =
            !categoryFilter || p.category.name.toLowerCase() === categoryFilter.toLowerCase();
          const matchAvail = !availabilityOnly || p.availability === true;
          const matchPrice = p.pricePerDay <= maxPrice;
          return matchQuery && matchCat && matchAvail && matchPrice;
        });

        if (sortBy === 'price-low') filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
        if (sortBy === 'price-high') filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
        if (sortBy === 'popular') filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);

        setProducts(filtered);
      }
    } catch (err) {
      console.warn('API fetch warning, using client fallback:', err);
      setProducts(MOCK_FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setAvailabilityOnly(false);
    setMaxPrice(5000);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="browse-page-wrapper">
        <div className="browse-container">
          <div className="browse-header">
            <h2>Rental Equipment Catalog</h2>
            <p>Browse verified equipment, vehicles, tools, and tech for temporary lease</p>
          </div>

          <div className="browse-layout">
            {/* Filter Sidebar */}
            <aside className="filter-sidebar glass-card">
              <div className="filter-title-box">
                <span className="flex items-center gap-2 font-bold"><SlidersHorizontal size={18} /> Filters</span>
                <button onClick={clearFilters} className="clear-btn">Clear All</button>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label>Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="Vehicles">Vehicles (Cars & Bikes)</option>
                  <option value="Gym">Gym & Fitness</option>
                  <option value="Gaming">Gaming & Consoles</option>
                  <option value="Clothes">Clothes & Fashion</option>
                  <option value="Electronics">Electronics & Tech</option>
                  <option value="Furniture">Furniture & Home</option>
                  <option value="Tools">Tools & Machinery</option>
                </select>
              </div>

              {/* Price Range Slider */}
              <div className="filter-group">
                <div className="flex justify-between">
                  <label>Max Daily Rate</label>
                  <span className="price-val">₹{maxPrice}/day</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>

              {/* Availability Filter Toggle */}
              <div className="filter-group">
                <label className="toggle-container">
                  <span className="text-sm font-semibold">Available Now Only</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={availabilityOnly}
                      onChange={(e) => setAvailabilityOnly(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </label>
              </div>
            </aside>

            {/* Catalog Main Content */}
            <main className="catalog-main">
              {/* Search & Sort Controls Bar */}
              <div className="catalog-controls glass-card">
                <div className="search-input-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by equipment title or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="sort-box">
                  <ArrowUpDown size={16} />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Sort by: Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Results Grid */}
              {loading ? (
                <div className="grid-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="skeleton" style={{ height: '320px', borderRadius: '16px' }} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="empty-catalog glass-card">
                  <Search size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                  <h3>No Equipment Found</h3>
                  <p>Try adjusting your search criteria or resetting filters.</p>
                  <button className="btn btn-primary mt-4" onClick={clearFilters}>
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                <div className="grid-3">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductBrowse;
