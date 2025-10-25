import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatZAR } from '../utils/api';

const BalanceTrendChart = ({ data, strategy }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-chart-area fa-3x text-gray-400 mb-3"></i>
            <h4>No Balance Trend Data</h4>
            <p className="text-gray-300">Add some debts to see your balance trend</p>
          </div>
        </div>
      </div>
    );
  }

  const formatTooltipValue = (value, name) => {
    if (name === 'total_balance') {
      return [formatZAR(value), 'Total Balance'];
    } else if (name === 'interest_paid') {
      return [formatZAR(value), 'Interest Paid'];
    } else if (name === 'principal_paid') {
      return [formatZAR(value), 'Principal Paid'];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem) => {
    return `Month ${tickItem}`;
  };

  const formatYAxisLabel = (value) => {
    return formatZAR(value);
  };

  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case 'avalanche':
        return '#ef4444'; // Red
      case 'snowball':
        return '#3b82f6'; // Blue
      case 'hybrid':
        return '#00d4aa'; // Mint
      default:
        return '#00d4aa';
    }
  };

  const getStrategyName = (strategy) => {
    switch (strategy) {
      case 'avalanche':
        return 'Avalanche Strategy';
      case 'snowball':
        return 'Snowball Strategy';
      case 'hybrid':
        return 'Hybrid Strategy';
      default:
        return 'Strategy';
    }
  };

  return (
    <div className="chart-container">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">
            <i className="fas fa-chart-area me-2"></i>
            Payment Breakdown Over Time
          </h4>
          <div className="strategy-badge">
            <span className="badge badge-info">
              <i className="fas fa-chart-bar me-1"></i>
              {getStrategyName(strategy)}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis 
                  dataKey="month" 
                  stroke="#d4d4d4"
                  tickFormatter={formatXAxisLabel}
                />
                <YAxis 
                  stroke="#d4d4d4"
                  tickFormatter={formatYAxisLabel}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => `Month ${label}`}
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="total_balance" 
                  stackId="1"
                  stroke={getStrategyColor(strategy)}
                  fill={getStrategyColor(strategy)}
                  fillOpacity={0.3}
                  name="Total Balance"
                />
                <Area 
                  type="monotone" 
                  dataKey="interest_paid" 
                  stackId="2"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                  name="Interest Paid"
                />
                <Area 
                  type="monotone" 
                  dataKey="principal_paid" 
                  stackId="2"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.6}
                  name="Principal Paid"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-insights mt-3">
            <div className="row">
              <div className="col-md-3">
                <div className="insight-item">
                  <div className="insight-value text-mint">
                    {data.length > 0 ? formatZAR(data[data.length - 1].total_balance) : formatZAR(0)}
                  </div>
                  <div className="insight-label text-gray-300">
                    Final Balance
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="insight-item">
                  <div className="insight-value text-warning">
                    {data.reduce((sum, item) => sum + item.interest_paid, 0).toFixed(0) > 0 
                      ? formatZAR(data.reduce((sum, item) => sum + item.interest_paid, 0))
                      : formatZAR(0)
                    }
                  </div>
                  <div className="insight-label text-gray-300">
                    Total Interest
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="insight-item">
                  <div className="insight-value text-success">
                    {data.reduce((sum, item) => sum + item.principal_paid, 0).toFixed(0) > 0 
                      ? formatZAR(data.reduce((sum, item) => sum + item.principal_paid, 0))
                      : formatZAR(0)
                    }
                  </div>
                  <div className="insight-label text-gray-300">
                    Total Principal
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="insight-item">
                  <div className="insight-value text-info">
                    {data.length} months
                  </div>
                  <div className="insight-label text-gray-300">
                    Timeline
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="chart-legend mt-3">
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: getStrategyColor(strategy) }}></div>
                <span className="legend-label">Total Balance</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="legend-label">Interest Paid</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
                <span className="legend-label">Principal Paid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceTrendChart;
