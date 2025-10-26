import React from 'react';
import SummaryCards from './SummaryCards';
import FreedomChart from './FreedomChart';

function Dashboard({ debts, simulationResults }) {
  console.log('🏠 Dashboard render - debts:', debts?.length, 'simulationResults:', simulationResults);
  
  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <SummaryCards debts={debts} simulationResults={simulationResults} />

      {/* Freedom Chart */}
      <div className="card mb-lg">
        <div className="card-header">
          <h2 className="card-title">Freedom Chart</h2>
          <button 
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              window.location.reload();
            }}
            className="btn btn-sm btn-outline"
          >
            Refresh Data
          </button>
        </div>
        <div className="card-body">
          {simulationResults && simulationResults.simulation_results && simulationResults.simulation_results.length > 0 ? (
            <FreedomChart 
              timeline={simulationResults.simulation_results} 
              title="Your Path to Financial Freedom"
              summary={simulationResults.summary}
            />
          ) : (
            <FreedomChart timeline={null} title="Freedom Chart" />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;