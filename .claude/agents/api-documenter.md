# API Documenter Agent

## Purpose
Generate comprehensive API documentation for Fastify endpoints with OpenAPI/Swagger schemas, following the project's documentation standards.

## When to Use
- After implementing new API endpoints
- When updating existing route schemas
- For new modules with HTTP interfaces
- Before releasing new API versions

## Documentation Standards

### OpenAPI Schema Requirements
- **Complete Schemas**: Request/response schemas with Zod validation
- **Authentication**: JWT requirements and role-based access
- **Error Responses**: Standardized error formats
- **Examples**: Realistic request/response examples
- **Tags**: Proper categorization by module

### Route Documentation Structure
```typescript
export async function routeName(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/api/endpoint', {
    schema: {
      tags: ['Module Name'],
      summary: 'Brief action description',
      description: 'Detailed endpoint description',
      security: [{ bearerAuth: [] }],
      body: requestSchema,
      response: {
        201: {
          description: 'Success response description',
          content: {
            'application/json': {
              schema: responseSchema,
              example: exampleResponse
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: errorSchema,
              example: exampleError
            }
          }
        }
      }
    }
  }, handler)
}
```

## Documentation Components

### Request/Response Schemas
- [ ] **Zod Schemas**: Convert to OpenAPI JSON schema
- [ ] **Validation Rules**: Min/max lengths, patterns, enums
- [ ] **Required Fields**: Clearly marked required vs optional
- [ ] **Nested Objects**: Proper object/array documentation
- [ ] **Type Definitions**: Consistent type naming

### Authentication & Authorization
- [ ] **JWT Requirements**: Which endpoints need authentication
- [ ] **Role Permissions**: RBAC role requirements
- [ ] **Tenant Scoping**: Multi-tenant access patterns
- [ ] **API Keys**: If applicable for integrations
- [ ] **Rate Limiting**: Request limits and throttling

### Error Documentation
- [ ] **Standard Errors**: 400, 401, 403, 404, 500 responses
- [ ] **Business Errors**: Domain-specific error codes
- [ ] **Validation Errors**: Zod validation failure formats
- [ ] **Error Examples**: Realistic error response examples
- [ ] **Troubleshooting**: Common issues and solutions

### Examples & Workflows
- [ ] **Request Examples**: Complete, working examples
- [ ] **Response Examples**: Success and error scenarios
- [ ] **User Flows**: Multi-step API workflows
- [ ] **Integration Guides**: How to integrate with the API
- [ ] **SDK Examples**: Code samples in different languages

## Module-Specific Documentation

### Account Module
- User creation, profile management, email verification
- Password recovery and reset workflows
- Multi-tenant user relationships

### Authentication Module
- Login/logout flows with JWT tokens
- Token refresh mechanisms
- Session management

### Tenant Module
- Organization creation and management
- User invitation and role assignment
- Subdomain configuration

### Subscription Module
- Stripe integration workflows
- Plan management and billing
- Usage tracking and limits

### RAGFlow Module
- Knowledge base creation and management
- Document upload and processing
- Chat and search endpoints

### Chatbot Module
- Bot creation and configuration
- Chat session management
- Analytics and monitoring

## Output Requirements

### Generated Documentation
1. **OpenAPI Spec**: Complete openapi.json/yaml file
2. **Interactive Docs**: Swagger UI accessible endpoints
3. **Markdown Docs**: Human-readable API documentation
4. **Postman Collection**: Ready-to-import collection
5. **SDK Documentation**: Integration examples

### Documentation Structure
```
docs/
├── api/
│   ├── openapi.json
│   ├── README.md
│   └── modules/
│       ├── account.md
│       ├── auth.md
│       ├── tenant.md
│       ├── subscription.md
│       ├── ragflow.md
│       └── chatbot.md
├── examples/
│   ├── postman/
│   ├── curl/
│   └── sdk/
└── guides/
    ├── getting-started.md
    ├── authentication.md
    └── integration.md
```

## Example Usage
```bash
# Document specific module endpoints
/document-api src/modules/account/routes/

# Generate complete API documentation
/document-api src/modules/*/routes/

# Update existing documentation
/document-api --update src/modules/subscription/routes/

# Generate integration examples
/document-api --examples src/modules/ragflow/routes/
```

## Integration with Existing Tools
- **Fastify Swagger**: Use existing @fastify/swagger setup
- **Zod OpenAPI**: Convert Zod schemas to OpenAPI format
- **Scalar**: Enhanced API reference documentation
- **Testing**: Link documentation examples to test cases