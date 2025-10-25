import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DebtForm from './components/DebtForm';
import StrategyComparison from './components/StrategyComparison';
import CommitPanel from './components/CommitPanel';
import InsightsPanel from './components/InsightsPanel';
import { getDebts, getDebtSummary } from './utils/api';
import './App.css';

function App() {
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [debtsData, summaryData] = await Promise.all([
        getDebts(),
        getDebtSummary()
      ]);
      setDebts(debtsData.debts || []);
      setSummary(summaryData.summary || {});
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDebtAdded = () => {
    loadData();
  };

  const handleDebtUpdated = () => {
    loadData();
  };

  const handleDebtDeleted = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="card">
          <div className="card-body text-center">
            <i className="fas fa-spinner fa-spin fa-2x text-mint mb-3"></i>
            <h3>Loading Financial Freedom Platform...</h3>
            <p className="text-gray-300">Preparing your debt management dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar navbar-dark">
        <div className="container">
          <div className="navbar-brand">
            <i className="fas fa-chart-line text-mint me-2"></i>
            Financial Freedom
          </div>
          <div className="navbar-nav">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="fas fa-tachometer-alt me-1"></i>
              Dashboard
            </button>
            <button 
              className={`nav-link ${activeTab === 'debts' ? 'active' : ''}`}
              onClick={() => setActiveTab('debts')}
            >
              <i className="fas fa-credit-card me-1"></i>
              Manage Debts
            </button>
            <button 
              className={`nav-link ${activeTab === 'strategies' ? 'active' : ''}`}
              onClick={() => setActiveTab('strategies')}
            >
              <i className="fas fa-chart-bar me-1"></i>
              Strategies
            </button>
            <button 
              className={`nav-link ${activeTab === 'commit' ? 'active' : ''}`}
              onClick={() => setActiveTab('commit')}
            >
              <i className="fas fa-plus-circle me-1"></i>
              Extra Payments
            </button>
            <button 
              className={`nav-link ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              <i className="fas fa-lightbulb me-1"></i>
              Insights
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {activeTab === 'dashboard' && (
            <Dashboard 
              debts={debts} 
              summary={summary}
              onDebtUpdated={handleDebtUpdated}
              onDebtDeleted={handleDebtDeleted}
            />
          )}
          
          {activeTab === 'debts' && (
            <DebtForm 
              onDebtAdded={handleDebtAdded}
              onDebtUpdated={handleDebtUpdated}
            />
          )}
          
          {activeTab === 'strategies' && (
            <StrategyComparison debts={debts} />
          )}
          
          {activeTab === 'commit' && (
            <CommitPanel debts={debts} />
          )}
          
          {activeTab === 'insights' && (
            <InsightsPanel debts={debts} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p className="text-gray-400 mb-0">
                &copy; 2024 Financial Freedom Platform. Built with Nodus Design System.
              </p>
            </div>
            <div className="col-md-6 text-end">
              <p className="text-gray-400 mb-0">
                <i className="fas fa-shield-alt me-1"></i>
                Your data is stored locally and securely.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
