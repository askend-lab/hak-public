# HAK — Master Audit Checklist

Список всех аудитов и review, проведённых по проекту HAK.
Каждый чекбокс = один аудит/review. Ссылка ведёт на файл с деталями.

Последнее обновление: 2026-02-17

---

## 🔒 Security

- [x] **Security Audit (Feb 2026)** — [`SECURITY-AUDIT-2026-02.md`](SECURITY-AUDIT-2026-02.md)
  Full codebase + infrastructure. 3 critical, 10 high, 14 medium. **All resolved.** Round 2 included. 2 deferred (S3 encryption/versioning — accepted risk).

- [x] **Security Audit Details** — [`SECURITY-AUDIT-2026-02-DETAILS.md`](SECURITY-AUDIT-2026-02-DETAILS.md)
  Technical details: token flow analysis, CORS matrix, endpoint auth matrix, Cognito filter injection, methodology.

---

## 🔍 Code Reviews

- [x] **hak-public Full Audit (83 findings)** — [`Audit-hak-public.md`](Audit-hak-public.md)
  Весь hak-public repo. 4 фазы: Critical (10/10 ✅), High (16/16 ✅), Medium (29/29 ✅), Discussion (13/13 ✅), Low (13/15). **Осталось:** #72 CI tara-auth, #73 integration tests.

- [x] **Audit14 — Detailed Code Review (100 findings)** — [`Audit14.md`](Audit14.md)
  Придирчивый аудит: Security & Auth, Data & State, Frontend Architecture, API & Network, UI/UX, Infrastructure, Code Quality, Privacy, Testing. Общая оценка: 7/10.

- [x] **Audit14 — Action Plan** — [`Audit14-Action-Plan.md`](Audit14-Action-Plan.md)
  План действий по Audit14. **Итого:** 🔧 FIX: 48 | 🔜 LATER: 22 | ✅ DONE: 13 | ❌ WONTFIX: 17. P0–P3 приоритизация. Большинство P0–P2 закрыты.

- [x] **Backend & Infra Code Review (30 findings)** — [`Code-Review-Backend-Infra.md`](Code-Review-Backend-Infra.md)
  Luna. merlin-api, merlin-worker, tara-auth, simplestore, vabamorf-api, shared, infra, CI/CD. 10 critical, 20 medium. **Fixed:** 13/30. Остаток: shell injection (#1), CloudWatch gaps (#7-8), Terraform approval (#9-10), Dockerfile (#15), VPC (#16), pickle (#17), S3 CORS (#18), integration tests (#22), ECR lifecycle (#24), gherkin depth (#26), specs package (#27), CloudFront cache (#29), health check (#30).

- [x] **Frontend Code Review — Luna (15 findings)** — [`Code-Review-Frontend.md`](Code-Review-Frontend.md)
  Security, architecture, performance, correctness. 2 critical, 5 high, 8 medium. **Fixed:** 10/15. Остаток: TARA cookie tokens (#1), synthesis dedup (#5), memo deps (#9), share token URL (#14), warmup auth (#15).

- [x] **Backend Code Review — Luna (32 findings)** — [`Code-Review-Luna.md`](Code-Review-Luna.md)
  simplestore, merlin-api, merlin-worker, vabamorf-api, tara-auth, shared, gherkin-parser, specs, CI/CD. **Fixed:** 27/32. Documented: 3. By design: 2.

---

## 🖥️ Frontend Reviews (by Eve)

- [x] **Frontend Code Review — Eve (120 findings)** — [`FRONTEND-CODE-REVIEW.md`](FRONTEND-CODE-REVIEW.md)
  Index file. 12 категорий × 10 findings. 26 critical, 53 major, 41 minor.

- [x] **01 — Architecture & React Patterns** — [`frontend-review/01-architecture-react.md`](frontend-review/01-architecture-react.md)
- [x] **02 — Security & Error Handling** — [`frontend-review/02-security-errors.md`](frontend-review/02-security-errors.md)
- [x] **03 — Performance & Data Management** — [`frontend-review/03-performance-data.md`](frontend-review/03-performance-data.md)
- [x] **04 — Type Safety & Code Quality** — [`frontend-review/04-types-quality.md`](frontend-review/04-types-quality.md)
- [x] **05 — Testing & Accessibility** — [`frontend-review/05-testing-a11y.md`](frontend-review/05-testing-a11y.md)
- [x] **06 — UX & Miscellaneous** — [`frontend-review/06-ux-misc.md`](frontend-review/06-ux-misc.md)

---

## 🖥️ Frontend Audits (specialized)

- [x] **Audit Findings (consolidated)** — [`frontend-audits/AUDIT_FINDINGS.md`](frontend-audits/AUDIT_FINDINGS.md)
- [x] **Architectural Problems** — [`frontend-audits/ARCHITECTURAL_PROBLEMS.md`](frontend-audits/ARCHITECTURAL_PROBLEMS.md)
- [x] **Code Quality Analysis** — [`frontend-audits/CODE_QUALITY_ANALYSIS.md`](frontend-audits/CODE_QUALITY_ANALYSIS.md)
- [x] **Optimization Report** — [`frontend-audits/OPTIMIZATION_REPORT.md`](frontend-audits/OPTIMIZATION_REPORT.md)
- [x] **WCAG Audit Report** — [`frontend-audits/WCAG_AUDIT_REPORT.md`](frontend-audits/WCAG_AUDIT_REPORT.md)
- [x] **Accessibility Remediation Backlog** — [`frontend-audits/ACCESSIBILITY_REMEDIATION_BACKLOG.md`](frontend-audits/ACCESSIBILITY_REMEDIATION_BACKLOG.md)
- [x] **Design System Compliance Report** — [`frontend-audits/DESIGN_SYSTEM_COMPLIANCE_REPORT.md`](frontend-audits/DESIGN_SYSTEM_COMPLIANCE_REPORT.md)

---

## 🏗️ Infrastructure

- [x] **Infrastructure Audit (4 phases)** — [`INFRA_AUDIT_PLAN.md`](INFRA_AUDIT_PLAN.md)
  Sam. Terraform, Serverless, Docker, GitHub Actions, AWS state. 16 issues. **All phases complete.** Phase 1: security fixes (PR #559, #561, #563). Phase 2: IAM/MFA (AWS Console). Phase 3: CloudTrail + GuardDuty. Phase 4: orphaned resources cleanup. Found and fixed wrong DynamoDB table in CloudWatch monitoring.

---

## ⚙️ CI/CD

- [x] **CI/CD Improvements** — [`CI-CD-Improvements.md`](CI-CD-Improvements.md)
  Kate. P0: merge safety bug ✅. P1: build reliability ✅. P2: consistency ✅. P3: incrementality (2 remaining). P4: missing checks ✅. P5: cleanup ✅. **Осталось:** split monolithic build, conditional pnpm install.

---

## 🌐 Open Source

- [ ] **Open Source Improvements (20 items)** — [`OPEN-SOURCE-IMPROVEMENTS.md`](OPEN-SOURCE-IMPROVEMENTS.md)
  Phase 1 critical (5/5 ✅), Phase 2 important (5/7), Phase 3 polish (6/8). **Осталось:** GitHub Release v0.1.0, enforce_admins, "Built with AI" badge.

- [x] **Public Repo Sync Documentation** — [`PUBLIC-REPO-SYNC.md`](PUBLIC-REPO-SYNC.md)
  Two-repo model, sync process, exclusion list, security checklist. Reference doc — no action items.

---

## 📋 Reference Documents

- [x] **Design Decisions** — [`DESIGN-DECISIONS.md`](DESIGN-DECISIONS.md)
  Все принятые архитектурные решения: auth token flow, S3 audio public, rate limiting, Serverless v3, CORS fallback, log retention. Reference doc.

- [ ] **Backlog** — [`BACKLOG.md`](BACKLOG.md)
  Lambda Node.js 18→20 upgrade (HIGH). ECS private subnets (MEDIUM, deferred — $30/mo).

---

## 🎯 Запланированные аудиты (новые перспективы)

### 👤 Пользовательские роли

- [ ] **Ученик-новичок** — человек, который плохо знает эстонский язык и пришёл учиться. Понятен ли интерфейс? Есть ли onboarding? Можно ли пользоваться без инструкции? Ошибки пугают или помогают? Мотивирует ли платформа продолжать?

- [ ] **Учитель эстонского языка** — использует платформу для подготовки материалов, задаёт тексты ученикам, проверяет произношение. Удобно ли создавать задания? Можно ли шарить задачи ученикам? Есть ли bulk-операции? Экспорт для класса?

- [ ] **Продвинутый пользователь** — знает эстонский хорошо, использует для проверки произношения сложных слов, морфологический анализ. Power-user flow: горячие клавиши, быстрая навигация, batch-обработка.

- [ ] **Родитель ребёнка** — ребёнок учит эстонский в школе, родитель помогает. Безопасность контента, простота использования, отсутствие отвлекающих элементов, возможность контроля прогресса.

- [ ] **Пожилой пользователь** — пенсионер, переехавший в Эстонию. Крупный шрифт, контраст, простые инструкции, минимум технических действий, толерантность к ошибкам.

- [ ] **Мобильный пользователь** — использует только телефон. Responsive, touch-friendly, быстрая загрузка на 3G, offline-режим, удобство ввода текста на маленьком экране.

- [ ] **Пользователь с инвалидностью** — screen reader, keyboard-only, low vision, motor impairment. WCAG 2.1 AA compliance, focus management, ARIA, альтернативные способы взаимодействия.

### 🏛️ Государственные и институциональные роли

- [ ] **Чиновник Министерства образования** — оценивает платформу для включения в гос. программу. Соответствие стандартам, масштабируемость, стоимость, безопасность данных граждан, accessibility compliance, языковая политика.

- [ ] **GDPR/Privacy аудитор** — проверка на соответствие защите персональных данных. Cookie consent, data minimization, right to deletion, data processing agreements, третьи стороны (Sentry, Google Fonts, AWS), хранение PII.

- [ ] **Юридический аудит** — Terms of Service, Privacy Policy, лицензирование контента, open source compliance (MIT), ответственность за качество TTS-произношения, доступность для публичного сектора.

- [ ] **Аудитор информационной безопасности (ISKE/ISO 27001)** — эстонский стандарт ISKE для гос. систем. Классификация данных, управление доступом, журналирование, incident response, backup/restore.

### 🔧 Технические роли

- [ ] **Open Source контрибьютор** — первый раз видит проект. README понятен? Можно ли запустить локально за 15 минут? Contributing guide? Тесты проходят? Code style понятен? Issue templates?

- [ ] **Junior-разработчик** — только что пришёл в команду. Onboarding experience: структура проекта, документация, naming conventions, паттерны. Сколько времени до первого PR?

- [ ] **Senior архитектор** — оценивает масштабируемость, maintainability, tech debt. Правильные ли абстракции? Где bottlenecks при росте? Что сломается первым при 10x нагрузке?

- [ ] **Performance-инженер** — load testing, profiling, bundle size, Time to Interactive, Core Web Vitals, API latency p99, DynamoDB capacity planning, Lambda cold starts.

- [ ] **Злобный DevOps** — ищет слабые места в CI/CD, инфраструктуре, мониторинге. Что случится если Lambda упадёт? Если DynamoDB throttle? Если S3 недоступен? Disaster recovery? Rollback? Нет ли single points of failure?

- [ ] **Database архитектор** — схема DynamoDB, partition key design, access patterns, hot partitions, item size limits, GSI стратегия, миграции, backup/restore.

- [ ] **API consumer / Developer Experience** — разработчик, который хочет использовать HAK API. Документация? OpenAPI spec? SDK? Rate limits понятны? Error messages полезны? Backward compatibility?

### 🎭 Adversarial / Stress-testing

- [ ] **Пентестер / Red team** — активная попытка взлома. SQL injection, XSS, CSRF, IDOR, privilege escalation, API abuse, DDoS, supply chain attack через dependencies.

- [ ] **Абьюзер / Спамер** — пытается злоупотребить TTS для генерации контента в промышленных масштабах. Rate limit bypass, account farming, audio scraping, cost amplification.

- [ ] **Конкурентный аналитик** — сравнение с Keeleklikk, Speakly, Lingvist, Google Translate TTS. Что HAK делает лучше/хуже? Уникальные features? Positioning?

- [ ] **Troll / вредный пользователь** — вводит оскорбительный текст, пытается генерировать неприемлемый аудио-контент, шарит вредоносные задачи. Content moderation? Abuse reporting?

### 📐 Качество и контент

- [ ] **Лингвист / фонетик** — точность морфологического анализа, качество TTS произношения, обработка исключений (иностранные слова, аббревиатуры, числа, даты). Vabamorf coverage.

- [ ] **UX/UI дизайнер** — визуальный дизайн, consistency, spacing, typography, color system, interaction patterns, micro-animations, empty states, loading states, error states.

- [ ] **Контент-стратег / copywriter** — тон голоса, error messages, microcopy, onboarding тексты, empty states, помощь в интерфейсе. Всё на эстонском? Качество переводов?

- [ ] **SEO-специалист** — для hak-public: meta tags, structured data, sitemap, robots.txt, Open Graph, page speed, indexability. Для SPA: SSR/prerender?

- [ ] **Cost analyst / FinOps** — AWS billing breakdown. Что стоит дороже всего? Lambda vs Fargate. S3 storage growth. DynamoDB pricing. CloudFront transfer. Можно ли оптимизировать?

- [ ] **Disaster recovery / Business continuity** — что если AWS eu-west-1 упадёт? RTO/RPO? Backup strategy? Restore procedure? Runbook для инцидентов?

- [ ] **Monitoring / Observability** — достаточно ли метрик? Алерты настроены? Dashboards полезны? Можно ли быстро найти причину проблемы? Distributed tracing? Log aggregation?

### 💰 Финансы и закупки

- [ ] **Финансовый директор / CFO** — общая стоимость владения (TCO). Месячные расходы AWS, прогноз роста при масштабировании (100/1000/10000 пользователей). Лицензионные расходы (Serverless v4? Sentry? домен?). Стоимость человеко-часов на поддержку. ROI от open source. Сравнение cloud vs self-hosted.

- [ ] **Procurement / закупщик инфраструктуры** — если нужно мигрировать с AWS: on-premise requirements, минимальные серверные мощности, GPU для TTS (Merlin), storage для аудио, сетевые требования. Что если гос. организация требует размещение в Эстонии? Есть ли зависимость от конкретного облачного провайдера (vendor lock-in)?

- [ ] **Capacity planner** — текущие лимиты: Lambda concurrency, DynamoDB throughput, SQS message rate, ECS task count, S3 request rate. При каком числе пользователей каждый лимит станет проблемой? Есть ли bottleneck, который не масштабируется линейно?

- [ ] **Budget auditor** — отслеживание расходов: есть ли AWS Budget alerts? Cost anomaly detection? Tagging strategy для cost allocation? Reserved instances vs on-demand? Savings Plans? Может ли один пользователь случайно сгенерировать $1000 счёт?

---

## Сводка

| Аудит | Findings | Resolved | Open |
|-------|----------|----------|------|
| Security Audit (Feb 2026) | 29 | 27 | 2 deferred |
| Audit-hak-public | 83 | 81 | 2 |
| Audit14 + Action Plan | 100 | ~85 | ~15 |
| Code Review Backend & Infra (Luna) | 30 | 13 | 17 |
| Code Review Frontend (Luna) | 15 | 10 | 5 |
| Code Review All-except-Frontend (Luna) | 32 | 27 | 5 |
| Frontend Review (Eve, 120) | 120 | varies | varies |
| Frontend Audits (specialized) | 7 reports | varies | varies |
| Infrastructure Audit (Sam) | 16 | 14 | 2 deferred |
| CI/CD Improvements (Kate) | 18 | 16 | 2 |
| Open Source Improvements | 20 | 16 | 4 |
