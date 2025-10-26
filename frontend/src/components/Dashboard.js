import React, { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards';
import FreedomChart from './FreedomChart';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Dashboard({ debts, simulationResults }) {
  console.log('🏠 Dashboard render - debts:', debts?.length, 'simulationResults:', simulationResults);
  
  const [baselineData, setBaselineData] = useState(null);
  const [showBaseline, setShowBaseline] = useState(false);
  
  // Fetch baseline data when simulation results change
  useEffect(() => {
    if (simulationResults?.simulation_results) {
      fetchBaselineData();
    }
  }, [simulationResults]);
  
  const fetchBaselineData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/calculate/compare-with-baseline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy: 'avalanche',
          extra_payment: 0
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBaselineData(data);
      }
    } catch (error) {
      console.error('Error fetching baseline data:', error);
    }
  };
  
  // Export functions
  const exportToExcel = () => {
    if (!simulationResults?.simulation_results) {
      alert('No simulation data available to export');
      return;
    }

    // Prepare data for Excel export
    const exportData = [];
    
    // Get all unique debt names
    const allDebtNames = new Set();
    simulationResults.simulation_results.forEach(month => {
      month.debts.forEach(debt => {
        allDebtNames.add(debt.name);
      });
    });
    
    const debtNames = Array.from(allDebtNames);
    
    // Create header row
    const header = ['Month', 'Date', 'Total Balance', 'Total Interest', 'Total Payments', ...debtNames];
    exportData.push(header);
    
    // Add data rows
    simulationResults.simulation_results.forEach(month => {
      const row = [
        month.month,
        month.date,
        parseFloat(month.total_balance).toFixed(2),
        parseFloat(month.interest_this_month).toFixed(2),
        parseFloat(month.payments_this_month).toFixed(2)
      ];
      
      // Add balance for each debt (0 if not present)
      debtNames.forEach(debtName => {
        const debt = month.debts.find(d => d.name === debtName);
        if (debt) {
          row.push(parseFloat(debt.balance).toFixed(2));
        } else {
          row.push('0.00');
        }
      });
      
      exportData.push(row);
    });
    
    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Debt Repayment Timeline');
    
    // Export file
    XLSX.writeFile(wb, `debt-repayment-timeline-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    if (!simulationResults?.simulation_results) {
      alert('No simulation data available to export');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Debt Repayment Timeline', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-ZA')}`, 14, 30);
    
    // Get all unique debt names
    const allDebtNames = new Set();
    simulationResults.simulation_results.forEach(month => {
      month.debts.forEach(debt => {
        allDebtNames.add(debt.name);
      });
    });
    
    const debtNames = Array.from(allDebtNames);
    
    // Prepare table data
    const tableData = simulationResults.simulation_results.map(month => {
      const row = [
        month.month,
        month.date,
        `R ${parseFloat(month.total_balance).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
        `R ${parseFloat(month.interest_this_month).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
        `R ${parseFloat(month.payments_this_month).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
      ];
      
      // Add balance for each debt
      debtNames.forEach(debtName => {
        const debt = month.debts.find(d => d.name === debtName);
        if (debt) {
          row.push(`R ${parseFloat(debt.balance).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`);
        } else {
          row.push('R 0.00');
        }
      });
      
      return row;
    });
    
    // Create table
    doc.autoTable({
      head: [['Month', 'Date', 'Total Balance', 'Interest', 'Payments', ...debtNames]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    // Save PDF
    doc.save(`debt-repayment-timeline-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportPlanReport = () => {
    if (!simulationResults?.simulation_results || !debts) {
      alert('No simulation data available to export');
      return;
    }

    // Create new PDF document
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Helper function to add text with line breaks
    const addText = (text, x = 20, fontSize = 12, color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      doc.text(text, x, yPosition);
      yPosition += fontSize * 0.5;
    };

    // Helper function to add section header
    const addSectionHeader = (title) => {
      yPosition += 10;
      addText(title, 20, 16, [52, 152, 219]);
      yPosition += 5;
    };

    // Helper function to add key-value pair
    const addKeyValue = (key, value, indent = 0) => {
      addText(`${key}: ${value}`, 20 + indent, 10);
    };

    // Page 1: Executive Summary
    addText('FINANCIAL FREEDOM PLAN', 20, 24, [52, 152, 219]);
    addText(`Generated on: ${new Date().toLocaleDateString('en-ZA')}`, 20, 10, [100, 100, 100]);
    yPosition += 15;

    addSectionHeader('EXECUTIVE SUMMARY');
    
    const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.principal), 0);
    const totalMonthlyPayments = debts.reduce((sum, debt) => sum + parseFloat(debt.min_payment), 0);
    const averageAPR = debts.reduce((sum, debt) => sum + parseFloat(debt.apr), 0) / debts.length;
    const highestAPR = Math.max(...debts.map(debt => parseFloat(debt.apr)));
    
    addKeyValue('Total Debt Outstanding', `R ${totalDebt.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    addKeyValue('Monthly Minimum Payments', `R ${totalMonthlyPayments.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    addKeyValue('Average Interest Rate', `${(averageAPR * 100).toFixed(2)}%`);
    addKeyValue('Highest Interest Rate', `${(highestAPR * 100).toFixed(2)}%`);
    addKeyValue('Debt-Free Date', simulationResults.summary.debt_free_date ? new Date(simulationResults.summary.debt_free_date).toLocaleDateString('en-ZA') : 'N/A');
    addKeyValue('Months to Freedom', `${simulationResults.summary.months_to_zero} months`);
    addKeyValue('Total Interest to Pay', `R ${simulationResults.summary.total_interest_paid.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    addKeyValue('Total Payments Made', `R ${simulationResults.summary.total_payments_made.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    // Page 2: Debt Portfolio Analysis
    doc.addPage();
    yPosition = 20;
    
    addSectionHeader('DEBT PORTFOLIO ANALYSIS');
    
    debts.forEach((debt, index) => {
      addText(`${index + 1}. ${debt.name}`, 20, 12, [0, 0, 0]);
      addKeyValue('  Outstanding Balance', `R ${parseFloat(debt.principal).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20);
      addKeyValue('  Interest Rate', `${(parseFloat(debt.apr) * 100).toFixed(2)}%`, 20);
      addKeyValue('  Monthly Payment', `R ${parseFloat(debt.min_payment).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20);
      addKeyValue('  Monthly Interest', `R ${(parseFloat(debt.principal) * parseFloat(debt.apr) / 12).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20);
      yPosition += 5;
    });

    // Page 3: Payoff Timeline
    doc.addPage();
    yPosition = 20;
    
    addSectionHeader('DEBT PAYOFF TIMELINE');
    
    const payoffMilestones = [];
    simulationResults.simulation_results.forEach(month => {
      if (month.paid_off_this_month && month.paid_off_this_month.length > 0) {
        payoffMilestones.push({
          month: month.month,
          date: month.date,
          debts: month.paid_off_this_month,
          totalBalance: month.total_balance
        });
      }
    });

    payoffMilestones.forEach((milestone, index) => {
      addText(`Milestone ${index + 1}: Month ${milestone.month}`, 20, 12, [0, 0, 0]);
      addKeyValue('  Date', new Date(milestone.date).toLocaleDateString('en-ZA'), 20);
      addKeyValue('  Accounts Paid Off', milestone.debts.join(', '), 20);
      addKeyValue('  Remaining Balance', `R ${parseFloat(milestone.totalBalance).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20);
      yPosition += 5;
    });

    // Page 4: Monthly Breakdown (First 12 months)
    doc.addPage();
    yPosition = 20;
    
    addSectionHeader('MONTHLY BREAKDOWN (FIRST 12 MONTHS)');
    
    const first12Months = simulationResults.simulation_results.slice(0, 12);
    const tableData = first12Months.map(month => [
      month.month,
      month.date,
      `R ${parseFloat(month.total_balance).toFixed(2)}`,
      `R ${parseFloat(month.interest_this_month).toFixed(2)}`,
      `R ${parseFloat(month.payments_this_month).toFixed(2)}`
    ]);

    doc.autoTable({
      head: [['Month', 'Date', 'Total Balance', 'Interest', 'Payments']],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Page 5: Recommendations
    doc.addPage();
    yPosition = 20;
    
    addSectionHeader('STRATEGIC RECOMMENDATIONS');
    
    addText('1. PRIORITY DEBT ELIMINATION', 20, 12, [0, 0, 0]);
    addText('   Focus on paying off the highest interest rate debts first (Avalanche Strategy)', 20, 10, [100, 100, 100]);
    yPosition += 10;
    
    addText('2. PAYMENT REALLOCATION', 20, 12, [0, 0, 0]);
    addText('   When a debt is paid off, immediately reallocate the freed payment to the next priority debt', 20, 10, [100, 100, 100]);
    yPosition += 10;
    
    addText('3. MONTHLY BUDGET OPTIMIZATION', 20, 12, [0, 0, 0]);
    addText('   Maintain consistent monthly payments to avoid interest accumulation', 20, 10, [100, 100, 100]);
    yPosition += 10;
    
    addText('4. EMERGENCY FUND CONSIDERATION', 20, 12, [0, 0, 0]);
    addText('   Consider building a small emergency fund before aggressive debt repayment', 20, 10, [100, 100, 100]);
    yPosition += 10;
    
    addText('5. REGULAR REVIEW', 20, 12, [0, 0, 0]);
    addText('   Review and update this plan quarterly to account for changes in income or expenses', 20, 10, [100, 100, 100]);

    // Save PDF
    doc.save(`financial-freedom-plan-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <SummaryCards debts={debts} simulationResults={simulationResults} />

      {/* Timeline Cards */}
      <div className="grid grid-cols-2 gap-sm mb-md">
        {/* Date To Freedom Card */}
        <div className="card card-sm">
          <div className="card-header py-sm">
            <h4 className="card-title text-success text-sm">Date To Freedom</h4>
          </div>
          <div className="card-body text-center py-sm">
            <p className="text-success text-xl font-bold">
              {simulationResults?.summary?.debt_free_date 
                ? new Date(simulationResults.summary.debt_free_date).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'N/A'
              }
            </p>
            <p className="text-secondary text-xs">
              {simulationResults?.summary?.months_to_zero 
                ? `${simulationResults.summary.months_to_zero} months`
                : 'No simulation'
              }
            </p>
          </div>
        </div>

        {/* Next Account Settlement Card */}
        <div className="card card-sm">
          <div className="card-header py-sm">
            <h4 className="card-title text-warning text-sm">Next Account Settlement</h4>
          </div>
          <div className="card-body text-center py-sm">
            <p className="text-warning text-xl font-bold">
              {simulationResults?.simulation_results?.find(month => month.paid_off_this_month?.length > 0)
                ? (() => {
                    const nextPayoff = simulationResults.simulation_results.find(month => month.paid_off_this_month?.length > 0);
                    return new Date(nextPayoff.date).toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  })()
                : 'N/A'
              }
            </p>
            <p className="text-secondary text-xs">
              {simulationResults?.simulation_results?.find(month => month.paid_off_this_month?.length > 0)
                ? (() => {
                    const nextPayoff = simulationResults.simulation_results.find(month => month.paid_off_this_month?.length > 0);
                    return nextPayoff.paid_off_this_month.join(', ');
                  })()
                : 'No payoffs scheduled'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Freedom Chart */}
      <div className="card mb-lg">
        <div className="card-header">
          <h2 className="card-title">Freedom Chart</h2>
          <div className="btn-group">
            <button 
              onClick={() => setShowBaseline(!showBaseline)}
              className={`btn btn-sm ${showBaseline ? 'btn-warning' : 'btn-outline-warning'}`}
              disabled={!baselineData}
              title="Show baseline comparison (no payment reallocation)"
            >
              <i className="fas fa-ghost me-1"></i>
              {showBaseline ? 'Hide' : 'Show'} Baseline
            </button>
            <button 
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                window.location.reload();
              }}
              className="btn btn-sm btn-outline"
            >
              <i className="fas fa-sync-alt me-1"></i>
              Refresh Data
            </button>
            <button 
              onClick={exportToExcel}
              className="btn btn-sm btn-success"
              disabled={!simulationResults?.simulation_results}
            >
              <i className="fas fa-file-excel me-1"></i>
              Export Excel
            </button>
            <button 
              onClick={exportToPDF}
              className="btn btn-sm btn-danger"
              disabled={!simulationResults?.simulation_results}
            >
              <i className="fas fa-file-pdf me-1"></i>
              Export PDF
            </button>
            <button 
              onClick={exportPlanReport}
              className="btn btn-sm btn-primary"
              disabled={!simulationResults?.simulation_results}
              title="Export comprehensive financial plan report"
            >
              <i className="fas fa-file-alt me-1"></i>
              Export Plan Report
            </button>
          </div>
        </div>
        <div className="card-body">
          {simulationResults && simulationResults.simulation_results && simulationResults.simulation_results.length > 0 ? (
            <FreedomChart 
              timeline={simulationResults.simulation_results} 
              title="Your Path to Financial Freedom"
              summary={simulationResults.summary}
              baselineTimeline={showBaseline ? baselineData?.baseline?.simulation_results : null}
              baselineSummary={showBaseline ? baselineData?.baseline?.summary : null}
              comparison={showBaseline ? baselineData?.comparison : null}
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