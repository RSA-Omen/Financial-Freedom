import React, { useState, useEffect } from 'react';
import { calculateImpact, getRecommendation } from '../utils/api';
import { formatZAR, formatMonthsToYears } from '../utils/api';
import FreedomChart from './FreedomChart';

const CommitPanel = ({ debts }) => {
  const [extraPayment, setExtraPayment] = useState(0);
  const [impact, setImpact] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState('avalanche');
  const [baseSimulation, setBaseSimulation] = useState(null);

  useEffect(() => {
    if (debts && debts.length > 0) {
      loadRecommendation();
      loadBaseSimulation();
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

  const loadBaseSimulation = async () => {
    try {
      console.log('🔄 Loading base simulation for strategy:', strategy);
      // Load base simulation (no extra payment) to always show a chart
      const result = await calculateImpact(0, 0, strategy);
      console.log('✅ Base simulation loaded:', result.base_simulation?.summary);
      setBaseSimulation(result.base_simulation);
    } catch (error) {
      console.error('❌ Error loading base simulation:', error);
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

  const handleCommit = () => {
    // TODO: Implement commit functionality
    alert(`Committed to pay ${formatZAR(extraPayment)} extra per month using ${strategy} strategy!`);
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
          
          {/* Real-time Impact Display */}
          {extraPayment > 0 && impact && (
            <div className="real-time-impact mt-4 p-3 bg-success-subtle rounded">
              <h5 className="text-success mb-2">
                <i className="fas fa-bolt me-2"></i>
                Real-time Impact
              </h5>
              <div className="impact-grid grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="impact-item text-center">
                  <div className="impact-value text-success font-bold text-lg">
                    {Math.round(impact.impact.months_saved * 30)} days
                  </div>
                  <div className="impact-label text-secondary text-sm">Days saved</div>
                </div>
                <div className="impact-item text-center">
                  <div className="impact-value text-success font-bold text-lg">
                    R{Math.round(impact.impact.interest_saved / impact.impact.months_saved)}
                  </div>
                  <div className="impact-label text-secondary text-sm">Interest saved per month</div>
                </div>
                <div className="impact-item text-center">
                  <div className="impact-value text-success font-bold text-lg">
                    {Math.round(impact.impact.months_saved * 30 / (extraPayment / 50))} days
                  </div>
                  <div className="impact-label text-secondary text-sm">Per R50 extra</div>
                </div>
              </div>
              <div className="impact-message mt-3 text-center">
                <p className="text-success font-bold">
                  <i className="fas fa-magic me-1"></i>
                  Every R50 extra removes ~{Math.round(impact.impact.months_saved * 30 / (extraPayment / 50))} days from your debt!
                </p>
              </div>
            </div>
          )}
          
          <div className="form-actions mt-4">
            <button 
              className="btn btn-primary"
              onClick={handleCommit}
              disabled={extraPayment <= 0}
            >
              <i className="fas fa-handshake me-2"></i>
              Commit to Extra Payment
            </button>
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

      {/* Freedom Chart */}
      {(() => {
        const showChart = baseSimulation || (impact && !loading);
        const timeline = impact && !loading ? impact.enhanced_simulation.simulation_results : baseSimulation?.simulation_results;
        console.log('📊 Chart render check:', { showChart, hasTimeline: !!timeline, baseSimulation: !!baseSimulation, impact: !!impact, loading });
        return showChart && (
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="card-title">
                <i className="fas fa-chart-line me-2"></i>
                {impact && !loading ? 'Freedom Chart with Extra Payment' : 'Freedom Chart'}
              </h4>
            </div>
            <div className="card-body">
              <FreedomChart 
                timeline={timeline} 
                title={impact && !loading ? "Your Path to Financial Freedom with Extra Payment" : "Your Path to Financial Freedom"}
                summary={impact && !loading ? impact.enhanced_simulation.summary : baseSimulation?.summary}
              />
            </div>
          </div>
        );
      })()}

      {/* Comparison Table */}
      {impact && !loading && (
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-table me-2"></i>
              Before vs After Comparison
            </h4>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th className="text-center">Without Extra Payment</th>
                    <th className="text-center">With Extra Payment</th>
                    <th className="text-center">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold">Months to Zero</td>
                    <td className="text-center text-secondary">
                      {formatMonthsToYears(impact.base_simulation.summary.months_to_zero)}
                    </td>
                    <td className="text-center text-success">
                      {formatMonthsToYears(impact.enhanced_simulation.summary.months_to_zero)}
                    </td>
                    <td className="text-center text-success">
                      -{impact.impact.months_saved} months
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Total Interest Paid</td>
                    <td className="text-center text-secondary">
                      {formatZAR(impact.base_simulation.summary.total_interest_paid)}
                    </td>
                    <td className="text-center text-success">
                      {formatZAR(impact.enhanced_simulation.summary.total_interest_paid)}
                    </td>
                    <td className="text-center text-success">
                      -{formatZAR(impact.impact.interest_saved)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Debt-Free Date</td>
                    <td className="text-center text-secondary">
                      {new Date(impact.base_simulation.summary.debt_free_date).toLocaleDateString('en-ZA')}
                    </td>
                    <td className="text-center text-success">
                      {new Date(impact.enhanced_simulation.summary.debt_free_date).toLocaleDateString('en-ZA')}
                    </td>
                    <td className="text-center text-success">
                      {impact.impact.months_saved} months earlier
                    </td>
                  </tr>
                </tbody>
              </table>
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
