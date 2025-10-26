#!/usr/bin/env python3
"""
Minimal test to debug the simulation issue
"""

from decimal import Decimal
import sys
import os

# Add the backend directory to Python path
sys.path.append('/home/lauchlan/docker-stacks/Financial Freedom/backend')

from services.simple_simulation_engine import SimpleDebt, SimpleSimulationEngine

def test_single_debt():
    """Test with just the home loan to isolate the issue."""
    print("=== Testing Single Debt ===")
    
    # Create the home loan debt
    debt = SimpleDebt(
        debt_id=12,
        name="Costa Grey Home Loan",
        principal=Decimal('672720.0'),
        apr=Decimal('0.0958'),
        min_payment=Decimal('6528.19')
    )
    
    print(f"Starting principal: {debt.principal}")
    print(f"APR: {debt.apr}")
    print(f"Min payment: {debt.min_payment}")
    
    # Calculate monthly interest
    monthly_interest = debt.calculate_monthly_interest()
    print(f"Monthly interest: {monthly_interest}")
    
    # Apply one payment
    result = debt.apply_payment(debt.min_payment)
    print(f"After payment:")
    print(f"  Principal payment: {result['principal_payment']}")
    print(f"  Interest payment: {result['interest_payment']}")
    print(f"  Remaining balance: {result['remaining']}")
    print(f"  Net change: {result['remaining'] - Decimal('672720.0')}")
    
    return debt

def test_simulation_engine():
    """Test the simulation engine with the home loan."""
    print("\n=== Testing Simulation Engine ===")
    
    # Create simulation engine
    engine = SimpleSimulationEngine()
    
    # Add the home loan
    debt = SimpleDebt(
        debt_id=12,
        name="Costa Grey Home Loan",
        principal=Decimal('672720.0'),
        apr=Decimal('0.0958'),
        min_payment=Decimal('6528.19')
    )
    engine.add_debt(debt)
    
    # Run simulation for 3 months
    result = engine.simulate_avalanche(extra_payment=Decimal('0'), max_months=3)
    
    print("Simulation results:")
    for month_data in result['simulation_results']:
        print(f"Month {month_data['month']}:")
        print(f"  Total balance: {month_data['total_balance']}")
        print(f"  Interest this month: {month_data['interest_this_month']}")
        print(f"  Payments this month: {month_data['payments_this_month']}")
        
        for debt_info in month_data['debts']:
            if debt_info['name'] == 'Costa Grey Home Loan':
                print(f"  Home loan balance: {debt_info['balance']}")
                print(f"  Home loan interest paid: {debt_info['interest_paid']}")
                print(f"  Home loan payment made: {debt_info['payment_made']}")
                break

if __name__ == "__main__":
    test_single_debt()
    test_simulation_engine()

