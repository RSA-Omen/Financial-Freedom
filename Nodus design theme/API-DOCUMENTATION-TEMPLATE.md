# [Project Name] API Documentation

**Template for comprehensive API documentation**

Based on: Gym Progress Tracker API docs  
Version: 1.0 | Date: [Current Date]

---

## Overview

[Brief description of what the API does]

**Example:**
```
RESTful API for [project purpose]. All endpoints return JSON and follow standard HTTP methods and status codes.
```

---

## Base URL

```
http://localhost:[PORT]
```

Or for production:
```
https://api.yourdomain.com
```

---

## Authentication

[Describe authentication if applicable]

**Examples:**
- No authentication required (development)
- JWT Bearer tokens (production)
- API keys
- OAuth 2.0

```http
# Example with auth
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Key Features

[Highlight unique API features]

**Example:**
- Bulk operations for efficiency
- Export functionality
- Real-time updates
- Webhook support

---

## Endpoints Summary

| Category | Endpoints | Description |
|----------|-----------|-------------|
| [Resource 1] | X | [CRUD operations] |
| [Resource 2] | X | [Purpose] |
| [Resource 3] | X | [Purpose] |
| **Total** | **XX** | Complete coverage |

---

## [Resource] API

### List All [Resources]
```http
GET /api/resources/
```

**Query Parameters:** (if applicable)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `filter` - Filter criteria

**Response:** Array of resource objects

**Example Response:**
```json
[
  {
    "id": 1,
    "field1": "value",
    "field2": "value",
    "created_at": "2025-10-19T10:00:00"
  }
]
```

---

### Get Single [Resource]
```http
GET /api/resources/{id}
```

**Path Parameters:**
- `id` - Resource ID (integer)

**Response:** Single resource object

---

### Create [Resource]
```http
POST /api/resources/
```

**Request Body:**
```json
{
  "field1": "value",
  "field2": "value",
  "optional_field": "value"
}
```

**Required Fields:**
- `field1` - Description
- `field2` - Description

**Optional Fields:**
- `optional_field` - Description

**Response:** Created resource with ID

**Example:**
```json
{
  "id": 1,
  "field1": "value",
  "field2": "value",
  "created_at": "2025-10-19T10:00:00"
}
```

---

### Update [Resource]
```http
PUT /api/resources/{id}
```

**Request Body:** (partial updates allowed)
```json
{
  "field1": "new_value"
}
```

**Response:** Updated resource

---

### Delete [Resource]
```http
DELETE /api/resources/{id}
```

**Response:**
```json
{
  "message": "Resource deleted successfully"
}
```

---

## Special Operations

### Bulk Operations

[If your API supports bulk operations, document them]

```http
POST /api/resources/bulk
```

**Request Body:**
```json
{
  "items": [
    {"field1": "value1"},
    {"field1": "value2"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "created": 2,
  "items": [...]
}
```

---

### Export Operations

[If your API supports exports]

```http
GET /api/resources/{id}/export
```

**Response:**
```json
{
  "format": "plaintext",
  "content": "...",
  "download_url": "..."
}
```

---

## Data Models

### [ResourceName]
```typescript
{
  id: number
  field1: string
  field2: number
  optional_field: string | null
  created_at: datetime
  updated_at: datetime
}
```

**Field Descriptions:**
- `id` - Unique identifier (auto-generated)
- `field1` - [Description]
- `field2` - [Description]
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

---

## Complete Workflow Example

### Typical Use Case

**1. Create Resource:**
```http
POST /api/resources/
{
  "field1": "value",
  "field2": 123
}
→ Response: {"id": 1, ...}
```

**2. List Resources:**
```http
GET /api/resources/
→ Response: [{id: 1, ...}, {id: 2, ...}]
```

**3. Update Resource:**
```http
PUT /api/resources/1
{
  "field1": "updated_value"
}
→ Response: {"id": 1, "field1": "updated_value", ...}
```

**4. Delete Resource:**
```http
DELETE /api/resources/1
→ Response: {"message": "Resource deleted successfully"}
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid data |
| 401 | Unauthorized | Missing/invalid auth |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Validation error |
| 500 | Server Error | Internal error |

---

## Error Response Format

All errors follow consistent format:

```json
{
  "detail": "Error message description",
  "code": "ERROR_CODE",
  "field": "field_name"  // For validation errors
}
```

**Example Error:**
```json
{
  "detail": "Resource with this name already exists",
  "code": "DUPLICATE_NAME"
}
```

---

## Rate Limiting

[If applicable]

**Limits:**
- Unauthenticated: 100 requests/hour
- Authenticated: 1000 requests/hour

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1634567890
```

---

## CORS Configuration

**Development:**
- All origins allowed

**Production:**
- Specific origins only
- Configure in environment variables

```
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

---

## Pagination

[If applicable]

**Query Parameters:**
```
GET /api/resources/?page=2&limit=50
```

**Response:**
```json
{
  "items": [...],
  "total": 150,
  "page": 2,
  "limit": 50,
  "pages": 3
}
```

---

## Filtering & Sorting

[If applicable]

**Filter:**
```
GET /api/resources/?filter=active&category=tech
```

**Sort:**
```
GET /api/resources/?sort=created_at&order=desc
```

---

## Webhooks

[If applicable]

**Configure webhook:**
```http
POST /api/webhooks/
{
  "url": "https://yourapp.com/webhook",
  "events": ["resource.created", "resource.updated"]
}
```

---

## Interactive Documentation

**Swagger UI:** http://localhost:[PORT]/docs  
**ReDoc:** http://localhost:[PORT]/redoc  

[For FastAPI - auto-generated]
[For Flask - use Flask-RESTX or document manually]

---

## Code Examples

### Python
```python
import requests

# Create resource
response = requests.post(
    'http://localhost:PORT/api/resources/',
    json={'field1': 'value', 'field2': 123}
)
resource = response.json()

# Get resource
resource = requests.get(f'http://localhost:PORT/api/resources/{resource["id"]}').json()
```

### JavaScript
```javascript
// Create resource
const response = await fetch('http://localhost:PORT/api/resources/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({field1: 'value', field2: 123})
});
const resource = await response.json();

// Get resource
const data = await fetch(`http://localhost:PORT/api/resources/${resource.id}`)
    .then(r => r.json());
```

### cURL
```bash
# Create resource
curl -X POST http://localhost:PORT/api/resources/ \
  -H "Content-Type: application/json" \
  -d '{"field1":"value","field2":123}'

# Get resource
curl http://localhost:PORT/api/resources/1
```

---

## Versioning

**Current Version:** v1

**API Version:** Included in URL or header
```
GET /api/v1/resources/
# or
X-API-Version: 1
```

---

## Best Practices for API Consumers

1. **Use HTTP methods correctly**
   - GET for reading
   - POST for creating
   - PUT for updating
   - DELETE for deleting

2. **Handle errors gracefully**
   - Check status codes
   - Parse error messages
   - Implement retry logic

3. **Respect rate limits**
   - Monitor headers
   - Implement backoff
   - Cache responses

4. **Use pagination**
   - Don't fetch all at once
   - Implement cursor-based pagination

5. **Keep tokens secure**
   - Use environment variables
   - Never commit to git
   - Rotate regularly

---

## Support & Resources

**Documentation:**
- API Reference: This document
- User Guide: docs/USAGE.md
- Quick Start: QUICK-START.md

**Interactive:**
- Swagger UI: http://localhost:PORT/docs
- Try endpoints directly
- See request/response schemas

**Help:**
- Check health endpoint: /health
- View application logs
- Review error messages

---

## Changelog

### Version 1.0.0 (2025-10-19)
- Initial API release
- All CRUD endpoints
- Bulk operations
- Export functionality

---

**Version:** 1.0.0  
**Last Updated:** [Date]  
**Base URL:** http://localhost:[PORT]  
**Interactive Docs:** http://localhost:[PORT]/docs

---

## Notes for Using This Template

1. **Replace all [placeholders]** with actual values
2. **Remove sections** that don't apply to your project
3. **Add sections** for project-specific features
4. **Include real examples** from your API
5. **Keep updated** as API evolves
6. **Version and date** every update
7. **Link to interactive docs** (FastAPI auto-generates)
8. **Provide workflow examples** showing multiple endpoints together

**Reference Implementation:**
- See: `/home/lauchlan/gym-progress-tracker/docs/API.md`
- This is a real-world example of comprehensive API documentation
- Copy structure and adapt to your project

---

**This template ensures all future projects have excellent API documentation!** 📚

