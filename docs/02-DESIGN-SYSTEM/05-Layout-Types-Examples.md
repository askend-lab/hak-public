# Responsive Layout - Layout Type Examples

## Layout Type 1: Minimal

**Use for:** Role selection, simple pages, splash screens

```tsx
<div className="page-layout">
  <header className="page-layout__header">...</header>
  
  <main className="page-layout__main">
    <div className="page-header page-header--minimal">
      <h1 className="page-header__title">Vali oma roll</h1>
    </div>
    
    <div className="page-content">
      {/* Page content */}
    </div>
  </main>
  
  <footer className="page-layout__footer page-footer--full">...</footer>
</div>
```

**Features:**
- Simple title only
- No description or actions
- Maximum content space

## Layout Type 2: Full

**Use for:** Synthesis page, task details, complex pages with description and actions

```tsx
<div className="page-layout">
  <header className="page-layout__header">...</header>
  
  <main className="page-layout__main">
    <div className="page-header page-header--full">
      <div className="page-header__content">
        <h1 className="page-header__title">Teksti kõnesüntees</h1>
        <p className="page-header__description">
          Sisesta tekst või sõna, et kuulata selle hääldust ja uurida variante
        </p>
      </div>
      <div className="page-header__actions">
        <button className="btn-secondary">Lisa ülesandesse</button>
        <button className="btn-primary">Mängi kõik</button>
      </div>
    </div>
    
    <div className="page-content">
      {/* Page content */}
    </div>
  </main>
  
  <footer className="page-layout__footer page-footer--full">...</footer>
</div>
```

**Features:**
- Title + description
- Action buttons aligned to bottom-right (desktop) or stacked (mobile)
- Horizontal layout on desktop, vertical on mobile

## Layout Type 3: With Actions

**Use for:** Task list, directory pages, pages with title and actions but no description

```tsx
<div className="page-layout">
  <header className="page-layout__header">...</header>
  
  <main className="page-layout__main">
    <div className="page-header page-header--with-actions">
      <h1 className="page-header__title">Minu ülesanded</h1>
      <div className="page-header__actions">
        <button className="btn-primary">Loo uus ülesanne</button>
      </div>
    </div>
    
    <div className="page-content">
      {/* Task list or directory content */}
    </div>
  </main>
  
  <footer className="page-layout__footer page-footer--full">...</footer>
</div>
```

**Features:**
- Title + action buttons
- No description (more compact)
- Horizontal layout on tablet+, vertical on mobile

## Layout Type 4: Empty State

**Use for:** Error pages, no results, empty lists

```tsx
<div className="page-layout">
  <header className="page-layout__header">...</header>
  
  <main className="page-layout__main">
    <div className="page-content page-content--empty">
      <div className="empty-state">
        <svg className="empty-state__icon">...</svg>
        <h2 className="empty-state__title">Ülesandeid ei leitud</h2>
        <p className="empty-state__description">
          Sul pole veel ühtegi ülesannet. Alusta uue ülesande loomisega!
        </p>
        <button className="empty-state__action btn-primary">
          Loo esimene ülesanne
        </button>
      </div>
    </div>
  </main>
  
  <footer className="page-layout__footer page-footer--full">...</footer>
</div>
```

**Features:**
- No page header
- Centered empty state
- Icon, title, description, call-to-action
- Vertically and horizontally centered

---

**See also:**
- [Responsive Behavior & Guide](./05-Layout-Behavior-Guide.md) - Behavior, selection guide, utilities
- [Breakpoints & Structure](./05-Responsive-Layout-Breakpoints.md) - Breakpoint strategy
