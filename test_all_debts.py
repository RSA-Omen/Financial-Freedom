#!/usr/bin/env python3
"""
Test the simulation engine with hardcoded data to bypass database issues
"""

from decimal import Decimal
import sys
import os

# Add the backend directory to Python path
sys.path.append('/home/lauchlan/docker-stacks/Financial Freedom/backend')

from services.simple_simulation_engine import SimpleDebt, SimpleSimulationEngine

def test_all_debts():
    """Test with all three debts."""
    print("=== Testing All Debts ===")
    
    # Create simulation engine
    engine = SimpleSimulationEngine()
    
    # Add all three debts
    debts = [
        SimpleDebt(
            debt_id=5,
            name="Ford Figo",
            principal=Decimal('44945.89'),
            apr=Decimal('0.1305'),
            min_payment=Decimal('3279.41')
        ),
        SimpleDebt(
            debt_id=6,
            name="Credit Card",
            principal=Decimal('17400.0'),
            apr=Decimal('0.155'),
            min_payment=Decimal('540.0')
        ),
        SimpleDebt(
            debt_id=12,
            name="Costa Grey Home Loan",
            principal=Decimal('672720.0'),
            apr=Decimal('0.0958'),
            min_payment=Decimal('6528.19')
        )
    ]
    
    for debt in debts:
        engine.add_debt(debt)
    
    # Run simulation for 20 months
    result = engine.simulate_avalanche(extra_payment=Decimal('0'), max_months=20)
    
    print("Simulation results:")
    for month_data in result['simulation_results']:
        print(f"Month {month_data['month']}:")
        print(f"  Total balance: {month_data['total_balance']}")
        print(f"  Interest this month: {month_data['interest_this_month']}")
        print(f"  Payments this month: {month_data['payments_this_month']}")
        
        for debt_info in month_data['debts']:
            print(f"  {debt_info['name']}: balance={debt_info['balance']}, payment={debt_info['payment_made']}, status={debt_info['status']}")
        
        if month_data['paid_off_this_month']:
            print(f"  Paid off: {month_data['paid_off_this_month']}")
        print()

if __name__ == "__main__":
    test_all_debts()

