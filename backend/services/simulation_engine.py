"""
Core simulation engine for debt repayment calculations.
Implements monthly step simulation with interest calculation and rollover logic.
"""

from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import json


class Debt:
    """Represents a single debt with all necessary attributes."""
    
    def __init__(self, debt_id: int, name: str, principal: Decimal, apr: Decimal, 
                 min_payment: Decimal, payment_frequency: str = 'monthly', 
                 compounding: str = 'monthly', status: str = 'active'):
        self.id = debt_id
        self.name = name
        self.principal = principal
        self.apr = apr
        self.min_payment = min_payment
        self.payment_frequency = payment_frequency
        self.compounding = compounding
        self.status = status
        self.original_principal = principal
        self.total_interest_paid = Decimal('0')
        self.months_paid = 0
        
    def calculate_monthly_interest(self) -> Decimal:
        """Calculate interest for one month based on compounding frequency."""
        if self.compounding == 'daily':
            # Daily compounding: (1 + apr/365)^30 - 1
            daily_rate = self.apr / Decimal('365')
            monthly_multiplier = (Decimal('1') + daily_rate) ** Decimal('30')
            return self.principal * (monthly_multiplier - Decimal('1'))
        elif self.compounding == 'monthly':
            # Monthly compounding: apr/12
            return self.principal * (self.apr / Decimal('12'))
        else:  # none
            return Decimal('0')
    
    def apply_payment(self, payment_amount: Decimal) -> Dict[str, Any]:
        """Apply payment to debt and return payment breakdown."""
        if self.status != 'active':
            return {'principal_payment': Decimal('0'), 'interest_payment': Decimal('0'), 'remaining': self.principal}
        
        interest_this_month = self.calculate_monthly_interest()
        self.total_interest_paid += interest_this_month
        
        # Add interest to principal first
        self.principal += interest_this_month
        
        # Apply payment
        if payment_amount >= self.principal:
            # Debt is paid off
            principal_payment = self.principal
            interest_payment = interest_this_month
            self.principal = Decimal('0')
            self.status = 'paid'
        else:
            # Partial payment
            principal_payment = payment_amount
            interest_payment = Decimal('0')
            self.principal -= payment_amount
        
        self.months_paid += 1
        
        return {
            'principal_payment': principal_payment,
            'interest_payment': interest_payment,
            'remaining': self.principal,
            'paid_off': self.status == 'paid'
        }


class SimulationEngine:
    """Core simulation engine for debt repayment strategies."""
    
    def __init__(self, max_horizon_years: int = 50):
        self.max_horizon_months = max_horizon_years * 12
        
    def run_simulation(self, debts: List[Debt], extra_payment: Decimal = Decimal('0'), 
                      strategy: str = 'avalanche') -> Dict[str, Any]:
        """
        Run monthly step simulation for debt repayment.
        
        Args:
            debts: List of Debt objects
            extra_payment: Additional monthly payment amount
            strategy: 'avalanche', 'snowball', or 'hybrid'
            
        Returns:
            Dictionary with simulation results
        """
        # Create working copies of debts
        working_debts = [Debt(d.id, d.name, d.principal, d.apr, d.min_payment, 
                             d.payment_frequency, d.compounding, d.status) for d in debts]
        
        simulation_results = []
        total_interest_paid = Decimal('0')
        total_payments_made = Decimal('0')
        available_extra = extra_payment
        
        for month in range(self.max_horizon_months):
            month_data = {
                'month': month + 1,
                'date': (datetime.now() + timedelta(days=30 * month)).strftime('%Y-%m-%d'),
                'total_balance': Decimal('0'),
                'interest_this_month': Decimal('0'),
                'payments_this_month': Decimal('0'),
                'debts': [],
                'paid_off_this_month': []
            }
            
            # Check if all debts are paid
            active_debts = [d for d in working_debts if d.status == 'active']
            if not active_debts:
                break
                
            # Calculate interest and apply minimum payments
            for debt in working_debts:
                if debt.status == 'active':
                    interest = debt.calculate_monthly_interest()
                    debt.principal += interest
                    debt.total_interest_paid += interest
                    total_interest_paid += interest
                    month_data['interest_this_month'] += interest
                    month_data['total_balance'] += debt.principal
                    
                    # Apply minimum payment
                    payment_result = debt.apply_payment(debt.min_payment)
                    month_data['payments_this_month'] += debt.min_payment
                    total_payments_made += debt.min_payment
                    
                    # Track debt status
                    debt_data = {
                        'id': debt.id,
                        'name': debt.name,
                        'balance': debt.principal,
                        'interest_paid': interest,
                        'payment_made': debt.min_payment,
                        'status': debt.status
                    }
                    month_data['debts'].append(debt_data)
                    
                    if payment_result['paid_off']:
                        month_data['paid_off_this_month'].append(debt.name)
                        # Add freed payment to available extra
                        available_extra += debt.min_payment
            
            # Apply extra payment according to strategy
            if available_extra > 0:
                target_debt = self._get_target_debt(working_debts, strategy)
                if target_debt:
                    extra_result = target_debt.apply_payment(available_extra)
                    month_data['payments_this_month'] += available_extra
                    total_payments_made += available_extra
                    month_data['total_balance'] -= available_extra
                    
                    if extra_result['paid_off']:
                        month_data['paid_off_this_month'].append(target_debt.name)
                        # Add freed payment to available extra for next month
                        available_extra = target_debt.min_payment
                    else:
                        available_extra = Decimal('0')
            
            simulation_results.append(month_data)
        
        # Calculate summary metrics
        months_to_zero = len(simulation_results)
        debt_free_date = None
        if simulation_results:
            debt_free_date = simulation_results[-1]['date']
        
        return {
            'simulation_results': simulation_results,
            'summary': {
                'months_to_zero': months_to_zero,
                'debt_free_date': debt_free_date,
                'total_interest_paid': float(total_interest_paid),
                'total_payments_made': float(total_payments_made),
                'interest_saved': 0,  # Will be calculated in comparison
                'strategy_used': strategy
            },
            'final_debts': [
                {
                    'id': d.id,
                    'name': d.name,
                    'final_balance': float(d.principal),
                    'total_interest_paid': float(d.total_interest_paid),
                    'months_paid': d.months_paid,
                    'status': d.status
                } for d in working_debts
            ]
        }
    
    def _get_target_debt(self, debts: List[Debt], strategy: str) -> Debt:
        """Get the target debt for extra payment based on strategy."""
        active_debts = [d for d in debts if d.status == 'active']
        if not active_debts:
            return None
            
        if strategy == 'avalanche':
            # Highest APR first
            return max(active_debts, key=lambda d: d.apr)
        elif strategy == 'snowball':
            # Smallest balance first
            return min(active_debts, key=lambda d: d.principal)
        elif strategy == 'hybrid':
            # APR-adjusted balance heuristic: balance / sqrt(apr)
            return min(active_debts, key=lambda d: d.principal / (d.apr ** Decimal('0.5')))
        else:
            return active_debts[0]  # Default to first debt
    
    def compare_strategies(self, debts: List[Debt], extra_payment: Decimal = Decimal('0')) -> Dict[str, Any]:
        """Compare all three strategies side by side."""
        strategies = ['avalanche', 'snowball', 'hybrid']
        results = {}
        
        for strategy in strategies:
            results[strategy] = self.run_simulation(debts, extra_payment, strategy)
        
        # Calculate interest saved compared to avalanche (mathematically optimal)
        avalanche_interest = results['avalanche']['summary']['total_interest_paid']
        for strategy in ['snowball', 'hybrid']:
            strategy_interest = results[strategy]['summary']['total_interest_paid']
            results[strategy]['summary']['interest_saved'] = avalanche_interest - strategy_interest
        
        return results
    
    def calculate_extra_payment_impact(self, debts: List[Debt], base_extra: Decimal, 
                                     additional_extra: Decimal, strategy: str = 'avalanche') -> Dict[str, Any]:
        """Calculate the impact of additional extra payment."""
        # Run simulation with base extra payment
        base_result = self.run_simulation(debts, base_extra, strategy)
        
        # Run simulation with additional extra payment
        total_extra = base_extra + additional_extra
        enhanced_result = self.run_simulation(debts, total_extra, strategy)
        
        # Calculate impact
        months_saved = base_result['summary']['months_to_zero'] - enhanced_result['summary']['months_to_zero']
        interest_saved = base_result['summary']['total_interest_paid'] - enhanced_result['summary']['total_interest_paid']
        
        return {
            'base_simulation': base_result,
            'enhanced_simulation': enhanced_result,
            'impact': {
                'months_saved': months_saved,
                'interest_saved': float(interest_saved),
                'new_debt_free_date': enhanced_result['summary']['debt_free_date'],
                'roi_per_rand': float(interest_saved / additional_extra) if additional_extra > 0 else 0
            }
        }
