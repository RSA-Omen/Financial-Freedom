"""
Financial Freedom Platform - Flask API
Main application with CORS support for React frontend.
All endpoints designed for MCP/AI agent integration.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from decimal import Decimal
import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime
import os
import copy

# Import services
from services.simple_simulation_engine import SimpleSimulationEngine, SimpleDebt
from services.avalanche_strategy import AvalancheStrategy
from services.snowball_strategy import SnowballStrategy
from services.hybrid_strategy import HybridStrategy

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database configuration
DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'user': os.getenv('MYSQL_USER', 'financial_user'),
    'password': os.getenv('MYSQL_PASSWORD', 'financial_pass'),
    'database': os.getenv('MYSQL_DB', 'financial_freedom')
}

# Initialize services
simulation_engine = SimpleSimulationEngine()
avalanche_strategy = AvalancheStrategy()
snowball_strategy = SnowballStrategy()
hybrid_strategy = HybridStrategy()


def get_db_connection():
    """Get database connection."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Database connection error: {e}")
        return None


def debt_from_row(row):
    """Convert database row to SimpleDebt object."""
    # Convert APR from percentage to decimal if it's > 1
    apr_value = Decimal(str(row[3]))
    if apr_value > 1:
        apr_value = apr_value / Decimal('100')
    
    return SimpleDebt(
        debt_id=row[0],
        name=row[1],
        principal=Decimal(str(row[2])),
        apr=apr_value,
        min_payment=Decimal(str(row[4]))
    )


# ============================================================================
# DEBT MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/debts', methods=['GET'])
def get_debts():
    """Get all debts for the user."""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, start_date, status, notes, created_at
            FROM debts 
            WHERE user_id IS NULL OR user_id = 1
            ORDER BY created_at DESC
        """)
        
        rows = cursor.fetchall()
        debts = []
        for row in rows:
            debts.append({
                'id': row[0],
                'name': row[1],
                'principal': float(row[2]),
                'apr': float(row[3]),
                'min_payment': float(row[4]),
                'payment_frequency': row[5],
                'compounding': row[6],
                'start_date': row[7].isoformat() if row[7] else None,
                'status': row[8],
                'notes': row[9],
                'created_at': row[10].isoformat() if row[10] else None
            })
        
        cursor.close()
        connection.close()
        
        return jsonify({'debts': debts})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/debts', methods=['POST'])
def create_debt():
    """Create a new debt."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'principal', 'apr', 'min_payment']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate data types and ranges
        if data['principal'] <= 0:
            return jsonify({'error': 'Principal must be positive'}), 400
        if not (0 <= data['apr'] <= 100):
            return jsonify({'error': 'APR must be between 0 and 100'}), 400
        if data['min_payment'] <= 0:
            return jsonify({'error': 'Minimum payment must be positive'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO debts (name, principal, apr, min_payment, payment_frequency, 
                             compounding, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data['name'],
            data['principal'],
            data['apr'],
            data['min_payment'],
            data.get('payment_frequency', 'monthly'),
            data.get('compounding', 'monthly'),
            data.get('notes', '')
        ))
        
        debt_id = cursor.lastrowid
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Debt created successfully',
            'debt_id': debt_id
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/debts/<int:debt_id>', methods=['GET'])
def get_debt(debt_id):
    """Get a specific debt by ID."""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, start_date, status, notes, created_at
            FROM debts 
            WHERE id = %s
        """, (debt_id,))
        
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'Debt not found'}), 404
        
        debt = {
            'id': row[0],
            'name': row[1],
            'principal': float(row[2]),
            'apr': float(row[3]),
            'min_payment': float(row[4]),
            'payment_frequency': row[5],
            'compounding': row[6],
            'start_date': row[7].isoformat() if row[7] else None,
            'status': row[8],
            'notes': row[9],
            'created_at': row[10].isoformat() if row[10] else None
        }
        
        cursor.close()
        connection.close()
        
        return jsonify({'debt': debt})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/debts/<int:debt_id>', methods=['PUT'])
def update_debt(debt_id):
    """Update a debt."""
    try:
        data = request.get_json()
        
        # Validate data if provided
        if 'principal' in data and data['principal'] <= 0:
            return jsonify({'error': 'Principal must be positive'}), 400
        if 'apr' in data and not (0 <= data['apr'] <= 100):
            return jsonify({'error': 'APR must be between 0 and 100'}), 400
        if 'min_payment' in data and data['min_payment'] <= 0:
            return jsonify({'error': 'Minimum payment must be positive'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Build dynamic update query
        update_fields = []
        values = []
        
        for field in ['name', 'principal', 'apr', 'min_payment', 'payment_frequency', 'compounding', 'notes']:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        values.append(debt_id)
        query = f"UPDATE debts SET {', '.join(update_fields)} WHERE id = %s"
        
        cursor.execute(query, values)
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Debt not found'}), 404
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Debt updated successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/debts/<int:debt_id>', methods=['DELETE'])
def delete_debt(debt_id):
    """Delete a debt."""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("DELETE FROM debts WHERE id = %s", (debt_id,))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Debt not found'}), 404
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Debt deleted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/debts/summary', methods=['GET'])
def get_debt_summary():
    """Get total debt summary."""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
                COUNT(*) as debt_count,
                SUM(principal) as total_principal,
                AVG(apr) as average_apr,
                SUM(min_payment) as total_min_payments
            FROM debts 
            WHERE status = 'active'
        """)
        
        row = cursor.fetchone()
        cursor.close()
        connection.close()
        
        summary = {
            'debt_count': row[0] or 0,
            'total_principal': float(row[1]) if row[1] else 0,
            'average_apr': float(row[2]) if row[2] else 0,
            'total_min_payments': float(row[3]) if row[3] else 0
        }
        
        return jsonify({'summary': summary})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# CALCULATION & SIMULATION ENDPOINTS
# ============================================================================

@app.route('/api/calculate/simulate', methods=['POST'])
def run_simulation():
    """Run full simulation with specified strategy."""
    try:
        data = request.get_json()
        strategy = data.get('strategy', 'avalanche')
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts from database
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        # Load debts into simulation engine
        simulation_engine.debts = debts
        
        # Run simulation using new engine
        if strategy == 'avalanche':
            result = simulation_engine.simulate_avalanche(extra_payment)
        elif strategy == 'snowball':
            result = simulation_engine.simulate_snowball(extra_payment)
        else:
            result = simulation_engine.simulate_avalanche(extra_payment)  # Default to avalanche
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/avalanche', methods=['POST'])
def calculate_avalanche():
    """Calculate avalanche strategy."""
    try:
        data = request.get_json()
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        result = avalanche_strategy.calculate_strategy(debts, extra_payment)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/snowball', methods=['POST'])
def calculate_snowball():
    """Calculate snowball strategy."""
    try:
        data = request.get_json()
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        result = snowball_strategy.calculate_strategy(debts, extra_payment)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/hybrid', methods=['POST'])
def calculate_hybrid():
    """Calculate hybrid strategy."""
    try:
        data = request.get_json()
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        result = hybrid_strategy.calculate_strategy(debts, extra_payment)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/baseline', methods=['POST'])
def run_baseline_simulation():
    """Run baseline simulation without payment reallocation."""
    try:
        data = request.get_json()
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts from database
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        # Load debts into simulation engine
        simulation_engine.debts = debts
        
        # Run baseline simulation
        result = simulation_engine.simulate_baseline(extra_payment)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/compare-with-baseline', methods=['POST'])
def compare_with_baseline():
    """Compare avalanche strategy with baseline (no reallocation)."""
    try:
        data = request.get_json()
        strategy = data.get('strategy', 'avalanche')
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts from database
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        # Load debts into simulation engine
        simulation_engine.debts = debts
        
        # Run strategy simulation
        if strategy == 'avalanche':
            strategy_result = simulation_engine.simulate_avalanche(extra_payment)
        elif strategy == 'snowball':
            strategy_result = simulation_engine.simulate_snowball(extra_payment)
        else:
            strategy_result = simulation_engine.simulate_avalanche(extra_payment)
        
        # Run baseline simulation
        baseline_result = simulation_engine.simulate_baseline(extra_payment)
        
        return jsonify({
            'strategy': strategy_result,
            'baseline': baseline_result,
            'comparison': {
                'months_saved': baseline_result['summary']['months_to_zero'] - strategy_result['summary']['months_to_zero'],
                'interest_saved': baseline_result['summary']['total_interest_paid'] - strategy_result['summary']['total_interest_paid'],
                'payments_saved': baseline_result['summary']['total_payments_made'] - strategy_result['summary']['total_payments_made']
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/scenarios', methods=['POST'])
def run_scenario_analysis():
    """Run what-if scenario analysis."""
    try:
        data = request.get_json()
        scenarios = data.get('scenarios', {})
        base_simulation = data.get('baseSimulation')
        
        if not base_simulation:
            return jsonify({'error': 'Base simulation data required'}), 400
        
        # Get debts from database
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        # Load debts into simulation engine
        simulation_engine.debts = debts
        
        results = {}
        
        # Job Loss Scenario
        if scenarios.get('jobLoss', {}).get('enabled'):
            job_loss_scenario = simulate_job_loss_scenario(
                debts, 
                scenarios['jobLoss']['months'],
                scenarios['jobLoss']['reducedIncome']
            )
            results['jobLoss'] = job_loss_scenario
        
        # Windfall Scenario
        if scenarios.get('windfall', {}).get('enabled'):
            windfall_scenario = simulate_windfall_scenario(
                debts,
                scenarios['windfall']['amount'],
                scenarios['windfall']['month']
            )
            results['windfall'] = windfall_scenario
        
        # Rate Change Scenario
        if scenarios.get('rateChange', {}).get('enabled'):
            rate_change_scenario = simulate_rate_change_scenario(
                debts,
                scenarios['rateChange']['newRate'],
                scenarios['rateChange']['affectedDebts']
            )
            results['rateChange'] = rate_change_scenario
        
        return jsonify({
            'baseSimulation': base_simulation,
            'scenarios': results,
            'comparison': calculate_scenario_comparison(base_simulation, results)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/consolidation', methods=['POST'])
def run_consolidation_analysis():
    """Run debt consolidation analysis."""
    try:
        data = request.get_json()
        debts_data = data.get('debts', [])
        consolidation_rate = Decimal(str(data.get('consolidationRate', 0.09)))
        consolidation_term = int(data.get('consolidationTerm', 60))
        
        if not debts_data:
            return jsonify({'error': 'Debts data required'}), 400
        
        # Calculate current total debt and weighted average rate
        total_debt = sum(float(debt['principal']) for debt in debts_data)
        total_monthly_payments = sum(float(debt['min_payment']) for debt in debts_data)
        
        # Calculate weighted average APR
        weighted_interest = sum(
            float(debt['principal']) * float(debt['apr']) 
            for debt in debts_data
        )
        current_avg_rate = weighted_interest / total_debt if total_debt > 0 else 0
        
        # Calculate consolidation loan details
        monthly_rate = consolidation_rate / Decimal('12')
        consolidation_payment = calculate_monthly_payment(
            Decimal(str(total_debt)), 
            consolidation_rate, 
            consolidation_term
        )
        
        # Calculate savings
        monthly_savings = Decimal(str(total_monthly_payments)) - consolidation_payment
        total_savings = monthly_savings * Decimal(str(consolidation_term))
        
        return jsonify({
            'current': {
                'totalDebt': float(total_debt),
                'monthlyPayments': float(total_monthly_payments),
                'averageRate': float(current_avg_rate),
                'totalPayments': float(total_monthly_payments * 128)  # Assuming 128 months from current simulation
            },
            'consolidation': {
                'totalDebt': float(total_debt),
                'monthlyPayment': float(consolidation_payment),
                'interestRate': float(consolidation_rate),
                'termMonths': consolidation_term,
                'totalPayments': float(consolidation_payment * consolidation_term)
            },
            'savings': {
                'monthlySavings': float(monthly_savings),
                'totalSavings': float(total_savings),
                'rateReduction': float(current_avg_rate - consolidation_rate),
                'recommended': consolidation_rate < current_avg_rate
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def calculate_monthly_payment(principal, annual_rate, months):
    """Calculate monthly payment for a loan."""
    if annual_rate == 0:
        return principal / Decimal(str(months))
    
    monthly_rate = annual_rate / Decimal('12')
    months_decimal = Decimal(str(months))
    payment = principal * (monthly_rate * (1 + monthly_rate) ** months_decimal) / ((1 + monthly_rate) ** months_decimal - 1)
    return payment


def simulate_job_loss_scenario(debts, months_unemployed, income_reduction):
    """Simulate impact of job loss."""
    # Create modified debts with reduced payments
    modified_debts = []
    for debt in debts:
        modified_debt = copy.deepcopy(debt)
        # Reduce payment by income reduction percentage
        modified_debt.min_payment = debt.min_payment * Decimal(str(income_reduction))
        modified_debts.append(modified_debt)
    
    # Run simulation with modified payments
    simulation_engine.debts = modified_debts
    result = simulation_engine.simulate_avalanche()
    
    return {
        'monthsUnemployed': months_unemployed,
        'incomeReduction': income_reduction,
        'simulation': result,
        'impact': {
            'monthsAdded': result['summary']['months_to_zero'] - 128,  # Compare to base
            'interestAdded': result['summary']['total_interest_paid'] - 1308728,  # Compare to base
            'paymentReduction': float(sum(debt.min_payment for debt in debts) * (1 - income_reduction))
        }
    }


def simulate_windfall_scenario(debts, windfall_amount, application_month):
    """Simulate impact of windfall payment."""
    # Run simulation with windfall applied at specific month
    simulation_engine.debts = debts
    result = simulation_engine.simulate_avalanche(Decimal(str(windfall_amount)))
    
    return {
        'windfallAmount': windfall_amount,
        'applicationMonth': application_month,
        'simulation': result,
        'impact': {
            'monthsSaved': 128 - result['summary']['months_to_zero'],  # Compare to base
            'interestSaved': 1308728 - result['summary']['total_interest_paid'],  # Compare to base
            'roi': (1308728 - result['summary']['total_interest_paid']) / windfall_amount if windfall_amount > 0 else 0
        }
    }


def simulate_rate_change_scenario(debts, new_rate, affected_debt_ids):
    """Simulate impact of interest rate changes."""
    # Create modified debts with new rates
    modified_debts = []
    for debt in debts:
        modified_debt = copy.deepcopy(debt)
        if str(debt.id) in affected_debt_ids:
            modified_debt.apr = Decimal(str(new_rate))
        modified_debts.append(modified_debt)
    
    # Run simulation with modified rates
    simulation_engine.debts = modified_debts
    result = simulation_engine.simulate_avalanche()
    
    return {
        'newRate': new_rate,
        'affectedDebts': affected_debt_ids,
        'simulation': result,
        'impact': {
            'monthsChanged': result['summary']['months_to_zero'] - 128,  # Compare to base
            'interestChanged': result['summary']['total_interest_paid'] - 1308728,  # Compare to base
        }
    }


def calculate_scenario_comparison(base_simulation, scenario_results):
    """Calculate comparison metrics between scenarios."""
    comparison = {}
    
    for scenario_name, scenario_data in scenario_results.items():
        if scenario_name == 'jobLoss':
            comparison[scenario_name] = {
                'monthsImpact': scenario_data['impact']['monthsAdded'],
                'interestImpact': scenario_data['impact']['interestAdded'],
                'severity': 'High' if scenario_data['impact']['monthsAdded'] > 12 else 'Medium'
            }
        elif scenario_name == 'windfall':
            comparison[scenario_name] = {
                'monthsSaved': scenario_data['impact']['monthsSaved'],
                'interestSaved': scenario_data['impact']['interestSaved'],
                'roi': scenario_data['impact']['roi'],
                'effectiveness': 'High' if scenario_data['impact']['roi'] > 2 else 'Medium'
            }
        elif scenario_name == 'rateChange':
            comparison[scenario_name] = {
                'monthsImpact': scenario_data['impact']['monthsChanged'],
                'interestImpact': scenario_data['impact']['interestChanged'],
                'impact': 'Positive' if scenario_data['impact']['interestChanged'] < 0 else 'Negative'
            }
    
    return comparison


@app.route('/api/calculate/custom-order', methods=['POST'])
def run_custom_order_simulation():
    """Run simulation with custom milestone order."""
    try:
        data = request.get_json()
        custom_order = data.get('custom_order', [])
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        if not custom_order:
            return jsonify({'error': 'Custom order required'}), 400
        
        # Get debts from database
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        # Load debts into simulation engine
        simulation_engine.debts = debts
        
        # Run custom order simulation
        result = simulation_engine.simulate_custom_order(custom_order, extra_payment)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/compare', methods=['POST'])
def compare_strategies():
    """Compare all three strategies."""
    try:
        data = request.get_json()
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        # Load debts into simulation engine
        simulation_engine.debts = debts
        
        result = simulation_engine.compare_strategies(extra_payment)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/impact', methods=['POST'])
def calculate_impact():
    """Calculate extra payment impact."""
    try:
        data = request.get_json()
        base_extra = Decimal(str(data.get('base_extra', 0)))
        additional_extra = Decimal(str(data.get('additional_extra', 0)))
        strategy = data.get('strategy', 'avalanche')
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        result = simulation_engine.calculate_extra_payment_impact(
            debts, base_extra, additional_extra, strategy
        )
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate/months-to-zero', methods=['POST'])
def get_months_to_zero():
    """Get months until debt-free."""
    try:
        data = request.get_json()
        strategy = data.get('strategy', 'avalanche')
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'months_to_zero': 0, 'debt_free_date': None})
        
        result = simulation_engine.run_simulation(debts, extra_payment, strategy)
        
        return jsonify({
            'months_to_zero': result['summary']['months_to_zero'],
            'debt_free_date': result['summary']['debt_free_date']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# INSIGHTS & RECOMMENDATIONS ENDPOINTS
# ============================================================================

@app.route('/api/insights/recommend', methods=['GET'])
def get_recommendation():
    """Get recommended debt target."""
    try:
        strategy = request.args.get('strategy', 'avalanche')
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'error': 'No active debts found'}), 400
        
        if strategy == 'avalanche':
            result = avalanche_strategy.get_recommendation(debts)
        elif strategy == 'snowball':
            result = snowball_strategy.get_recommendation(debts)
        elif strategy == 'hybrid':
            result = hybrid_strategy.get_recommendation(debts)
        else:
            return jsonify({'error': 'Invalid strategy'}), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/insights/top-targets', methods=['GET'])
def get_top_targets():
    """Get top 3 debt targets."""
    try:
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
            ORDER BY apr DESC
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'targets': []})
        
        # Get recommendations for each strategy
        avalanche_rec = avalanche_strategy.get_recommendation(debts)
        snowball_rec = snowball_strategy.get_recommendation(debts)
        hybrid_rec = hybrid_strategy.get_recommendation(debts)
        
        targets = [
            {
                'strategy': 'avalanche',
                'target': avalanche_rec.get('target_debt'),
                'rationale': avalanche_rec.get('rationale', '')
            },
            {
                'strategy': 'snowball',
                'target': snowball_rec.get('target_debt'),
                'rationale': snowball_rec.get('rationale', '')
            },
            {
                'strategy': 'hybrid',
                'target': hybrid_rec.get('target_debt'),
                'rationale': hybrid_rec.get('rationale', '')
            }
        ]
        
        return jsonify({'targets': targets})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/insights/marginal-benefit', methods=['POST'])
def get_marginal_benefit():
    """Get ROI per extra rand."""
    try:
        data = request.get_json()
        extra_amount = Decimal(str(data.get('extra_amount', 0)))
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'benefit_per_rand': 0, 'target_debt': None})
        
        result = avalanche_strategy.get_marginal_benefit(debts, extra_amount)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# ANALYTICS ENDPOINTS (for charts)
# ============================================================================

@app.route('/api/analytics/timeline', methods=['POST'])
def get_timeline_data():
    """Get timeline data for charts."""
    try:
        data = request.get_json()
        strategy = data.get('strategy', 'avalanche')
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'timeline': []})
        
        result = simulation_engine.run_simulation(debts, extra_payment, strategy)
        
        # Format for charts
        timeline = []
        for month_data in result['simulation_results']:
            timeline.append({
                'month': month_data['month'],
                'date': month_data['date'],
                'total_balance': float(month_data['total_balance']),
                'interest_paid': float(month_data['interest_this_month']),
                'payments_made': float(month_data['payments_this_month']),
                'debts_paid_off': month_data['paid_off_this_month']
            })
        
        return jsonify({'timeline': timeline})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/balance-trend', methods=['POST'])
def get_balance_trend():
    """Get balance trend data for charts."""
    try:
        data = request.get_json()
        strategy = data.get('strategy', 'avalanche')
        extra_payment = Decimal(str(data.get('extra_payment', 0)))
        
        # Get debts
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id, name, principal, apr, min_payment, payment_frequency, 
                   compounding, status
            FROM debts 
            WHERE status = 'active'
        """)
        
        rows = cursor.fetchall()
        debts = [debt_from_row(row) for row in rows]
        cursor.close()
        connection.close()
        
        if not debts:
            return jsonify({'trend': []})
        
        result = simulation_engine.run_simulation(debts, extra_payment, strategy)
        
        # Format for area chart
        trend = []
        for month_data in result['simulation_results']:
            trend.append({
                'month': month_data['month'],
                'date': month_data['date'],
                'total_balance': float(month_data['total_balance']),
                'interest_paid': float(month_data['interest_this_month']),
                'principal_paid': float(month_data['payments_this_month'] - month_data['interest_this_month'])
            })
        
        return jsonify({'trend': trend})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006, debug=True)
