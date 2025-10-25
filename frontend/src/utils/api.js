/**
 * API client for Financial Freedom Platform
 * Handles all communication with Flask backend
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================================================
// DEBT MANAGEMENT API
// ============================================================================

export const getDebts = async () => {
  try {
    const response = await api.get('/api/debts');
    return response.data;
  } catch (error) {
    console.error('Error fetching debts:', error);
    throw error;
  }
};

export const getDebt = async (debtId) => {
  try {
    const response = await api.get(`/api/debts/${debtId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching debt:', error);
    throw error;
  }
};

export const createDebt = async (debtData) => {
  try {
    const response = await api.post('/api/debts', debtData);
    return response.data;
  } catch (error) {
    console.error('Error creating debt:', error);
    throw error;
  }
};

export const updateDebt = async (debtId, debtData) => {
  try {
    const response = await api.put(`/api/debts/${debtId}`, debtData);
    return response.data;
  } catch (error) {
    console.error('Error updating debt:', error);
    throw error;
  }
};

export const deleteDebt = async (debtId) => {
  try {
    const response = await api.delete(`/api/debts/${debtId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting debt:', error);
    throw error;
  }
};

export const getDebtSummary = async () => {
  try {
    const response = await api.get('/api/debts/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching debt summary:', error);
    throw error;
  }
};

// ============================================================================
// CALCULATION & SIMULATION API
// ============================================================================

export const runSimulation = async (strategy = 'avalanche', extraPayment = 0) => {
  try {
    const response = await api.post('/api/calculate/simulate', {
      strategy,
      extra_payment: extraPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error running simulation:', error);
    throw error;
  }
};

export const calculateAvalanche = async (extraPayment = 0) => {
  try {
    const response = await api.post('/api/calculate/avalanche', {
      extra_payment: extraPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating avalanche strategy:', error);
    throw error;
  }
};

export const calculateSnowball = async (extraPayment = 0) => {
  try {
    const response = await api.post('/api/calculate/snowball', {
      extra_payment: extraPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating snowball strategy:', error);
    throw error;
  }
};

export const calculateHybrid = async (extraPayment = 0) => {
  try {
    const response = await api.post('/api/calculate/hybrid', {
      extra_payment: extraPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating hybrid strategy:', error);
    throw error;
  }
};

export const compareStrategies = async (extraPayment = 0) => {
  try {
    const response = await api.post('/api/calculate/compare', {
      extra_payment: extraPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error comparing strategies:', error);
    throw error;
  }
};

export const calculateImpact = async (baseExtra, additionalExtra, strategy = 'avalanche') => {
  try {
    const response = await api.post('/api/calculate/impact', {
      base_extra: baseExtra,
      additional_extra: additionalExtra,
      strategy
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating impact:', error);
    throw error;
  }
};

export const getMonthsToZero = async (strategy = 'avalanche', extraPayment = 0) => {
  try {
    const response = await api.post('/api/calculate/months-to-zero', {
      strategy,
      extra_payment: extraPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error getting months to zero:', error);
    throw error;
  }
};

// ============================================================================
// INSIGHTS & RECOMMENDATIONS API
// ============================================================================

export const getRecommendation = async (strategy = 'avalanche') => {
  try {
    const response = await api.get(`/api/insights/recommend?strategy=${strategy}`);
    return response.data;
  } catch (error) {
    console.error('Error getting recommendation:', error);
    throw error;
  }
};

export const getTopTargets = async () => {
  try {
    const response = await api.get('/api/insights/top-targets');
    return response.data;
  } catch (error) {
    console.error('Error getting top targets:', error);
    throw error;
  }
};

export const getMarginalBenefit = async (extraAmount) => {
  try {
    const response = await api.post('/api/insights/marginal-benefit', {
      extra_amount: extraAmount
    });
    return response.data;
  } catch (error) {
    console.error('Error getting marginal benefit:', error);
    throw error;
  }
};

// ============================================================================
// ANALYTICS API (for charts)
// ============================================================================

export const getTimelineData = async (strategy = 'avalanche', extraPayment = 0) => {
  try {
    const response = await api.post('/api/analytics/timeline', {
      strategy,
      extra_payment: extraPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error getting timeline data:', error);
    throw error;
  }
};

export const getBalanceTrendData = async (strategy = 'avalanche', extraPayment = 0) => {
  try {
    const response = await api.post('/api/analytics/balance-trend', {
      strategy,
      extra_payment: extraPayment
    });
    return response.data;
  } catch (error) {
    console.error('Error getting balance trend data:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatZAR = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

export const formatPercentage = (number, decimals = 2) => {
  return `${formatNumber(number, decimals)}%`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatMonthsToYears = (months) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
};

// Error handling utility
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.message) {
    return error.message;
  } else {
    return defaultMessage;
  }
};

export default api;
