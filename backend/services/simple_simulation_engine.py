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
    
    def apply_monthly_interest(self):
        """Apply monthly interest to principal. Should be called once per month."""
        if self.status != 'active':
            return Decimal('0')
        
        monthly_interest = self.calculate_monthly_interest()
        self.principal += monthly_interest
        self.total_interest_paid += monthly_interest
        return monthly_interest
    
    def apply_payment(self, payment_amount: Decimal) -> Dict[str, Any]:
        """Apply payment to debt. Interest should be applied separately before calling this."""
        if self.status != 'active':
            return {'principal_payment': Decimal('0'), 'interest_payment': Decimal('0'), 'remaining': self.principal}
        
        # Apply payment directly to principal
        if payment_amount >= self.principal:
            # Payment covers full remaining balance
            principal_payment = self.principal
            self.principal = Decimal('0')
            self.status = 'paid'
        else:
            # Partial principal payment
            principal_payment = payment_amount
            self.principal -= principal_payment
        
        self.months_paid += 1
        
        return {
            'principal_payment': principal_payment,
            'interest_payment': Decimal('0'),  # Interest tracked separately now
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
        
        # Calculate total available payment once at the beginning (constant throughout simulation)
        total_min_payments = sum(debt.min_payment for debt in self.debts)
        total_available_payment = total_min_payments + extra_payment
        
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
            
            # Step 0: Apply monthly interest to all active debts (once per month)
            debt_interest_map = {}
            for debt in active_debts:
                if debt.status != 'active':
                    continue
                monthly_interest = debt.apply_monthly_interest()
                debt_interest_map[debt.id] = monthly_interest
                month_data['interest_this_month'] += monthly_interest
                total_interest_paid += monthly_interest
            
            # Step 1: Apply minimum payments to all active debts
            for debt in active_debts:
                if debt.status != 'active':
                    continue
                
                # Apply minimum payment
                payment_result = debt.apply_payment(debt.min_payment)
                
                # Track payments
                month_data['payments_this_month'] += debt.min_payment
                total_payments_made += debt.min_payment
                
                # Add debt info
                debt_info = {
                    'id': debt.id,
                    'name': debt.name,
                    'balance': debt.principal,
                    'interest_paid': debt_interest_map.get(debt.id, Decimal('0')),
                    'payment_made': debt.min_payment,
                    'status': debt.status
                }
                month_data['debts'].append(debt_info)
                
                # Check if paid off
                if debt.status == 'paid':
                    month_data['paid_off_this_month'].append(debt.name)
            
            # Step 2: Reallocate freed payments and extra payment to remaining debts
            # Calculate how much extra payment is available (freed payments + extra payment)
            # Use the original total available payment to maintain constant payments
            remaining_payment = total_available_payment - month_data['payments_this_month']
            
            while remaining_payment > 0:
                # Get remaining active debts sorted by APR (highest first for avalanche)
                remaining_debts = [debt for debt in working_debts if debt.status == 'active']
                if not remaining_debts:
                    break
                
                remaining_debts.sort(key=lambda x: x.apr, reverse=True)
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
                    # Add the freed payment to remaining_payment for next iteration
                    remaining_payment = target_debt.min_payment
                else:
                    remaining_payment = Decimal('0')  # No more payment available
            
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
    
    def simulate_snowball(self, extra_payment: Decimal = Decimal('0'), max_months: int = 600) -> Dict[str, Any]:
        """Simulate debt repayment using snowball strategy."""
        # Create working copies
        working_debts = [copy.deepcopy(debt) for debt in self.debts]
        
        simulation_results = []
        total_interest_paid = Decimal('0')
        total_payments_made = Decimal('0')
        
        # Calculate total available payment once at the beginning (constant throughout simulation)
        total_min_payments = sum(debt.min_payment for debt in self.debts)
        total_available_payment = total_min_payments + extra_payment
        
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
            
            # Sort debts by balance (smallest first) for snowball
            active_debts.sort(key=lambda x: x.principal)
            
            # Step 0: Apply monthly interest to all active debts (once per month)
            debt_interest_map = {}
            for debt in active_debts:
                if debt.status != 'active':
                    continue
                monthly_interest = debt.apply_monthly_interest()
                debt_interest_map[debt.id] = monthly_interest
                month_data['interest_this_month'] += monthly_interest
                total_interest_paid += monthly_interest
            
            # Step 1: Apply minimum payments to all active debts
            for debt in active_debts:
                if debt.status != 'active':
                    continue
                
                # Apply minimum payment
                payment_result = debt.apply_payment(debt.min_payment)
                
                # Track payments
                month_data['payments_this_month'] += debt.min_payment
                total_payments_made += debt.min_payment
                
                # Add debt info
                debt_info = {
                    'id': debt.id,
                    'name': debt.name,
                    'balance': debt.principal,
                    'interest_paid': debt_interest_map.get(debt.id, Decimal('0')),
                    'payment_made': debt.min_payment,
                    'status': debt.status
                }
                month_data['debts'].append(debt_info)
                
                # Check if paid off
                if debt.status == 'paid':
                    month_data['paid_off_this_month'].append(debt.name)
            
            # Step 2: Reallocate freed payments and extra payment to remaining debts
            # Calculate how much extra payment is available (freed payments + extra payment)
            # Use the original total available payment to maintain constant payments
            remaining_payment = total_available_payment - month_data['payments_this_month']
            
            while remaining_payment > 0:
                # Get remaining active debts sorted by balance (smallest first for snowball)
                remaining_debts = [debt for debt in working_debts if debt.status == 'active']
                if not remaining_debts:
                    break
                
                remaining_debts.sort(key=lambda x: x.principal)
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
                    # Add the freed payment to remaining_payment for next iteration
                    remaining_payment = target_debt.min_payment
                else:
                    remaining_payment = Decimal('0')  # No more payment available
            
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
    
    def compare_strategies(self, debts: List[SimpleDebt], extra_payment: Decimal = Decimal('0')) -> Dict[str, Any]:
        """Compare avalanche and snowball strategies."""
        # Set debts
        self.debts = debts
        
        # Run both simulations
        avalanche_result = self.simulate_avalanche(extra_payment)
        snowball_result = self.simulate_snowball(extra_payment)
        
        return {
            'avalanche': avalanche_result,
            'snowball': snowball_result
        }
    
    def calculate_extra_payment_impact(self, debts: List[SimpleDebt], base_extra: Decimal, 
                                     additional_extra: Decimal, strategy: str = 'avalanche') -> Dict[str, Any]:
        """Calculate the impact of additional extra payment."""
        # Set debts
        self.debts = debts
        
        # Run simulation with base extra payment
        if strategy == 'avalanche':
            base_result = self.simulate_avalanche(base_extra)
        else:
            base_result = self.simulate_snowball(base_extra)
        
        # Run simulation with additional extra payment
        total_extra = base_extra + additional_extra
        if strategy == 'avalanche':
            enhanced_result = self.simulate_avalanche(total_extra)
        else:
            enhanced_result = self.simulate_snowball(total_extra)
        
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
                'roi_per_rand': float(interest_saved / float(additional_extra)) if additional_extra > 0 else 0
            }
        }
    
    def compare_strategies(self, extra_payment: Decimal = Decimal('0')) -> Dict[str, Any]:
        """Compare avalanche and snowball strategies."""
        if not self.debts:
            return {'error': 'No debts loaded'}
        
        # Run avalanche simulation
        avalanche_result = self.simulate_avalanche(extra_payment)
        
        # Run snowball simulation  
        snowball_result = self.simulate_snowball(extra_payment)
        
        # Calculate differences
        avalanche_months = avalanche_result['summary']['months_to_zero']
        snowball_months = snowball_result['summary']['months_to_zero']
        avalanche_interest = avalanche_result['summary']['total_interest_paid']
        snowball_interest = snowball_result['summary']['total_interest_paid']
        
        months_difference = avalanche_months - snowball_months
        interest_difference = avalanche_interest - snowball_interest
        
        return {
            'avalanche': avalanche_result,
            'snowball': snowball_result,
            'comparison': {
                'months_difference': months_difference,
                'interest_difference': interest_difference,
                'avalanche_better': interest_difference < 0,  # Negative means avalanche paid less interest
                'avalanche_months': avalanche_months,
                'snowball_months': snowball_months,
                'avalanche_interest': avalanche_interest,
                'snowball_interest': snowball_interest
            }
        }
    
    def simulate_baseline(self, extra_payment: Decimal = Decimal('0'), max_months: int = 600) -> Dict[str, Any]:
        """Simulate debt repayment WITHOUT payment reallocation (baseline comparison)."""
        if not self.debts:
            return {'error': 'No debts loaded'}
        
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
            
            # Step 0: Apply monthly interest to all active debts (once per month)
            debt_interest_map = {}
            for debt in active_debts:
                if debt.status != 'active':
                    continue
                monthly_interest = debt.apply_monthly_interest()
                debt_interest_map[debt.id] = monthly_interest
                month_data['interest_this_month'] += monthly_interest
                total_interest_paid += monthly_interest
            
            # Step 1: Apply minimum payments to all active debts (NO REALLOCATION)
            for debt in active_debts:
                if debt.status != 'active':
                    continue
                
                # Apply minimum payment only
                payment_result = debt.apply_payment(debt.min_payment)
                
                # Track payments
                month_data['payments_this_month'] += debt.min_payment
                total_payments_made += debt.min_payment
                
                # Add debt info
                debt_info = {
                    'id': debt.id,
                    'name': debt.name,
                    'balance': debt.principal,
                    'interest_paid': debt_interest_map.get(debt.id, Decimal('0')),
                    'payment_made': debt.min_payment,
                    'status': debt.status
                }
                month_data['debts'].append(debt_info)
                
                # Check if paid off
                if debt.status == 'paid':
                    month_data['paid_off_this_month'].append(debt.name)
            
            # Step 2: Apply extra payment to highest APR debt (if any)
            if extra_payment > 0:
                remaining_debts = [debt for debt in working_debts if debt.status == 'active']
                if remaining_debts:
                    # Sort by APR (highest first) for extra payment
                    remaining_debts.sort(key=lambda x: x.apr, reverse=True)
                    target_debt = remaining_debts[0]
                    
                    # Apply extra payment
                    extra_result = target_debt.apply_payment(extra_payment)
                    
                    # Update the debt info in month_data
                    for debt_info in month_data['debts']:
                        if debt_info['id'] == target_debt.id:
                            debt_info['balance'] = target_debt.principal
                            debt_info['payment_made'] += extra_payment
                            debt_info['status'] = target_debt.status
                            break
                    
                    # Track extra payment
                    month_data['payments_this_month'] += extra_payment
                    total_payments_made += extra_payment
                    
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
                'status': debt.status,
                'months_paid': debt.months_paid,
                'total_interest_paid': float(debt.total_interest_paid)
            })
        
        return {
            'simulation_results': simulation_results,
            'summary': {
                'months_to_zero': month - 1 if not active_debts else max_months,
                'total_interest_paid': float(total_interest_paid),
                'total_payments_made': float(total_payments_made),
                'final_debts': final_debts,
                'strategy': 'baseline'
            }
        }