import React, { useState } from 'react';
import { createDebt } from '../utils/api';

const DebtForm = ({ onDebtAdded }) => {
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
      
      await createDebt(debtData);
      
      // Reset form
      setFormData({
        name: '',
        principal: '',
        apr: '',
        min_payment: '',
        payment_frequency: 'monthly',
        compounding: 'monthly',
        notes: ''
      });
      
      onDebtAdded();
      
      // Show success message
      alert('Debt added successfully!');
      
    } catch (error) {
      console.error('Error creating debt:', error);
      alert('Failed to create debt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      principal: '',
      apr: '',
      min_payment: '',
      payment_frequency: 'monthly',
      compounding: 'monthly',
      notes: ''
    });
    setErrors({});
  };

  return (
    <div className="debt-form">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-plus-circle me-2"></i>
            Add New Debt
          </h3>
          <p className="card-subtitle text-gray-300">
            Enter the details of your debt to start tracking your financial freedom journey
          </p>
        </div>
        
        <div className="card-body">
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
                    placeholder="e.g., Credit Card, Car Loan, Personal Loan"
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
                      Adding Debt...
                    </>
                  ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Add Debt
                      </>
                    )}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <i className="fas fa-undo me-2"></i>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Help Section */}
      <div className="card mt-4">
        <div className="card-header">
          <h4 className="card-title">
            <i className="fas fa-question-circle me-2"></i>
            Need Help?
          </h4>
        </div>
        <div className="card-body">
          <div className="help-content">
            <div className="help-item">
              <h5 className="text-mint">
                <i className="fas fa-lightbulb me-2"></i>
                Tips for Accurate Data
              </h5>
              <ul className="text-gray-300">
                <li>Use your most recent statement for current balance</li>
                <li>APR (Annual Percentage Rate) is usually shown on your statement</li>
                <li>Minimum payment is the amount you must pay each period</li>
                <li>Choose the compounding frequency that matches your debt type</li>
              </ul>
            </div>
            
            <div className="help-item mt-3">
              <h5 className="text-mint">
                <i className="fas fa-info-circle me-2"></i>
                Common Debt Types
              </h5>
              <div className="debt-types">
                <div className="debt-type">
                  <strong className="text-gray-300">Credit Cards:</strong>
                  <span className="text-gray-400 ms-2">Usually monthly compounding, high APR</span>
                </div>
                <div className="debt-type">
                  <strong className="text-gray-300">Car Loans:</strong>
                  <span className="text-gray-400 ms-2">Usually monthly compounding, moderate APR</span>
                </div>
                <div className="debt-type">
                  <strong className="text-gray-300">Personal Loans:</strong>
                  <span className="text-gray-400 ms-2">Usually monthly compounding, variable APR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtForm;
