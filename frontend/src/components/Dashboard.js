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
  
  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <SummaryCards debts={debts} simulationResults={simulationResults} />

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