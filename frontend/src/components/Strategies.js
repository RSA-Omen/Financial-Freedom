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
      const results = await compareStrategies(0);
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
      {/* Strategy Comparison Header */}
      <div className="card mb-lg">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-balance-scale me-2"></i>
            Strategy Comparison: Avalanche vs Snowball
          </h2>
          <p className="text-secondary">
            Compare the two most popular debt repayment strategies side by side
          </p>
        </div>
        <div className="card-body">
          <div className="strategy-overview grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="strategy-card bg-danger-subtle p-4 rounded">
              <h4 className="text-danger mb-2">
                <i className="fas fa-fire me-2"></i>
                Avalanche Strategy
              </h4>
              <p className="text-secondary mb-2">Pay highest interest rate debts first</p>
              <div className="strategy-stats">
                <div className="stat">
                  <span className="stat-label">Time to Freedom:</span>
                  <span className="stat-value text-danger font-bold">
                    {avalanche?.summary?.months_to_zero || 'N/A'} months
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Interest:</span>
                  <span className="stat-value text-danger font-bold">
                    {formatCurrency(avalanche?.summary?.total_interest_paid || 0)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="strategy-card bg-info-subtle p-4 rounded">
              <h4 className="text-info mb-2">
                <i className="fas fa-snowflake me-2"></i>
                Snowball Strategy
              </h4>
              <p className="text-secondary mb-2">Pay smallest balance debts first</p>
              <div className="strategy-stats">
                <div className="stat">
                  <span className="stat-label">Time to Freedom:</span>
                  <span className="stat-value text-info font-bold">
                    {snowball?.summary?.months_to_zero || 'N/A'} months
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Interest:</span>
                  <span className="stat-value text-info font-bold">
                    {formatCurrency(snowball?.summary?.total_interest_paid || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
        {/* Avalanche Strategy */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-danger">
              <i className="fas fa-fire me-2"></i>
              Avalanche Strategy
            </h3>
            <p className="text-secondary text-sm">Highest interest rate first (mathematically optimal)</p>
          </div>
          <div className="card-body">
            {avalanche && avalanche.simulation_results && (
              <FreedomChart 
                timeline={avalanche.simulation_results} 
                title="Avalanche Freedom Chart"
                summary={avalanche.summary}
              />
            )}
          </div>
        </div>

        {/* Snowball Strategy */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-info">
              <i className="fas fa-snowflake me-2"></i>
              Snowball Strategy
            </h3>
            <p className="text-secondary text-sm">Smallest balance first (psychological wins)</p>
          </div>
          <div className="card-body">
            {snowball && snowball.simulation_results && (
              <FreedomChart 
                timeline={snowball.simulation_results} 
                title="Snowball Freedom Chart"
                summary={snowball.summary}
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
                  <td className="text-center text-mint">{avalanche?.summary?.months_to_zero || 'N/A'}</td>
                  <td className="text-center text-mint">{snowball?.summary?.months_to_zero || 'N/A'}</td>
                  <td className="text-center">
                    {avalanche?.summary?.months_to_zero && snowball?.summary?.months_to_zero ? (
                      <span className={avalanche.summary.months_to_zero < snowball.summary.months_to_zero ? 'text-success' : 'text-danger'}>
                        {snowball.summary.months_to_zero - avalanche.summary.months_to_zero} months
                      </span>
                    ) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold">Total Interest Paid</td>
                  <td className="text-center text-mint">{formatCurrency(avalanche?.summary?.total_interest_paid || 0)}</td>
                  <td className="text-center text-mint">{formatCurrency(snowball?.summary?.total_interest_paid || 0)}</td>
                  <td className="text-center">
                    {avalanche?.summary?.total_interest_paid && snowball?.summary?.total_interest_paid ? (
                      <span className={avalanche.summary.total_interest_paid < snowball.summary.total_interest_paid ? 'text-success' : 'text-danger'}>
                        {formatCurrency(snowball.summary.total_interest_paid - avalanche.summary.total_interest_paid)}
                      </span>
                    ) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold">Payoff Date</td>
                  <td className="text-center">{avalanche?.summary?.debt_free_date || 'N/A'}</td>
                  <td className="text-center">{snowball?.summary?.debt_free_date || 'N/A'}</td>
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

