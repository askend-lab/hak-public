# Accessibility Standards

Standards for making web applications usable by everyone, including people with disabilities.

## 1. WCAG 2.1 — Web Content Accessibility Guidelines
- **Link**: https://www.w3.org/TR/WCAG21/
- **Levels**: A (minimum), AA (standard), AAA (enhanced)
- **HAK target**: Level AA compliance
- **Principles** (POUR):
  - **Perceivable**: Text alternatives, captions, adaptable content, distinguishable
  - **Operable**: Keyboard accessible, enough time, no seizures, navigable, input modalities
  - **Understandable**: Readable, predictable, input assistance
  - **Robust**: Compatible with assistive technologies
- **Quick reference**: https://www.w3.org/WAI/WCAG21/quickref/

## 2. WCAG 2.2 — Latest Version (2023)
- **Link**: https://www.w3.org/TR/WCAG22/
- **New criteria**: Focus Not Obscured, Dragging Movements, Target Size (Minimum), Consistent Help, Redundant Entry, Accessible Authentication
- **HAK action**: Target WCAG 2.2 AA for forward compatibility

## 3. WAI-ARIA — Accessible Rich Internet Applications
- **Link**: https://www.w3.org/TR/wai-aria-1.2/
- **Scope**: Roles, states, and properties for dynamic web content
- **Key for HAK**: Live regions for audio playback status, dialog roles for modals, combobox for search, tree for task navigation

## 4. EN 301 549 — European Accessibility Standard
- **Link**: https://www.etsi.org/deliver/etsi_en/301500_301599/301549/
- **Scope**: EU standard for ICT accessibility (references WCAG 2.1)
- **Mandatory for**: EU public sector websites and mobile apps
- **HAK relevance**: As an Estonian government project, EN 301 549 compliance is likely **legally required**

## 5. Section 508 — US Federal Accessibility
- **Link**: https://www.section508.gov/
- **Scope**: US federal government ICT accessibility requirements
- **Based on**: WCAG 2.0 Level AA (being updated to 2.1)
- **Relevance**: International benchmark, good practice even for non-US projects

## 6. ATAG 2.0 — Authoring Tool Accessibility Guidelines
- **Link**: https://www.w3.org/TR/ATAG20/
- **Scope**: Guidelines for tools that produce web content
- **HAK relevance**: HAK is a content authoring tool for teachers — teachers creating lessons must be able to do so accessibly

## 7. axe-core — Automated Accessibility Testing
- **Link**: https://github.com/dequelabs/axe-core
- **Playwright integration**: https://github.com/nicolo-ribaudo/axe-playwright
- **Scope**: Automated detection of ~60% of WCAG issues
- **HAK action**: Integrate into E2E tests and CI pipeline
- **Complement with**: Manual testing for the remaining ~40% (keyboard navigation, screen reader, cognitive)
