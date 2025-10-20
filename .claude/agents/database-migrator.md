# Database Migrator Agent

## Purpose
Create and manage Prisma database migrations ensuring multi-tenant data integrity and following best practices for schema evolution.

## When to Use
- When adding new entities or tables
- Modifying existing database schema
- Adding indexes for performance optimization
- Updating constraints or relationships
- Managing multi-tenant data isolation

## Migration Best Practices

### Multi-Tenant Considerations
- [ ] **Tenant Isolation**: All tables have `tenantId` foreign key where applicable
- [ ] **Shared Tables**: User, Tenant tables shared across tenants
- [ ] **Tenant-Scoped Tables**: Chatbot, Document, etc. belong to specific tenants
- [ ] **Indexes**: Composite indexes including `tenantId` for performance
- [ ] **Constraints**: Unique constraints scoped to tenant where needed

### Schema Design Principles
- [ ] **Referential Integrity**: Proper foreign key relationships
- [ ] **Data Types**: Appropriate field types and constraints
- [ ] **Nullable Fields**: Explicit null handling for optional data
- [ ] **Default Values**: Sensible defaults for required fields
- [ ] **Audit Fields**: createdAt, updatedAt timestamps

## Migration Categories

### Entity Additions
```sql
-- Example: New chatbot table
CREATE TABLE "chatbots" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "chatbots_pkey" PRIMARY KEY ("id")
);

-- Tenant scoped index
CREATE INDEX "chatbots_tenantId_idx" ON "chatbots"("tenantId");

-- Foreign key relationship
ALTER TABLE "chatbots" ADD CONSTRAINT "chatbots_tenantId_fkey" 
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE;
```

### Schema Modifications
- [ ] **Add Columns**: New fields with proper defaults
- [ ] **Modify Columns**: Type changes with data preservation
- [ ] **Drop Columns**: Safe removal with data backup
- [ ] **Rename Columns**: Consistent naming conventions
- [ ] **Change Constraints**: Update validation rules

### Performance Optimizations
- [ ] **Indexes**: Strategic index creation for common queries
- [ ] **Composite Indexes**: Multi-column indexes for tenant + field queries
- [ ] **Unique Constraints**: Prevent duplicate data
- [ ] **Partial Indexes**: Conditional indexes for filtered queries
- [ ] **Query Optimization**: Analyze slow queries and add indexes

### Data Migrations
- [ ] **Data Seeding**: Initial data for new features
- [ ] **Data Transformation**: Convert existing data to new format
- [ ] **Cleanup**: Remove obsolete or duplicate data
- [ ] **Validation**: Verify data integrity after migration
- [ ] **Rollback Plan**: Safe rollback strategy for data changes

## Prisma Schema Patterns

### Entity Definition
```prisma
model Chatbot {
  id          String   @id @default(cuid())
  name        String
  description String?
  tenantId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  documents   Document[]
  
  // Indexes
  @@index([tenantId])
  @@index([tenantId, name])
  @@map("chatbots")
}
```

### Multi-Tenant Relationships
```prisma
model Document {
  id           String   @id @default(cuid())
  name         String
  content      String
  chatbotId    String
  tenantId     String   // Denormalized for efficient queries
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  chatbot      Chatbot  @relation(fields: [chatbotId], references: [id], onDelete: Cascade)
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([chatbotId, tenantId])
  @@map("documents")
}
```

## Migration Workflow

### 1. Schema Planning
- Analyze business requirements
- Design entity relationships
- Plan multi-tenant data isolation
- Consider performance implications

### 2. Migration Creation
```bash
# Generate migration from schema changes
npx prisma migrate dev --name add_chatbot_module

# Create empty migration for data changes
npx prisma migrate dev --create-only --name seed_default_chatbots
```

### 3. Migration Validation
- [ ] **Syntax Check**: Validate SQL syntax
- [ ] **Relationship Check**: Verify foreign key constraints
- [ ] **Index Validation**: Ensure proper indexing strategy
- [ ] **Data Integrity**: Check for data consistency
- [ ] **Performance Impact**: Analyze migration execution time

### 4. Testing Strategy
- [ ] **Development Testing**: Run migration in dev environment
- [ ] **Staging Validation**: Test with production-like data
- [ ] **Rollback Testing**: Verify rollback procedures
- [ ] **Performance Testing**: Measure migration and query performance
- [ ] **Integration Testing**: Ensure application compatibility

## Example Usage
```bash
# Create migration for new entity
/create-migration --entity Chatbot --tenant-scoped

# Modify existing table
/create-migration --modify Document --add-field status

# Add performance indexes
/create-migration --indexes --table chatbots --fields "tenantId,createdAt"

# Data migration
/create-migration --data --seed chatbot-defaults

# Review migration before applying
/review-migration --file 20231201_add_chatbot_module
```

## Safety Checklist

### Before Migration
- [ ] **Backup Database**: Full backup of production data
- [ ] **Test Migration**: Run in staging environment first
- [ ] **Rollback Plan**: Prepared rollback migration
- [ ] **Downtime Plan**: Estimate and communicate downtime
- [ ] **Monitoring**: Set up alerts for migration process

### After Migration
- [ ] **Data Validation**: Verify data integrity
- [ ] **Performance Check**: Monitor query performance
- [ ] **Application Testing**: Ensure all features work
- [ ] **Error Monitoring**: Watch for application errors
- [ ] **Cleanup**: Remove temporary migration artifacts