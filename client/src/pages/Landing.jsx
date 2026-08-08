import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const categories = [
    { name: 'Cars & Bikes', icon: '🚗', count: '120+ Products' },
    { name: 'Laptops & Computers', icon: '💻', count: '85+ Products' },
    { name: 'Cameras & Lenses', icon: '📷', count: '64+ Products' },
    { name: 'Gaming Consoles', icon: '🎮', count: '42+ Products' },
    { name: 'Home Furniture', icon: '🛋️', count: '110+ Products' },
    { name: 'Tools & Equipment', icon: '🛠️', count: '95+ Products' },
  ];

  const featuredRentals = [
    {
      id: '1',
      title: 'Sony Alpha 7 IV Mirrorless Camera',
      category: 'Cameras',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
      price: '$45',
      period: 'day',
      rating: '4.9',
    },
    {
      id: '2',
      title: 'MacBook Pro 16" M3 Max (64GB)',
      category: 'Laptops',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
      price: '$79',
      period: 'day',
      rating: '4.8',
    },
    {
      id: '3',
      title: 'DJI Mavic 3 Pro Drone',
      category: 'Cameras',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
      price: '$55',
      period: 'day',
      rating: '4.9',
    },
  ];

  const faqs = [
    {
      question: 'How do I start renting on RentSphere?',
      answer: 'Simply sign up for a Customer Account, browse the catalog, select your dates, pay the security deposit, and book your rental item. You can choose home delivery or pickup from the vendor.',
    },
    {
      question: 'What is the security deposit for?',
      answer: 'The security deposit protects the vendor against damages or loss. It is held securely during the lease period and fully refunded back to your payment account within 24 hours of returning the product in good condition.',
    },
    {
      question: 'How are late fees calculated?',
      answer: 'If you fail to return the product by the rental end date, a daily late fee rate is charged. The default late fee rate is 1.5x the standard daily renting price for every day overdue.',
    },
    {
      question: 'How do I list my own products as a Vendor?',
      answer: 'Click the "Become a Vendor" button, sign up with your company name, GST registration parameters, and address details. Once verified, you can access your dashboard to post product listings and track agreements.',
    },
  ];

  return (
    <div className="landing-container">
      {/* Navbar Section */}
      <header className="landing-header">
        <div className="landing-nav">
          <div className="landing-logo">
            <span>🌐</span> RentSphere
          </div>
          <ul className="landing-nav-links">
            <li><a href="#hero">Home</a></li>
            <li><Link to="/browse">Browse Rentals</Link></li>
            <li><a href="#categories">Categories</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="landing-auth-buttons">
            <Link to="/login" className="btn-outline">Log In</Link>
            <Link to="/choose-account" className="btn-filled">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="landing-hero">
        <div className="hero-content">
          <h1>Rent Anything. <br /><span>Anytime. Anywhere.</span></h1>
          <p>Discover trusted rental products from verified vendors. Secure payments, flexible booking dates, and low security deposits.</p>
          <div className="hero-actions">
            <Link to="/browse" className="btn btn-filled">Browse Rentals</Link>
            <Link to="/choose-account?type=vendor" className="btn btn-outline">Become a Vendor</Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="categories" className="landing-section">
        <div className="section-header">
          <h2>Featured Categories</h2>
          <p>Explore our most popular rental categories and save money by renting instead of buying.</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <div key={idx} className="category-card" onClick={() => navigate(`/browse?category=${cat.name}`)}>
              <span className="category-icon">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rentals */}
      <section className="landing-section" style={{ backgroundColor: '#f1f5f9', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', paddingLeft: '50vw', paddingRight: '50vw' }}>
        <div className="landing-section">
          <div className="section-header">
            <h2>Trending Rentals</h2>
            <p>High-quality, verified gear ready for your next project or event.</p>
          </div>
          <div className="rentals-grid">
            {featuredRentals.map((item) => (
              <div key={item.id} className="rental-item-card">
                <div className="rental-image" style={{ backgroundImage: `url(${item.image})` }}>
                  <span className="rental-badge">{item.category}</span>
                </div>
                <div className="rental-info">
                  <h3>{item.title}</h3>
                  <div className="rental-meta">
                    <span>⭐ {item.rating}</span>
                    <span>Verified Vendor</span>
                  </div>
                  <div className="rental-price-section">
                    <div className="rental-price">
                      {item.price}<span>/{item.period}</span>
                    </div>
                    <Link to={`/products/${item.id}`} className="btn-filled" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '6px' }}>
                      Rent Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="landing-section">
        <div className="section-header">
          <h2>How RentSphere Works</h2>
          <p>Renting on our platform is quick, verified, and completely secure.</p>
        </div>
        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Browse & Choose</h3>
            <p>Find the product you need from our verified catalog and enter your lease booking start and end dates.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Book & Pay</h3>
            <p>Confirm the booking by securely paying the rental rate and security deposit using our integrated gateway.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Use & Return</h3>
            <p>Get the product delivered or pick it up. Return it when finished to receive your security deposit refund.</p>
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      <section className="stats-banner">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">10k+</div>
            <div className="stat-label">Successful Rentals</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Verified Vendors</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.8%</div>
            <div className="stat-label">Customer Satisfaction</div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Got questions? We have got answers to the most common queries.</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <div className="faq-question" onClick={() => toggleFaq(idx)}>
                <span>{faq.question}</span>
                <span>{activeFaq === idx ? '▲' : '▼'}</span>
              </div>
              {activeFaq === idx && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Become a Vendor CTA */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Earn Money on RentSphere</h2>
          <p>Have equipment, electronics, or gear lying around? List your products and start earning passive income today as a verified vendor.</p>
          <Link to="/choose-account?type=vendor" className="btn btn-filled" style={{ padding: '0.85rem 2.5rem' }}>
            Start Earning Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>RentSphere</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6' }}>Everything You Need. Ready to Rent. Decoupling rental needs and inventory listings securely.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/browse">Browse Products</Link></li>
              <li><Link to="/choose-account">Register Account</Link></li>
              <li><Link to="/login">Member Login</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#faq">Terms of Use</a></li>
              <li><a href="#faq">Privacy Policy</a></li>
              <li><a href="#faq">Refund Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RentSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
