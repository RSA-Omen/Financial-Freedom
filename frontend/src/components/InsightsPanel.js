import React, { useState, useEffect } from 'react';
import { getTopTargets, getMarginalBenefit } from '../utils/api';
import { formatZAR, formatPercentage } from '../utils/api';

const InsightsPanel = ({ debts }) => {
  const [topTargets, setTopTargets] = useState(null);
  const [marginalBenefit, setMarginalBenefit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extraAmount, setExtraAmount] = useState(1000);

  useEffect(() => {
    if (debts && debts.length > 0) {
      loadInsights();
    }
  }, [debts, extraAmount]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const [targetsResult, benefitResult] = await Promise.all([
        getTopTargets(),
        getMarginalBenefit(extraAmount)
      ]);
      
      setTopTargets(targetsResult);
      setMarginalBenefit(benefitResult);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtraAmountChange = (e) => {
    setExtraAmount(parseFloat(e.target.value) || 0);
  };

  if (!debts || debts.length === 0) {
    return (
      <div className="empty-state">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-lightbulb fa-3x text-gray-400 mb-3"></i>
            <h3>No Debts to Analyze</h3>
            <p className="text-gray-300 mb-4">
              Add some debts to get personalized insights and recommendations.
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
            <h3>Analyzing Your Debts...</h3>
            <p className="text-gray-300">Generating personalized insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-panel">
      {/* Marginal Benefit Calculator */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-calculator me-2"></i>
            ROI Calculator
          </h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-money-bill-wave me-1"></i>
              Extra Payment Amount (ZAR)
            </label>
            <input
              type="number"
              value={extraAmount}
              onChange={handleExtraAmountChange}
              className="form-input"
              placeholder="1000.00"
              step="0.01"
              min="0"
            />
            <div className="form-help text-gray-400 mt-1">
              See the return on investment for your extra payment
            </div>
          </div>
          
          {marginalBenefit && (
            <div className="benefit-analysis mt-3">
              <div className="benefit-metrics">
                <div className="benefit-item">
                  <div className="benefit-label text-gray-300">Monthly Benefit:</div>
                  <div className="benefit-value text-success">
                    {formatZAR(marginalBenefit.monthly_benefit)}
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-label text-gray-300">Annual Benefit:</div>
                  <div className="benefit-value text-success">
                    {formatZAR(marginalBenefit.annual_benefit)}
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-label text-gray-300">Benefit per Rand:</div>
                  <div className="benefit-value text-mint">
                    {formatPercentage(marginalBenefit.benefit_per_rand * 100)}
                  </div>
                </div>
              </div>
              
              {marginalBenefit.target_debt && (
                <div className="target-info mt-3">
                  <div className="target-debt">
                    <h5 className="text-mint">
                      <i className="fas fa-bullseye me-2"></i>
                      Best Target: {marginalBenefit.target_debt.name}
                    </h5>
                    <p className="text-gray-300">
                      APR: {formatPercentage(marginalBenefit.target_debt.apr)} - 
                      This debt offers the highest return on your extra payment
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Targets */}
      {topTargets && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-bullseye me-2"></i>
              Top 3 Debt Targets
            </h3>
          </div>
          <div className="card-body">
            <div className="targets-grid">
              {topTargets.targets.map((target, index) => {
                if (!target.target) return null;
                
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
                
                const strategyNames = {
                  avalanche: 'Avalanche',
                  snowball: 'Snowball',
                  hybrid: 'Hybrid'
                };

                return (
                  <div key={index} className="target-card">
                    <div className="target-header">
                      <div className="target-rank">
                        <span className="rank-number">#{index + 1}</span>
                      </div>
                      <div className="target-strategy">
                        <i className={`${strategyIcons[target.strategy]} me-1`}></i>
                        <span className={strategyColors[target.strategy]}>
                          {strategyNames[target.strategy]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="target-content">
                      <h5 className="target-name text-mint">
                        {target.target.name}
                      </h5>
                      
                      <div className="target-details">
                        <div className="detail-row">
                          <span className="detail-label text-gray-300">Balance:</span>
                          <span className="detail-value text-mint">
                            {formatZAR(target.target.balance)}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label text-gray-300">APR:</span>
                          <span className="detail-value text-warning">
                            {formatPercentage(target.target.apr)}
                          </span>
                        </div>
                        {target.target.min_payment && (
                          <div className="detail-row">
                            <span className="detail-label text-gray-300">Min Payment:</span>
                            <span className="detail-value text-gray-300">
                              {formatZAR(target.target.min_payment)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="target-rationale">
                        <p className="text-gray-300 small">
                          <i className="fas fa-info-circle me-1"></i>
                          {target.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Debt Analysis */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-chart-pie me-2"></i>
            Debt Portfolio Analysis
          </h3>
        </div>
        <div className="card-body">
          <div className="portfolio-analysis">
            <div className="analysis-grid">
              <div className="analysis-item">
                <div className="analysis-icon text-danger">
                  <i className="fas fa-fire fa-2x"></i>
                </div>
                <div className="analysis-content">
                  <h5 className="text-danger">High Interest Debts</h5>
                  <p className="text-gray-300">
                    {debts.filter(d => d.apr > 15).length} debt(s) with APR > 15%
                  </p>
                  <p className="text-gray-400 small">
                    These should be your priority targets for extra payments
                  </p>
                </div>
              </div>
              
              <div className="analysis-item">
                <div className="analysis-icon text-info">
                  <i className="fas fa-snowflake fa-2x"></i>
                </div>
                <div className="analysis-content">
                  <h5 className="text-info">Quick Wins</h5>
                  <p className="text-gray-300">
                    {debts.filter(d => d.principal < 5000).length} debt(s) under R5,000
                  </p>
                  <p className="text-gray-400 small">
                    Small balances that can be paid off quickly for motivation
                  </p>
                </div>
              </div>
              
              <div className="analysis-item">
                <div className="analysis-icon text-mint">
                  <i className="fas fa-balance-scale fa-2x"></i>
                </div>
                <div className="analysis-content">
                  <h5 className="text-mint">Balanced Approach</h5>
                  <p className="text-gray-300">
                    Consider both interest rate and balance size
                  </p>
                  <p className="text-gray-400 small">
                    Hybrid strategy balances math and psychology
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-lightbulb me-2"></i>
            Actionable Insights
          </h3>
        </div>
        <div className="card-body">
          <div className="insights-list">
            {debts.filter(d => d.apr > 20).length > 0 && (
              <div className="insight-item">
                <div className="insight-icon text-danger">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="insight-content">
                  <h6 className="text-danger">High Interest Alert</h6>
                  <p className="text-gray-300">
                    You have {debts.filter(d => d.apr > 20).length} debt(s) with APR > 20%. 
                    These are costing you significantly in interest. Consider prioritizing these for extra payments.
                  </p>
                </div>
              </div>
            )}
            
            {debts.filter(d => d.principal < 2000).length > 0 && (
              <div className="insight-item">
                <div className="insight-icon text-success">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="insight-content">
                  <h6 className="text-success">Quick Win Opportunity</h6>
                  <p className="text-gray-300">
                    You have {debts.filter(d => d.principal < 2000).length} debt(s) under R2,000. 
                    These could be paid off quickly for a psychological boost and freed payment amount.
                  </p>
                </div>
              </div>
            )}
            
            {debts.reduce((sum, d) => sum + d.min_payment, 0) > 5000 && (
              <div className="insight-item">
                <div className="insight-icon text-warning">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="insight-content">
                  <h6 className="text-warning">High Monthly Burden</h6>
                  <p className="text-gray-300">
                    Your total minimum payments are {formatZAR(debts.reduce((sum, d) => sum + d.min_payment, 0))}. 
                    Consider if you can afford additional payments or need to restructure.
                  </p>
                </div>
              </div>
            )}
            
            <div className="insight-item">
              <div className="insight-icon text-mint">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="insight-content">
                <h6 className="text-mint">Optimization Opportunity</h6>
                <p className="text-gray-300">
                  Use the strategy comparison to find the optimal repayment order. 
                  Even small changes in payment allocation can save significant interest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-heart me-2"></i>
            Your Financial Freedom Journey
          </h3>
        </div>
        <div className="card-body">
          <div className="motivation-content">
            <div className="motivation-message text-center mb-4">
              <h4 className="text-mint">
                <i className="fas fa-star me-2"></i>
                You're Taking Control!
              </h4>
              <p className="text-gray-300">
                By analyzing your debts and planning your repayment strategy, you're already on the path to financial freedom. 
                Every extra payment brings you closer to your goal.
              </p>
            </div>
            
            <div className="motivation-tips">
              <h5 className="text-mint mb-3">
                <i className="fas fa-lightbulb me-2"></i>
                Tips for Success
              </h5>
              <ul className="text-gray-300">
                <li>Start with small extra payments and build momentum</li>
                <li>Celebrate each debt payoff as a milestone</li>
                <li>Use freed payments to accelerate the next debt</li>
                <li>Track your progress regularly to stay motivated</li>
                <li>Consider automatic payments to avoid temptation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
