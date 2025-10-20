# Claude Code Subagents

This directory contains specialized subagents designed specifically for this multi-saas platform built with Clean Architecture principles.

## Available Subagents

### 1. 🔍 **Code Reviewer** (`code-reviewer.md`)
Reviews code implementations for Clean Architecture compliance and project-specific patterns.

**Usage Examples:**
```bash
# Review a complete module
Task: "Review the account module for Clean Architecture compliance using the code-reviewer agent"

# Review specific use case
Task: "Use code-reviewer to analyze the create-account use case implementation"

# Review API endpoints
Task: "Review all controllers and routes using code-reviewer for best practices"
```

### 2. 🧪 **Test Generator** (`test-generator.md`)
Generates comprehensive unit and e2e tests following project patterns.

**Usage Examples:**
```bash
# Generate tests for new use case
Task: "Generate unit tests for the CreateChatbotUseCase using test-generator"

# Generate e2e tests for controllers
Task: "Use test-generator to create e2e tests for the invitation module controllers"

# Generate complete test suite
Task: "Generate both unit and e2e tests for the subscription module using test-generator"
```

### 3. 📖 **API Documenter** (`api-documenter.md`)
Creates comprehensive API documentation with OpenAPI/Swagger schemas.

**Usage Examples:**
```bash
# Document module endpoints
Task: "Document all RAGFlow API endpoints using api-documenter with complete schemas"

# Update API documentation
Task: "Use api-documenter to update subscription module documentation with new endpoints"

# Generate integration examples
Task: "Create API documentation with integration examples using api-documenter"
```

### 4. 🗄️ **Database Migrator** (`database-migrator.md`)
Creates and manages Prisma migrations with multi-tenant considerations.

**Usage Examples:**
```bash
# Create migration for new entity
Task: "Create a Prisma migration for the ChatbotSession entity using database-migrator"

# Modify existing schema
Task: "Use database-migrator to add a status field to the Document table"

# Performance optimization
Task: "Create database indexes for better query performance using database-migrator"
```

### 5. 🏗️ **Clean Architecture Enforcer** (`clean-architecture-enforcer.md`)
Validates and enforces Clean Architecture principles across modules.

**Usage Examples:**
```bash
# Validate module structure
Task: "Validate the chatbot module structure using clean-architecture-enforcer"

# Check dependency flow
Task: "Use clean-architecture-enforcer to verify dependency directions in all modules"

# Architecture audit
Task: "Perform a complete architecture audit using clean-architecture-enforcer"
```

### 6. ⚠️ **Error Handler Specialist** (`error-handler-specialist.md`)
Implements consistent error handling using the Either pattern.

**Usage Examples:**
```bash
# Implement error handling
Task: "Add proper Either pattern error handling to the upload-document use case using error-handler-specialist"

# Review error consistency
Task: "Use error-handler-specialist to review error handling across the tenant module"

# Convert legacy error handling
Task: "Convert try-catch blocks to Either pattern using error-handler-specialist"
```

## How to Use Subagents

### 1. Using the Task Tool
```bash
# Basic usage
Task: "Use [agent-name] to [specific task]"

# With specific focus
Task: "Use code-reviewer to analyze the authentication module for security best practices"

# With multiple requirements
Task: "Use test-generator to create comprehensive tests for the new RAGFlow features including unit tests for use cases and e2e tests for API endpoints"
```

### 2. Agent Selection Guidelines

**Choose `code-reviewer` when:**
- After implementing new features
- Before committing code changes
- During code review process
- When ensuring architectural compliance

**Choose `test-generator` when:**
- Adding new use cases or controllers
- Updating existing functionality
- Improving test coverage
- Setting up CI/CD pipelines

**Choose `api-documenter` when:**
- Adding new API endpoints
- Updating request/response schemas
- Preparing for API releases
- Creating integration guides

**Choose `database-migrator` when:**
- Adding new entities or tables
- Modifying database schema
- Optimizing database performance
- Managing data migrations

**Choose `clean-architecture-enforcer` when:**
- Creating new modules
- Refactoring existing code
- Onboarding new team members
- Conducting architecture reviews

**Choose `error-handler-specialist` when:**
- Implementing new use cases
- Improving error handling consistency
- Converting legacy error patterns
- Debugging error flows

## Best Practices

### 1. Combine Agents for Complete Workflows
```bash
# Complete feature implementation
1. Task: "Use clean-architecture-enforcer to validate the new chatbot module structure"
2. Task: "Use test-generator to create comprehensive tests for chatbot use cases"
3. Task: "Use api-documenter to document the chatbot API endpoints"
4. Task: "Use code-reviewer to ensure the implementation follows Clean Architecture"
```

### 2. Sequential Agent Usage
```bash
# Database changes workflow
1. Task: "Use database-migrator to create migration for ChatbotSession entity"
2. Task: "Use clean-architecture-enforcer to validate the repository implementation"
3. Task: "Use test-generator to create tests for the new repository methods"
```

### 3. Agent-Specific Focus
```bash
# Focused error handling improvement
Task: "Use error-handler-specialist to review and improve error handling in the subscription module, focusing on payment failure scenarios and proper Either pattern implementation"
```

## Integration with Development Workflow

1. **Before Coding**: Use `clean-architecture-enforcer` to plan module structure
2. **During Development**: Use `code-reviewer` for continuous validation
3. **After Implementation**: Use `test-generator` for comprehensive testing
4. **Before Release**: Use `api-documenter` for documentation
5. **Database Changes**: Use `database-migrator` for schema evolution
6. **Error Handling**: Use `error-handler-specialist` for consistent error flows

## Agent Customization

Each agent can be customized by:
1. Modifying the agent's `.md` file with project-specific requirements
2. Adding new validation rules or patterns
3. Updating examples and use cases
4. Extending checklists and best practices

These subagents are designed to work seamlessly with the existing Clean Architecture implementation and multi-tenant SaaS platform requirements.