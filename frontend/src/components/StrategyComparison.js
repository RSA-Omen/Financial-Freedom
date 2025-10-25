import React, { useState, useEffect } from 'react';
import { compareStrategies } from '../utils/api';
import { formatZAR, formatMonthsToYears } from '../utils/api';

const StrategyComparison = ({ debts }) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extraPayment, setExtraPayment] = useState(0);

  useEffect(() => {
    if (debts && debts.length > 0) {
      loadComparison();
    }
  }, [debts, extraPayment]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const result = await compareStrategies(extraPayment);
      setComparison(result);
    } catch (error) {
      console.error('Error loading comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtraPaymentChange = (e) => {
    setExtraPayment(parseFloat(e.target.value) || 0);
  };

  if (!debts || debts.length === 0) {
    return (
      <div className="empty-state">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-chart-bar fa-3x text-gray-400 mb-3"></i>
            <h3>No Debts to Compare</h3>
            <p className="text-gray-300 mb-4">
              Add some debts to compare different repayment strategies.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.hash = '#debts'}
            >
              <i className="fas fa-plus me-2"></i>
              Add Your First Debt
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-spinner fa-spin fa-2x text-mint mb-3"></i>
            <h3>Comparing Strategies...</h3>
            <p className="text-gray-300">Calculating optimal repayment paths</p>
          </div>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="error-state">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h3>Unable to Load Comparison</h3>
            <p className="text-gray-300">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const strategies = ['avalanche', 'snowball', 'hybrid'];
  const strategyNames = {
    avalanche: 'Avalanche',
    snowball: 'Snowball',
    hybrid: 'Hybrid'
  };
  const strategyIcons = {
    avalanche: 'fas fa-fire',
    snowball: 'fas fa-snowflake',
    hybrid: 'fas fa-balance-scale'
  };
  const strategyColors = {
    avalanche: 'text-danger',
    snowball: 'text-info',
    hybrid: 'text-mint'
  };

  return (
    <div className="strategy-comparison">
      {/* Extra Payment Input */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-calculator me-2"></i>
            Extra Payment Calculator
          </h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-plus-circle me-1"></i>
              Additional Monthly Payment (ZAR)
            </label>
            <input
              type="number"
              value={extraPayment}
              onChange={handleExtraPaymentChange}
              className="form-input"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <div className="form-help text-gray-400 mt-1">
              Enter any additional amount you can pay each month to see the impact on different strategies
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Cards */}
      <div className="strategy-grid">
        {strategies.map(strategy => {
          const data = comparison[strategy];
          if (!data) return null;

          const summary = data.summary;
          const isOptimal = strategy === 'avalanche'; // Avalanche is mathematically optimal

          return (
            <div key={strategy} className="card strategy-card">
              <div className="card-header">
                <h4 className="card-title">
                  <i className={`${strategyIcons[strategy]} me-2`}></i>
                  {strategyNames[strategy]} Strategy
                  {isOptimal && (
                    <span className="badge badge-success ms-2">
                      <i className="fas fa-crown me-1"></i>
                      Optimal
                    </span>
                  )}
                </h4>
              </div>
              
              <div className="card-body">
                <div className="strategy-metrics">
                  <div className="metric-row">
                    <div className="metric-label text-gray-300">Time to Freedom:</div>
                    <div className={`metric-value ${strategyColors[strategy]}`}>
                      {formatMonthsToYears(summary.months_to_zero)}
                    </div>
                  </div>
                  
                  <div className="metric-row">
                    <div className="metric-label text-gray-300">Total Interest:</div>
                    <div className="metric-value text-warning">
                      {formatZAR(summary.total_interest_paid)}
                    </div>
                  </div>
                  
                  <div className="metric-row">
                    <div className="metric-label text-gray-300">Total Payments:</div>
                    <div className="metric-value text-mint">
                      {formatZAR(summary.total_payments_made)}
                    </div>
                  </div>
                  
                  {summary.debt_free_date && (
                    <div className="metric-row">
                      <div className="metric-label text-gray-300">Debt-Free Date:</div>
                      <div className="metric-value text-gray-300">
                        {new Date(summary.debt_free_date).toLocaleDateString('en-ZA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="strategy-rationale mt-3">
                  <h6 className="text-mint mb-2">
                    <i className="fas fa-lightbulb me-1"></i>
                    Why {strategyNames[strategy]}?
                  </h6>
                  <p className="text-gray-300 small">
                    {strategy === 'avalanche' && 
                      'Pays highest interest debt first, minimizing total interest paid. Mathematically optimal.'
                    }
                    {strategy === 'snowball' && 
                      'Pays smallest balance first for quick wins and psychological motivation.'
                    }
                    {strategy === 'hybrid' && 
                      'Balances mathematical optimization with psychological benefits.'
                    }
                  </p>
                </div>

                {summary.interest_saved !== undefined && (
                  <div className="savings-info mt-3">
                    <div className="savings-amount text-success">
                      <i className="fas fa-piggy-bank me-1"></i>
                      Interest Saved: {formatZAR(summary.interest_saved)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Summary */}
      <div className="card mt-4">
        <div className="card-header">
          <h4 className="card-title">
            <i className="fas fa-chart-line me-2"></i>
            Strategy Comparison Summary
          </h4>
        </div>
        <div className="card-body">
          <div className="comparison-table">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Strategy</th>
                    <th>Time to Freedom</th>
                    <th>Total Interest</th>
                    <th>Interest Saved</th>
                    <th>Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.map(strategy => {
                    const data = comparison[strategy];
                    if (!data) return null;
                    const summary = data.summary;
                    
                    return (
                      <tr key={strategy}>
                        <td>
                          <i className={`${strategyIcons[strategy]} me-2`}></i>
                          {strategyNames[strategy]}
                        </td>
                        <td className={strategyColors[strategy]}>
                          {formatMonthsToYears(summary.months_to_zero)}
                        </td>
                        <td className="text-warning">
                          {formatZAR(summary.total_interest_paid)}
                        </td>
                        <td className="text-success">
                          {summary.interest_saved !== undefined 
                            ? formatZAR(summary.interest_saved)
                            : 'N/A'
                          }
                        </td>
                        <td className="text-gray-300">
                          {strategy === 'avalanche' && 'Math-focused users'}
                          {strategy === 'snowball' && 'Motivation-focused users'}
                          {strategy === 'hybrid' && 'Balanced approach'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card mt-4">
        <div className="card-header">
          <h4 className="card-title">
            <i className="fas fa-star me-2"></i>
            Recommendations
          </h4>
        </div>
        <div className="card-body">
          <div className="recommendations">
            <div className="recommendation-item">
              <div className="recommendation-icon text-danger">
                <i className="fas fa-fire fa-2x"></i>
              </div>
              <div className="recommendation-content">
                <h5 className="text-danger">Avalanche Strategy</h5>
                <p className="text-gray-300">
                  Best for users who want to minimize total interest paid. 
                  Mathematically optimal but may take longer to see first debt paid off.
                </p>
              </div>
            </div>
            
            <div className="recommendation-item">
              <div className="recommendation-icon text-info">
                <i className="fas fa-snowflake fa-2x"></i>
              </div>
              <div className="recommendation-content">
                <h5 className="text-info">Snowball Strategy</h5>
                <p className="text-gray-300">
                  Best for users who need psychological motivation. 
                  Quick wins help build momentum and confidence.
                </p>
              </div>
            </div>
            
            <div className="recommendation-item">
              <div className="recommendation-icon text-mint">
                <i className="fas fa-balance-scale fa-2x"></i>
              </div>
              <div className="recommendation-content">
                <h5 className="text-mint">Hybrid Strategy</h5>
                <p className="text-gray-300">
                  Best for users who want a balanced approach. 
                  Combines mathematical optimization with psychological benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyComparison;
