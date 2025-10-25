"""
Avalanche Strategy Implementation
Mathematically optimal strategy - targets highest APR debt first.
"""

from decimal import Decimal
from typing import List, Dict, Any
from .simulation_engine import SimulationEngine, Debt


class AvalancheStrategy:
    """Avalanche debt repayment strategy - highest APR first."""
    
    def __init__(self):
        self.simulation_engine = SimulationEngine()
    
    def calculate_strategy(self, debts: List[Debt], extra_payment: Decimal = Decimal('0')) -> Dict[str, Any]:
        """Calculate avalanche strategy results."""
        return self.simulation_engine.run_simulation(debts, extra_payment, 'avalanche')
    
    def get_recommendation(self, debts: List[Debt]) -> Dict[str, Any]:
        """Get avalanche strategy recommendation."""
        active_debts = [d for d in debts if d.status == 'active']
        if not active_debts:
            return {'target_debt': None, 'rationale': 'No active debts'}
        
        # Find highest APR debt
        target_debt = max(active_debts, key=lambda d: d.apr)
        
        # Calculate potential savings
        monthly_interest = target_debt.calculate_monthly_interest()
        annual_interest = monthly_interest * Decimal('12')
        
        return {
            'target_debt': {
                'id': target_debt.id,
                'name': target_debt.name,
                'apr': float(target_debt.apr),
                'balance': float(target_debt.principal),
                'monthly_interest': float(monthly_interest)
            },
            'rationale': f'Target {target_debt.name} (APR: {target_debt.apr}%) - highest interest rate',
            'monthly_interest_saved': float(monthly_interest),
            'annual_interest_saved': float(annual_interest),
            'strategy': 'avalanche',
            'mathematical_optimal': True
        }
    
    def get_marginal_benefit(self, debts: List[Debt], extra_amount: Decimal) -> Dict[str, Any]:
        """Calculate marginal benefit of extra payment using avalanche strategy."""
        if extra_amount <= 0:
            return {'benefit_per_rand': 0, 'target_debt': None}
        
        active_debts = [d for d in debts if d.status == 'active']
        if not active_debts:
            return {'benefit_per_rand': 0, 'target_debt': None}
        
        target_debt = max(active_debts, key=lambda d: d.apr)
        monthly_rate = target_debt.apr / Decimal('12')
        benefit_per_rand = monthly_rate
        
        return {
            'benefit_per_rand': float(benefit_per_rand),
            'target_debt': {
                'id': target_debt.id,
                'name': target_debt.name,
                'apr': float(target_debt.apr)
            },
            'monthly_benefit': float(extra_amount * monthly_rate),
            'annual_benefit': float(extra_amount * target_debt.apr / Decimal('100'))
        }
