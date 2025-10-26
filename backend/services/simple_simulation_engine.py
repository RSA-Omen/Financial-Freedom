from decimal import Decimal
from typing import Dict, List, Any
from datetime import datetime, timedelta
import copy


class SimpleDebt:
    """Simple debt class with correct payment logic."""
    
    def __init__(self, debt_id: int, name: str, principal: Decimal, apr: Decimal, min_payment: Decimal):
        self.id = debt_id
        self.name = name
        self.principal = principal
        self.apr = apr
        self.min_payment = min_payment
        self.status = 'active'
        self.months_paid = 0
        self.total_interest_paid = Decimal('0')
    
    def calculate_monthly_interest(self) -> Decimal:
        """Calculate monthly interest."""
        return self.principal * (self.apr / Decimal('12'))
    
    def apply_payment(self, payment_amount: Decimal) -> Dict[str, Any]:
        """Apply payment to debt."""
        if self.status != 'active':
            return {'principal_payment': Decimal('0'), 'interest_payment': Decimal('0'), 'remaining': self.principal}
        
        # Calculate monthly interest
        monthly_interest = self.calculate_monthly_interest()
        
        # Add interest to principal
        self.principal += monthly_interest
        
        # Apply payment
        if payment_amount >= self.principal:
            # Payment covers full balance
            interest_payment = monthly_interest
            principal_payment = self.principal - monthly_interest
            self.principal = Decimal('0')
            self.status = 'paid'
        else:
            # Partial payment
            interest_payment = monthly_interest
            principal_payment = payment_amount - monthly_interest
            self.principal -= payment_amount
        
        # Track totals
        self.total_interest_paid += interest_payment
        self.months_paid += 1
        
        return {
            'principal_payment': principal_payment,
            'interest_payment': interest_payment,
            'remaining': self.principal,
            'paid_off': self.status == 'paid'
        }


class SimpleSimulationEngine:
    """Simple simulation engine with correct logic."""
    
    def __init__(self):
        self.debts = []
    
    def add_debt(self, debt: SimpleDebt):
        """Add a debt to the simulation."""
        self.debts.append(debt)
    
    def simulate_avalanche(self, extra_payment: Decimal = Decimal('0'), max_months: int = 600) -> Dict[str, Any]:
        """Simulate debt repayment using avalanche strategy."""
        # Create working copies
        working_debts = [copy.deepcopy(debt) for debt in self.debts]
        
        simulation_results = []
        total_interest_paid = Decimal('0')
        total_payments_made = Decimal('0')
        
        for month in range(1, max_months + 1):
            # Check if all debts are paid off
            active_debts = [debt for debt in working_debts if debt.status == 'active']
            if not active_debts:
                break
            
            # Calculate current date
            current_date = datetime.now() + timedelta(days=30 * (month - 1))
            
            month_data = {
                'month': month,
                'date': current_date.strftime('%Y-%m-%d'),
                'debts': [],
                'total_balance': Decimal('0'),
                'interest_this_month': Decimal('0'),
                'payments_this_month': Decimal('0'),
                'paid_off_this_month': []
            }
            
            # Sort debts by APR (highest first) for avalanche
            active_debts.sort(key=lambda x: x.apr, reverse=True)
            
            # Calculate total available payment (all minimum payments + extra)
            total_min_payments = sum(debt.min_payment for debt in active_debts)
            available_payment = total_min_payments + extra_payment
            
            # Apply payments to each debt
            for i, debt in enumerate(active_debts):
                if debt.status != 'active':
                    continue
                
                # Calculate interest
                monthly_interest = debt.calculate_monthly_interest()
                month_data['interest_this_month'] += monthly_interest
                total_interest_paid += monthly_interest
                
                # Determine payment amount
                if i == 0:  # Highest APR debt gets extra payment
                    payment_amount = debt.min_payment + extra_payment
                else:
                    payment_amount = debt.min_payment
                
                # Apply payment
                payment_result = debt.apply_payment(payment_amount)
                
                # Track payments
                month_data['payments_this_month'] += payment_amount
                total_payments_made += payment_amount
                
                # Add debt info
                debt_info = {
                    'id': debt.id,
                    'name': debt.name,
                    'balance': debt.principal,
                    'interest_paid': payment_result['interest_payment'],
                    'payment_made': payment_amount,
                    'status': debt.status
                }
                month_data['debts'].append(debt_info)
                
                # Check if paid off
                if debt.status == 'paid':
                    month_data['paid_off_this_month'].append(debt.name)
            
            # Calculate total balance
            month_data['total_balance'] = sum(debt.principal for debt in working_debts if debt.status == 'active')
            
            simulation_results.append(month_data)
        
        # Calculate summary
        final_debts = []
        for debt in working_debts:
            final_debts.append({
                'id': debt.id,
                'name': debt.name,
                'final_balance': float(debt.principal),
                'months_paid': debt.months_paid,
                'status': debt.status,
                'total_interest_paid': float(debt.total_interest_paid)
            })
        
        # Find debt-free date
        debt_free_date = None
        for month_data in simulation_results:
            if month_data['total_balance'] <= Decimal('0'):
                debt_free_date = month_data['date']
                break
        
        summary = {
            'total_interest_paid': float(total_interest_paid),
            'total_payments_made': float(total_payments_made),
            'months_to_zero': len(simulation_results),
            'debt_free_date': debt_free_date,
            'final_total_balance': float(sum(debt.principal for debt in working_debts if debt.status == 'active'))
        }
        
        return {
            'simulation_results': simulation_results,
            'summary': summary,
            'final_debts': final_debts
        }
