# Clean Architecture Enforcer Agent

## Purpose
Validate and enforce Clean Architecture principles across all modules, ensuring consistent structure and dependency flow throughout the codebase.

## When to Use
- Before creating new modules
- When refactoring existing modules
- During code reviews for architectural compliance
- When onboarding new team members
- Periodic architecture audits

## Clean Architecture Layers

### 1. Entities (Domain Layer)
**Location**: `src/modules/[module]/entities/`
**Purpose**: Core business objects and domain logic
**Rules**:
- [ ] **Pure Business Logic**: No external dependencies
- [ ] **Framework Independent**: No HTTP, database, or UI concerns
- [ ] **Immutable Data**: Entities should be immutable where possible
- [ ] **Domain Validation**: Business rule validation within entities
- [ ] **TypeScript Interfaces**: Simple interfaces/types only

```typescript
// ✅ Correct Entity Example
export interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly createdAt: Date
}

// ❌ Wrong - Has external dependencies
import { PrismaClient } from '@prisma/client'
export class User {
  constructor(private prisma: PrismaClient) {} // ❌ No external deps
}
```

### 2. Use Cases (Application Layer)
**Location**: `src/modules/[module]/use-cases/`
**Purpose**: Application-specific business rules and orchestration
**Rules**:
- [ ] **Single Responsibility**: One use case per class
- [ ] **Dependency Injection**: Dependencies injected via constructor
- [ ] **Either Pattern**: Return `Either<Error, Success>` for error handling
- [ ] **Interface Dependencies**: Depend on abstractions, not implementations
- [ ] **Pure Functions**: Deterministic, testable business logic

```typescript
// ✅ Correct Use Case Example
export class CreateUserUseCase implements UseCase<CreateUserRequest, User> {
  constructor(
    private userRepository: UserRepository, // ✅ Interface dependency
    private hashProvider: HashProvider      // ✅ Interface dependency
  ) {}

  async execute(request: CreateUserRequest): Promise<Either<Error, User>> {
    // ✅ Business logic implementation
  }
}
```

### 3. Repositories (Infrastructure Interface)
**Location**: `src/modules/[module]/repositories/`
**Purpose**: Data access abstractions and implementations
**Rules**:
- [ ] **Interface Definition**: Abstract interfaces in main folder
- [ ] **Implementation Separation**: Concrete implementations in subfolders
- [ ] **Entity Mapping**: Convert between domain and persistence models
- [ ] **Query Abstraction**: Hide database-specific query language
- [ ] **Error Handling**: Translate database errors to domain errors

```typescript
// ✅ Repository Interface
export interface UserRepository {
  create(user: User): Promise<void>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
}

// ✅ Prisma Implementation
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(user: User): Promise<void> {
    const data = UserMapper.toPrisma(user) // ✅ Use mapper
    await this.prisma.user.create({ data })
  }
}
```

### 4. Controllers (Interface Layer)
**Location**: `src/modules/[module]/controllers/`
**Purpose**: Handle HTTP requests and responses
**Rules**:
- [ ] **HTTP Concerns Only**: Handle request/response formatting
- [ ] **Validation**: Input validation using Zod schemas
- [ ] **Authentication**: JWT token validation
- [ ] **Authorization**: Permission checks via RBAC
- [ ] **Error Mapping**: Convert domain errors to HTTP status codes

```typescript
// ✅ Correct Controller Example
export async function createUserController(
  request: FastifyRequest<{ Body: CreateUserRequest }>,
  reply: FastifyReply
) {
  const useCase = makeCreateUserUseCase() // ✅ Factory injection
  const result = await useCase.execute(request.body)

  if (result.isLeft()) {
    const error = result.value
    return reply.status(400).send({ message: error.message })
  }

  return reply.status(201).send(result.value)
}
```

### 5. Routes (Interface Layer)
**Location**: `src/modules/[module]/routes/`
**Purpose**: Define HTTP endpoints and their schemas
**Rules**:
- [ ] **Schema Validation**: Zod schemas for request/response
- [ ] **OpenAPI Documentation**: Complete API documentation
- [ ] **Authentication Setup**: Proper auth middleware configuration
- [ ] **Error Schemas**: Standardized error response formats
- [ ] **Type Safety**: TypeScript type providers for validation

## Module Structure Validation

### Required Structure
```
modules/[module-name]/
├── entities/           # Domain models
├── use-cases/          # Business logic + tests
├── repositories/       # Data access interfaces
│   ├── in-memory/      # Test implementations
│   └── prisma/         # Production implementations
├── controllers/        # HTTP handlers + e2e tests
├── routes/             # Fastify route definitions
├── factories/          # Dependency injection
├── events/             # Domain events (optional)
├── errors/             # Module-specific errors
└── dtos/              # Data transfer objects
```

### Dependency Flow Rules
- [ ] **Inward Dependencies**: Outer layers depend on inner layers
- [ ] **No Circular Dependencies**: No circular imports between layers
- [ ] **Interface Segregation**: Small, focused interfaces
- [ ] **Dependency Inversion**: Depend on abstractions, not concretions

```typescript
// ✅ Correct Dependency Flow
entities/ ← use-cases/ ← controllers/
    ↑         ↑            ↑
repositories/  ←  factories/  ←  routes/

// ❌ Wrong - Entity depending on use case
import { CreateUserUseCase } from '../use-cases/create-user' // ❌
```

## Validation Checklist

### Module Creation
- [ ] **Folder Structure**: Follows established module structure
- [ ] **Naming Conventions**: Consistent file and class naming
- [ ] **Index Files**: Proper barrel exports where needed
- [ ] **Dependencies**: Correct dependency flow and injection
- [ ] **Testing**: Unit tests for use cases, e2e tests for controllers

### Code Quality
- [ ] **Single Responsibility**: Each class has one reason to change
- [ ] **Open/Closed Principle**: Open for extension, closed for modification
- [ ] **Liskov Substitution**: Subtypes must be substitutable for base types
- [ ] **Interface Segregation**: No forced dependencies on unused methods
- [ ] **Dependency Inversion**: High-level modules don't depend on low-level modules

### Multi-Tenant Compliance
- [ ] **Tenant Scoping**: All queries filtered by tenant ID
- [ ] **Permission Checks**: RBAC validation in controllers
- [ ] **Data Isolation**: No cross-tenant data access
- [ ] **Resource Limits**: Usage limit validation where applicable

## Common Violations

### 1. Direct Database Access in Use Cases
```typescript
// ❌ Wrong - Direct Prisma usage
export class CreateUserUseCase {
  constructor(private prisma: PrismaClient) {} // ❌

  async execute(request: CreateUserRequest) {
    const user = await this.prisma.user.create({ data: request }) // ❌
  }
}

// ✅ Correct - Repository abstraction
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {} // ✅

  async execute(request: CreateUserRequest) {
    await this.userRepository.create(user) // ✅
  }
}
```

### 2. Business Logic in Controllers
```typescript
// ❌ Wrong - Business logic in controller
export async function createUserController(request, reply) {
  const hashedPassword = await bcrypt.hash(request.body.password, 10) // ❌
  const user = await prisma.user.create({ data: { ...request.body, password: hashedPassword } }) // ❌
  return reply.send(user)
}

// ✅ Correct - Delegate to use case
export async function createUserController(request, reply) {
  const useCase = makeCreateUserUseCase() // ✅
  const result = await useCase.execute(request.body) // ✅
  // Handle result...
}
```

### 3. Missing Error Handling
```typescript
// ❌ Wrong - No error handling
async execute(request: CreateUserRequest): Promise<User> {
  return await this.userRepository.create(request) // ❌ Can throw
}

// ✅ Correct - Either pattern
async execute(request: CreateUserRequest): Promise<Either<Error, User>> {
  try {
    const user = await this.userRepository.create(request)
    return right(user) // ✅
  } catch (error) {
    return left(new CreateUserError(error.message)) // ✅
  }
}
```

## Example Usage
```bash
# Validate specific module structure
/validate-architecture src/modules/account/

# Check all modules for compliance
/validate-architecture src/modules/

# Validate dependency flow
/validate-dependencies src/modules/user/ src/modules/tenant/

# Architecture audit report
/architecture-audit --report
```

## Enforcement Rules

### Automated Checks
- [ ] **Import Analysis**: Verify dependency directions
- [ ] **File Structure**: Ensure proper module organization
- [ ] **Interface Compliance**: Check repository implementations
- [ ] **Test Coverage**: Validate test presence and structure
- [ ] **Naming Conventions**: Consistent naming across modules