import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ChooseAccount.css';

const ChooseAccount = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/register?type=${role}`);
  };

  return (
    <div className="choose-account-container">
      <div className="choose-card-wrapper">
        <div className="choose-header">
          <h2>Select Account Type</h2>
          <p>Please select your role on RentSphere to register the correct account profile</p>
        </div>

        <div className="account-options-grid">
          {/* Customer Choice */}
          <div className="account-option-card" onClick={() => handleSelect('customer')}>
            <span className="option-icon">🛒</span>
            <h3>Customer Account</h3>
            <p>I want to rent equipment, cars, tools, gadgets, or clothing from verified vendors for my projects or events.</p>
            <button className="btn-filled" style={{ width: '100%' }}>
              Register as Customer
            </button>
          </div>

          {/* Vendor Choice */}
          <div className="account-option-card" onClick={() => handleSelect('vendor')}>
            <span className="option-icon">🏢</span>
            <h3>Vendor Business Account</h3>
            <p>I want to list my product inventory, manage renting schedules, handle invoice billing, and earn passive revenue.</p>
            <button className="btn-outline" style={{ width: '100%' }}>
              Register as Vendor
            </button>
          </div>
        </div>

        <div className="choose-footer">
          Already have an account? <Link to="/login">Sign In here</Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseAccount;
