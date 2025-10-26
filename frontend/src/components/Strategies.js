import React, { useState, useEffect } from 'react';
import FreedomChart from './FreedomChart';
import { compareStrategies } from '../utils/api';

function Strategies({ debts }) {
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debts && debts.length > 0) {
      loadComparison();
    }
  }, [debts]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const results = await compareStrategies(debts, 0);
      setComparisonResults(results);
    } catch (error) {
      console.error('Error loading strategy comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `R ${parseFloat(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatMonths = (value) => `${value} months`;

  if (loading) {
    return (
      <div className="text-center py-lg">
        <i className="fas fa-spinner fa-spin fa-2x text-mint mb-md"></i>
        <p className="text-secondary">Comparing strategies...</p>
      </div>
    );
  }

  if (!comparisonResults) {
    return (
      <div className="text-center py-lg">
        <p className="text-secondary">Add debts to compare strategies</p>
      </div>
    );
  }

  const { avalanche, snowball } = comparisonResults;

  return (
    <div className="strategies">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
        {/* Avalanche Strategy */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-mint">
              <i className="fas fa-fire me-2"></i>
              Avalanche Strategy
            </h3>
            <p className="text-secondary text-sm">Highest interest rate first (mathematically optimal)</p>
          </div>
          <div className="card-body">
            {avalanche && avalanche.timeline && (
              <FreedomChart 
                timeline={avalanche.timeline} 
                title="Avalanche Freedom Chart"
              />
            )}
          </div>
        </div>

        {/* Snowball Strategy */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-mint">
              <i className="fas fa-snowflake me-2"></i>
              Snowball Strategy
            </h3>
            <p className="text-secondary text-sm">Smallest balance first (psychological wins)</p>
          </div>
          <div className="card-body">
            {snowball && snowball.timeline && (
              <FreedomChart 
                timeline={snowball.timeline} 
                title="Snowball Freedom Chart"
              />
            )}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Strategy Comparison</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="text-center">Avalanche</th>
                  <th className="text-center">Snowball</th>
                  <th className="text-center">Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold">Months to Zero</td>
                  <td className="text-center text-mint">{avalanche?.months_to_zero || 'N/A'}</td>
                  <td className="text-center text-mint">{snowball?.months_to_zero || 'N/A'}</td>
                  <td className="text-center">
                    {avalanche?.months_to_zero && snowball?.months_to_zero ? (
                      <span className={avalanche.months_to_zero < snowball.months_to_zero ? 'text-success' : 'text-danger'}>
                        {snowball.months_to_zero - avalanche.months_to_zero} months
                      </span>
                    ) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold">Total Interest Paid</td>
                  <td className="text-center text-mint">{formatCurrency(avalanche?.total_interest_paid || 0)}</td>
                  <td className="text-center text-mint">{formatCurrency(snowball?.total_interest_paid || 0)}</td>
                  <td className="text-center">
                    {avalanche?.total_interest_paid && snowball?.total_interest_paid ? (
                      <span className={avalanche.total_interest_paid < snowball.total_interest_paid ? 'text-success' : 'text-danger'}>
                        {formatCurrency(snowball.total_interest_paid - avalanche.total_interest_paid)}
                      </span>
                    ) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold">Payoff Date</td>
                  <td className="text-center">{avalanche?.payoff_date || 'N/A'}</td>
                  <td className="text-center">{snowball?.payoff_date || 'N/A'}</td>
                  <td className="text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Strategies;

