from decimal import Decimal
from typing import Dict, List, Any
from datetime import datetime, timedelta
import copy


class TwoTowerDebt:
    """Debt class for two-tower architecture."""
    
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
            interest_payment = min(payment_amount, monthly_interest)
            principal_payment = max(Decimal('0'), payment_amount - monthly_interest)
            self.principal -= principal_payment
        
        # Track totals
        self.total_interest_paid += interest_payment
        self.months_paid += 1
        
        return {
            'principal_payment': principal_payment,
            'interest_payment': interest_payment,
            'remaining': self.principal
        }


class PaymentTower:
    """Payment Tower - manages total available payments."""
    
    def __init__(self, total_payment: Decimal, extra_payment: Decimal = Decimal('0')):
        self.total_available = total_payment + extra_payment
        self.extra_payment = extra_payment
    
    def get_available_payment(self) -> Decimal:
        """Get total available payment."""
        return self.total_available


class DebtTower:
    """Debt Tower - manages individual debt logic."""
    
    def __init__(self, debts: List[TwoTowerDebt]):
        self.debts = debts
    
    def get_active_debts(self) -> List[TwoTowerDebt]:
        """Get list of active debts."""
        return [debt for debt in self.debts if debt.status == 'active']
    
    def get_total_min_payments(self) -> Decimal:
        """Get total minimum payments for active debts."""
        return sum(debt.min_payment for debt in self.get_active_debts())
    
    def sort_by_strategy(self, strategy: str) -> List[TwoTowerDebt]:
        """Sort debts by strategy."""
        active_debts = self.get_active_debts()
        if strategy == 'avalanche':
            return sorted(active_debts, key=lambda x: x.apr, reverse=True)
        elif strategy == 'snowball':
            return sorted(active_debts, key=lambda x: x.principal)
        else:
            return active_debts


class TwoTowerSimulationEngine:
    """Two-tower simulation engine for debt repayment."""
    
    def __init__(self, debts: List[Dict[str, Any]]):
        self.debts = [TwoTowerDebt(
            debt_id=debt['id'],
            name=debt['name'],
            principal=Decimal(str(debt['principal'])),
            apr=Decimal(str(debt['apr'])),
            min_payment=Decimal(str(debt['min_payment']))
        ) for debt in debts]
    
    def simulate_avalanche(self, extra_payment: Decimal = Decimal('0'), max_months: int = 600) -> Dict[str, Any]:
        """Simulate debt repayment using avalanche strategy with two-tower architecture."""
        # Create working copies
        working_debts = [copy.deepcopy(debt) for debt in self.debts]
        
        # Initialize towers
        total_min_payments = sum(debt.min_payment for debt in working_debts)
        payment_tower = PaymentTower(total_min_payments, extra_payment)
        debt_tower = DebtTower(working_debts)
        
        simulation_results = []
        total_interest_paid = Decimal('0')
        total_payments_made = Decimal('0')
        
        for month in range(1, max_months + 1):
            # Check if all debts are paid off
            active_debts = debt_tower.get_active_debts()
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
            
            # Get available payment from Payment Tower
            available_payment = payment_tower.get_available_payment()
            
            # Sort debts by avalanche strategy (highest APR first)
            sorted_debts = debt_tower.sort_by_strategy('avalanche')
            
            # Calculate freed payment as total available minus active minimum payments
            active_min_payments = sum(debt.min_payment for debt in debt_tower.get_active_debts())
            freed_payment = available_payment - active_min_payments
            
            # Step 1: Apply minimum payments to all active debts
            remaining_payment = available_payment
            for debt in sorted_debts:
                if remaining_payment <= 0:
                    break
                
                if debt.status != 'active':
                    continue
                
                # Calculate interest first
                monthly_interest = debt.calculate_monthly_interest()
                month_data['interest_this_month'] += monthly_interest
                total_interest_paid += monthly_interest
                
                # Determine payment amount
                if remaining_payment >= debt.min_payment:
                    # Can pay minimum payment
                    payment_amount = debt.min_payment
                    remaining_payment -= debt.min_payment
                else:
                    # Partial payment
                    payment_amount = remaining_payment
                    remaining_payment = Decimal('0')
                
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
            
            # Step 2: Reallocate remaining payment to highest priority debt
            # If there's remaining payment, give it to the highest priority debt
            if remaining_payment > 0:
                remaining_debts = debt_tower.get_active_debts()
                if remaining_debts:
                    remaining_debts = debt_tower.sort_by_strategy('avalanche')
                    target_debt = remaining_debts[0]
                    
                    # Apply remaining payment to target debt
                    extra_result = target_debt.apply_payment(remaining_payment)
                    
                    # Update the debt info in month_data
                    for debt_info in month_data['debts']:
                        if debt_info['id'] == target_debt.id:
                            debt_info['balance'] = target_debt.principal
                            debt_info['payment_made'] += remaining_payment
                            debt_info['status'] = target_debt.status
                            break
                    
                    # Track extra payment
                    month_data['payments_this_month'] += remaining_payment
                    total_payments_made += remaining_payment
                    
                    # Check if target debt was paid off
                    if target_debt.status == 'paid':
                        month_data['paid_off_this_month'].append(target_debt.name)
            
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
                'total_interest_paid': float(debt.total_interest_paid),
                'status': debt.status
            })
        
        return {
            'simulation_results': simulation_results,
            'summary': {
                'months_to_zero': len(simulation_results),
                'total_interest_paid': float(total_interest_paid),
                'total_payments_made': float(total_payments_made),
                'final_debts': final_debts
            }
        }
    
    def simulate_snowball(self, extra_payment: Decimal = Decimal('0'), max_months: int = 600) -> Dict[str, Any]:
        """Simulate debt repayment using snowball strategy with two-tower architecture."""
        # Create working copies
        working_debts = [copy.deepcopy(debt) for debt in self.debts]
        
        # Initialize towers
        total_min_payments = sum(debt.min_payment for debt in working_debts)
        payment_tower = PaymentTower(total_min_payments, extra_payment)
        debt_tower = DebtTower(working_debts)
        
        simulation_results = []
        total_interest_paid = Decimal('0')
        total_payments_made = Decimal('0')
        
        for month in range(1, max_months + 1):
            # Check if all debts are paid off
            active_debts = debt_tower.get_active_debts()
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
            
            # Get available payment from Payment Tower
            available_payment = payment_tower.get_available_payment()
            
            # Sort debts by snowball strategy (smallest balance first)
            sorted_debts = debt_tower.sort_by_strategy('snowball')
            
            # Calculate freed payment as total available minus active minimum payments
            active_min_payments = sum(debt.min_payment for debt in debt_tower.get_active_debts())
            freed_payment = available_payment - active_min_payments
            
            # Step 1: Apply minimum payments to all active debts
            remaining_payment = available_payment
            for debt in sorted_debts:
                if remaining_payment <= 0:
                    break
                
                if debt.status != 'active':
                    continue
                
                # Calculate interest first
                monthly_interest = debt.calculate_monthly_interest()
                month_data['interest_this_month'] += monthly_interest
                total_interest_paid += monthly_interest
                
                # Determine payment amount
                if remaining_payment >= debt.min_payment:
                    # Can pay minimum payment
                    payment_amount = debt.min_payment
                    remaining_payment -= debt.min_payment
                else:
                    # Partial payment
                    payment_amount = remaining_payment
                    remaining_payment = Decimal('0')
                
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
            
            # Step 2: Reallocate remaining payment to highest priority debt
            # If there's remaining payment, give it to the highest priority debt
            if remaining_payment > 0:
                remaining_debts = debt_tower.get_active_debts()
                if remaining_debts:
                    remaining_debts = debt_tower.sort_by_strategy('snowball')
                    target_debt = remaining_debts[0]
                    
                    # Apply remaining payment to target debt
                    extra_result = target_debt.apply_payment(remaining_payment)
                    
                    # Update the debt info in month_data
                    for debt_info in month_data['debts']:
                        if debt_info['id'] == target_debt.id:
                            debt_info['balance'] = target_debt.principal
                            debt_info['payment_made'] += remaining_payment
                            debt_info['status'] = target_debt.status
                            break
                    
                    # Track extra payment
                    month_data['payments_this_month'] += remaining_payment
                    total_payments_made += remaining_payment
                    
                    # Check if target debt was paid off
                    if target_debt.status == 'paid':
                        month_data['paid_off_this_month'].append(target_debt.name)
            
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
                'total_interest_paid': float(debt.total_interest_paid),
                'status': debt.status
            })
        
        return {
            'simulation_results': simulation_results,
            'summary': {
                'months_to_zero': len(simulation_results),
                'total_interest_paid': float(total_interest_paid),
                'total_payments_made': float(total_payments_made),
                'final_debts': final_debts
            }
        }
    
    def calculate_extra_payment_impact(self, debts: List[Dict[str, Any]], base_extra: Decimal, additional_extra: Decimal, strategy: str) -> Dict[str, Any]:
        """Calculate the impact of extra payments using two-tower architecture."""
        # Run base simulation
        base_simulation = self.simulate_avalanche(base_extra) if strategy == 'avalanche' else self.simulate_snowball(base_extra)
        
        # Run enhanced simulation
        enhanced_simulation = self.simulate_avalanche(base_extra + additional_extra) if strategy == 'avalanche' else self.simulate_snowball(base_extra + additional_extra)
        
        # Calculate impact
        months_saved = base_simulation['summary']['months_to_zero'] - enhanced_simulation['summary']['months_to_zero']
        interest_saved = base_simulation['summary']['total_interest_paid'] - enhanced_simulation['summary']['total_interest_paid']
        
        return {
            'base_simulation': base_simulation,
            'enhanced_simulation': enhanced_simulation,
            'impact': {
                'months_saved': months_saved,
                'interest_saved': interest_saved,
                'roi': interest_saved / float(additional_extra) if additional_extra > 0 else 0
            }
        }
