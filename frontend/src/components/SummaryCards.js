import React from 'react';

function SummaryCards({ debts, simulationResults }) {
  // Handle case where debts is undefined or null
  if (!debts || !Array.isArray(debts)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-mint">Loading...</h3>
          </div>
          <div className="card-body text-center">
            <p className="text-primary text-3xl font-bold">R 0.00</p>
            <p className="text-secondary text-sm">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.principal), 0);
  const totalMonthlyPayments = debts.reduce((sum, debt) => sum + parseFloat(debt.min_payment), 0);
  
  // Calculate average APR
  const averageAPR = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + parseFloat(debt.apr), 0) / debts.length 
    : 0;
  
  // Find highest APR
  const highestAPR = debts.length > 0 
    ? Math.max(...debts.map(debt => parseFloat(debt.apr)))
    : 0;

  const formatCurrency = (value) => `R ${parseFloat(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercentage = (value) => `${(parseFloat(value) * 100).toFixed(2)}%`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
      {/* Total Debt Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-mint">Total Debt</h3>
        </div>
        <div className="card-body text-center">
          <p className="text-primary text-3xl font-bold">{formatCurrency(totalDebt)}</p>
          <p className="text-secondary text-sm">Outstanding Balance</p>
        </div>
      </div>

      {/* Monthly Payments Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-mint">Monthly Payments</h3>
        </div>
        <div className="card-body text-center">
          <p className="text-primary text-3xl font-bold">{formatCurrency(totalMonthlyPayments)}</p>
          <p className="text-secondary text-sm">Minimum Required</p>
        </div>
      </div>

      {/* Average APR Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-mint">Average APR</h3>
        </div>
        <div className="card-body text-center">
          <p className="text-primary text-3xl font-bold">{formatPercentage(averageAPR)}</p>
          <p className="text-secondary text-sm">Weighted Average</p>
        </div>
      </div>

      {/* Highest APR Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-mint">Highest APR</h3>
        </div>
        <div className="card-body text-center">
          <p className="text-primary text-3xl font-bold">{formatPercentage(highestAPR)}</p>
          <p className="text-secondary text-sm">Priority Target</p>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
