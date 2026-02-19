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

## Layout Type 5: Two-Column

**Use for:** Synthesis page with side panel, dashboard layouts, pages with primary content and sidebar

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
    
    <div className="page-content page-content--two-column">
      <div className="page-content__primary">
        {/* Main content area - sentences, forms, etc. */}
      </div>
      <div className="page-content__secondary">
        {/* Sidebar - playlist, settings, etc. */}
        {/* Sticky on desktop, stacks below on mobile */}
      </div>
    </div>
  </main>
  
  <footer className="page-layout__footer page-footer--full">...</footer>
</div>
```

**Features:**
- Two-column grid layout (1.4fr / 1fr ratio)
- Primary column on left, secondary (sticky sidebar) on right
- Responsive: stacks to single column below 1024px
- Secondary column becomes static on mobile
- Optional `.page-content__full` class for full-width content rows

**Responsive Behavior:**

| Breakpoint | Columns | Secondary Position |
|------------|---------|-------------------|
| Desktop (1280px+) | 1.4fr / 1fr | Sticky sidebar |
| Desktop (1024px - 1279px) | 1.2fr / 1fr | Sticky sidebar |
| Below 1024px | Single column | Stacks below primary |

## Layout Type 6: Content Page

**Use for:** Privacy policy, accessibility statement, legal pages, text-heavy informational content

```tsx
<div className="content-page">
  <div className="content-page__banner">
    <h1 className="content-page__banner-title">Privaatsuspoliitika</h1>
  </div>

  <div className="content-page__body">
    <div className="content-page__section">
      <h2>Section Heading</h2>
      <p>Section content with body text...</p>
    </div>
    <div className="content-page__section">
      <h2>Another Section</h2>
      <ul>
        <li>List items for structured content</li>
      </ul>
    </div>
  </div>

  <div className="content-page__footer-band">
    <div className="content-page__body">
      <div className="content-page__section">
        <h2>Contact / Disclaimers</h2>
        <p>Footer band content (secondary background)...</p>
      </div>
    </div>
  </div>
</div>
```

**Features:**
- Does **not** use the standard `.page-layout` / `.page-header` structure
- Full-width colored banner (secondary background) with centered title
- Narrow body (max-width 750px vs 920px for normal content)
- Sections separated by border-bottom dividers
- Footer band with secondary-color background for closing sections (contact info, disclaimers)
- Content-specific typography tokens (`$letter-spacing-content-title`, `$letter-spacing-content-body`)

**Responsive Behavior:**

| Breakpoint | Banner Height | Body Padding | Section Padding |
|------------|--------------|-------------|-----------------|
| Mobile (< 640px) | 140px | 0 16px | 32px 0 |
| Mobile landscape (640px+) | 140px | 0 20px | 32px 0 |
| Tablet (768px+) | 180px | 0 24px | 36px 0 |
| Desktop (1024px+) | 220px | 0 24px | 36px 0 |
| Large (750px + 48px) | 220px | 0 | 36px 0 |

**BEM Structure:**

| Class | Purpose |
|-------|---------|
| `.content-page` | Root wrapper |
| `.content-page__banner` | Full-width colored header band |
| `.content-page__banner-title` | Banner heading (24px mobile, 34px tablet+) |
| `.content-page__body` | Narrow centered body (max-width 750px) |
| `.content-page__section` | Content section with bottom border divider |
| `.content-page__footer-band` | Full-width footer band (secondary background) |

---

**See also:**
- [Responsive Behavior & Guide](./06-Layout-Behavior-Guide.md)
- [Breakpoints & Structure](./05-Responsive-Layout-Breakpoints.md)
