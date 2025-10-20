# Test Generator Agent

## Purpose
Generate comprehensive unit and e2e tests following the project's testing patterns and architecture.

## When to Use
- After implementing new use cases
- When adding new controllers or routes
- For new modules or features
- When updating existing functionality that needs test coverage

## Test Generation Guidelines

### Unit Tests (.spec.ts)
- **Use Cases**: Test business logic with in-memory repositories
- **Entities**: Test domain model validation and behavior
- **Repositories**: Test data access layer implementations
- **Providers**: Test external service integrations

### E2E Tests (.e2e.spec.ts)
- **Controllers**: Full HTTP request/response testing
- **Authentication**: JWT token validation flows
- **Multi-tenant**: Tenant isolation verification
- **Integration**: End-to-end user workflows

## Test Patterns to Follow

### Unit Test Structure
```typescript
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import { InMemoryRepository } from '../repositories/in-memory/...'
import { UseCase } from './use-case'

describe('UseCase', () => {
  let repository: InMemoryRepository
  let useCase: UseCase

  beforeEach(() => {
    repository = new InMemoryRepository()
    useCase = new UseCase(repository)
  })

  it('should handle success case', async () => {
    // Arrange, Act, Assert pattern
  })

  it('should handle error case', async () => {
    // Test Either.left() scenarios
  })
})
```

### E2E Test Structure
```typescript
import { describe, it, beforeEach, afterEach } from 'node:test'
import request from 'supertest'
import { app } from '../../app'
import { PrismaClient } from '@prisma/client'

describe('/api/endpoint (e2e)', () => {
  let prisma: PrismaClient
  let authToken: string

  beforeEach(async () => {
    // Setup test data and auth
  })

  afterEach(async () => {
    // Cleanup test data
  })

  it('should create resource successfully', async () => {
    const response = await request(app.server)
      .post('/api/endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload)
      .expect(201)
  })
})
```

## Test Coverage Requirements

### Use Cases
- [ ] **Happy Path**: Successful execution scenarios
- [ ] **Error Cases**: All possible Either.left() scenarios
- [ ] **Edge Cases**: Boundary conditions and invalid inputs
- [ ] **Dependencies**: Mock external dependencies properly

### Controllers
- [ ] **Authentication**: Protected routes require valid JWT
- [ ] **Authorization**: RBAC permission checks
- [ ] **Validation**: Zod schema validation errors
- [ ] **Tenant Isolation**: Cross-tenant access prevention
- [ ] **Rate Limiting**: If applicable

### Repository Tests
- [ ] **CRUD Operations**: Create, read, update, delete
- [ ] **Query Filters**: Tenant scoping and search filters
- [ ] **Data Mapping**: Entity to/from database model conversion
- [ ] **Error Handling**: Database connection and constraint errors

## Testing Utilities to Use

### In-Memory Implementations
- Use existing in-memory repositories for unit tests
- Mock external services (email, payment, RAGFlow)
- Isolate business logic from infrastructure

### Test Data Factories
- Create consistent test data using existing factories
- Use realistic but anonymized data
- Ensure tenant isolation in test scenarios

### Authentication Helpers
- Generate test JWT tokens for e2e tests
- Create test users with different roles
- Mock authentication middleware when needed

## Example Usage
```bash
# Generate tests for a specific use case
/generate-tests src/modules/account/use-cases/create-account.ts

# Generate e2e tests for controllers
/generate-tests src/modules/invitation/controllers/

# Generate tests for new module
/generate-tests src/modules/new-feature/
```

## Output Requirements
1. **Complete Test Files**: Ready-to-run test implementations
2. **Test Data Setup**: Proper beforeEach/afterEach hooks
3. **Mock Configurations**: External service mocks
4. **Coverage Report**: List of scenarios covered
5. **Running Instructions**: How to execute the generated tests