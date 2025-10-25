import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatZAR } from '../utils/api';

const TimelineChart = ({ data, strategy }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-chart-line fa-3x text-gray-400 mb-3"></i>
            <h4>No Timeline Data</h4>
            <p className="text-gray-300">Add some debts to see your financial freedom timeline</p>
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
    } else if (name === 'payments_made') {
      return [formatZAR(value), 'Payments Made'];
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
            <i className="fas fa-chart-line me-2"></i>
            Debt Balance Over Time
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
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                <Line 
                  type="monotone" 
                  dataKey="total_balance" 
                  stroke={getStrategyColor(strategy)}
                  strokeWidth={3}
                  name="Total Balance"
                  dot={{ fill: getStrategyColor(strategy), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: getStrategyColor(strategy), strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="interest_paid" 
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Interest Paid"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="payments_made" 
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Payments Made"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-insights mt-3">
            <div className="row">
              <div className="col-md-4">
                <div className="insight-item">
                  <div className="insight-value text-mint">
                    {data.length > 0 ? formatZAR(data[data.length - 1].total_balance) : formatZAR(0)}
                  </div>
                  <div className="insight-label text-gray-300">
                    Final Balance
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="insight-item">
                  <div className="insight-value text-warning">
                    {data.reduce((sum, item) => sum + item.interest_paid, 0).toFixed(0) > 0 
                      ? formatZAR(data.reduce((sum, item) => sum + item.interest_paid, 0))
                      : formatZAR(0)
                    }
                  </div>
                  <div className="insight-label text-gray-300">
                    Total Interest Paid
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="insight-item">
                  <div className="insight-value text-success">
                    {data.length} months
                  </div>
                  <div className="insight-label text-gray-300">
                    Time to Freedom
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
