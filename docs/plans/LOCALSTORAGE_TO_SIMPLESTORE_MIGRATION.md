# localStorage to SimpleStore Migration Plan

## Current State Analysis

### localStorage Usage Patterns
1. **Authentication**: `hak_user`, `hak_*_token`, `eki_user`
2. **Tasks**: `eki_user_tasks_{userId}`, `eki_deleted_tasks_{userId}`, `eki_baseline_additions_{userId}`
3. **Synthesis**: `eki_synthesis_sentences`, legacy `eki_playlist_entries`
4. **Onboarding**: `eki_onboarding`
5. **Shared**: `eki_shared_tasks`

### Problems Identified
- Duplicate keys (`hak_user` vs `eki_user`)
- Inconsistent prefixes (`hak_` vs `eki_`)
- No centralized management
- Manual cleanup on logout
- No data validation/migration strategy

## SimpleStore Architecture

### Key Benefits
- Multi-tenancy support
- Access control (public/shared/private)
- Auto-expiration with TTL
- Clean separation of concerns
- Type-safe operations

### Data Model
```
pk (partition key) - entity identifier
sk (sort key) - sub-identifier  
type - public/shared/private
data - JSON payload
ttl - expiration (max 1 year)
```

## Migration Strategy

### Phase 1: Minimal Viable Migration (Week 1)
**Goal**: Replace authentication storage only

#### Steps:
1. Create `AuthStorageService` using SimpleStore
2. Map existing keys to SimpleStore structure:
   - `pk: "user"` `sk: "{userId}"` `type: "private"` for user data
   - `pk: "auth"` `sk: "{userId}"` `type: "private"` for tokens
3. Add migration logic in AuthContext
4. Update logout to use SimpleStore cleanup
5. Add fallback to localStorage during transition

#### Expected Outcome:
- Authentication data stored in SimpleStore
- Backward compatibility maintained
- No impact on other features

### Phase 2: Task Storage Migration (Week 2)
**Goal**: Migrate task-related storage

#### Steps:
1. Create `TaskStorageService` using SimpleStore
2. Map task storage:
   - `pk: "tasks"` `sk: "{userId}"` `type: "private"` for user tasks
   - `pk: "tasks"` `sk: "deleted-{userId}"` `type: "private"` for deleted tasks
   - `pk: "tasks"` `sk: "baseline-{userId}"` `type: "private"` for additions
   - `pk: "shared"` `sk: "tasks"` `type: "shared"` for shared tasks
3. Update LocalStorageAdapter to use SimpleStore
4. Add data migration from localStorage
5. Update task repository layer

#### Expected Outcome:
- All task data in SimpleStore
- Improved data consistency
- Better sharing capabilities

### Phase 3: Feature Storage Migration (Week 3)
**Goal**: Migrate synthesis and onboarding

#### Steps:
1. Create `FeatureStorageService` for synthesis state
2. Create `OnboardingStorageService` for onboarding state
3. Map remaining keys:
   - `pk: "synthesis"` `sk: "{userId}"` `type: "private"` for sentences
   - `pk: "onboarding"` `sk: "{userId}"` `type: "private"` for state
4. Update hooks and contexts
5. Clean up legacy keys

#### Expected Outcome:
- Complete migration to SimpleStore
- Unified storage interface
- Easier maintenance

### Phase 4: Cleanup & Optimization (Week 4)
**Goal**: Remove localStorage dependencies

#### Steps:
1. Remove localStorage fallbacks
2. Clean up unused code
3. Add error handling and retry logic
4. Performance optimization
5. Documentation updates

## Implementation Details

### Key Mapping Strategy
```
localStorage key → SimpleStore pk/sk/type
eki_user_{userId} → pk: "user", sk: "{userId}", type: "private"
eki_tasks_{userId} → pk: "tasks", sk: "{userId}", type: "private"
eki_shared_tasks → pk: "shared", sk: "tasks", type: "shared"
```

### Data Migration Approach
1. **Read existing data** from localStorage
2. **Transform to SimpleStore format**
3. **Write to SimpleStore**
4. **Verify successful migration**
5. **Clean up localStorage** (only after verification)

### Fallback Strategy
- During migration: try SimpleStore first, fallback to localStorage
- Error handling: Graceful degradation if SimpleStore unavailable
- Rollback plan: Keep localStorage until migration verified

## Risk Assessment

### High Risks
- Data loss during migration
- Performance impact
- Breaking existing functionality

### Mitigations
- Comprehensive testing at each phase
- Data backup before migration
- Gradual rollout with fallbacks
- Monitoring and rollback procedures

## Success Criteria

### Phase 1 Success
- Authentication works via SimpleStore
- No regressions in login/logout
- Performance maintained

### Complete Migration Success
- All localStorage usage eliminated
- Data consistency improved
- Better access control implemented
- Maintenance burden reduced

## Next Steps

1. **Get approval for Phase 1 approach**
2. **Create implementation branch**
3. **Set up SimpleStore dev environment**
4. **Start Phase 1 implementation**
