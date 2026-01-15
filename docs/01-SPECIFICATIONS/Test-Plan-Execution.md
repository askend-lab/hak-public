# Test Plan - Execution

## 5. Test Execution

### 5.1 Entry Criteria

- Application deployed to test environment
- Backend services (Vabamorf, Merlin) running
- Test data prepared
- Browser audio enabled

### 5.2 Exit Criteria

- All Critical test cases pass
- 95% of High priority test cases pass
- No Critical or High severity defects open
- All user journeys completed successfully

### 5.3 Test Execution Order

1. **Smoke Test**: TC-01 (Basic Synthesis) - verify app loads and synthesizes
2. **Critical Features**: All Critical priority test cases
3. **High Features**: All High priority test cases
4. **User Journeys**: UJ-01, UJ-02, UJ-03
5. **Edge Cases**: All edge case test cases
6. **Medium Features**: Remaining test cases

---

## 6. Defect Management

### 6.1 Severity Levels

| Severity | Description | Example |
|----------|-------------|---------|
| **Critical** | Application unusable | Synthesis fails completely |
| **High** | Major feature broken | Cannot create tasks |
| **Medium** | Feature partially broken | Download fails on specific browsers |
| **Low** | Minor issue | Visual alignment issue |

### 6.2 Defect Workflow

1. **New** - Defect reported
2. **Open** - Assigned to developer
3. **In Progress** - Being fixed
4. **Resolved** - Fix implemented
5. **Verified** - Tester confirms fix
6. **Closed** - Defect resolved

---

**See also:**
- [Test Plan Overview](./Test-Plan-Overview.md)
- [Test Strategy](./Test-Plan-Strategy.md)
- [Roles & Schedule](./Test-Plan-Logistics.md)
