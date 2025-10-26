import React from 'react';

function SummaryCards({ debts, simulationResults }) {
  // Handle case where debts is undefined or null
  if (!debts || !Array.isArray(debts)) {
    return (
      <div className="grid grid-cols-4 gap-sm mb-md">
        <div className="card card-sm">
          <div className="card-header py-sm">
            <h4 className="card-title text-mint text-sm">Loading...</h4>
          </div>
          <div className="card-body text-center py-sm">
            <p className="text-primary text-xl font-bold">R 0.00</p>
            <p className="text-secondary text-xs">Please wait</p>
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
    <div className="grid grid-cols-4 gap-sm mb-md">
      {/* Total Debt Card */}
      <div className="card card-sm">
        <div className="card-header py-sm">
          <h4 className="card-title text-mint text-sm">Total Debt</h4>
        </div>
        <div className="card-body text-center py-sm">
          <p className="text-primary text-xl font-bold">{formatCurrency(totalDebt)}</p>
          <p className="text-secondary text-xs">Outstanding Balance</p>
        </div>
      </div>

      {/* Monthly Payments Card */}
      <div className="card card-sm">
        <div className="card-header py-sm">
          <h4 className="card-title text-mint text-sm">Monthly Payments</h4>
        </div>
        <div className="card-body text-center py-sm">
          <p className="text-primary text-xl font-bold">{formatCurrency(totalMonthlyPayments)}</p>
          <p className="text-secondary text-xs">Minimum Required</p>
        </div>
      </div>

      {/* Average APR Card */}
      <div className="card card-sm">
        <div className="card-header py-sm">
          <h4 className="card-title text-mint text-sm">Average APR</h4>
        </div>
        <div className="card-body text-center py-sm">
          <p className="text-primary text-xl font-bold">{formatPercentage(averageAPR)}</p>
          <p className="text-secondary text-xs">Weighted Average</p>
        </div>
      </div>

      {/* Highest APR Card */}
      <div className="card card-sm">
        <div className="card-header py-sm">
          <h4 className="card-title text-mint text-sm">Highest APR</h4>
        </div>
        <div className="card-body text-center py-sm">
          <p className="text-primary text-xl font-bold">{formatPercentage(highestAPR)}</p>
          <p className="text-secondary text-xs">Priority Target</p>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
