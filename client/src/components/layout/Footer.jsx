import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, PhoneCall, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-highlights">
        <div className="highlight-item">
          <ShieldCheck size={28} className="highlight-icon" />
          <div>
            <h4>Verified Vendors</h4>
            <p>100% inspected items with deposit safety</p>
          </div>
        </div>
        <div className="highlight-item">
          <Truck size={28} className="highlight-icon" />
          <div>
            <h4>Doorstep Delivery</h4>
            <p>Fast pickup & drop delivery options</p>
          </div>
        </div>
        <div className="highlight-item">
          <RefreshCw size={28} className="highlight-icon" />
          <div>
            <h4>Easy Returns</h4>
            <p>Hassle-free return request scheduling</p>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <div className="brand-icon">
            <ShoppingBag size={22} color="#fff" />
          </div>
          <span className="brand-title">RentalHub</span>
          <p className="footer-desc">
            The premier equipment and product rental marketplace for electronics, cameras, tools, and heavy machinery.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore Catalog</h4>
          <Link to="/products?category=electronics">Electronics</Link>
          <Link to="/products?category=cameras">Cameras & Photography</Link>
          <Link to="/products?category=vehicles">Vehicles & Bikes</Link>
          <Link to="/products?category=tools">Tools & Machinery</Link>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">Active Rental Cart</Link>
          <Link to="/wishlist">Saved Items</Link>
          <Link to="/settings">Account Settings</Link>
        </div>

        <div className="footer-col">
          <h4>Partner Network</h4>
          <Link to="/partner/login">Become a Vendor</Link>
          <Link to="/partner/dashboard">Vendor Portal</Link>
          <Link to="/partner/settings">Partner Settings</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RentalHub System. All rights reserved.</p>
        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security & Deposit Protection</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
