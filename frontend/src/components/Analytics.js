import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Analytics({ debts, simulationResults }) {
  const [scenarios, setScenarios] = useState({
    jobLoss: { enabled: false, months: 6, reducedIncome: 0.5 },
    windfall: { enabled: false, amount: 50000, month: 12 },
    rateChange: { enabled: false, newRate: 0.08, affectedDebts: [] }
  });
  
  const [scenarioResults, setScenarioResults] = useState(null);
  const [roiData, setRoiData] = useState(null);
  const [consolidationAnalysis, setConsolidationAnalysis] = useState(null);

  // Calculate ROI for extra payments
  useEffect(() => {
    if (simulationResults?.simulation_results) {
      calculateROI();
    }
  }, [simulationResults]);

  const calculateROI = () => {
    const extraPaymentAmounts = [0, 1000, 2000, 3000, 5000, 10000];
    const roiResults = [];

    extraPaymentAmounts.forEach(extra => {
      // This would call the backend API for each extra payment amount
      // For now, we'll calculate a simplified version
      const monthsSaved = Math.max(0, simulationResults.summary.months_to_zero - (simulationResults.summary.months_to_zero * (1 - extra / 10000)));
      const interestSaved = simulationResults.summary.total_interest_paid * (extra / 10000);
      const roi = extra > 0 ? (interestSaved / extra) * 100 : 0;
      
      roiResults.push({
        extraPayment: extra,
        monthsSaved: Math.round(monthsSaved),
        interestSaved: Math.round(interestSaved),
        roi: Math.round(roi)
      });
    });

    setRoiData(roiResults);
  };

  const runScenarioAnalysis = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/calculate/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarios: scenarios,
          baseSimulation: simulationResults
        })
      });

      if (response.ok) {
        const data = await response.json();
        setScenarioResults(data);
      }
    } catch (error) {
      console.error('Error running scenario analysis:', error);
    }
  };

  const runConsolidationAnalysis = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/calculate/consolidation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          debts: debts,
          consolidationRate: 0.09,
          consolidationTerm: 60
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConsolidationAnalysis(data);
      }
    } catch (error) {
      console.error('Error running consolidation analysis:', error);
    }
  };

  const formatCurrency = (value) => `R ${parseFloat(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="analytics">
      <div className="card mb-lg">
        <div className="card-header">
          <h2 className="card-title">Analytics & Insights</h2>
          <p className="text-secondary">Advanced financial analysis and scenario planning</p>
        </div>
        <div className="card-body">
          
          {/* What-if Scenarios */}
          <div className="scenario-section mb-lg">
            <h3 className="text-primary mb-md">
              <i className="fas fa-crystal-ball me-2"></i>
              What-if Scenarios
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
              {/* Job Loss Scenario */}
              <div className="card card-sm">
                <div className="card-header py-sm">
                  <h4 className="card-title text-warning text-sm">Job Loss Impact</h4>
                </div>
                <div className="card-body py-sm">
                  <div className="form-group mb-sm">
                    <label className="form-label text-xs">Duration (months)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={scenarios.jobLoss.months}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        jobLoss: { ...scenarios.jobLoss, months: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="form-group mb-sm">
                    <label className="form-label text-xs">Income Reduction (%)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={scenarios.jobLoss.reducedIncome * 100}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        jobLoss: { ...scenarios.jobLoss, reducedIncome: parseFloat(e.target.value) / 100 }
                      })}
                    />
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={scenarios.jobLoss.enabled}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        jobLoss: { ...scenarios.jobLoss, enabled: e.target.checked }
                      })}
                    />
                    <label className="form-check-label text-xs">Enable Scenario</label>
                  </div>
                </div>
              </div>

              {/* Windfall Scenario */}
              <div className="card card-sm">
                <div className="card-header py-sm">
                  <h4 className="card-title text-success text-sm">Windfall Impact</h4>
                </div>
                <div className="card-body py-sm">
                  <div className="form-group mb-sm">
                    <label className="form-label text-xs">Amount (R)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={scenarios.windfall.amount}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        windfall: { ...scenarios.windfall, amount: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="form-group mb-sm">
                    <label className="form-label text-xs">Month Applied</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={scenarios.windfall.month}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        windfall: { ...scenarios.windfall, month: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={scenarios.windfall.enabled}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        windfall: { ...scenarios.windfall, enabled: e.target.checked }
                      })}
                    />
                    <label className="form-check-label text-xs">Enable Scenario</label>
                  </div>
                </div>
              </div>

              {/* Rate Change Scenario */}
              <div className="card card-sm">
                <div className="card-header py-sm">
                  <h4 className="card-title text-info text-sm">Rate Change Impact</h4>
                </div>
                <div className="card-body py-sm">
                  <div className="form-group mb-sm">
                    <label className="form-label text-xs">New Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-control-sm"
                      value={scenarios.rateChange.newRate * 100}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        rateChange: { ...scenarios.rateChange, newRate: parseFloat(e.target.value) / 100 }
                      })}
                    />
                  </div>
                  <div className="form-group mb-sm">
                    <label className="form-label text-xs">Affected Debts</label>
                    <select
                      className="form-control form-control-sm"
                      multiple
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        rateChange: { ...scenarios.rateChange, affectedDebts: Array.from(e.target.selectedOptions, option => option.value) }
                      })}
                    >
                      {debts?.map(debt => (
                        <option key={debt.id} value={debt.id}>{debt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={scenarios.rateChange.enabled}
                      onChange={(e) => setScenarios({
                        ...scenarios,
                        rateChange: { ...scenarios.rateChange, enabled: e.target.checked }
                      })}
                    />
                    <label className="form-check-label text-xs">Enable Scenario</label>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={runScenarioAnalysis}
              className="btn btn-primary"
              disabled={!scenarios.jobLoss.enabled && !scenarios.windfall.enabled && !scenarios.rateChange.enabled}
            >
              <i className="fas fa-play me-2"></i>
              Run Scenario Analysis
            </button>
          </div>

          {/* ROI Calculator */}
          <div className="roi-section mb-lg">
            <h3 className="text-primary mb-md">
              <i className="fas fa-chart-line me-2"></i>
              ROI Calculator for Extra Payments
            </h3>
            
            {roiData && (
              <div className="card">
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={roiData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="extraPayment" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="monthsSaved" stroke="#8884d8" name="Months Saved" />
                      <Line type="monotone" dataKey="roi" stroke="#82ca9d" name="ROI %" />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-md">
                    <h5>ROI Analysis</h5>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Extra Payment</th>
                            <th>Months Saved</th>
                            <th>Interest Saved</th>
                            <th>ROI %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roiData.map((row, index) => (
                            <tr key={index}>
                              <td>{formatCurrency(row.extraPayment)}</td>
                              <td>{row.monthsSaved}</td>
                              <td>{formatCurrency(row.interestSaved)}</td>
                              <td className={row.roi > 0 ? 'text-success' : 'text-secondary'}>{row.roi}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Debt Consolidation Analysis */}
          <div className="consolidation-section mb-lg">
            <h3 className="text-primary mb-md">
              <i className="fas fa-compress-arrows-alt me-2"></i>
              Debt Consolidation Analysis
            </h3>
            
            <div className="card">
              <div className="card-body">
                <p className="text-secondary mb-md">
                  Compare your current debt structure with a consolidated loan option.
                </p>
                
                <div className="row mb-md">
                  <div className="col-md-6">
                    <h5>Current Structure</h5>
                    <ul className="list-unstyled">
                      {debts?.map(debt => (
                        <li key={debt.id} className="mb-sm">
                          <strong>{debt.name}:</strong> {formatCurrency(debt.principal)} @ {(debt.apr * 100).toFixed(2)}%
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h5>Consolidation Options</h5>
                    <div className="form-group">
                      <label className="form-label">Consolidation Rate (%)</label>
                      <input type="number" step="0.01" className="form-control" defaultValue="9.0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Term (months)</label>
                      <input type="number" className="form-control" defaultValue="60" />
                    </div>
                  </div>
                </div>
                
                <button onClick={runConsolidationAnalysis} className="btn btn-outline-primary">
                  <i className="fas fa-calculator me-2"></i>
                  Analyze Consolidation
                </button>
              </div>
            </div>
          </div>

          {/* Refinancing Recommendations */}
          <div className="refinancing-section">
            <h3 className="text-primary mb-md">
              <i className="fas fa-exchange-alt me-2"></i>
              Refinancing Recommendations
            </h3>
            
            <div className="card">
              <div className="card-body">
                <p className="text-secondary mb-md">
                  Get personalized refinancing recommendations based on current market rates.
                </p>
                
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Coming Soon:</strong> Real-time rate comparison and refinancing analysis will be available in the next update.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Analytics;
