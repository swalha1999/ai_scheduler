# Access Layer V2 - Clean Architecture

This is the new access layer architecture that separates concerns into distinct layers for better maintainability and testability.

## Architecture Overview

```
┌─────────────────┐
│   Services      │  ← Business Logic + Authorization + Caching
├─────────────────┤
│  Repositories   │  ← Pure Database Operations
├─────────────────┤
│   Database      │  ← Drizzle ORM + PostgreSQL
└─────────────────┘
```

## Layers

### 1. Repository Layer (`src/db/repositories/`)
- **Purpose**: Pure database operations without business logic
- **Responsibilities**:
  - CRUD operations
  - Complex queries
  - Data filtering and pagination
  - No authorization checks
  - No caching logic

### 2. Service Layer (`src/db/services/`)
- **Purpose**: Business logic, authorization, and caching
- **Responsibilities**:
  - Authorization checks (admin, super admin, etc.)
  - Business rules and validation
  - Cache management with class-level cached functions
  - Orchestrating multiple repository calls
  - Error handling

## Usage Examples

### Using Services (Recommended)
```typescript
import { UsersService, ContactsService } from '@/db/access-layer-v2';

// Services handle authorization and caching automatically
const usersService = new UsersService();
const users = await usersService.getAllUsers(); // Requires admin access

const contactsService = new ContactsService();
const contacts = await contactsService.getContactsWithFilters(
  'Main St', 
  'Springfield', 
  'gave_consent'
); // Requires admin access + caching
```

### Using Repositories Directly (For Internal Use)
```typescript
import { UsersRepository, ContactsRepository } from '@/db/access-layer-v2';

// Repositories are pure database operations
const usersRepo = new UsersRepository();
const users = await usersRepo.findAll(); // No auth checks, no caching

const contactsRepo = new ContactsRepository();
const contacts = await contactsRepo.findWithFilters('Main St', 'Springfield');
```

## Key Benefits

1. **Separation of Concerns**: Database logic is separate from business logic
2. **Testability**: Each layer can be tested independently
3. **Reusability**: Repositories can be used by multiple services
4. **Maintainability**: Changes to business rules don't affect database queries
5. **Consistency**: Authorization and caching are handled consistently across services
6. **Proper Caching**: Class-level cached functions prevent creating new cache functions on every call

## Caching Implementation

We use **class-level cached functions** to ensure proper caching behavior:

```typescript
export class UsersService extends BaseService {
  private usersRepo = new UsersRepository();

  // ✅ CORRECT: Class-level cached functions
  private getAllUsersCached = unstable_cache(
    () => this.usersRepo.findAll(),
    ['users', 'all'],
    { tags: ['users'], revalidate: 300 }
  );

  private getUserByIdCached = unstable_cache(
    (id: number) => this.usersRepo.findById(id),
    ['user', 'by-id'],
    { tags: ['users'], revalidate: 300 }
  );

  async getAllUsers() {
    await this.requireAdmin(); // Authorization
    return await this.getAllUsersCached(); // Uses same cached function every time
  }

  async getUserById(id: number) {
    return await this.getUserByIdCached(id);
  }

  // Non-cached operations
  async createUser(data: Omit<User, 'id'>) {
    await this.requireSuperAdmin();
    const result = await this.usersRepo.create(data);
    this.invalidateCache(['users']); // Invalidate cache
    return result;
  }
}
```

### Why Class-Level Cached Functions?

**❌ WRONG: Creating cached functions inside methods**
```typescript
async getAllUsers() {
  // This creates a NEW cached function on every call!
  const cachedFn = unstable_cache(
    () => this.usersRepo.findAll(),
    ['users', 'all'],
    { tags: ['users'] }
  );
  return await cachedFn(); // Defeats caching purpose!
}
```

**✅ CORRECT: Class-level cached functions**
```typescript
// Created once when class is instantiated
private getAllUsersCached = unstable_cache(
  () => this.usersRepo.findAll(),
  ['users', 'all'],
  { tags: ['users'], revalidate: 300 }
);

async getAllUsers() {
  await this.requireAdmin();
  return await this.getAllUsersCached(); // Uses same cached function every time
}
```

## Available Services

- **UsersService**: User management with admin authorization
- **ContactsService**: Contact management with filtering and search
- **FamiliesService**: Family management
- **WhatsAppService**: WhatsApp message handling with business logic
- **InvitesService**: Wedding invitation management
- **FilesService**: File upload and management
- **LeadsService**: Lead management

## Available Repositories

- **UsersRepository**: User CRUD operations
- **ContactsRepository**: Contact CRUD with advanced filtering
- **HouseholdsRepository**: Household management
- **FamiliesRepository**: Family CRUD operations
- **WhatsAppRepository**: WhatsApp message CRUD
- **InvitesRepository**: Invitation CRUD operations
- **FilesRepository**: File CRUD operations
- **LeadsRepository**: Lead CRUD operations

## Best Practices

1. **Use Services in Application Code**: Always use services in your application code for proper authorization and caching
2. **Use Repositories for Testing**: Use repositories directly in tests for faster, isolated testing
3. **Extend Base Classes**: Extend `BaseService` and `BaseRepository` for consistent patterns
4. **Handle Errors Properly**: Services should handle and transform repository errors appropriately
5. **Cache Strategically**: Use class-level cached functions with appropriate cache keys and invalidation strategies
6. **Never Create Cached Functions Inside Methods**: Always define cached functions as class properties to ensure proper caching behavior

## Migration from Old Access Layer

The old access layer mixed database operations with business logic. The new architecture separates these concerns:

**Old Way:**
```typescript
// Mixed DB operations with auth and caching
export async function getAllUsers() {
  const { session, user } = await getCurrentSession();
  if (!user?.is_admin) return [];
  
  return await unstable_cache(
    () => db.select().from(users),
    ['users'],
    { tags: ['users'] }
  )();
}
```

**New Way:**
```typescript
// Repository: Pure DB operation
class UsersRepository {
  async findAll() {
    return await this.db.select().from(users);
  }
}

// Service: Business logic + auth + caching
class UsersService {
  async getAllUsers() {
    await this.requireAdmin(); // Authorization
    
    const cachedFn = this.createCachedFunction(
      () => this.usersRepo.findAll(),
      ['users', 'all'],
      { tags: ['users'] }
    );
    
    return await cachedFn(); // Caching
  }
}
``` 