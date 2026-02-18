# EKI Design System Architecture

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Overview

The EKI Design System provides a comprehensive, scalable, and maintainable approach to styling the Estonian pronunciation learning platform. This documentation is split into focused sections for easier reading and maintenance.

## Documentation Structure

### Core Architecture
1. **[Introduction](./01-Introduction.md)** - Purpose, philosophy, and target audience
2. **[Architecture Overview](./02-Architecture-Overview.md)** - Three-layer architecture and ITCSS methodology
3. **[File Structure](./03-File-Structure.md)** - Project organization and design token system
4. **[Component Architecture](./04-Component-Architecture.md)** - BEM methodology and component patterns
5. **[Responsive Layout System](./05-Responsive-Layout.md)** - Breakpoints, page layouts, and responsive utilities

### Development & Quality
6. **[Development Workflows](./06-Development-Workflows.md)** - Adding components, styling patterns, and best practices
7. **[Quality Standards](./07-Quality-Standards.md)** - Mandatory standards, validation, and industry compliance
8. **[Migration Patterns](./08-Migration-Patterns.md)** - Legacy migration and storybook proposals

### Reference
9. **[Architecture Diagrams](./09-Architecture-Diagrams.md)** - Visual architecture representations

### Quick References
- **[Quick Reference Guide](./DESIGN_SYSTEM_QUICK_REFERENCE.md)** - Fast lookup for common tasks
- **[Onboarding Guide](./DESIGN_SYSTEM_ONBOARDING.md)** - Getting started with the design system

---

## Quick Start

**For new developers:**
1. Read [Introduction](./01-Introduction.md)
2. Review [Architecture Overview](./02-Architecture-Overview.md)
3. Follow [Development Workflows](./06-Development-Workflows.md)

**For existing developers adding features:**
1. Check [Component Architecture](./04-Component-Architecture.md)
2. Follow [Development Workflows](./06-Development-Workflows.md)
3. Verify against [Quality Standards](./07-Quality-Standards.md)

**For migrations:**
1. Review [Migration Patterns](./08-Migration-Patterns.md)
2. Follow step-by-step migration process
3. Validate with `npm run validate:design`

---

## Additional Resources

- **Token governance:** `styles/tokens/README.md`
- **Style guide:** `styles/README.md`
- **Component proposals:** `STORYBOOK-BACKLOG.md`
- **Validation:** `npm run validate:design`
