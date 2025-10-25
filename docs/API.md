# Financial Freedom Platform - API Documentation

## Overview

The Financial Freedom Platform provides a comprehensive REST API for debt management, repayment strategy calculations, and financial planning. All endpoints are designed for MCP/AI agent integration.

**Base URL**: `http://localhost:5006`  
**Content-Type**: `application/json`  
**Currency**: ZAR (South African Rand)

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible for local development.

## Debt Management Endpoints

### List All Debts
```http
GET /api/debts
```

**Response:**
```json
{
  "debts": [
    {
      "id": 1,
      "name": "Credit Card",
      "principal": 15000.00,
      "apr": 18.50,
      "min_payment": 300.00,
      "payment_frequency": "monthly",
      "compounding": "monthly",
      "start_date": "2024-01-01",
      "status": "active",
      "notes": "High interest credit card",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Specific Debt
```http
GET /api/debts/{id}
```

**Response:**
```json
{
  "debt": {
    "id": 1,
    "name": "Credit Card",
    "principal": 15000.00,
    "apr": 18.50,
    "min_payment": 300.00,
    "payment_frequency": "monthly",
    "compounding": "monthly",
    "start_date": "2024-01-01",
    "status": "active",
    "notes": "High interest credit card",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Create New Debt
```http
POST /api/debts
```

**Request Body:**
```json
{
  "name": "Car Loan",
  "principal": 45000.00,
  "apr": 8.75,
  "min_payment": 650.00,
  "payment_frequency": "monthly",
  "compounding": "monthly",
  "notes": "Vehicle financing"
}
```

**Response:**
```json
{
  "message": "Debt created successfully",
  "debt_id": 2
}
```

### Update Debt
```http
PUT /api/debts/{id}
```

**Request Body:**
```json
{
  "name": "Updated Car Loan",
  "principal": 40000.00,
  "apr": 8.50
}
```

**Response:**
```json
{
  "message": "Debt updated successfully"
}
```

### Delete Debt
```http
DELETE /api/debts/{id}
```

**Response:**
```json
{
  "message": "Debt deleted successfully"
}
```

### Get Debt Summary
```http
GET /api/debts/summary
```

**Response:**
```json
{
  "summary": {
    "debt_count": 3,
    "total_principal": 85000.00,
    "average_apr": 12.25,
    "total_min_payments": 1350.00
  }
}
```

## Calculation & Simulation Endpoints

### Run Full Simulation
```http
POST /api/calculate/simulate
```

**Request Body:**
```json
{
  "strategy": "avalanche",
  "extra_payment": 500.00
}
```

**Response:**
```json
{
  "simulation_results": [
    {
      "month": 1,
      "date": "2024-02-01",
      "total_balance": 85000.00,
      "interest_this_month": 850.00,
      "payments_this_month": 1350.00,
      "debts": [
        {
          "id": 1,
          "name": "Credit Card",
          "balance": 15000.00,
          "interest_paid": 231.25,
          "payment_made": 300.00,
          "status": "active"
        }
      ],
      "paid_off_this_month": []
    }
  ],
  "summary": {
    "months_to_zero": 48,
    "debt_free_date": "2028-02-01",
    "total_interest_paid": 12500.00,
    "total_payments_made": 97500.00,
    "interest_saved": 0,
    "strategy_used": "avalanche"
  },
  "final_debts": [
    {
      "id": 1,
      "name": "Credit Card",
      "final_balance": 0.00,
      "total_interest_paid": 2500.00,
      "months_paid": 24,
      "status": "paid"
    }
  ]
}
```

### Calculate Avalanche Strategy
```http
POST /api/calculate/avalanche
```

**Request Body:**
```json
{
  "extra_payment": 500.00
}
```

**Response:** Same as simulation endpoint with avalanche strategy.

### Calculate Snowball Strategy
```http
POST /api/calculate/snowball
```

**Request Body:**
```json
{
  "extra_payment": 500.00
}
```

**Response:** Same as simulation endpoint with snowball strategy.

### Calculate Hybrid Strategy
```http
POST /api/calculate/hybrid
```

**Request Body:**
```json
{
  "extra_payment": 500.00
}
```

**Response:** Same as simulation endpoint with hybrid strategy.

### Compare All Strategies
```http
POST /api/calculate/compare
```

**Request Body:**
```json
{
  "extra_payment": 500.00
}
```

**Response:**
```json
{
  "avalanche": {
    "summary": {
      "months_to_zero": 48,
      "debt_free_date": "2028-02-01",
      "total_interest_paid": 12500.00,
      "total_payments_made": 97500.00,
      "interest_saved": 0,
      "strategy_used": "avalanche"
    }
  },
  "snowball": {
    "summary": {
      "months_to_zero": 52,
      "debt_free_date": "2028-06-01",
      "total_interest_paid": 13500.00,
      "total_payments_made": 98500.00,
      "interest_saved": -1000.00,
      "strategy_used": "snowball"
    }
  },
  "hybrid": {
    "summary": {
      "months_to_zero": 50,
      "debt_free_date": "2028-04-01",
      "total_interest_paid": 13000.00,
      "total_payments_made": 98000.00,
      "interest_saved": -500.00,
      "strategy_used": "hybrid"
    }
  }
}
```

### Calculate Extra Payment Impact
```http
POST /api/calculate/impact
```

**Request Body:**
```json
{
  "base_extra": 0.00,
  "additional_extra": 500.00,
  "strategy": "avalanche"
}
```

**Response:**
```json
{
  "base_simulation": {
    "summary": {
      "months_to_zero": 60,
      "debt_free_date": "2029-01-01",
      "total_interest_paid": 15000.00,
      "total_payments_made": 100000.00
    }
  },
  "enhanced_simulation": {
    "summary": {
      "months_to_zero": 48,
      "debt_free_date": "2028-02-01",
      "total_interest_paid": 12500.00,
      "total_payments_made": 97500.00
    }
  },
  "impact": {
    "months_saved": 12,
    "interest_saved": 2500.00,
    "new_debt_free_date": "2028-02-01",
    "roi_per_rand": 0.0042
  }
}
```

### Get Months to Zero
```http
POST /api/calculate/months-to-zero
```

**Request Body:**
```json
{
  "strategy": "avalanche",
  "extra_payment": 500.00
}
```

**Response:**
```json
{
  "months_to_zero": 48,
  "debt_free_date": "2028-02-01"
}
```

## Insights & Recommendations Endpoints

### Get Recommended Debt Target
```http
GET /api/insights/recommend?strategy=avalanche
```

**Response:**
```json
{
  "target_debt": {
    "id": 1,
    "name": "Credit Card",
    "apr": 18.50,
    "balance": 15000.00,
    "monthly_interest": 231.25
  },
  "rationale": "Target Credit Card (APR: 18.5%) - highest interest rate",
  "monthly_interest_saved": 231.25,
  "annual_interest_saved": 2775.00,
  "strategy": "avalanche",
  "mathematical_optimal": true
}
```

### Get Top 3 Debt Targets
```http
GET /api/insights/top-targets
```

**Response:**
```json
{
  "targets": [
    {
      "strategy": "avalanche",
      "target": {
        "id": 1,
        "name": "Credit Card",
        "apr": 18.50,
        "balance": 15000.00
      },
      "rationale": "Target Credit Card (APR: 18.5%) - highest interest rate"
    },
    {
      "strategy": "snowball",
      "target": {
        "id": 3,
        "name": "Personal Loan",
        "balance": 5000.00,
        "apr": 12.25
      },
      "rationale": "Target Personal Loan (R5,000) - smallest balance for quick win"
    },
    {
      "strategy": "hybrid",
      "target": {
        "id": 2,
        "name": "Car Loan",
        "balance": 45000.00,
        "apr": 8.75
      },
      "rationale": "Target Car Loan - balanced approach considering both balance and APR"
    }
  ]
}
```

### Get Marginal Benefit (ROI)
```http
POST /api/insights/marginal-benefit
```

**Request Body:**
```json
{
  "extra_amount": 1000.00
}
```

**Response:**
```json
{
  "benefit_per_rand": 0.0154,
  "target_debt": {
    "id": 1,
    "name": "Credit Card",
    "apr": 18.50
  },
  "monthly_benefit": 15.42,
  "annual_benefit": 185.00
}
```

## Analytics Endpoints (for Charts)

### Get Timeline Data
```http
POST /api/analytics/timeline
```

**Request Body:**
```json
{
  "strategy": "avalanche",
  "extra_payment": 500.00
}
```

**Response:**
```json
{
  "timeline": [
    {
      "month": 1,
      "date": "2024-02-01",
      "total_balance": 85000.00,
      "interest_paid": 850.00,
      "payments_made": 1350.00,
      "debts_paid_off": []
    }
  ]
}
```

### Get Balance Trend Data
```http
POST /api/analytics/balance-trend
```

**Request Body:**
```json
{
  "strategy": "avalanche",
  "extra_payment": 500.00
}
```

**Response:**
```json
{
  "trend": [
    {
      "month": 1,
      "date": "2024-02-01",
      "total_balance": 85000.00,
      "interest_paid": 850.00,
      "principal_paid": 500.00
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required field: name"
}
```

### 404 Not Found
```json
{
  "error": "Debt not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database connection failed"
}
```

## Data Models

### Debt Object
```json
{
  "id": "integer",
  "name": "string (required)",
  "principal": "decimal (required, >= 0)",
  "apr": "decimal (required, 0-100)",
  "min_payment": "decimal (required, >= 0)",
  "payment_frequency": "enum: monthly|weekly (default: monthly)",
  "compounding": "enum: monthly|daily|none (default: monthly)",
  "start_date": "date (default: current date)",
  "status": "enum: active|paid (default: active)",
  "notes": "string (optional)",
  "created_at": "timestamp"
}
```

### Simulation Result
```json
{
  "month": "integer",
  "date": "string (YYYY-MM-DD)",
  "total_balance": "decimal",
  "interest_this_month": "decimal",
  "payments_this_month": "decimal",
  "debts": [
    {
      "id": "integer",
      "name": "string",
      "balance": "decimal",
      "interest_paid": "decimal",
      "payment_made": "decimal",
      "status": "string"
    }
  ],
  "paid_off_this_month": ["string"]
}
```

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing rate limiting based on your requirements.

## CORS

CORS is enabled for all origins in development. For production, configure appropriate CORS settings.

## MCP/AI Integration

All endpoints are designed for MCP (Model Context Protocol) and AI agent integration:

1. **Structured Responses**: All endpoints return consistent JSON structures
2. **Error Handling**: Comprehensive error responses with clear messages
3. **Data Validation**: Input validation with detailed error messages
4. **Currency Formatting**: ZAR currency formatting throughout
5. **Decimal Precision**: Financial calculations use DECIMAL types for accuracy

## Examples

### Complete Workflow Example

1. **Add a debt:**
   ```bash
   curl -X POST http://localhost:5006/api/debts \
     -H "Content-Type: application/json" \
     -d '{"name":"Credit Card","principal":15000,"apr":18.5,"min_payment":300}'
   ```

2. **Get debt summary:**
   ```bash
   curl http://localhost:5006/api/debts/summary
   ```

3. **Compare strategies:**
   ```bash
   curl -X POST http://localhost:5006/api/calculate/compare \
     -H "Content-Type: application/json" \
     -d '{"extra_payment":500}'
   ```

4. **Get recommendations:**
   ```bash
   curl http://localhost:5006/api/insights/recommend?strategy=avalanche
   ```

## Support

For API support and questions:
- Check the endpoint documentation above
- Review the request/response examples
- Test endpoints using the provided curl examples
- Open an issue for bugs or feature requests
