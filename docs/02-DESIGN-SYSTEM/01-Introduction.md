# Introduction

## Purpose and Scope

The EKI Design System provides a comprehensive, scalable, and maintainable approach to styling the Estonian pronunciation learning platform. This document serves as the definitive architectural guide for developers implementing or updating the application.

## Philosophy: Design Tokens as Single Source of Truth

Our design system is built on a fundamental principle: **all design values originate from design tokens**. This approach ensures:

- **Consistency**: Visual elements share common design language
- **Maintainability**: Changes propagate through token updates
- **Scalability**: New components inherit established patterns
- **Themability**: Runtime CSS custom properties enable dynamic theming

## Relationship to EKI Storybook

The EKI Design System **extends, not replaces** the central EKI Storybook:

```
EKI Storybook (Shared)          EKI App Design System (Local)
├─ Base components              ├─ Design tokens (extends storybook)
│  └─ Button, Input, Avatar     ├─ App-specific components
└─ Shared patterns              │  └─ Task Manager, Audio Player, Panel
                                └─ Component proposals (for future storybook)
```

**Key Principles:**
- Use storybook components when available
- Follow storybook conventions for consistency
- Document app-specific components for future centralization
- Maintain compatibility for seamless migration

## Target Audience

This documentation is for:
- **Frontend Developers**: Implementing features and components
- **UI/UX Designers**: Understanding implementation constraints
- **Maintainers**: Ensuring architectural consistency
- **New Team Members**: Onboarding to the system
