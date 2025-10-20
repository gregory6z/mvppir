# Error Handler Specialist Agent

## Purpose
Implement consistent error handling using the Either pattern throughout the application, ensuring predictable error flows and proper error propagation.

## When to Use
- Implementing new use cases with error handling
- Refactoring existing error handling to Either pattern
- Creating new error types for modules
- Reviewing error handling consistency
- Troubleshooting error propagation issues

## Either Pattern Implementation

### Core Either Type
```typescript
// Already implemented in src/core/either.ts
export abstract class Either<L, R> {
  abstract isLeft(): this is Left<L, R>
  abstract isRight(): this is Right<L, R>
}

export class Left<L, R> extends Either<L, R> {
  readonly value: L
  constructor(value: L) {
    super()
    this.value = value
  }
  isLeft(): this is Left<L, R> { return true }
  isRight(): this is Right<L, R> { return false }
}

export class Right<L, R> extends Either<L, R> {
  readonly value: R
  constructor(value: R) {
    super()
    this.value = value
  }
  isLeft(): this is Left<L, R> { return false }
  isRight(): this is Right<L, R> { return true }
}

export const left = <L, R>(l: L): Either<L, R> => new Left(l)
export const right = <L, R>(r: R): Either<L, R> => new Right(r)
```

### Use Case Implementation Pattern
```typescript
import { Either, left, right } from '@/core/either'
import { UseCaseError } from '@/core/errors/use-case-error'

export class CreateUserUseCase implements UseCase<CreateUserRequest, User> {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider
  ) {}

  async execute(request: CreateUserRequest): Promise<Either<UseCaseError, User>> {
    try {
      // Business validation
      const existingUser = await this.userRepository.findByEmail(request.email)
      if (existingUser) {
        return left(new UserAlreadyExistsError()) // ✅ Return error
      }

      // Business logic
      const hashedPassword = await this.hashProvider.hash(request.password)
      const user = {
        id: randomUUID(),
        email: request.email,
        name: request.name,
        password: hashedPassword,
        createdAt: new Date(),
      }

      await this.userRepository.create(user)
      return right(user) // ✅ Return success
    } catch (error) {
      return left(new ServerError(error.message)) // ✅ Handle unexpected errors
    }
  }
}
```

## Error Hierarchy

### Base Error Classes
```typescript
// src/core/errors/use-case-error.ts
export abstract class UseCaseError extends Error {
  abstract readonly type: string
}

// src/core/errors/server-error.ts
export class ServerError extends UseCaseError {
  readonly type = 'ServerError'
  
  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'ServerError'
  }
}

// src/core/errors/not-allowed-error.ts
export class NotAllowedError extends UseCaseError {
  readonly type = 'NotAllowedError'
  
  constructor(message: string = 'Operation not allowed') {
    super(message)
    this.name = 'NotAllowedError'
  }
}

// src/core/errors/resource-not-found-error.ts
export class ResourceNotFoundError extends UseCaseError {
  readonly type = 'ResourceNotFoundError'
  
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'ResourceNotFoundError'
  }
}
```

### Module-Specific Errors
```typescript
// src/modules/account/errors/account.errors.ts
export class UserAlreadyExistsError extends UseCaseError {
  readonly type = 'UserAlreadyExistsError'
  
  constructor() {
    super('User with this email already exists')
    this.name = 'UserAlreadyExistsError'
  }
}

export class InvalidCredentialsError extends UseCaseError {
  readonly type = 'InvalidCredentialsError'
  
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

export class EmailNotVerifiedError extends UseCaseError {
  readonly type = 'EmailNotVerifiedError'
  
  constructor() {
    super('Email address not verified')
    this.name = 'EmailNotVerifiedError'
  }
}
```

## Controller Error Handling

### HTTP Status Code Mapping
```typescript
export async function createUserController(
  request: FastifyRequest<{ Body: CreateUserRequest }>,
  reply: FastifyReply
) {
  const useCase = makeCreateUserUseCase()
  const result = await useCase.execute(request.body)

  if (result.isLeft()) {
    const error = result.value
    
    // Map domain errors to HTTP status codes
    switch (error.type) {
      case 'UserAlreadyExistsError':
        return reply.status(409).send({ 
          message: error.message,
          type: error.type 
        })
      
      case 'ValidationError':
        return reply.status(400).send({ 
          message: error.message,
          type: error.type 
        })
      
      case 'NotAllowedError':
        return reply.status(403).send({ 
          message: error.message,
          type: error.type 
        })
      
      case 'ResourceNotFoundError':
        return reply.status(404).send({ 
          message: error.message,
          type: error.type 
        })
      
      default:
        return reply.status(500).send({ 
          message: 'Internal server error',
          type: 'ServerError' 
        })
    }
  }

  return reply.status(201).send(result.value)
}
```

### Standardized Error Response
```typescript
// Define consistent error response schema
export const errorResponseSchema = z.object({
  message: z.string(),
  type: z.string(),
  details: z.any().optional(),
  timestamp: z.string().optional(),
  path: z.string().optional(),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>
```

## Error Handling Patterns

### 1. Repository Error Handling
```typescript
export class PrismaUserRepository implements UserRepository {
  async create(user: User): Promise<void> {
    try {
      const data = UserMapper.toPrisma(user)
      await this.prisma.user.create({ data })
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint
        throw new UserAlreadyExistsError()
      }
      throw new ServerError(`Database error: ${error.message}`)
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } })
      return user ? UserMapper.toDomain(user) : null
    } catch (error) {
      throw new ServerError(`Database error: ${error.message}`)
    }
  }
}
```

### 2. Provider Error Handling
```typescript
export class NodemailerEmailProvider implements EmailProvider {
  async send(email: Email): Promise<Either<EmailError, void>> {
    try {
      await this.transporter.sendMail({
        from: email.from,
        to: email.to,
        subject: email.subject,
        html: email.html,
      })
      return right(undefined)
    } catch (error) {
      return left(new EmailDeliveryError(error.message))
    }
  }
}
```

### 3. Chain Error Handling
```typescript
export class InviteUserUseCase {
  async execute(request: InviteUserRequest): Promise<Either<UseCaseError, void>> {
    // Check permissions
    const permissionResult = await this.checkPermissionUseCase.execute({
      userId: request.inviterId,
      permission: 'INVITE_USERS',
      tenantId: request.tenantId,
    })
    
    if (permissionResult.isLeft()) {
      return left(permissionResult.value) // ✅ Propagate error
    }

    // Check limits
    const limitsResult = await this.checkLimitsUseCase.execute({
      tenantId: request.tenantId,
      resource: 'USERS',
      increment: 1,
    })
    
    if (limitsResult.isLeft()) {
      return left(limitsResult.value) // ✅ Propagate error
    }

    // Create invitation
    try {
      const invitation = await this.invitationRepository.create({
        email: request.email,
        tenantId: request.tenantId,
        role: request.role,
        inviterId: request.inviterId,
      })

      // Send email
      const emailResult = await this.emailProvider.send({
        to: request.email,
        subject: 'Team Invitation',
        template: 'invitation',
        data: { invitation },
      })

      if (emailResult.isLeft()) {
        return left(new InvitationEmailError())
      }

      return right(undefined)
    } catch (error) {
      return left(new ServerError(error.message))
    }
  }
}
```

## Testing Error Scenarios

### Unit Test Examples
```typescript
describe('CreateUserUseCase', () => {
  it('should return UserAlreadyExistsError when email is taken', async () => {
    // Arrange
    const existingUser = makeUser({ email: 'test@example.com' })
    userRepository.items = [existingUser]
    
    // Act
    const result = await useCase.execute({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    })
    
    // Assert
    assert(result.isLeft())
    assert(result.value instanceof UserAlreadyExistsError)
  })

  it('should return ServerError on repository failure', async () => {
    // Arrange
    userRepository.shouldFail = true
    
    // Act
    const result = await useCase.execute(validRequest)
    
    // Assert
    assert(result.isLeft())
    assert(result.value instanceof ServerError)
  })
})
```

### E2E Error Testing
```typescript
describe('POST /api/users (e2e)', () => {
  it('should return 409 when user already exists', async () => {
    // Arrange
    await createUser({ email: 'test@example.com' })
    
    // Act
    const response = await request(app.server)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      })
      .expect(409)
    
    // Assert
    assert.strictEqual(response.body.type, 'UserAlreadyExistsError')
  })
})
```

## Best Practices

### 1. Fail Fast Principle
```typescript
async execute(request: Request): Promise<Either<Error, Result>> {
  // Validate early
  if (!request.email) {
    return left(new ValidationError('Email is required'))
  }
  
  // Check permissions early
  const hasPermission = await this.checkPermission(request.userId)
  if (!hasPermission) {
    return left(new NotAllowedError())
  }
  
  // Continue with business logic...
}
```

### 2. Error Context
```typescript
export class DocumentNotFoundError extends UseCaseError {
  readonly type = 'DocumentNotFoundError'
  
  constructor(documentId: string, tenantId: string) {
    super(`Document ${documentId} not found in tenant ${tenantId}`)
    this.name = 'DocumentNotFoundError'
  }
}
```

### 3. Error Recovery
```typescript
async execute(request: Request): Promise<Either<Error, Result>> {
  const primaryResult = await this.primaryService.process(request)
  
  if (primaryResult.isLeft() && primaryResult.value.type === 'ServiceUnavailableError') {
    // Fallback to secondary service
    const fallbackResult = await this.fallbackService.process(request)
    return fallbackResult
  }
  
  return primaryResult
}
```

## Example Usage
```bash
# Implement error handling for new use case
/implement-error-handling src/modules/account/use-cases/create-account.ts

# Review error consistency across module
/review-error-handling src/modules/subscription/

# Generate error classes for module
/generate-errors --module chatbot --errors BotNotFound,BotLimitExceeded

# Convert existing try-catch to Either pattern
/convert-to-either src/modules/legacy/use-cases/
```