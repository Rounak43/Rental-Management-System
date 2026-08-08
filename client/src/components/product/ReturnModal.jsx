import React, { useState } from 'react';
import { X, RotateCcw, Calendar, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import './ProductConfigModal.css';

const ReturnModal = ({ rental, isOpen, onClose, onSubmitReturn }) => {
  if (!isOpen || !rental) return null;

  const [reason, setReason] = useState('Rental period completed');
  const [pickupDate, setPickupDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitReturn({
        rentalId: rental._id,
        reason,
        pickupDate,
        photoUrl,
        notes,
      });
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Schedule Equipment Return</h3>
            <p className="modal-subtitle">Order #{rental._id?.substring(0, 10) || 'RET-8923'}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h3>Return Scheduled Successfully!</h3>
            <p className="tab-desc mt-2">
              Pickup team will collect item on <strong>{pickupDate}</strong>. Refundable deposit will be processed after inspection.
            </p>
            <button className="btn btn-primary mt-4" onClick={onClose}>
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body config-body">
            <div className="form-group">
              <label>Reason for Return</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="Rental period completed">Rental period completed</option>
                <option value="Finished project early">Finished project early</option>
                <option value="Item replacement requested">Item replacement requested</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label><Calendar size={16} /> Preferred Pickup Date</label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label><Camera size={16} /> Item Condition Photo (Optional)</label>
              <input
                type="url"
                placeholder="https://example.com/item-condition.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                rows={3}
                placeholder="Provide access instructions or packaging condition details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer config-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <RotateCcw size={16} /> {isSubmitting ? 'Scheduling...' : 'Confirm Return Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReturnModal;
