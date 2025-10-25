import React, { useState, useEffect } from 'react';
import { calculateImpact, getRecommendation } from '../utils/api';
import { formatZAR, formatMonthsToYears } from '../utils/api';

const CommitPanel = ({ debts }) => {
  const [extraPayment, setExtraPayment] = useState(0);
  const [impact, setImpact] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState('avalanche');

  useEffect(() => {
    if (debts && debts.length > 0) {
      loadRecommendation();
    }
  }, [debts, strategy]);

  useEffect(() => {
    if (extraPayment > 0) {
      loadImpact();
    } else {
      setImpact(null);
    }
  }, [extraPayment, strategy]);

  const loadRecommendation = async () => {
    try {
      const result = await getRecommendation(strategy);
      setRecommendation(result);
    } catch (error) {
      console.error('Error loading recommendation:', error);
    }
  };

  const loadImpact = async () => {
    try {
      setLoading(true);
      const result = await calculateImpact(0, extraPayment, strategy);
      setImpact(result);
    } catch (error) {
      console.error('Error loading impact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtraPaymentChange = (e) => {
    setExtraPayment(parseFloat(e.target.value) || 0);
  };

  const handleStrategyChange = (newStrategy) => {
    setStrategy(newStrategy);
  };

  if (!debts || debts.length === 0) {
    return (
      <div className="empty-state">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-plus-circle fa-3x text-gray-400 mb-3"></i>
            <h3>No Debts to Optimize</h3>
            <p className="text-gray-300 mb-4">
              Add some debts to see the impact of extra payments.
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

  return (
    <div className="commit-panel">
      {/* Strategy Selector */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-chart-line me-2"></i>
            Choose Your Strategy
          </h3>
        </div>
        <div className="card-body">
          <div className="btn-group">
            <button 
              className={`btn ${strategy === 'avalanche' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStrategyChange('avalanche')}
            >
              <i className="fas fa-fire me-1"></i>
              Avalanche
            </button>
            <button 
              className={`btn ${strategy === 'snowball' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStrategyChange('snowball')}
            >
              <i className="fas fa-snowflake me-1"></i>
              Snowball
            </button>
            <button 
              className={`btn ${strategy === 'hybrid' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStrategyChange('hybrid')}
            >
              <i className="fas fa-balance-scale me-1"></i>
              Hybrid
            </button>
          </div>
        </div>
      </div>

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
              Enter any additional amount you can pay each month
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-lightbulb me-2"></i>
              Recommended Target
            </h4>
          </div>
          <div className="card-body">
            {recommendation.target_debt ? (
              <div className="recommendation-content">
                <div className="target-debt">
                  <h5 className="text-mint">
                    <i className="fas fa-bullseye me-2"></i>
                    {recommendation.target_debt.name}
                  </h5>
                  <div className="debt-details">
                    <div className="detail-row">
                      <span className="detail-label text-gray-300">Balance:</span>
                      <span className="detail-value text-mint">
                        {formatZAR(recommendation.target_debt.balance)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label text-gray-300">APR:</span>
                      <span className="detail-value text-warning">
                        {recommendation.target_debt.apr}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="rationale mt-3">
                  <p className="text-gray-300">
                    <i className="fas fa-info-circle me-2"></i>
                    {recommendation.rationale}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-300">
                <i className="fas fa-info-circle me-2"></i>
                {recommendation.rationale}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Impact Analysis */}
      {loading && (
        <div className="card mb-4">
          <div className="card-body text-center">
            <i className="fas fa-spinner fa-spin fa-2x text-mint mb-3"></i>
            <h4>Calculating Impact...</h4>
            <p className="text-gray-300">Analyzing your extra payment strategy</p>
          </div>
        </div>
      )}

      {impact && !loading && (
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-chart-bar me-2"></i>
              Impact Analysis
            </h4>
          </div>
          <div className="card-body">
            <div className="impact-metrics">
              <div className="metric-row">
                <div className="metric-label text-gray-300">Months Saved:</div>
                <div className="metric-value text-success">
                  {impact.impact.months_saved} months
                </div>
              </div>
              
              <div className="metric-row">
                <div className="metric-label text-gray-300">Interest Saved:</div>
                <div className="metric-value text-success">
                  {formatZAR(impact.impact.interest_saved)}
                </div>
              </div>
              
              <div className="metric-row">
                <div className="metric-label text-gray-300">New Debt-Free Date:</div>
                <div className="metric-value text-mint">
                  {new Date(impact.impact.new_debt_free_date).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <div className="metric-row">
                <div className="metric-label text-gray-300">ROI per Rand:</div>
                <div className="metric-value text-info">
                  {impact.impact.roi_per_rand.toFixed(4)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Charts */}
      {impact && !loading && (
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-chart-line me-2"></i>
              Before vs After Comparison
            </h4>
          </div>
          <div className="card-body">
            <div className="comparison-charts">
              <div className="chart-container">
                <h5 className="text-mint mb-3">Base Scenario (No Extra Payment)</h5>
                <div className="scenario-summary">
                  <div className="summary-item">
                    <span className="label text-gray-300">Time to Freedom:</span>
                    <span className="value text-gray-300">
                      {formatMonthsToYears(impact.base_simulation.summary.months_to_zero)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label text-gray-300">Total Interest:</span>
                    <span className="value text-warning">
                      {formatZAR(impact.base_simulation.summary.total_interest_paid)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label text-gray-300">Debt-Free Date:</span>
                    <span className="value text-gray-300">
                      {new Date(impact.base_simulation.summary.debt_free_date).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <h5 className="text-success mb-3">Enhanced Scenario (With Extra Payment)</h5>
                <div className="scenario-summary">
                  <div className="summary-item">
                    <span className="label text-gray-300">Time to Freedom:</span>
                    <span className="value text-success">
                      {formatMonthsToYears(impact.enhanced_simulation.summary.months_to_zero)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label text-gray-300">Total Interest:</span>
                    <span className="value text-success">
                      {formatZAR(impact.enhanced_simulation.summary.total_interest_paid)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label text-gray-300">Debt-Free Date:</span>
                    <span className="value text-success">
                      {new Date(impact.enhanced_simulation.summary.debt_free_date).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Motivation Section */}
      {impact && !loading && (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-heart me-2"></i>
              Your Financial Freedom Journey
            </h4>
          </div>
          <div className="card-body">
            <div className="motivation-content">
              <div className="motivation-message text-center mb-4">
                <h5 className="text-mint">
                  <i className="fas fa-star me-2"></i>
                  Amazing Progress!
                </h5>
                <p className="text-gray-300">
                  By adding {formatZAR(extraPayment)} per month, you'll save{' '}
                  <strong className="text-success">{formatZAR(impact.impact.interest_saved)}</strong> in interest{' '}
                  and become debt-free <strong className="text-success">{impact.impact.months_saved} months</strong> earlier!
                </p>
              </div>
              
              <div className="progress-visualization">
                <div className="progress-bar-large">
                  <div 
                    className="progress-fill-large"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, (120 - impact.enhanced_simulation.summary.months_to_zero) / 120 * 100))}%` 
                    }}
                  ></div>
                </div>
                <div className="progress-text text-center mt-2">
                  <span className="text-mint">
                    {impact.enhanced_simulation.summary.months_to_zero} months to freedom
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitPanel;
