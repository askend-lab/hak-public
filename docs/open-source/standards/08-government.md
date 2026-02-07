# Government & Public Sector Standards

Standards specific to government software, EU regulations, and Estonian digital infrastructure.

## 1. GDPR — General Data Protection Regulation
- **Link**: https://gdpr-info.eu/
- **Scope**: EU data protection and privacy regulation
- **Key articles for HAK**:
  - Art. 5: Data minimization, purpose limitation, storage limitation
  - Art. 25: Data protection by design and by default
  - Art. 32: Security of processing (encryption, pseudonymization)
  - Art. 33-34: Breach notification (72h to DPA, without undue delay to data subjects)
  - Art. 35: Data Protection Impact Assessment (DPIA) for high-risk processing
- **HAK action**: Conduct DPIA, implement data minimization, document processing activities

## 2. eIDAS — EU Electronic Identification and Trust Services
- **Link**: https://digital-strategy.ec.europa.eu/en/policies/eidas-regulation
- **Scope**: EU framework for electronic identification and trust services
- **HAK relevance**: TARA (Estonian eID) authentication is eIDAS-compliant
- **HAK action**: Document eIDAS compliance through TARA/Cognito integration

## 3. EU Web Accessibility Directive (2016/2102)
- **Link**: https://eur-lex.europa.eu/eli/dir/2016/2102/oj
- **Scope**: Public sector websites and mobile apps must be accessible (EN 301 549 / WCAG 2.1 AA)
- **Deadline**: Already in effect for Estonian public sector
- **HAK action**: WCAG 2.1 AA compliance is **legally mandatory** for this project

## 4. Estonian Information System Authority (RIA) Requirements
- **Link**: https://www.ria.ee/en
- **ISKE**: Estonian Information Security Standard (based on German BSI IT-Grundschutz)
  - https://www.ria.ee/en/cyber-security/it-baseline-security-system-iske
- **Scope**: Security requirements for Estonian public sector information systems
- **HAK action**: Classify the system and apply ISKE requirements accordingly

## 5. Estonian Interoperability Framework — X-Road
- **Link**: https://x-road.global/
- **Scope**: Secure data exchange layer for Estonian e-government services
- **HAK relevance**: If HAK needs to integrate with other Estonian government systems, X-Road is the standard channel

## 6. TARA — Estonian Authentication Service
- **Link**: https://www.ria.ee/en/state-information-system/electronic-identity-eid-and-trust-services/central-authentication-service-tara
- **Scope**: Central authentication for Estonian e-services (ID-card, Mobile-ID, Smart-ID)
- **HAK status**: Integrated via AWS Cognito as OIDC provider
- **HAK action**: Verify TARA integration follows RIA's technical specification

## 7. EU Cyber Resilience Act (CRA)
- **Link**: https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act
- **Scope**: Cybersecurity requirements for products with digital elements (including open source)
- **Status**: Coming into force 2024-2027
- **HAK relevance**: As open source software used in government, CRA requirements will apply
- **Key requirements**: Vulnerability handling, security updates, SBOM, incident reporting

## 8. Public Money, Public Code — FSFE Campaign
- **Link**: https://publiccode.eu/
- **Scope**: Advocacy for publicly funded software to be Free Software
- **Principles**: Code paid by the people should be available to the people
- **HAK alignment**: This project directly embodies this principle

## 9. Standard for Public Code — Foundation for Public Code
- **Link**: https://standard.publiccode.net/
- **Scope**: Criteria for high-quality, collaborative, reusable public code
- **Criteria**: Code in the open, bundle policy and code, create reusable code, welcome contributions, maintain version control, require review, document decisions, use plain English, use open standards, use continuous integration, publish with an open license, make the codebase findable, use a coherent style, document codebase maturity
- **HAK action**: Audit against all 15 criteria; this is the **primary standard** for our use case
