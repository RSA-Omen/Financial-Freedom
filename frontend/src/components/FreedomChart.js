import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

function FreedomChart({ timeline, title = "Freedom Chart" }) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-secondary">No timeline data available.</p>;
  }

  // Prepare data for the chart
  const chartData = timeline.map(month => ({
    date: month.date,
    'Total Debt': parseFloat(month.ending_total_balance),
    'Interest Accrued': parseFloat(month.total_interest_accrued),
    'Principal Paid': parseFloat(month.total_principal_paid),
    debtDetails: month.debt_details, // Keep for custom tooltip
  }));

  // Identify debt payoff milestones
  const payoffMilestones = [];
  const paidOffDebts = new Set();

  timeline.forEach((month, index) => {
    month.debt_details.forEach(debt => {
      if (debt.is_paid_off && !paidOffDebts.has(debt.id)) {
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
          {monthData && monthData.debt_details && (
            <div className="mt-sm">
              <p className="text-secondary font-bold">Debt Balances:</p>
              {monthData.debt_details.map(debt => (
                <p key={debt.id} className="text-secondary text-sm">
                  {debt.name}: R {parseFloat(debt.balance).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {debt.is_paid_off && '(Paid Off)'}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="freedom-chart">
      <h3 className="text-primary mb-md">{title}</h3>
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

