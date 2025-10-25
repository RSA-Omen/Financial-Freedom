import React, { useState, useEffect } from 'react';
import DebtCard from './DebtCard';
import MonthsToZeroCard from './MonthsToZeroCard';
import TimelineChart from './TimelineChart';
import BalanceTrendChart from './BalanceTrendChart';
import { getMonthsToZero, getTimelineData, getBalanceTrendData } from '../utils/api';
import { formatZAR } from '../utils/api';

const Dashboard = ({ debts, summary, onDebtUpdated, onDebtDeleted }) => {
  const [monthsToZero, setMonthsToZero] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [balanceTrendData, setBalanceTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('avalanche');

  useEffect(() => {
    if (debts && debts.length > 0) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [debts, selectedStrategy]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [monthsData, timeline, balanceTrend] = await Promise.all([
        getMonthsToZero(selectedStrategy, 0),
        getTimelineData(selectedStrategy, 0),
        getBalanceTrendData(selectedStrategy, 0)
      ]);
      
      setMonthsToZero(monthsData);
      setTimelineData(timeline.timeline || []);
      setBalanceTrendData(balanceTrend.trend || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyChange = (strategy) => {
    setSelectedStrategy(strategy);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-spinner fa-spin fa-2x text-mint mb-3"></i>
            <h3>Loading Dashboard...</h3>
            <p className="text-gray-300">Calculating your financial freedom timeline</p>
          </div>
        </div>
      </div>
    );
  }

  if (!debts || debts.length === 0) {
    return (
      <div className="empty-state">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-credit-card fa-3x text-gray-400 mb-3"></i>
            <h3>No Debts Found</h3>
            <p className="text-gray-300 mb-4">
              Start your journey to financial freedom by adding your first debt.
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
    <div className="dashboard">
      {/* Strategy Selector */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-chart-line me-2"></i>
            Repayment Strategy
          </h3>
        </div>
        <div className="card-body">
          <div className="btn-group">
            <button 
              className={`btn ${selectedStrategy === 'avalanche' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStrategyChange('avalanche')}
            >
              <i className="fas fa-fire me-1"></i>
              Avalanche (Mathematical)
            </button>
            <button 
              className={`btn ${selectedStrategy === 'snowball' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStrategyChange('snowball')}
            >
              <i className="fas fa-snowflake me-1"></i>
              Snowball (Psychological)
            </button>
            <button 
              className={`btn ${selectedStrategy === 'hybrid' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleStrategyChange('hybrid')}
            >
              <i className="fas fa-balance-scale me-1"></i>
              Hybrid (Balanced)
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-wallet me-2"></i>
              Total Debt
            </h4>
          </div>
          <div className="card-body">
            <div className="summary-value text-mint">
              {formatZAR(summary?.total_principal || 0)}
            </div>
            <div className="summary-label text-gray-300">
              {summary?.debt_count || 0} active debt{(summary?.debt_count || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-calendar-alt me-2"></i>
              Monthly Payments
            </h4>
          </div>
          <div className="card-body">
            <div className="summary-value text-mint">
              {formatZAR(summary?.total_min_payments || 0)}
            </div>
            <div className="summary-label text-gray-300">
              Minimum payments
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-percentage me-2"></i>
              Average APR
            </h4>
          </div>
          <div className="card-body">
            <div className="summary-value text-mint">
              {(summary?.average_apr || 0).toFixed(2)}%
            </div>
            <div className="summary-label text-gray-300">
              Weighted average
            </div>
          </div>
        </div>

        {monthsToZero && (
          <MonthsToZeroCard 
            monthsToZero={monthsToZero.months_to_zero}
            debtFreeDate={monthsToZero.debt_free_date}
            strategy={selectedStrategy}
          />
        )}
      </div>

      {/* Debt Cards */}
      <div className="debt-section">
        <h3 className="section-title">
          <i className="fas fa-credit-card me-2"></i>
          Your Debts
        </h3>
        <div className="debt-grid">
          {debts.map(debt => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onUpdated={onDebtUpdated}
              onDeleted={onDebtDeleted}
            />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      {timelineData.length > 0 && (
        <div className="charts-section">
          <h3 className="section-title">
            <i className="fas fa-chart-area me-2"></i>
            Financial Freedom Timeline
          </h3>
          
          <div className="chart-container">
            <TimelineChart 
              data={timelineData}
              strategy={selectedStrategy}
            />
          </div>

          <div className="chart-container">
            <BalanceTrendChart 
              data={balanceTrendData}
              strategy={selectedStrategy}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              <i className="fas fa-bolt me-2"></i>
              Quick Actions
            </h4>
          </div>
          <div className="card-body">
            <div className="btn-group">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.hash = '#commit'}
              >
                <i className="fas fa-plus-circle me-1"></i>
                Add Extra Payment
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.hash = '#strategies'}
              >
                <i className="fas fa-chart-bar me-1"></i>
                Compare Strategies
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => window.location.hash = '#insights'}
              >
                <i className="fas fa-lightbulb me-1"></i>
                Get Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
