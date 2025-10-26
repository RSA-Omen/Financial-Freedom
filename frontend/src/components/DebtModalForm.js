import React, { useState, useEffect } from 'react';
import { createDebt, updateDebt } from '../utils/api';

const DebtModalForm = ({ debt, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    apr: '',
    min_payment: '',
    payment_frequency: 'monthly',
    compounding: 'monthly',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when editing existing debt
  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name || '',
        principal: debt.principal || '',
        apr: (debt.apr || 0) * 100, // Convert decimal to percentage for display
        min_payment: debt.min_payment || '',
        payment_frequency: debt.payment_frequency || 'monthly',
        compounding: debt.compounding || debt.compounding_frequency || 'monthly',
        notes: debt.notes || ''
      });
    }
  }, [debt]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For APR field, store the raw percentage value and convert only on submit
    if (name === 'apr') {
      setFormData(prev => ({
        ...prev,
        [name]: value // Store raw percentage value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Debt name is required';
    }
    
    if (!formData.principal || parseFloat(formData.principal) <= 0) {
      newErrors.principal = 'Principal amount must be greater than 0';
    }
    
    if (!formData.apr || parseFloat(formData.apr) < 0 || parseFloat(formData.apr) > 1000) {
      newErrors.apr = 'APR must be between 0 and 1000%';
    }
    
    if (!formData.min_payment || parseFloat(formData.min_payment) <= 0) {
      newErrors.min_payment = 'Minimum payment must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const debtData = {
        ...formData,
        principal: parseFloat(formData.principal),
        apr: parseFloat(formData.apr) / 100, // Convert percentage to decimal
        min_payment: parseFloat(formData.min_payment)
      };
      
      if (debt) {
        await updateDebt(debt.id, debtData);
      } else {
        await createDebt(debtData);
      }
      
      onSave(debtData);
      
    } catch (error) {
      console.error('Error saving debt:', error);
      alert('Failed to save debt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-tag me-1"></i>
              Debt Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g., Credit Card, Car Loan"
              required
            />
            {errors.name && (
              <div className="error-message text-danger mt-1">
                <i className="fas fa-exclamation-circle me-1"></i>
                {errors.name}
              </div>
            )}
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-wallet me-1"></i>
              Current Balance (ZAR) *
            </label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleInputChange}
              className={`form-input ${errors.principal ? 'error' : ''}`}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            {errors.principal && (
              <div className="error-message text-danger mt-1">
                <i className="fas fa-exclamation-circle me-1"></i>
                {errors.principal}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-percentage me-1"></i>
              Interest Rate (APR %) *
            </label>
            <input
              type="number"
              name="apr"
              value={formData.apr}
              onChange={handleInputChange}
              className={`form-input ${errors.apr ? 'error' : ''}`}
              placeholder="13.05"
              step="0.01"
              min="0"
              max="1000"
              required
            />
            {errors.apr && (
              <div className="error-message text-danger mt-1">
                <i className="fas fa-exclamation-circle me-1"></i>
                {errors.apr}
              </div>
            )}
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-credit-card me-1"></i>
              Minimum Payment (ZAR) *
            </label>
            <input
              type="number"
              name="min_payment"
              value={formData.min_payment}
              onChange={handleInputChange}
              className={`form-input ${errors.min_payment ? 'error' : ''}`}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            {errors.min_payment && (
              <div className="error-message text-danger mt-1">
                <i className="fas fa-exclamation-circle me-1"></i>
                {errors.min_payment}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-calendar-alt me-1"></i>
              Payment Frequency
            </label>
            <select
              name="payment_frequency"
              value={formData.payment_frequency}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-calculator me-1"></i>
              Interest Compounding
            </label>
            <select
              name="compounding"
              value={formData.compounding}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">
          <i className="fas fa-sticky-note me-1"></i>
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="form-input"
          rows="3"
          placeholder="Any additional notes about this debt..."
        />
      </div>
      
      <div className="form-actions">
        <div className="btn-group">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                {debt ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                {debt ? 'Update Debt' : 'Add Debt'}
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <i className="fas fa-times me-2"></i>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default DebtModalForm;
