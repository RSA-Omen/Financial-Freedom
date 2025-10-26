import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

function FreedomChart({ timeline, title = "Freedom Chart", summary = null }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="freedom-chart">
        <h3 className="text-primary mb-md">{title}</h3>
        <div className="empty-chart">
          <div className="card">
            <div className="card-body text-center py-lg">
              <i className="fas fa-chart-line fa-3x text-gray-400 mb-3"></i>
              <h4 className="text-gray-300 mb-2">No Data Available</h4>
              <p className="text-gray-400">Add debts and run a simulation to see your freedom chart.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = timeline.map(month => ({
    date: month.date,
    'Total Debt': parseFloat(month.total_balance),
    'Interest Accrued': parseFloat(month.interest_this_month),
    'Principal Paid': parseFloat(month.payments_this_month),
    debtDetails: month.debts, // Keep for custom tooltip
  }));

  // Identify debt payoff milestones
  const payoffMilestones = [];
  const paidOffDebts = new Set();

  timeline.forEach((month, index) => {
    month.debts.forEach(debt => {
      if (debt.status === 'paid' && !paidOffDebts.has(debt.id)) {
        payoffMilestones.push({
          date: month.date,
          value: chartData[index]['Total Debt'],
          debtName: debt.name,
          monthIndex: index,
        });
        paidOffDebts.add(debt.id);
      }
    });
  });

  // Custom Tooltip for more details
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthData = timeline.find(m => m.date === label);
      return (
        <div className="recharts-tooltip-wrapper card">
          <p className="label text-mint">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: R ${entry.value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          ))}
          {monthData && monthData.debts && (
            <div className="mt-sm">
              <p className="text-secondary font-bold">Debt Balances:</p>
              {monthData.debts.map(debt => (
                <p key={debt.id} className="text-secondary text-sm">
                  {debt.name}: R {parseFloat(debt.balance).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {debt.status === 'paid' && '(Paid Off)'}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate debt-free date from summary or timeline
  const debtFreeDate = summary?.debt_free_date || (chartData.length > 0 ? chartData[chartData.length - 1].date : null);
  const debtFreeDateFormatted = debtFreeDate ? new Date(debtFreeDate).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  return (
    <div className="freedom-chart">
      <div className="chart-header mb-md">
        <h3 className="text-primary mb-2">{title}</h3>
        {debtFreeDateFormatted && (
          <div className="debt-free-date">
            <span className="text-success font-bold">
              <i className="fas fa-calendar-check me-2"></i>
              Debt-Free Date: {debtFreeDateFormatted}
            </span>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--nodus-border)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--nodus-text-secondary)"
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' })}
          />
          <YAxis 
            stroke="var(--nodus-text-secondary)" 
            tickFormatter={(value) => `R ${value.toLocaleString('en-ZA')}`}
            domain={[0, 'dataMax']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Total Debt" 
            stroke="var(--nodus-primary)" 
            strokeWidth={3}
            activeDot={{ r: 8 }} 
          />
          {/* Add reference lines for debt payoff milestones */}
          {payoffMilestones.map((milestone, index) => (
            <ReferenceLine
              key={`milestone-${index}`}
              x={milestone.date}
              stroke="var(--nodus-success)"
              strokeDasharray="5 5"
              label={{ value: `${milestone.debtName} Paid Off`, position: 'top', fill: 'var(--nodus-text-primary)' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FreedomChart;

