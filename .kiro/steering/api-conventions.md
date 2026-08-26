---
inclusion: auto
---

# API Conventions — TaskFlow

## REST Endpoint Naming

- Base path: `/api`
- Resources are plural: `/api/projects`, `/api/tasks`
- Nested actions use sub-paths: `/api/tasks/:id/status`
- Use kebab-case for multi-word paths (if any)
- IDs are UUIDs in path params

## HTTP Methods

| Operation | Method | Path | Status |
|-----------|--------|------|--------|
| Create | POST | `/api/resources` | 201 |
| List all | GET | `/api/resources` | 200 |
| Get one | GET | `/api/resources/:id` | 200 |
| Update | PATCH | `/api/resources/:id` | 200 |
| Delete (soft) | DELETE | `/api/resources/:id` | 200 |
| Custom action | PATCH | `/api/resources/:id/action` | 200 |

## Response Envelope

All successful responses use a standard envelope:

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

For list endpoints, `data` is an array. Meta may include pagination info in future.

## Error Response Format

All error responses use:

```json
{
  "error": {
    "statusCode": 400,
    "message": "Human-readable error message",
    "details": [
      { "field": "name", "message": "Name is required" }
    ]
  }
}
```

- `details` is optional — included for validation errors
- Use appropriate HTTP status codes: 400 (validation), 404 (not found), 500 (server error)

## NestJS Module Structure

Each feature module follows:

```
modules/
└── projects/
    ├── projects.module.ts        # Module definition
    ├── projects.controller.ts    # Route handlers + Swagger decorators
    ├── projects.service.ts       # Business logic + Prisma queries
    ├── dto/                      # Request/response DTOs (from Zod)
    │   ├── create-project.dto.ts
    │   └── update-project.dto.ts
    └── projects.controller.spec.ts  # Tests
```

## Validation with Zod

- Import Zod schemas from `@taskflow/shared`
- Use `ZodValidationPipe` as a parameter-level pipe: `@Body(new ZodValidationPipe(schema))`
- The pipe throws `BadRequestException` with structured field errors
- Backend ALWAYS validates independently of frontend — never trust client data

## Swagger Documentation

Every endpoint MUST have:

- `@ApiTags('resource-name')` on the controller class
- `@ApiOperation({ summary: '...' })` on each method
- `@ApiResponse({ status: 2xx, description: '...' })` for success
- `@ApiResponse({ status: 4xx, description: '...' })` for errors
- `@ApiParam()` for path parameters
- `@ApiQuery()` for query parameters
- `@ApiBody()` for request bodies

## Query Parameters for Filtering

Task list endpoint supports:
- `search` — partial title match (case-insensitive)
- `projectId` — filter by project UUID
- `status` — filter by task status (TODO, IN_PROGRESS, COMPLETED)
- `priority` — filter by priority (LOW, MEDIUM, HIGH)
- `sortBy` — field to sort (createdAt, updatedAt, dueDate, priority)
- `sortOrder` — asc or desc

Multiple filters are combinable (AND logic).

## CORS

- Allow origin: `http://localhost:3000` (Next.js dev)
- Allow methods: GET, POST, PATCH, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization
- Credentials: true
