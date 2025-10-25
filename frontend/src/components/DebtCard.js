import React, { useState } from 'react';
import { updateDebt, deleteDebt } from '../utils/api';
import { formatZAR, formatPercentage } from '../utils/api';

const DebtCard = ({ debt, onUpdated, onDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: debt.name,
    principal: debt.principal,
    apr: debt.apr,
    min_payment: debt.min_payment,
    payment_frequency: debt.payment_frequency,
    compounding: debt.compounding,
    notes: debt.notes || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'principal' || name === 'apr' || name === 'min_payment' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateDebt(debt.id, formData);
      setIsEditing(false);
      onUpdated();
    } catch (error) {
      console.error('Error updating debt:', error);
      alert('Failed to update debt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: debt.name,
      principal: debt.principal,
      apr: debt.apr,
      min_payment: debt.min_payment,
      payment_frequency: debt.payment_frequency,
      compounding: debt.compounding,
      notes: debt.notes || ''
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${debt.name}"?`)) {
      try {
        setLoading(true);
        await deleteDebt(debt.id);
        onDeleted();
      } catch (error) {
        console.error('Error deleting debt:', error);
        alert('Failed to delete debt. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = () => {
    if (debt.status === 'paid') {
      return <span className="badge badge-success">Paid Off</span>;
    } else if (debt.apr > 20) {
      return <span className="badge badge-danger">High Interest</span>;
    } else if (debt.apr > 15) {
      return <span className="badge badge-warning">Medium Interest</span>;
    } else {
      return <span className="badge badge-info">Low Interest</span>;
    }
  };

  const getPriorityColor = () => {
    if (debt.apr > 20) return 'text-danger';
    if (debt.apr > 15) return 'text-warning';
    if (debt.apr > 10) return 'text-info';
    return 'text-success';
  };

  if (isEditing) {
    return (
      <div className="card debt-card">
        <div className="card-header">
          <h4 className="card-title">
            <i className="fas fa-edit me-2"></i>
            Edit Debt
          </h4>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Debt Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Credit Card, Car Loan"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Current Balance</label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleInputChange}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Interest Rate (APR %)</label>
            <input
              type="number"
              name="apr"
              value={formData.apr}
              onChange={handleInputChange}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
              max="100"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Minimum Payment</label>
            <input
              type="number"
              name="min_payment"
              value={formData.min_payment}
              onChange={handleInputChange}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Payment Frequency</label>
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
          
          <div className="form-group">
            <label className="form-label">Compounding</label>
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
          
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-input"
              rows="2"
              placeholder="Optional notes..."
            />
          </div>
          
          <div className="btn-group">
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin me-1"></i>
              ) : (
                <i className="fas fa-save me-1"></i>
              )}
              Save
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              <i className="fas fa-times me-1"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card debt-card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">
            <i className="fas fa-credit-card me-2"></i>
            {debt.name}
          </h4>
          <div className="debt-actions">
            <button 
              className="btn btn-sm btn-outline me-1"
              onClick={() => setIsEditing(true)}
              title="Edit debt"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="btn btn-sm btn-outline text-danger"
              onClick={handleDelete}
              disabled={loading}
              title="Delete debt"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="debt-info">
          <div className="debt-balance mb-3">
            <div className="balance-amount text-mint">
              {formatZAR(debt.principal)}
            </div>
            <div className="balance-label text-gray-300">
              Current Balance
            </div>
          </div>
          
          <div className="debt-details">
            <div className="detail-row">
              <span className="detail-label text-gray-300">Interest Rate:</span>
              <span className={`detail-value ${getPriorityColor()}`}>
                {formatPercentage(debt.apr)}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label text-gray-300">Min Payment:</span>
              <span className="detail-value text-mint">
                {formatZAR(debt.min_payment)}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label text-gray-300">Frequency:</span>
              <span className="detail-value text-gray-300 capitalize">
                {debt.payment_frequency}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label text-gray-300">Compounding:</span>
              <span className="detail-value text-gray-300 capitalize">
                {debt.compounding}
              </span>
            </div>
          </div>
          
          {debt.notes && (
            <div className="debt-notes mt-3">
              <div className="notes-label text-gray-400 mb-1">
                <i className="fas fa-sticky-note me-1"></i>
                Notes:
              </div>
              <div className="notes-content text-gray-300">
                {debt.notes}
              </div>
            </div>
          )}
        </div>
        
        <div className="debt-status mt-3">
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
};

export default DebtCard;
