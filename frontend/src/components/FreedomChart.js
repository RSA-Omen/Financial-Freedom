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
    month: `Month ${month.month}`,
    'Total Debt': parseFloat(month.total_balance),
    'Interest Accrued': parseFloat(month.interest_this_month),
    'Principal Paid': parseFloat(month.payments_this_month),
    debtDetails: month.debts, // Keep for custom tooltip
    paidOffThisMonth: month.paid_off_this_month || [], // Add payoff info
    monthNumber: month.month,
  }));

  // Identify debt payoff milestones
  const payoffMilestones = [];
  const paidOffDebts = new Set();

  timeline.forEach((month, index) => {
    // Check if any debts were paid off this month
    if (month.paid_off_this_month && month.paid_off_this_month.length > 0) {
      month.paid_off_this_month.forEach(debtName => {
        if (!paidOffDebts.has(debtName)) {
          payoffMilestones.push({
            date: month.date,
            value: chartData[index]['Total Debt'],
            debtName: debtName,
            monthIndex: index,
            monthNumber: month.month,
          });
          paidOffDebts.add(debtName);
        }
      });
    }
  });

  console.log('🎯 Payoff Milestones Found:', payoffMilestones);

  // Create custom x-axis tick formatter to highlight payoff dates
  const formatXAxisTick = (value) => {
    const date = new Date(value);
    const milestone = payoffMilestones.find(m => m.date === value);
    
    if (milestone) {
      return {
        value: date.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }),
        style: { fontWeight: 'bold', fill: 'var(--nodus-success)' }
      };
    }
    
    return date.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' });
  };

      // Custom Tooltip for more details
      const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const monthNumber = parseInt(label.replace('Month ', ''));
          const monthData = timeline.find(m => m.month === monthNumber);
          return (
            <div className="recharts-tooltip-wrapper card">
              <p className="label text-mint">{`${label}`}</p>
              {monthData && (
                <p className="text-secondary text-sm">{`Date: ${monthData.date}`}</p>
              )}
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
            dataKey="month" 
            stroke="var(--nodus-text-secondary)"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
            tickCount={Math.min(chartData.length, 15)}
            type="category"
            scale="point"
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
          {payoffMilestones.map((milestone, index) => {
            console.log(`Adding reference line for ${milestone.debtName} at Month ${milestone.monthNumber}`);
            return (
              <ReferenceLine
                key={`milestone-${index}`}
                x={`Month ${milestone.monthNumber}`}
                stroke="#00d4aa"
                strokeWidth={4}
                strokeDasharray="10 5"
                label={{ 
                  value: `🎉 ${milestone.debtName}`, 
                  position: 'top', 
                  fill: '#00d4aa',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Payoff Milestones Summary */}
      {payoffMilestones.length > 0 && (
        <div className="payoff-milestones mt-md">
          <h4 className="text-success mb-sm">
            <i className="fas fa-trophy me-2"></i>
            Debt Payoff Milestones
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm">
            {payoffMilestones.map((milestone, index) => (
              <div key={`summary-${index}`} className="card card-sm">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-success mb-1">{milestone.debtName}</h5>
                      <p className="text-secondary text-sm">
                        Month {milestone.monthNumber}
                      </p>
                      <p className="text-primary font-bold">
                        {new Date(milestone.date).toLocaleDateString('en-ZA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-success text-2xl">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FreedomChart;

