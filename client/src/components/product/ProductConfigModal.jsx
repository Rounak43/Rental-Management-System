import React, { useState } from 'react';
import { X, Check, ShieldCheck, Cpu, HardDrive, Palette, Package, Wrench } from 'lucide-react';
import './ProductConfigModal.css';

const DEFAULT_CONFIG_OPTIONS = {
  ram: [
    { label: '16GB DDR5', extraPrice: 0 },
    { label: '32GB DDR5 (+ $15/day)', extraPrice: 15 },
    { label: '64GB DDR5 (+ $30/day)', extraPrice: 30 },
  ],
  storage: [
    { label: '512GB NVMe SSD', extraPrice: 0 },
    { label: '1TB High-Speed SSD (+ $10/day)', extraPrice: 10 },
    { label: '2TB High-Speed SSD (+ $22/day)', extraPrice: 22 },
  ],
  color: [
    { label: 'Space Black', extraPrice: 0 },
    { label: 'Silver Titanium', extraPrice: 0 },
  ],
  accessories: [
    { label: 'Heavy-Duty Waterproof Carry Case', extraPrice: 8 },
    { label: 'Extra Dual-Rechargeable Battery Pack', extraPrice: 12 },
    { label: 'Professional Carbon Fiber Tripod Stand', extraPrice: 15 },
  ],
  protection: [
    { label: 'Standard Coverage (No Extra Fee)', extraPrice: 0 },
    { label: 'Full Loss & Accidental Damage Waiver (+ $14/day)', extraPrice: 14 },
  ],
};

const ProductConfigModal = ({ product, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !product) return null;

  const basePrice = product.pricePerDay || product.price || 120;
  const baseDeposit = product.securityDeposit || product.deposit || 350;

  const [selectedRam, setSelectedRam] = useState(DEFAULT_CONFIG_OPTIONS.ram[0]);
  const [selectedStorage, setSelectedStorage] = useState(DEFAULT_CONFIG_OPTIONS.storage[0]);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_CONFIG_OPTIONS.color[0]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedProtection, setSelectedProtection] = useState(DEFAULT_CONFIG_OPTIONS.protection[0]);

  // Calculate dynamic extra price
  const extraPerDay =
    (selectedRam?.extraPrice || 0) +
    (selectedStorage?.extraPrice || 0) +
    (selectedColor?.extraPrice || 0) +
    (selectedProtection?.extraPrice || 0) +
    selectedAccessories.reduce((acc, a) => acc + a.extraPrice, 0);

  const totalDailyRate = basePrice + extraPerDay;
  const calculatedDeposit = baseDeposit + Math.round(extraPerDay * 2.5);

  const toggleAccessory = (accItem) => {
    if (selectedAccessories.some((a) => a.label === accItem.label)) {
      setSelectedAccessories(selectedAccessories.filter((a) => a.label !== accItem.label));
    } else {
      setSelectedAccessories([...selectedAccessories, accItem]);
    }
  };

  const handleApply = () => {
    const finalConfig = {
      ram: selectedRam,
      storage: selectedStorage,
      color: selectedColor,
      accessories: selectedAccessories,
      protection: selectedProtection,
      extraPerDay,
      totalDailyRate,
      calculatedDeposit,
    };
    onConfirm(finalConfig);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container config-modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Configure {product.title || product.name}</h3>
            <p className="modal-subtitle">Customize hardware options, accessories & protection plan</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body config-body">
          {/* RAM Option */}
          <div className="config-group">
            <label className="config-label"><Cpu size={16} /> Memory (RAM)</label>
            <div className="config-pills">
              {DEFAULT_CONFIG_OPTIONS.ram.map((opt, i) => (
                <button
                  key={i}
                  className={`config-pill ${selectedRam?.label === opt.label ? 'selected' : ''}`}
                  onClick={() => setSelectedRam(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Storage Option */}
          <div className="config-group">
            <label className="config-label"><HardDrive size={16} /> Storage Capacity</label>
            <div className="config-pills">
              {DEFAULT_CONFIG_OPTIONS.storage.map((opt, i) => (
                <button
                  key={i}
                  className={`config-pill ${selectedStorage?.label === opt.label ? 'selected' : ''}`}
                  onClick={() => setSelectedStorage(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Edition */}
          <div className="config-group">
            <label className="config-label"><Palette size={16} /> Color Edition</label>
            <div className="config-pills">
              {DEFAULT_CONFIG_OPTIONS.color.map((opt, i) => (
                <button
                  key={i}
                  className={`config-pill ${selectedColor?.label === opt.label ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories Checkboxes */}
          <div className="config-group">
            <label className="config-label"><Wrench size={16} /> Add-On Accessories</label>
            <div className="config-checkboxes">
              {DEFAULT_CONFIG_OPTIONS.accessories.map((acc, i) => {
                const checked = selectedAccessories.some((a) => a.label === acc.label);
                return (
                  <div
                    key={i}
                    className={`config-check-card ${checked ? 'selected' : ''}`}
                    onClick={() => toggleAccessory(acc)}
                  >
                    <div className={`custom-check ${checked ? 'checked' : ''}`}>
                      {checked && <Check size={12} />}
                    </div>
                    <span>{acc.label} (+ ₹{acc.extraPrice}/day)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Protection Plan */}
          <div className="config-group">
            <label className="config-label"><ShieldCheck size={16} /> Damage Waiver & Insurance</label>
            <div className="config-pills flex-col">
              {DEFAULT_CONFIG_OPTIONS.protection.map((opt, i) => (
                <button
                  key={i}
                  className={`config-pill pill-full ${selectedProtection?.label === opt.label ? 'selected' : ''}`}
                  onClick={() => setSelectedProtection(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Price Summary Footer */}
        <div className="modal-footer config-footer">
          <div className="config-price-summary">
            <div>
              <span className="summary-label">Total Daily Rate</span>
              <span className="summary-price">₹{totalDailyRate}<small>/day</small></span>
            </div>
            <div>
              <span className="summary-label">Security Deposit</span>
              <span className="summary-deposit">₹{calculatedDeposit} <small>(Refundable)</small></span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleApply}>
            Save Configuration & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductConfigModal;
