# MCP Integration Guide - Financial Freedom Platform

## Overview

The Financial Freedom Platform is designed for seamless integration with MCP (Model Context Protocol) and AI agents. All backend functions are exposed as REST APIs with structured responses, comprehensive error handling, and currency formatting.

## MCP Integration Features

### 1. Structured API Responses
All endpoints return consistent JSON structures with:
- Clear success/error indicators
- Standardized data formats
- Comprehensive error messages
- Currency formatting (ZAR)

### 2. AI Agent Friendly Endpoints
- **Debt Management**: CRUD operations for debt tracking
- **Calculations**: Strategy simulations and comparisons
- **Insights**: Recommendations and ROI analysis
- **Analytics**: Chart data for visualizations

### 3. Error Handling
- HTTP status codes for different error types
- Detailed error messages for debugging
- Validation errors with field-specific feedback

## Integration Patterns

### 1. Debt Management Workflow

```python
# Add a new debt
debt_data = {
    "name": "Credit Card",
    "principal": 15000.00,
    "apr": 18.50,
    "min_payment": 300.00
}
response = requests.post("http://localhost:5006/api/debts", json=debt_data)
debt_id = response.json()["debt_id"]

# Get debt summary
summary = requests.get("http://localhost:5006/api/debts/summary").json()
total_debt = summary["summary"]["total_principal"]
```

### 2. Strategy Analysis Workflow

```python
# Compare all strategies
comparison = requests.post("http://localhost:5006/api/calculate/compare", 
                          json={"extra_payment": 500}).json()

# Get best strategy
avalanche_months = comparison["avalanche"]["summary"]["months_to_zero"]
snowball_months = comparison["snowball"]["summary"]["months_to_zero"]

if avalanche_months < snowball_months:
    best_strategy = "avalanche"
else:
    best_strategy = "snowball"
```

### 3. Impact Analysis Workflow

```python
# Calculate impact of extra payment
impact = requests.post("http://localhost:5006/api/calculate/impact",
                      json={
                          "base_extra": 0,
                          "additional_extra": 1000,
                          "strategy": "avalanche"
                      }).json()

months_saved = impact["impact"]["months_saved"]
interest_saved = impact["impact"]["interest_saved"]
```

## AI Agent Use Cases

### 1. Financial Advisor Agent
```python
class FinancialAdvisorAgent:
    def __init__(self, api_base="http://localhost:5006"):
        self.api_base = api_base
    
    def analyze_debt_portfolio(self):
        """Analyze user's debt portfolio and provide recommendations"""
        debts = requests.get(f"{self.api_base}/api/debts").json()["debts"]
        summary = requests.get(f"{self.api_base}/api/debts/summary").json()["summary"]
        
        # Get strategy comparison
        comparison = requests.post(f"{self.api_base}/api/calculate/compare",
                                 json={"extra_payment": 0}).json()
        
        # Get recommendations
        targets = requests.get(f"{self.api_base}/api/insights/top-targets").json()
        
        return {
            "debt_count": summary["debt_count"],
            "total_debt": summary["total_principal"],
            "best_strategy": self._get_best_strategy(comparison),
            "recommendations": targets["targets"]
        }
    
    def _get_best_strategy(self, comparison):
        """Determine the best strategy based on comparison results"""
        strategies = ["avalanche", "snowball", "hybrid"]
        best_strategy = min(strategies, 
                          key=lambda s: comparison[s]["summary"]["months_to_zero"])
        return best_strategy
```

### 2. Payment Optimizer Agent
```python
class PaymentOptimizerAgent:
    def __init__(self, api_base="http://localhost:5006"):
        self.api_base = api_base
    
    def optimize_extra_payment(self, extra_amount, strategy="avalanche"):
        """Optimize extra payment allocation"""
        # Get current recommendation
        recommendation = requests.get(f"{self.api_base}/api/insights/recommend",
                                    params={"strategy": strategy}).json()
        
        # Calculate impact
        impact = requests.post(f"{self.api_base}/api/calculate/impact",
                             json={
                                 "base_extra": 0,
                                 "additional_extra": extra_amount,
                                 "strategy": strategy
                             }).json()
        
        return {
            "target_debt": recommendation["target_debt"]["name"],
            "months_saved": impact["impact"]["months_saved"],
            "interest_saved": impact["impact"]["interest_saved"],
            "roi": impact["impact"]["roi_per_rand"]
        }
```

### 3. Progress Tracker Agent
```python
class ProgressTrackerAgent:
    def __init__(self, api_base="http://localhost:5006"):
        self.api_base = api_base
    
    def track_progress(self, strategy="avalanche", extra_payment=0):
        """Track debt repayment progress"""
        # Get timeline data
        timeline = requests.post(f"{self.api_base}/api/analytics/timeline",
                               json={"strategy": strategy, 
                                    "extra_payment": extra_payment}).json()
        
        # Get months to zero
        months_data = requests.post(f"{self.api_base}/api/calculate/months-to-zero",
                                  json={"strategy": strategy, 
                                       "extra_payment": extra_payment}).json()
        
        return {
            "months_to_freedom": months_data["months_to_zero"],
            "debt_free_date": months_data["debt_free_date"],
            "timeline": timeline["timeline"]
        }
```

## Data Formatting for AI Agents

### 1. Currency Formatting
```python
def format_zar(amount):
    """Format amount as ZAR currency"""
    return f"R{amount:,.2f}"

# Example usage
debt_balance = 15000.00
formatted = format_zar(debt_balance)  # "R15,000.00"
```

### 2. Time Formatting
```python
def format_months_to_years(months):
    """Format months as years and months"""
    years = months // 12
    remaining_months = months % 12
    
    if years == 0:
        return f"{remaining_months} months"
    elif remaining_months == 0:
        return f"{years} years"
    else:
        return f"{years} years {remaining_months} months"
```

### 3. Percentage Formatting
```python
def format_percentage(value, decimals=2):
    """Format value as percentage"""
    return f"{value:.{decimals}f}%"

# Example usage
apr = 18.5
formatted = format_percentage(apr)  # "18.50%"
```

## Error Handling for AI Agents

### 1. API Error Handling
```python
import requests
from requests.exceptions import RequestException

def safe_api_call(url, method="GET", data=None):
    """Safely call API with error handling"""
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            return {"error": "Bad request", "details": e.response.json()}
        elif e.response.status_code == 404:
            return {"error": "Not found"}
        elif e.response.status_code == 500:
            return {"error": "Server error"}
    
    except RequestException as e:
        return {"error": "Network error", "details": str(e)}
```

### 2. Validation
```python
def validate_debt_data(data):
    """Validate debt data before API call"""
    required_fields = ["name", "principal", "apr", "min_payment"]
    
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    if data["principal"] <= 0:
        return False, "Principal must be positive"
    
    if not (0 <= data["apr"] <= 100):
        return False, "APR must be between 0 and 100"
    
    if data["min_payment"] <= 0:
        return False, "Minimum payment must be positive"
    
    return True, "Valid"
```

## Integration Examples

### 1. Complete Debt Analysis
```python
def analyze_user_debts():
    """Complete debt analysis for AI agent"""
    # Get all debts
    debts_response = safe_api_call("http://localhost:5006/api/debts")
    if "error" in debts_response:
        return debts_response
    
    debts = debts_response["debts"]
    
    # Get summary
    summary_response = safe_api_call("http://localhost:5006/api/debts/summary")
    if "error" in summary_response:
        return summary_response
    
    summary = summary_response["summary"]
    
    # Compare strategies
    comparison_response = safe_api_call("http://localhost:5006/api/calculate/compare",
                                      method="POST", data={"extra_payment": 0})
    if "error" in comparison_response:
        return comparison_response
    
    comparison = comparison_response
    
    # Get recommendations
    targets_response = safe_api_call("http://localhost:5006/api/insights/top-targets")
    if "error" in targets_response:
        return targets_response
    
    targets = targets_response["targets"]
    
    return {
        "debts": debts,
        "summary": summary,
        "strategy_comparison": comparison,
        "recommendations": targets
    }
```

### 2. Extra Payment Impact Analysis
```python
def analyze_extra_payment_impact(extra_amount, strategy="avalanche"):
    """Analyze impact of extra payment"""
    # Get marginal benefit
    benefit_response = safe_api_call("http://localhost:5006/api/insights/marginal-benefit",
                                   method="POST", data={"extra_amount": extra_amount})
    if "error" in benefit_response:
        return benefit_response
    
    # Calculate impact
    impact_response = safe_api_call("http://localhost:5006/api/calculate/impact",
                                  method="POST", data={
                                      "base_extra": 0,
                                      "additional_extra": extra_amount,
                                      "strategy": strategy
                                  })
    if "error" in impact_response:
        return impact_response
    
    return {
        "marginal_benefit": benefit_response,
        "impact": impact_response["impact"]
    }
```

## Best Practices for AI Agents

### 1. Error Handling
- Always check for API errors before processing data
- Implement retry logic for transient failures
- Provide meaningful error messages to users

### 2. Data Validation
- Validate input data before API calls
- Handle edge cases (empty debt lists, invalid amounts)
- Provide fallback values for missing data

### 3. Performance Optimization
- Cache frequently accessed data
- Use batch operations when possible
- Implement request timeouts

### 4. User Experience
- Format currency and percentages consistently
- Provide clear explanations of calculations
- Show progress indicators for long operations

## Testing Integration

### 1. Unit Tests
```python
import unittest
from unittest.mock import patch, Mock

class TestFinancialFreedomAPI(unittest.TestCase):
    def setUp(self):
        self.api_base = "http://localhost:5006"
    
    @patch('requests.get')
    def test_get_debts(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {"debts": []}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        result = safe_api_call(f"{self.api_base}/api/debts")
        self.assertIn("debts", result)
```

### 2. Integration Tests
```python
def test_complete_workflow():
    """Test complete debt management workflow"""
    # Add debt
    debt_data = {
        "name": "Test Debt",
        "principal": 1000.00,
        "apr": 10.0,
        "min_payment": 100.00
    }
    
    create_response = safe_api_call("http://localhost:5006/api/debts",
                                  method="POST", data=debt_data)
    assert "debt_id" in create_response
    
    # Get debts
    debts_response = safe_api_call("http://localhost:5006/api/debts")
    assert len(debts_response["debts"]) > 0
    
    # Calculate strategy
    strategy_response = safe_api_call("http://localhost:5006/api/calculate/avalanche",
                                    method="POST", data={"extra_payment": 0})
    assert "summary" in strategy_response
```

## Deployment Considerations

### 1. Environment Variables
```bash
export FINANCIAL_FREEDOM_API_URL="http://localhost:5006"
export FINANCIAL_FREEDOM_TIMEOUT=30
export FINANCIAL_FREEDOM_RETRY_ATTEMPTS=3
```

### 2. Configuration
```python
import os

class FinancialFreedomConfig:
    API_BASE_URL = os.getenv("FINANCIAL_FREEDOM_API_URL", "http://localhost:5006")
    TIMEOUT = int(os.getenv("FINANCIAL_FREEDOM_TIMEOUT", "30"))
    RETRY_ATTEMPTS = int(os.getenv("FINANCIAL_FREEDOM_RETRY_ATTEMPTS", "3"))
```

### 3. Monitoring
- Log API calls and responses
- Monitor error rates and response times
- Set up alerts for API failures

## Support

For MCP integration support:
- Review the API documentation for endpoint details
- Test integration using the provided examples
- Check error responses for debugging
- Open an issue for integration-specific problems
