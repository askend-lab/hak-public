# Component Architecture - BEM Methodology

## BEM Methodology

All components follow the **BEM (Block Element Modifier)** naming methodology for predictable, maintainable CSS.

**BEM Structure:**

```scss
.block {}                    // Component root
.block__element {}           // Child element (double underscore)
.block--modifier {}          // Variant/state (double dash)
.block__element--modifier {} // Element variant
```

**Real Examples from the App:**

```scss
// Panel Component
.panel {}                    // Block
.panel__backdrop {}          // Element
.panel__header {}            // Element
.panel__title {}             // Element
.panel--right {}             // Modifier (position)
.panel--md {}                // Modifier (size)
.panel__close {}             // Element

// Paper Component
.paper {}                    // Block
.paper__item {}              // Element
.paper__divider {}           // Element
.paper--dropdown {}          // Modifier (type)
.paper--elevated {}          // Modifier (elevation)
.paper__item--danger {}      // Element modifier

// Task Manager
.task-manager {}             // Block
.task-manager__header {}     // Element
.task-manager__list {}       // Element
.task-manager--loading {}    // Modifier (state)
```

**Why BEM?**

1. **Flat Specificity**: No nested selectors, consistent specificity
2. **Self-Documenting**: Class names describe structure and purpose
3. **Portable**: Components can be moved without breaking
4. **Predictable**: Easy to find and modify styles
5. **No Conflicts**: Naming convention prevents class name collisions

**BEM Naming Rules:**

✅ **DO:**
- Use lowercase and hyphens for multi-word blocks: `.task-manager`
- Use double underscore for elements: `.task-manager__header`
- Use double dash for modifiers: `.task-manager--loading`
- Keep nesting shallow: avoid `.block__element__subelement`

❌ **DON'T:**
- Use camelCase: `.taskManager`
- Use single separators: `.task-manager-header` (ambiguous)
- Nest too deeply: `.task__header__title__icon` (create new elements instead)
- Mix BEM with other conventions

---

**See also:**
- [Component Patterns](./04-Component-Architecture-Patterns.md) - Base and standalone patterns
