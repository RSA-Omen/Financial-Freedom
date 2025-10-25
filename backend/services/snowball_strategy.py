"""
Snowball Strategy Implementation
Psychological strategy - targets smallest balance first for quick wins.
"""

from decimal import Decimal
from typing import List, Dict, Any
from .simulation_engine import SimulationEngine, Debt


class SnowballStrategy:
    """Snowball debt repayment strategy - smallest balance first."""
    
    def __init__(self):
        self.simulation_engine = SimulationEngine()
    
    def calculate_strategy(self, debts: List[Debt], extra_payment: Decimal = Decimal('0')) -> Dict[str, Any]:
        """Calculate snowball strategy results."""
        return self.simulation_engine.run_simulation(debts, extra_payment, 'snowball')
    
    def get_recommendation(self, debts: List[Debt]) -> Dict[str, Any]:
        """Get snowball strategy recommendation."""
        active_debts = [d for d in debts if d.status == 'active']
        if not active_debts:
            return {'target_debt': None, 'rationale': 'No active debts'}
        
        # Find smallest balance debt
        target_debt = min(active_debts, key=lambda d: d.principal)
        
        # Calculate time to payoff with minimum payments
        monthly_interest = target_debt.calculate_monthly_interest()
        net_payment = target_debt.min_payment - monthly_interest
        
        if net_payment <= 0:
            months_to_payoff = 999  # Never pays off
        else:
            months_to_payoff = int(target_debt.principal / net_payment)
        
        return {
            'target_debt': {
                'id': target_debt.id,
                'name': target_debt.name,
                'balance': float(target_debt.principal),
                'apr': float(target_debt.apr),
                'min_payment': float(target_debt.min_payment)
            },
            'rationale': f'Target {target_debt.name} (R{target_debt.principal:,.2f}) - smallest balance for quick win',
            'months_to_payoff': months_to_payoff,
            'strategy': 'snowball',
            'psychological_benefit': True,
            'quick_win_potential': months_to_payoff < 12
        }
    
    def get_motivational_metrics(self, debts: List[Debt]) -> Dict[str, Any]:
        """Get motivational metrics for snowball strategy."""
        active_debts = [d for d in debts if d.status == 'active']
        if not active_debts:
            return {'debt_count': 0, 'smallest_debt': None}
        
        # Sort by balance
        sorted_debts = sorted(active_debts, key=lambda d: d.principal)
        smallest_debt = sorted_debts[0]
        
        # Calculate potential quick wins
        quick_wins = [d for d in sorted_debts if d.principal < Decimal('5000')]
        
        return {
            'debt_count': len(active_debts),
            'smallest_debt': {
                'name': smallest_debt.name,
                'balance': float(smallest_debt.principal),
                'months_to_payoff': self._calculate_months_to_payoff(smallest_debt)
            },
            'quick_wins_available': len(quick_wins),
            'total_quick_win_balance': sum(d.principal for d in quick_wins),
            'motivation_level': 'high' if len(quick_wins) > 0 else 'medium'
        }
    
    def _calculate_months_to_payoff(self, debt: Debt) -> int:
        """Calculate months to payoff with minimum payments."""
        monthly_interest = debt.calculate_monthly_interest()
        net_payment = debt.min_payment - monthly_interest
        
        if net_payment <= 0:
            return 999  # Never pays off
        
        return int(debt.principal / net_payment)
