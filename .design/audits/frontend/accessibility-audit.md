# Accessibility Audit

**Scope:** WCAG compliance, a11y best practices, inclusive design

## WCAG Compliance Level

- [ ] Target WCAG level defined (A, AA, or AAA)
- [ ] WCAG 2.1 guidelines followed
- [ ] Compliance level documented
- [ ] Regular accessibility audits scheduled
- [ ] Automated accessibility testing in CI/CD
- [ ] Manual accessibility testing performed

## Semantic HTML

- [ ] Semantic HTML5 elements used (`<header>`, `<nav>`, `<main>`, `<article>`, etc.)
- [ ] Proper heading hierarchy (h1-h6)
- [ ] No skipped heading levels
- [ ] `<button>` used for clickable actions
- [ ] `<a>` used for navigation
- [ ] `<form>` elements used for forms
- [ ] Lists use `<ul>`, `<ol>`, `<dl>` appropriately
- [ ] Tables use proper structure (`<thead>`, `<tbody>`, `<th>`)
- [ ] Divs and spans not overused

## Keyboard Navigation

- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order maintained
- [ ] No keyboard traps
- [ ] Skip links provided for main content
- [ ] Focus visible on all focusable elements
- [ ] Custom focus indicators meet contrast requirements
- [ ] Modal dialogs trap focus appropriately
- [ ] Escape key closes modals/dropdowns
- [ ] Arrow keys navigate menus/lists where appropriate
- [ ] Keyboard shortcuts documented and configurable

## ARIA Attributes

- [ ] ARIA labels used where native HTML insufficient
- [ ] ARIA roles used appropriately
- [ ] ARIA states updated dynamically (`aria-expanded`, `aria-selected`)
- [ ] `aria-label` or `aria-labelledby` on unlabeled elements
- [ ] `aria-describedby` for additional context
- [ ] `aria-live` regions for dynamic content
- [ ] `aria-hidden` used to hide decorative elements
- [ ] ARIA landmarks used (`role="main"`, `role="navigation"`, etc.)
- [ ] ARIA not used redundantly with semantic HTML
- [ ] ARIA validated with accessibility tools

## Screen Reader Support

- [ ] Screen reader testing performed (NVDA, JAWS, VoiceOver)
- [ ] Alternative text for images
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have detailed descriptions
- [ ] Form labels associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Dynamic content changes announced
- [ ] Loading states announced
- [ ] Page title descriptive and unique
- [ ] Language attribute set on `<html>`

## Color & Contrast

- [ ] Color contrast ratio meets WCAG AA (4.5:1 for normal text)
- [ ] Color contrast ratio meets WCAG AA (3:1 for large text)
- [ ] Color not sole means of conveying information
- [ ] Link color distinguishable from text
- [ ] Focus indicators have sufficient contrast
- [ ] Error states indicated beyond color
- [ ] Success states indicated beyond color
- [ ] Chart/graph data accessible without color
- [ ] Contrast ratio tested with tools

## Forms

- [ ] All form inputs have labels
- [ ] Labels visible (not placeholder-only)
- [ ] Required fields clearly indicated
- [ ] Error messages associated with fields
- [ ] Error messages descriptive
- [ ] Inline validation accessible
- [ ] Form submission success/failure announced
- [ ] Fieldsets group related inputs
- [ ] Autocomplete attributes used appropriately
- [ ] Input types appropriate (email, tel, date, etc.)

## Images & Media

- [ ] All images have alt text
- [ ] Alt text descriptive but concise
- [ ] Complex images have long descriptions
- [ ] SVGs have title and desc elements
- [ ] Icon fonts have text alternatives
- [ ] Videos have captions/subtitles
- [ ] Audio content has transcripts
- [ ] Video controls keyboard accessible
- [ ] Auto-play avoided or minimal

## Interactive Components

- [ ] Buttons have clear labels
- [ ] Links have descriptive text (not "click here")
- [ ] Modals/dialogs keyboard accessible
- [ ] Dropdowns keyboard navigable
- [ ] Accordions indicate expanded/collapsed state
- [ ] Tabs indicate selected state
- [ ] Tooltips keyboard accessible
- [ ] Carousels/sliders keyboard accessible
- [ ] Carousels provide pause control
- [ ] Date pickers keyboard accessible

## Dynamic Content

- [ ] Loading states announced
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] AJAX updates announced to screen readers
- [ ] Infinite scroll has keyboard access
- [ ] Notification/toast messages accessible
- [ ] Live regions used appropriately
- [ ] Skeleton screens labeled appropriately

## Page Structure

- [ ] Landmark regions defined
- [ ] One `<main>` landmark per page
- [ ] Page title updated on route change (SPA)
- [ ] Breadcrumbs provided for navigation
- [ ] Clear heading hierarchy
- [ ] Content organized logically
- [ ] Related content grouped
- [ ] Navigation consistent across pages

## Touch Targets

- [ ] Touch targets at least 44x44 pixels
- [ ] Adequate spacing between touch targets
- [ ] Clickable areas large enough
- [ ] Hover states have touch equivalents
- [ ] Touch gestures have alternatives

## Animations & Motion

- [ ] `prefers-reduced-motion` respected
- [ ] Parallax effects have reduced-motion alternative
- [ ] Animations can be paused
- [ ] No content flashes more than 3 times per second
- [ ] Animations don't trigger vestibular disorders
- [ ] Essential animations have alternatives

## Text & Readability

- [ ] Font size at least 16px for body text
- [ ] Line height at least 1.5 for body text
- [ ] Line length reasonable (50-75 characters)
- [ ] Text resizable up to 200% without loss of content
- [ ] Text not justified (left-aligned preferred)
- [ ] Adequate paragraph spacing
- [ ] Text over images has sufficient contrast
- [ ] Sans-serif fonts used for body text

## Responsive & Mobile

- [ ] Viewport meta tag configured correctly
- [ ] Layout works at 320px width
- [ ] Content reflows without horizontal scroll
- [ ] Pinch-to-zoom not disabled
- [ ] Mobile navigation accessible
- [ ] Mobile forms usable
- [ ] Mobile touch targets appropriately sized

## Tables

- [ ] Data tables have `<th>` headers
- [ ] Table headers have scope attribute
- [ ] Complex tables have captions
- [ ] Row/column headers properly associated
- [ ] Tables not used for layout
- [ ] Responsive table strategy implemented

## Links

- [ ] Link purpose clear from link text
- [ ] External links indicated
- [ ] Links that open new windows/tabs indicated
- [ ] Download links indicate file type and size
- [ ] Skip to main content link present
- [ ] Breadcrumb navigation accessible

## Error Handling

- [ ] Form errors clearly identified
- [ ] Error messages descriptive
- [ ] Errors announced to screen readers
- [ ] Error summary at top of form
- [ ] Inline validation accessible
- [ ] Error recovery suggestions provided
- [ ] 404 pages helpful and accessible

## Focus Management

- [ ] Focus never invisible
- [ ] Focus moves logically
- [ ] Focus trapped in modals
- [ ] Focus returned after modal close
- [ ] Focus managed in SPAs on route change
- [ ] Focus outline not removed without replacement
- [ ] Custom focus styles meet contrast requirements

## Testing Tools

- [ ] Automated testing with axe or similar
- [ ] Lighthouse accessibility checks run
- [ ] Browser extensions used (WAVE, axe DevTools)
- [ ] Manual keyboard testing performed
- [ ] Screen reader testing performed
- [ ] Color contrast checker used
- [ ] Accessibility linter integrated

## Documentation

- [ ] Accessibility guidelines documented
- [ ] Component accessibility documented
- [ ] Known issues documented
- [ ] Remediation plans documented
- [ ] User documentation accessible

## Training & Awareness

- [ ] Team trained on accessibility
- [ ] Designers aware of accessibility requirements
- [ ] Developers aware of accessibility requirements
- [ ] QA includes accessibility testing
- [ ] Accessibility champion identified

## Third-Party Components

- [ ] Third-party components accessibility reviewed
- [ ] Accessible alternatives chosen
- [ ] Third-party issues documented
- [ ] Workarounds implemented where needed

## Compliance & Legal

- [ ] ADA compliance considered (if US)
- [ ] Section 508 compliance considered (if US government)
- [ ] EN 301 549 compliance considered (if EU)
- [ ] Accessibility statement published
- [ ] Feedback mechanism for accessibility issues

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**WCAG Level Target:** ⬜ A ⬜ AA ⬜ AAA  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**Automated Test Results:**
- axe Violations: _____
- Lighthouse Score: _____/100

**Critical Issues:**
- 

**Recommendations:**
- 

**Action Items:**
- 
