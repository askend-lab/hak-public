# Code Quality & Style Standards

Standards and guides for writing clean, maintainable, readable code.

## 1. Clean Code — Robert C. Martin
- **Link**: https://www.oreilly.com/library/view/clean-code-a/9780136083238/
- **Key principles**: Meaningful names, small functions, single responsibility, DRY, YAGNI, no side effects, command-query separation, error handling over return codes
- **HAK action**: Every function < 30 lines, every file < 400 lines, every name self-documenting

## 2. Google TypeScript Style Guide
- **Link**: https://google.github.io/styleguide/tsguide.html
- **Scope**: Google's internal TypeScript conventions
- **Key rules**: No `any`, explicit visibility, readonly by default, union types over enums, no default exports, barrel files discouraged

## 3. Airbnb JavaScript Style Guide
- **Link**: https://github.com/airbnb/javascript
- **Scope**: Most widely adopted JS style guide (4M+ GitHub stars)
- **Key rules**: `const` over `let`, arrow functions, destructuring, template literals, modules

## 4. TypeScript Deep Dive — Basarat Ali Syed
- **Link**: https://basarat.gitbook.io/typescript/
- **Scope**: Comprehensive TypeScript best practices
- **Key areas**: Type guards, discriminated unions, strict null checks, branded types

## 5. Effective TypeScript — Dan Vanderkam
- **Link**: https://effectivetypescript.com/
- **Scope**: 83 specific ways to improve TypeScript code
- **Key items**: Prefer type declarations over assertions, use readonly, understand type widening/narrowing

## 6. SOLID Principles
- **Link**: https://en.wikipedia.org/wiki/SOLID
- **Single Responsibility**: Each module/class has one reason to change
- **Open-Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Many specific interfaces over one general
- **Dependency Inversion**: Depend on abstractions, not concretions
- **HAK action**: Audit each package against SOLID principles

## 7. Node.js Best Practices
- **Link**: https://github.com/goldbergyoni/nodebestpractices (100k+ stars)
- **Scope**: 100+ best practices for Node.js production applications
- **Sections**: Project structure, error handling, code style, testing, security, performance, Docker

## 8. React Patterns & Best Practices
- **Link**: https://react.dev/learn (official docs)
- **Additional**: https://github.com/alan2207/bulletproof-react
- **Key patterns**: Custom hooks, composition over inheritance, error boundaries, suspense, memoization, server state management

## 9. Conventional Commits
- **Link**: https://www.conventionalcommits.org/
- **Scope**: Structured commit message format
- **Format**: `type(scope): description` — feat, fix, docs, refactor, test, chore
- **HAK status**: Configured but not enforced with commitlint

## 10. Semantic Versioning (SemVer)
- **Link**: https://semver.org/
- **Format**: MAJOR.MINOR.PATCH — breaking.feature.fix
- **HAK action**: Define versioning strategy before open source launch

## 11. The Twelve-Factor App (see also Cloud section)
- **Link**: https://12factor.net/
- **Applicable factors**: Config in env, backing services as resources, stateless processes, dev/prod parity, logs as event streams

## 12. IEEE 730 — Software Quality Assurance
- **Link**: https://standards.ieee.org/standard/730-2014.html
- **Scope**: SQA processes and activities
- **Key areas**: Reviews, audits, testing, configuration management, reporting

## 13. Refactoring — Martin Fowler
- **Link**: https://refactoring.com/
- **Catalog**: https://refactoring.com/catalog/
- **Key refactorings**: Extract function, inline function, rename, move, encapsulate, replace conditional with polymorphism

## 14. Design Patterns — Gang of Four + Modern Patterns
- **Link**: https://refactoring.guru/design-patterns
- **Applicable to HAK**: Strategy (parsers), Factory (adapters), Observer (events), Singleton (config), Repository (data access), Middleware (Lambda handlers)
