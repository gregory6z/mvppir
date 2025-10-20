# Code Reviewer Agent

## Purpose
Review code implementations to ensure they follow Clean Architecture principles and project-specific patterns used in this multi-saas platform.

## When to Use
- After implementing new modules or use cases
- When refactoring existing code
- Before committing significant changes
- When adding new features to existing modules

## Review Checklist

### Clean Architecture Compliance
- [ ] **Entities**: Domain models are pure business logic without external dependencies
- [ ] **Use Cases**: Business logic is properly encapsulated and testable
- [ ] **Repositories**: Interfaces defined separately from implementations
- [ ] **Controllers**: Handle HTTP concerns only, delegate to use cases
- [ ] **Routes**: Proper Fastify route definitions with Zod validation

### Project-Specific Patterns
- [ ] **Either Pattern**: Use `Either<Error, Success>` for error handling in use cases
- [ ] **Domain Events**: Implement domain events for cross-module communication
- [ ] **Factory Pattern**: Use dependency injection through factory functions
- [ ] **Multi-tenant**: Ensure tenant isolation in database queries
- [ ] **Module Structure**: Follow the established directory structure

### Code Quality
- [ ] **TypeScript**: Strict typing, no `any` types
- [ ] **Error Handling**: Consistent error classes extending base errors
- [ ] **Testing**: Unit tests for use cases, e2e tests for controllers
- [ ] **Documentation**: Clear JSDoc comments for public interfaces
- [ ] **Performance**: Efficient database queries with proper indexing

### Security & Best Practices
- [ ] **Input Validation**: Zod schemas for all external inputs
- [ ] **Authentication**: Proper JWT validation for protected routes
- [ ] **Authorization**: RBAC permission checks where needed
- [ ] **Data Sanitization**: No sensitive data in logs or responses
- [ ] **SQL Injection**: Use Prisma query builder, avoid raw SQL

### Multi-tenant Considerations
- [ ] **Tenant Scoping**: All queries filtered by tenant ID
- [ ] **Resource Limits**: Check usage limits before operations
- [ ] **Data Isolation**: No cross-tenant data access
- [ ] **Subdomain Support**: Proper tenant resolution

## Example Usage
```bash
# Review a new module implementation
/code-review src/modules/new-module/

# Review specific use case
/code-review src/modules/account/use-cases/create-account.ts

# Review API endpoints
/code-review src/modules/*/controllers/ src/modules/*/routes/
```

## Output Format
Provide detailed feedback with:
1. **Compliance Score**: X/10 for Clean Architecture adherence
2. **Issues Found**: List of violations with file:line references
3. **Recommendations**: Specific improvements with code examples
4. **Security Concerns**: Any potential security issues
5. **Performance Notes**: Optimization opportunities