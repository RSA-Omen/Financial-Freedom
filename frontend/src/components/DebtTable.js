import React, { useState } from 'react';
import DebtModalForm from './DebtModalForm';
import { deleteDebt } from '../utils/api';

function DebtTable({ debts, onEditDebt, onDeleteDebt }) {
  const [showModal, setShowModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingDebt(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingDebt(null);
  };

  const handleSave = (debtData) => {
    onEditDebt(); // Refresh the debt list
    handleClose();
  };

  const handleDelete = async (debtId) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      try {
        await deleteDebt(debtId);
        onDeleteDebt(); // Refresh the debt list
      } catch (error) {
        console.error('Error deleting debt:', error);
        alert('Failed to delete debt. Please try again.');
      }
    }
  };

  const formatCurrency = (value) => `R ${parseFloat(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercentage = (value) => `${(parseFloat(value) * 100).toFixed(2)}%`;

  return (
    <div className="debt-table">
      <div className="card mb-lg">
        <div className="card-header flex justify-between items-center">
          <h2 className="card-title">Manage Debts</h2>
          <button className="btn btn-primary" onClick={handleAdd}>
            <i className="fas fa-plus"></i> Add Debt
          </button>
        </div>
        <div className="card-body">
          {debts.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Debt Name</th>
                    <th>Current Balance</th>
                    <th>APR</th>
                    <th>Min Payment</th>
                    <th>Frequency</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map(debt => (
                    <tr key={debt.id}>
                      <td className="font-bold">{debt.name}</td>
                      <td className="text-mint">{formatCurrency(debt.principal)}</td>
                      <td>{formatPercentage(debt.apr)}</td>
                      <td>{formatCurrency(debt.min_payment)}</td>
                      <td className="capitalize">{debt.payment_frequency}</td>
                      <td>
                        <span className={`badge ${parseFloat(debt.principal) > 0 ? 'badge-warning' : 'badge-success'}`}>
                          {parseFloat(debt.principal) > 0 ? 'Active' : 'Paid Off'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={() => handleEdit(debt)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDelete(debt.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-lg">
              <i className="fas fa-credit-card fa-3x text-secondary mb-md"></i>
              <p className="text-secondary text-lg">No debts added yet</p>
              <p className="text-secondary">Click "Add Debt" to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Debt */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingDebt ? 'Edit Debt' : 'Add New Debt'}
              </h3>
              <button className="modal-close" onClick={handleClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <DebtModalForm
                debt={editingDebt}
                onSave={handleSave}
                onCancel={handleClose}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebtTable;
