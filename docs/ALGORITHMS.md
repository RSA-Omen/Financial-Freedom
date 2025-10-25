# Financial Freedom Platform - Algorithms Guide

## Overview

This guide explains the mathematical algorithms used in the Financial Freedom Platform for debt repayment calculations, strategy comparisons, and timeline projections.

## Core Simulation Engine

### Monthly Step Simulation
The platform uses a month-by-month simulation approach that accurately models real-world debt repayment:

```python
For each month until all debts are paid:
  1. For each active debt:
     - Calculate interest: principal * (apr / 12)
     - Add interest to principal
  
  2. Apply minimum payments to all debts
  
  3. Apply committed extra amount per strategy:
     - Avalanche: entire extra to highest APR debt
     - Snowball: entire extra to smallest balance debt
     - Hybrid: APR-adjusted balance heuristic
  
  4. Check for paid-off debts:
     - If principal <= 0: mark as paid
     - Rollover: add freed payment (min + extra) to available pool
  
  5. Record month snapshot:
     - Total balance remaining
     - Interest paid this month
     - Payments made this month
     - Per-debt breakdown
  
  6. Stop when all debts paid or max horizon (50 years)
```

### Interest Calculation Methods

#### Monthly Compounding (Default)
```python
monthly_interest = principal * (apr / 12)
```

#### Daily Compounding
```python
daily_rate = apr / 365
monthly_multiplier = (1 + daily_rate) ** 30
monthly_interest = principal * (monthly_multiplier - 1)
```

#### No Compounding
```python
monthly_interest = 0
```

## Repayment Strategies

### 1. Avalanche Strategy (Mathematical Optimal)

**Algorithm:**
1. Sort debts by APR (highest first)
2. Apply extra payment to highest APR debt
3. When debt is paid off, roll freed payment to next highest APR debt

**Mathematical Basis:**
- Minimizes total interest paid
- Optimal for users focused on mathematical efficiency
- Formula: `target_debt = max(debts, key=lambda d: d.apr)`

**Example:**
```
Debts: Credit Card (18.5%), Car Loan (8.75%), Personal Loan (12.25%)
Order: Credit Card → Personal Loan → Car Loan
```

### 2. Snowball Strategy (Psychological)

**Algorithm:**
1. Sort debts by balance (lowest first)
2. Apply extra payment to lowest balance debt
3. When debt is paid off, roll freed payment to next lowest balance debt

**Psychological Basis:**
- Provides quick wins and motivation
- Builds momentum through early successes
- Formula: `target_debt = min(debts, key=lambda d: d.principal)`

**Example:**
```
Debts: Personal Loan (R5,000), Credit Card (R15,000), Car Loan (R45,000)
Order: Personal Loan → Credit Card → Car Loan
```

### 3. Hybrid Strategy (Balanced)

**Algorithm:**
1. Calculate APR-adjusted balance score for each debt
2. Sort by score (lowest first)
3. Apply extra payment to lowest score debt

**Mathematical Basis:**
- Balances interest rate and debt size
- Formula: `score = principal / sqrt(apr)`
- Lower score = higher priority

**Example:**
```
Debt A: R10,000 at 20% APR → Score = 10,000 / sqrt(20) = 2,236
Debt B: R5,000 at 10% APR → Score = 5,000 / sqrt(10) = 1,581
Order: Debt B → Debt A (lower score first)
```

## Payment Rollover Logic

### Freed Payment Calculation
When a debt is paid off, its payment amount becomes available for the next debt:

```python
if debt.principal <= 0:
    debt.status = 'paid'
    freed_payment = debt.min_payment + extra_payment_applied
    available_extra += freed_payment
```

### Cumulative Effect
The snowball effect occurs when freed payments accelerate subsequent debt payoffs:

```
Month 1: Pay R300 minimum on Debt A
Month 2: Pay R300 minimum on Debt A
...
Month 12: Debt A paid off, R300 now available
Month 13: Pay R300 + R500 extra = R800 on Debt B
```

## Timeline Projection

### Month-by-Month Calculation
Each month's calculation includes:

1. **Interest Accrual:**
   ```python
   for debt in active_debts:
       interest = debt.calculate_monthly_interest()
       debt.principal += interest
       total_interest_paid += interest
   ```

2. **Minimum Payments:**
   ```python
   for debt in active_debts:
       payment_result = debt.apply_payment(debt.min_payment)
       total_payments += debt.min_payment
   ```

3. **Extra Payment Application:**
   ```python
   target_debt = get_target_debt(active_debts, strategy)
   if target_debt and available_extra > 0:
       extra_result = target_debt.apply_payment(available_extra)
       if extra_result['paid_off']:
           available_extra += target_debt.min_payment
   ```

4. **Debt Status Updates:**
   ```python
   for debt in active_debts:
       if debt.principal <= 0:
           debt.status = 'paid'
           freed_payment = debt.min_payment + extra_payment_applied
           available_extra += freed_payment
   ```

## Impact Analysis

### Extra Payment Impact Calculation
```python
def calculate_impact(base_extra, additional_extra, strategy):
    # Run simulation with base extra payment
    base_result = run_simulation(debts, base_extra, strategy)
    
    # Run simulation with additional extra payment
    total_extra = base_extra + additional_extra
    enhanced_result = run_simulation(debts, total_extra, strategy)
    
    # Calculate impact
    months_saved = base_result.months_to_zero - enhanced_result.months_to_zero
    interest_saved = base_result.total_interest_paid - enhanced_result.total_interest_paid
    
    return {
        'months_saved': months_saved,
        'interest_saved': interest_saved,
        'roi_per_rand': interest_saved / additional_extra
    }
```

### Marginal Benefit Analysis
```python
def get_marginal_benefit(debts, extra_amount):
    target_debt = get_target_debt(debts, 'avalanche')
    monthly_rate = target_debt.apr / 12
    benefit_per_rand = monthly_rate
    
    return {
        'benefit_per_rand': benefit_per_rand,
        'monthly_benefit': extra_amount * monthly_rate,
        'annual_benefit': extra_amount * target_debt.apr / 100
    }
```

## Data Precision

### Decimal Arithmetic
All financial calculations use Python's `Decimal` type for precision:

```python
from decimal import Decimal

# Avoid floating point errors
principal = Decimal('15000.00')
apr = Decimal('18.50')
monthly_rate = apr / Decimal('12')
interest = principal * monthly_rate
```

### Rounding Strategy
- Intermediate calculations: No rounding
- Final display: Round to 2 decimal places
- Database storage: DECIMAL(12,2) for principal, DECIMAL(5,2) for APR

## Validation and Edge Cases

### Input Validation
```python
def validate_debt_data(data):
    if data['principal'] <= 0:
        raise ValueError("Principal must be positive")
    if not (0 <= data['apr'] <= 100):
        raise ValueError("APR must be between 0 and 100")
    if data['min_payment'] <= 0:
        raise ValueError("Minimum payment must be positive")
```

### Edge Cases
1. **Zero Interest Loans:** Handle with special logic
2. **Negative Amortization:** Prevent with validation
3. **Interest-Only Loans:** Track separately
4. **Variable Rate Loans:** Use current rate
5. **Payment Holidays:** Skip payment months

## Performance Optimization

### Simulation Limits
- Maximum horizon: 50 years (600 months)
- Early termination when all debts paid
- Memory-efficient month-by-month processing

### Caching Strategy
- Cache strategy calculations
- Store intermediate results
- Avoid redundant calculations

## Testing and Validation

### Unit Tests
```python
def test_avalanche_strategy():
    debts = [
        Debt(1, "High APR", 1000, 20.0, 100),
        Debt(2, "Low APR", 1000, 5.0, 100)
    ]
    result = avalanche_strategy.calculate_strategy(debts, 0)
    assert result['summary']['strategy_used'] == 'avalanche'
```

### Integration Tests
```python
def test_complete_simulation():
    debts = create_sample_debts()
    result = simulation_engine.run_simulation(debts, 500, 'avalanche')
    assert result['summary']['months_to_zero'] > 0
    assert result['summary']['total_interest_paid'] > 0
```

### Validation Tests
```python
def test_interest_calculation():
    debt = Debt(1, "Test", 1000, 12.0, 100)
    monthly_interest = debt.calculate_monthly_interest()
    assert monthly_interest == Decimal('10.00')
```

## Mathematical Formulas

### Interest Calculation
```
Monthly Interest = Principal × (APR / 12)
```

### Payment Application
```
New Principal = Principal + Interest - Payment
```

### Rollover Calculation
```
Freed Payment = Minimum Payment + Extra Payment Applied
```

### Score Calculation (Hybrid)
```
Score = Principal / √(APR)
```

## Error Handling

### Calculation Errors
- Division by zero protection
- Overflow handling
- Invalid input validation
- Graceful degradation

### Data Consistency
- Referential integrity
- Constraint validation
- Transaction rollback
- Error logging

## Future Enhancements

### Advanced Features
1. **Variable Rate Support:** Handle changing interest rates
2. **Payment Holidays:** Skip payment months
3. **Early Payment Penalties:** Account for fees
4. **Multiple Currency Support:** International users
5. **Tax Implications:** Interest deduction calculations

### Algorithm Improvements
1. **Optimization Engine:** Linear programming for optimal allocation
2. **Sensitivity Analysis:** Impact of rate changes
3. **Monte Carlo Simulation:** Risk analysis
4. **Machine Learning:** Personalized recommendations

## Conclusion

The Financial Freedom Platform uses mathematically sound algorithms to provide accurate debt repayment calculations. The simulation engine handles complex scenarios including payment rollovers, multiple strategies, and edge cases while maintaining precision through decimal arithmetic.

The platform's strength lies in its ability to:
- Model real-world debt repayment accurately
- Provide multiple strategy options
- Calculate the impact of extra payments
- Visualize progress over time
- Offer personalized recommendations

All algorithms are thoroughly tested and validated to ensure accuracy and reliability for users making important financial decisions.
