# Software Safety & Reliability Standards

Standards from aerospace, automotive, and critical systems — the gold standard for code quality.

## 1. NASA JPL — The Power of Ten Rules
- **Link**: https://spinroot.com/gerard/pdf/P10.pdf
- **Scope**: 10 rules for safety-critical C code, applicable principles for any language
- **Key rules applicable to HAK**:
  - No complex flow constructs (goto, setjmp, recursion)
  - All loops must have fixed upper bounds
  - No dynamic memory allocation after initialization
  - Functions must be no longer than 60 lines (printable page)
  - Minimum two assertions per function
  - Data objects declared at smallest possible scope
  - All return values must be checked
  - Preprocessor use limited to includes and simple macros
  - Pointer use restricted (max 1 level of dereferencing)
  - All code compiled with all warnings enabled, zero warnings policy

## 2. NASA Software Engineering Requirements — NPR 7150.2
- **Link**: https://nodis3.gsfc.nasa.gov/displayDir.cfm?t=NPR&c=7150&s=2D
- **Scope**: Full lifecycle software engineering for NASA missions
- **Key requirements**: Code reviews, static analysis, test coverage >80%, traceability, CM

## 3. DO-178C — Software Considerations in Airborne Systems
- **Link**: https://www.rtca.org/products/do-178c/
- **Scope**: Aviation software certification (Level A = most critical)
- **Key concepts**: MC/DC coverage, requirements traceability, verification independence
- **Applicable to HAK**: Requirement traceability (Gherkin specs → tests → code)

## 4. IEC 61508 — Functional Safety of E/E/PE Systems
- **Link**: https://www.iec.ch/functional-safety
- **Scope**: Safety integrity levels (SIL 1-4) for industrial systems
- **Applicable**: Defensive programming, fault detection, systematic capability

## 5. MISRA C/C++ — Motor Industry Software Reliability Association
- **Link**: https://misra.org.uk/
- **Scope**: Coding guidelines for automotive safety-critical systems
- **TypeScript equivalents**: No implicit coercion, no `any`, strict null checks, explicit types

## 6. ISO/IEC 25010 — Software Quality Model (SQuaRE)
- **Link**: https://www.iso.org/standard/35733.html
- **Scope**: Defines 8 quality characteristics
- **Characteristics**: Functional suitability, Performance efficiency, Compatibility, Usability, Reliability, Security, Maintainability, Portability
- **Use**: Framework for evaluating HAK's overall quality

## 7. ISO/IEC 12207 — Software Life Cycle Processes
- **Link**: https://www.iso.org/standard/63712.html
- **Scope**: International standard for software lifecycle processes
- **Key processes**: Development, maintenance, operation, configuration management

## 8. SWEBOK — Software Engineering Body of Knowledge
- **Link**: https://www.computer.org/education/bodies-of-knowledge/software-engineering
- **Scope**: IEEE guide to the software engineering body of knowledge
- **Coverage**: Requirements, design, construction, testing, maintenance, configuration, management

## 9. SEI CMMI — Capability Maturity Model Integration
- **Link**: https://cmmiinstitute.com/
- **Scope**: Process improvement framework for software development
- **Levels**: Initial → Managed → Defined → Quantitatively Managed → Optimizing

## 10. ISO/IEC 15408 — Common Criteria for IT Security Evaluation
- **Link**: https://www.commoncriteriaportal.org/
- **Scope**: Framework for evaluating security properties of IT products
- **Applicable**: Security Target definition, Protection Profile

## 11. IEC 62443 — Industrial Automation and Control Systems Security
- **Link**: https://www.iec.ch/cyber-security
- **Scope**: Cybersecurity for industrial systems
- **Applicable**: Defense in depth, security zones, conduits

## 12. ECSS-E-ST-40C — European Space Agency Software Standard
- **Link**: https://ecss.nl/standard/ecss-e-st-40c-rev-1-software-general-requirements/
- **Scope**: ESA software engineering standards
- **Key aspects**: V&V processes, code reviews, traceability, anomaly management
