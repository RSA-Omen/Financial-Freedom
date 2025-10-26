#!/usr/bin/env python3
"""
Test with just the home loan to verify the payment logic
"""

from decimal import Decimal
import sys
import os

# Add the backend directory to Python path
sys.path.append('/home/lauchlan/docker-stacks/Financial Freedom/backend')

from services.simple_simulation_engine import SimpleDebt, SimpleSimulationEngine

def test_home_loan_only():
    """Test with just the home loan."""
    print("=== Testing Home Loan Only ===")
    
    # Create simulation engine
    engine = SimpleSimulationEngine()
    
    # Add only the home loan
    debt = SimpleDebt(
        debt_id=12,
        name="Costa Grey Home Loan",
        principal=Decimal('672720.0'),
        apr=Decimal('0.0958'),
        min_payment=Decimal('6528.19')
    )
    engine.add_debt(debt)
    
    # Run simulation for 5 months
    result = engine.simulate_avalanche(extra_payment=Decimal('0'), max_months=5)
    
    print("Simulation results:")
    for month_data in result['simulation_results']:
        print(f"Month {month_data['month']}:")
        print(f"  Total balance: {month_data['total_balance']}")
        print(f"  Interest this month: {month_data['interest_this_month']}")
        print(f"  Payments this month: {month_data['payments_this_month']}")
        
        for debt_info in month_data['debts']:
            print(f"  Home loan balance: {debt_info['balance']}")
            print(f"  Home loan interest paid: {debt_info['interest_paid']}")
            print(f"  Home loan payment made: {debt_info['payment_made']}")
            print(f"  Net change: {Decimal(debt_info['balance']) - Decimal('672720.0')}")
            break

if __name__ == "__main__":
    test_home_loan_only()

