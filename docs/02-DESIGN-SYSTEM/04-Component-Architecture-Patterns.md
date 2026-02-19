# Component Architecture - Patterns & Integration

## Component Patterns

### Pattern A: Base Component with Mixins

**Use when:** Component will be extended or reused with variations

**Structure:**

```scss
// Provides both mixins AND classes
// Other components can @include the mixins

// 1. Define mixins
@mixin panel-base {
  position: fixed;
  background: $color-white;
  z-index: 1001;
}

@mixin panel-right {
  right: 0;
  animation: panelSlideInRight 0.3s ease-out;
}

// 2. Create classes using mixins
.panel {
  @include panel-base;
}

.panel--right {
  @include panel-right;
}

// 3. Other components can extend
.pronunciation-variants {
  @include panel-base;
  @include panel-right;
  // Add specific overrides
}
```

**Examples in App:**
- **Panel** (`styles/components/_panel.scss`) - Base for sliding drawers
  - Extended by: pronunciation-variants, sentence-phonetic-panel
- **Paper** (`styles/components/_paper.scss`) - Base for dropdowns/popovers
  - Extended by: playlist, user-profile, add-to-task-dropdown

**Benefits:**
- Reusability without duplication
- Consistent base behavior
- Flexibility for variations
- Easy to maintain shared patterns

### Pattern B: Standalone Component

**Use when:** Component is specific to one use case

**Structure:**

```scss
// Direct classes only, no mixins needed

.task-manager {
  display: flex;
  flex-direction: column;
  padding: $spacing-4;
  background: $color-white;
}

.task-manager__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-3;
}

.task-manager__list {
  flex: 1;
  overflow-y: auto;
}

.task-manager--loading {
  opacity: 0.6;
  pointer-events: none;
}
```

**Examples in App:**
- **Task Manager** (`styles/components/_task-manager.scss`)
- **Audio Player** (`styles/components/_audio-player.scss`)
- **Playlist** (`styles/components/_playlist.scss`)
- **Login Modal** (`styles/components/_login-modal.scss`)

**Benefits:**
- Simpler structure
- Faster to write
- No overhead from unused mixins
- Easier to understand for specific use cases

## Storybook Integration

### Components from Storybook (Layer 2)

These components are **imported from EKI Storybook** and used as-is:

| Component | Classes | Usage |
|-----------|---------|-------|
| **Button** | `.button`, `.button--primary`, `.button--secondary` | All buttons |
| **Input** | `.input`, `.input-wrapper`, `.input-label` | Text inputs |
| **Avatar** | `.avatar`, `.avatar__initials` | User avatars |
| **Checkbox** | `.checkbox-btn` | Checkboxes |
| **Radio** | `.radio-btn` | Radio buttons |
| **Select** | `.select` | Dropdowns |
| **Modal** | `.modal` (notification variant) | Toast notifications |

**How to use:**

```tsx
// React component
<button className="button button--primary">
  Save Changes
</button>

<input className="input" type="text" />
```

**Rules:**
- ✅ Use storybook classes directly
- ✅ Can combine with utility modifiers if needed
- ❌ Don't modify storybook component styles
- ❌ Don't create duplicate button/input styles

### App-Specific Components (Layer 3)

These components are **unique to this app** and not in storybook:

| Component | Purpose | File |
|-----------|---------|------|
| **Panel** | Sliding drawer panels | `_panel.scss` |
| **Paper** | Dropdown/popover surfaces | `_paper.scss` |
| **Modal** | Dialog modals (not toast) | `_modal-base.scss` |
| **Task Manager** | Task list management | `_task-manager.scss` |
| **Audio Player** | Audio playback controls | `_audio-player.scss` |
| **Playlist** | Batch audio management | `_playlist.scss` |
| **Textarea** | Multi-line text input | `_textarea.scss` |

These may be proposed to storybook in the future if they prove valuable for other EKI apps.

---

**See also:**
- [BEM Methodology](./03-Component-Architecture-BEM.md)
