import React from 'react';
import { formatZAR } from '../utils/api';

const MonthsToZeroCard = ({ monthsToZero, debtFreeDate, strategy }) => {
  const formatMonthsToYears = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years}y ${remainingMonths}m`;
    }
  };

  const getStrategyIcon = (strategy) => {
    switch (strategy) {
      case 'avalanche':
        return 'fas fa-fire';
      case 'snowball':
        return 'fas fa-snowflake';
      case 'hybrid':
        return 'fas fa-balance-scale';
      default:
        return 'fas fa-chart-line';
    }
  };

  const getStrategyName = (strategy) => {
    switch (strategy) {
      case 'avalanche':
        return 'Avalanche';
      case 'snowball':
        return 'Snowball';
      case 'hybrid':
        return 'Hybrid';
      default:
        return 'Strategy';
    }
  };

  const getMotivationalMessage = (months) => {
    if (months <= 12) {
      return "You're almost there! 🎉";
    } else if (months <= 24) {
      return "Great progress! Keep it up! 💪";
    } else if (months <= 60) {
      return "You're on the right track! 📈";
    } else {
      return "Every payment counts! 💰";
    }
  };

  return (
    <div className="card months-to-zero-card">
      <div className="card-header">
        <h4 className="card-title">
          <i className={`${getStrategyIcon(strategy)} me-2`}></i>
          Debt-Free in {formatMonthsToYears(monthsToZero)}
        </h4>
      </div>
      <div className="card-body text-center">
        <div className="months-to-zero">
          {monthsToZero}
        </div>
        <div className="months-label text-gray-300 mb-3">
          months to freedom
        </div>
        
        {debtFreeDate && (
          <div className="debt-free-date mb-3">
            <i className="fas fa-calendar-check me-2 text-mint"></i>
            <span className="text-gray-300">
              Target: {new Date(debtFreeDate).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
        
        <div className="strategy-info mb-3">
          <span className="badge badge-info">
            <i className={`${getStrategyIcon(strategy)} me-1`}></i>
            {getStrategyName(strategy)} Strategy
          </span>
        </div>
        
        <div className="motivational-message">
          <p className="text-mint mb-0">
            <i className="fas fa-heart me-1"></i>
            {getMotivationalMessage(monthsToZero)}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-container mt-3">
          <div className="progress-label text-gray-300 mb-1">
            Progress to Freedom
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(100, Math.max(0, (120 - monthsToZero) / 120 * 100))}%` 
              }}
            ></div>
          </div>
          <div className="progress-text text-gray-400 mt-1">
            {monthsToZero <= 120 ? 'On track!' : 'Keep pushing!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthsToZeroCard;
