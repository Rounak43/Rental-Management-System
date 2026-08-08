import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => el.classList.add("show"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      {
        threshold: 0.05,
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const categories = [
    {
      name: "Vehicles",
      description: "Cars, bikes, scooters and EVs",
      image:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=85",
    },
    {
      name: "Gym",
      description: "Treadmills, dumbbells and home gym",
      image:
        "https://images.unsplash.com/photo-1576678927484-cc909957088c?auto=format&fit=crop&w=700&q=85",
    },
    {
      name: "Gaming",
      description: "PS5, Xbox, VR headsets and PCs",
      image:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=700&q=85",
    },
    {
      name: "Clothes",
      description: "Designer tuxedos, suits and dresses",
      image:
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=85",
    },
    {
      name: "Electronics",
      description: "MacBooks, cameras, drones and tech",
      image:
        "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=700&q=85",
    },
    {
      name: "Furniture",
      description: "Home sofas, chairs and office sets",
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85",
    },
    {
      name: "Tools",
      description: "Power tools and heavy machinery",
      image:
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=85",
    },
  ];

  const featuredProducts = [
    {
      id: "1",
      title: "Premium Sedan",
      category: "Vehicles",
      price: "₹1,499",
      period: "day",
      rating: "4.9",
      image:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "2",
      title: "MacBook Pro",
      category: "Electronics",
      price: "₹1,299",
      period: "day",
      rating: "4.8",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "3",
      title: "PlayStation 5",
      category: "Gaming",
      price: "₹499",
      period: "day",
      rating: "4.9",
      image:
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: "4",
      title: "Modern Sofa Set",
      category: "Furniture",
      price: "₹799",
      period: "day",
      rating: "4.7",
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    },
  ];

  const faqs = [
    {
      question: "What can I rent on RentSphere?",
      answer:
        "RentSphere is designed as an all-category rental marketplace. You can discover vehicles, electronics, gaming products, furniture, cameras, clothing, tools, sports equipment and many other products listed by verified vendors.",
    },
    {
      question: "How does renting work?",
      answer:
        "Browse the marketplace, select a product, choose your rental dates, review the rental price and security deposit, and confirm your booking. Depending on the vendor, you can choose delivery or pickup.",
    },
    {
      question: "Is a security deposit required?",
      answer:
        "A security deposit may be required depending on the product and vendor. The amount is displayed before you confirm the booking and is handled according to the rental agreement.",
    },
    {
      question: "Can I rent out my own products?",
      answer:
        "Yes. You can create a vendor account and list eligible products on RentSphere. Vendors can manage listings, rental requests, bookings and earnings through their dashboard.",
    },
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="rent-sphere">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-inner">

          <Link to="/" className="brand">
            <span className="brand-icon">R</span>
            <span>RentSphere</span>
          </Link>

          <nav className="nav-links">
            <a href="#home">Home</a>
            <Link to="/browse">Browse</Link>
            <a href="#categories">Categories</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="login-link">
              Log in
            </Link>

            <Link to="/choose-account" className="signup-button">
              Sign up
            </Link>
          </div>

        </div>
      </header>

      {/* HERO */}
      <section id="home" className="hero">

        <div className="hero-pattern"></div>

        <div className="hero-content reveal">

          <div className="eyebrow">
            <span className="eyebrow-line"></span>
            THE RENTAL MARKETPLACE
          </div>

          <h1>
            Anything you need.
            <br />
            <span>Rent it.</span>
          </h1>

          <p>
            From vehicles and electronics to furniture, gaming,
            clothing, cameras and more. Find what you need,
            rent it for as long as you need it, and return it when
            you're done.
          </p>

          <div className="hero-buttons">

            <Link to="/browse" className="primary-button">
              Explore Rentals
              <span>→</span>
            </Link>

            <Link
              to="/choose-account?type=vendor"
              className="outline-button"
            >
              List Your Product
            </Link>

          </div>

          <div className="hero-features">

            <div>
              <strong>10K+</strong>
              <span>Rentals completed</span>
            </div>

            <div className="feature-divider"></div>

            <div>
              <strong>500+</strong>
              <span>Verified vendors</span>
            </div>

            <div className="feature-divider"></div>

            <div>
              <strong>850+</strong>
              <span>Products available</span>
            </div>

          </div>

        </div>

        <div className="hero-visual reveal">

          <div className="hero-image-main">

            <img
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=90"
              alt="People using rental products"
            />

            <div className="hero-image-overlay">
              <span>RENT FOR YOUR NEXT PROJECT</span>
              <h3>Don't buy it. Rent it.</h3>
            </div>

          </div>

          <div className="floating-product-card floating-one">

            <div className="floating-product-image">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80"
                alt="Laptop"
              />
            </div>

            <div>
              <strong>Electronics</strong>
              <span>Available to rent</span>
            </div>

          </div>

          <div className="floating-product-card floating-two">

            <div className="floating-product-image">
              <img
                src="https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=200&q=80"
                alt="Car"
              />
            </div>

            <div>
              <strong>Vehicles</strong>
              <span>Starting from ₹999/day</span>
            </div>

          </div>

        </div>

      </section>

      {/* CATEGORY SECTION */}
      <section id="categories" className="section categories-section">

        <div className="section-heading reveal">

          <span>EXPLORE CATEGORIES</span>

          <h2>
            One marketplace.
            <br />
            <strong>Endless possibilities.</strong>
          </h2>

          <p>
            Whatever you need, there's a good chance you can rent it.
            Explore products from everyday essentials to special-event equipment.
          </p>

        </div>

        <div className="category-grid">

          {categories.map((category, index) => (

            <div
              key={category.name}
              className="category-card reveal"
              style={{
                animationDelay: `${index * 70}ms`,
              }}
              onClick={() =>
                navigate(
                  `/browse?category=${encodeURIComponent(category.name)}`
                )
              }
            >

              <div className="category-image">

                <img
                  src={category.image}
                  alt={category.name}
                />

                <div className="category-overlay"></div>

                <span className="category-arrow">↗</span>

              </div>

              <div className="category-info">

                <h3>{category.name}</h3>

                <p>{category.description}</p>

              </div>

            </div>

          ))}

        </div>

        <div className="category-button-wrapper reveal">

          <Link to="/browse" className="outline-button">
            View All Categories →
          </Link>

        </div>

      </section>

      {/* TRENDING PRODUCTS */}
      <section className="products-section">

        <div className="section product-section-inner">

          <div className="products-heading reveal">

            <div>
              <span>POPULAR RENTALS</span>

              <h2>
                What people are
                <strong> renting.</strong>
              </h2>
            </div>

            <Link to="/browse" className="view-link">
              Browse everything →
            </Link>

          </div>

          <div className="products-grid">

            {featuredProducts.map((product, index) => (

              <div
                className="product-card reveal"
                key={product.id}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >

                <Link
                  to={`/products/${product.id}`}
                  className="product-image"
                >

                  <img
                    src={product.image}
                    alt={product.title}
                  />

                  <span className="product-category">
                    {product.category}
                  </span>

                </Link>

                <div className="product-details">

                  <div className="product-rating">
                    ★ {product.rating}
                    <span>Verified vendor</span>
                  </div>

                  <h3>{product.title}</h3>

                  <div className="product-bottom">

                    <div className="product-price">
                      {product.price}
                      <span>/{product.period}</span>
                    </div>

                    <Link
                      to={`/products/${product.id}`}
                      className="rent-button"
                    >
                      Rent
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section how-section">

        <div className="section-heading reveal">

          <span>HOW IT WORKS</span>

          <h2>
            Renting is
            <strong> simple.</strong>
          </h2>

          <p>
            No complicated process. Find the item, choose your dates,
            make your booking and enjoy it.
          </p>

        </div>

        <div className="steps">

          <div className="step reveal">

            <div className="step-number">01</div>

            <div className="step-content">
              <h3>Find what you need</h3>

              <p>
                Search across multiple categories and discover
                products from trusted vendors.
              </p>
            </div>

          </div>

          <div className="step-connector"></div>

          <div className="step reveal">

            <div className="step-number">02</div>

            <div className="step-content">
              <h3>Choose your dates</h3>

              <p>
                Select how long you need the product and review
                the rental price and applicable deposit.
              </p>
            </div>

          </div>

          <div className="step-connector"></div>

          <div className="step reveal">

            <div className="step-number">03</div>

            <div className="step-content">
              <h3>Rent and enjoy</h3>

              <p>
                Complete your booking, receive the product and
                return it when your rental period ends.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* STATS */}
      <section className="stats">

        <div className="stats-inner">

          <div className="stat">
            <strong>10K+</strong>
            <span>Successful rentals</span>
          </div>

          <div className="stat">
            <strong>500+</strong>
            <span>Verified vendors</span>
          </div>

          <div className="stat">
            <strong>850+</strong>
            <span>Products listed</span>
          </div>

          <div className="stat">
            <strong>99.8%</strong>
            <span>Customer satisfaction</span>
          </div>

        </div>

      </section>

      {/* FAQ */}
      <section id="faq" className="section faq-section">

        <div className="faq-layout">

          <div className="faq-intro reveal">

            <span>HELP CENTER</span>

            <h2>
              Questions?
              <strong> We've got answers.</strong>
            </h2>

            <p>
              Learn more about renting products, deposits,
              vendors and how RentSphere works.
            </p>

            <Link to="/browse" className="primary-button">
              Start Browsing
              <span>→</span>
            </Link>

          </div>

          <div className="faq-list">

            {faqs.map((faq, index) => (

              <div
                className={`faq-item ${activeFaq === index ? "active" : ""
                  } reveal`}
                key={index}
              >

                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >

                  <span>{faq.question}</span>

                  <span className="faq-plus">
                    {activeFaq === index ? "−" : "+"}
                  </span>

                </button>

                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* VENDOR CTA */}
      <section className="vendor-cta">

        <div className="vendor-cta-content reveal">

          <span>FOR PRODUCT OWNERS</span>

          <h2>
            Have something
            <strong> worth renting?</strong>
          </h2>

          <p>
            Turn unused products into income. List your items on
            RentSphere and connect with people who need them.
          </p>

          <Link
            to="/choose-account?type=vendor"
            className="white-button"
          >
            Become a Vendor →
          </Link>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-inner">

          <div className="footer-brand">

            <Link to="/" className="brand footer-logo">
              <span className="brand-icon">R</span>
              <span>RentSphere</span>
            </Link>

            <p>
              A simple marketplace where you can rent
              the things you need without buying them.
            </p>

          </div>

          <div className="footer-column">

            <h4>Marketplace</h4>

            <Link to="/browse">Browse Rentals</Link>
            <a href="#categories">Categories</a>
            <a href="#how-it-works">How It Works</a>

          </div>

          <div className="footer-column">

            <h4>Account</h4>

            <Link to="/login">Log In</Link>
            <Link to="/choose-account">Create Account</Link>
            <Link to="/choose-account?type=vendor">
              Become a Vendor
            </Link>

          </div>

          <div className="footer-column">

            <h4>Support</h4>

            <a href="#faq">FAQ</a>
            <a href="#faq">Privacy Policy</a>
            <a href="#faq">Terms of Use</a>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © {new Date().getFullYear()} RentSphere. All rights reserved.
          </span>

          <span>
            Rent smarter. Buy less.
          </span>

        </div>

      </footer>

    </div>
  );
};

export default Landing;