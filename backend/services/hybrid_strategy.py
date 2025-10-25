"""
Hybrid Strategy Implementation
APR-adjusted balance heuristic - balances mathematical optimization with psychological benefits.
"""

from decimal import Decimal
from typing import List, Dict, Any
from .simulation_engine import SimulationEngine, Debt


class HybridStrategy:
    """Hybrid debt repayment strategy - APR-adjusted balance heuristic."""
    
    def __init__(self):
        self.simulation_engine = SimulationEngine()
    
    def calculate_strategy(self, debts: List[Debt], extra_payment: Decimal = Decimal('0')) -> Dict[str, Any]:
        """Calculate hybrid strategy results."""
        return self.simulation_engine.run_simulation(debts, extra_payment, 'hybrid')
    
    def get_recommendation(self, debts: List[Debt]) -> Dict[str, Any]:
        """Get hybrid strategy recommendation."""
        active_debts = [d for d in debts if d.status == 'active']
        if not active_debts:
            return {'target_debt': None, 'rationale': 'No active debts'}
        
        # Calculate APR-adjusted balance score for each debt
        scored_debts = []
        for debt in active_debts:
            # APR-adjusted balance heuristic: balance / sqrt(apr)
            # Lower score = higher priority
            score = debt.principal / (debt.apr ** Decimal('0.5'))
            scored_debts.append((debt, score))
        
        # Sort by score (lowest first)
        scored_debts.sort(key=lambda x: x[1])
        target_debt = scored_debts[0][0]
        
        return {
            'target_debt': {
                'id': target_debt.id,
                'name': target_debt.name,
                'balance': float(target_debt.principal),
                'apr': float(target_debt.apr),
                'score': float(scored_debts[0][1])
            },
            'rationale': f'Target {target_debt.name} - balanced approach considering both balance and APR',
            'strategy': 'hybrid',
            'balanced_approach': True,
            'all_scores': [
                {
                    'debt_name': debt.name,
                    'score': float(score),
                    'balance': float(debt.principal),
                    'apr': float(debt.apr)
                } for debt, score in scored_debts
            ]
        }
    
    def get_strategy_analysis(self, debts: List[Debt]) -> Dict[str, Any]:
        """Get detailed analysis of hybrid strategy approach."""
        active_debts = [d for d in debts if d.status == 'active']
        if not active_debts:
            return {'analysis': 'No active debts'}
        
        # Calculate scores for all debts
        scored_debts = []
        for debt in active_debts:
            score = debt.principal / (debt.apr ** Decimal('0.5'))
            scored_debts.append({
                'debt': debt,
                'score': score,
                'balance_weight': debt.principal,
                'apr_weight': debt.apr
            })
        
        # Sort by score
        scored_debts.sort(key=lambda x: x['score'])
        
        # Analyze the strategy
        total_balance = sum(d['balance_weight'] for d in scored_debts)
        avg_apr = sum(d['apr_weight'] for d in scored_debts) / len(scored_debts)
        
        return {
            'strategy_name': 'Hybrid (APR-Adjusted Balance)',
            'total_debts': len(active_debts),
            'total_balance': float(total_balance),
            'average_apr': float(avg_apr),
            'debt_priorities': [
                {
                    'rank': i + 1,
                    'debt_name': d['debt'].name,
                    'score': float(d['score']),
                    'balance': float(d['balance_weight']),
                    'apr': float(d['apr_weight'])
                } for i, d in enumerate(scored_debts)
            ],
            'strategy_rationale': 'Balances mathematical optimization (APR) with psychological benefits (balance size)',
            'best_for': 'Users who want mathematical optimization but also value quick wins'
        }
