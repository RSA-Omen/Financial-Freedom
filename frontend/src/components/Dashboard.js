import React from 'react';
import SummaryCards from './SummaryCards';
import FreedomChart from './FreedomChart';

function Dashboard({ debts, simulationResults }) {
  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <SummaryCards debts={debts} simulationResults={simulationResults} />

      {/* Freedom Chart */}
      <div className="card mb-lg">
        <div className="card-header">
          <h2 className="card-title">Freedom Chart</h2>
        </div>
        <div className="card-body">
          {simulationResults && simulationResults.timeline && simulationResults.timeline.length > 0 ? (
            <FreedomChart timeline={simulationResults.timeline} />
          ) : (
            <p className="text-secondary">Add debts and run a simulation to see your freedom chart.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;