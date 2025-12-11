# Contributing Guide

Guidelines for developers contributing to Single Table Lambda.

## Development Setup

```bash
git clone <repository>
cd singletablelambda
npm install
npm test
```

## Project Structure

```
src/
├── index.ts        # Public API exports
├── types.ts        # TypeScript interfaces (immutable with readonly)
├── config.ts       # Centralized configuration
├── keyBuilder.ts   # DynamoDB key construction
├── validation.ts   # Request validation
├── store.ts        # Core CRUD operations
├── handler.ts      # Lambda handler with routing
└── dynamoClient.ts # AWS DynamoDB adapter

test/
├── *.test.ts       # Jest test files
└── mockDynamoDB.ts # In-memory DynamoDB mock
```

## Code Principles

### SOLID

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Each module has one purpose |
| **O**pen/Closed | `DynamoDBClient` interface for extensibility |
| **L**iskov Substitution | `InMemoryDynamoDB` substitutes `DynamoDBAdapter` |
| **I**nterface Segregation | Small, focused interfaces |
| **D**ependency Inversion | Store depends on abstraction, not concrete |

### DRY (Don't Repeat Yourself)

- `ERRORS` constants in `store.ts` - single source for error messages
- `HTTP_ERRORS` constants in `handler.ts` - HTTP error messages
- `extractKeyParams()` - shared parameter extraction
- `validateString/validateType/validatePrefix` - reusable validators

### KISS (Keep It Simple)

- Router pattern instead of complex if/else chains
- Simple helper functions with single purpose
- No unnecessary abstractions

## Coding Standards

### TypeScript

- Use `readonly` for immutable properties
- Prefer `??` over `||` for nullish coalescing
- Use `as const` for literal type constants
- Add JSDoc comments for public functions

### Naming

- **Constants**: `UPPER_SNAKE_CASE`
- **Functions**: `camelCase`, verb prefix (`build`, `validate`, `create`)
- **Interfaces**: `PascalCase`, noun
- **Files**: `camelCase.ts`

### Error Handling

- Return `StoreResult` objects, don't throw exceptions
- Use `ERRORS` constants for error messages
- Map errors to HTTP status codes via `ERROR_STATUS_MAP`

## Testing

### Requirements

- Minimum 80% coverage (statements, branches, functions)
- Use `InMemoryDynamoDB` mock for unit tests
- Test both success and failure paths

### Running Tests

```bash
npm test              # Run all tests
npm run test:coverage # With coverage report
```

### Writing Tests

```typescript
describe('Store', () => {
  let db: InMemoryDynamoDB;
  let store: Store;

  beforeEach(() => {
    db = new InMemoryDynamoDB();
    store = new Store(db, context);
  });

  it('should save item', async () => {
    const result = await store.save(request);
    expect(result.success).toBe(true);
  });
});
```

## Adding Features

### New Store Operation

1. Add method to `DynamoDBClient` interface
2. Implement in `Store` class
3. Implement in `DynamoDBAdapter`
4. Implement in `InMemoryDynamoDB` mock
5. Add validation function
6. Add handler function
7. Add route to `routes` array
8. Write tests

### New Validation Rule

1. Add helper function in `validation.ts`
2. Use in appropriate `validate*Request` function
3. Add tests in `validation.test.ts`

## Pull Request Checklist

- [ ] All tests pass (`npm test`)
- [ ] Coverage ≥ 80% (`npm run test:coverage`)
- [ ] Build succeeds (`npm run build`)
- [ ] No linting errors
- [ ] JSDoc comments for public API
- [ ] Updated documentation if needed

## Key Design Decisions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanations of:

- Why single-table design
- Key structure rationale
- Iron Rule enforcement
- TTL requirements
- Error handling approach
