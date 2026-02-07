# Cloud & Infrastructure Standards

Standards for cloud architecture, deployment, and operational excellence.

## 1. AWS Well-Architected Framework
- **Link**: https://aws.amazon.com/architecture/well-architected/
- **Pillars**:
  - **Operational Excellence**: Runbooks, observability, incremental changes
  - **Security**: IAM least privilege, encryption, detective controls
  - **Reliability**: Fault isolation, auto-scaling, disaster recovery
  - **Performance Efficiency**: Right-sizing, caching, serverless
  - **Cost Optimization**: Right-sizing, reserved capacity, waste elimination
  - **Sustainability**: Minimize environmental impact
- **HAK action**: Run AWS Well-Architected Tool review on the workload

## 2. AWS Serverless Lens
- **Link**: https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/
- **Scope**: Well-Architected guidance specific to serverless (Lambda, API Gateway, DynamoDB)
- **Directly applicable to HAK's architecture**
- **Key areas**: Event-driven design, state management, distributed tracing, cold starts

## 3. The Twelve-Factor App
- **Link**: https://12factor.net/
- **Factors applicable to HAK**:
  1. **Codebase**: One repo, many deploys ✓ (monorepo)
  2. **Dependencies**: Explicitly declared ✓ (package.json)
  3. **Config**: Store in environment ⚠️ (some hardcoded)
  4. **Backing services**: Treat as attached resources ✓ (DynamoDB, S3, SQS)
  5. **Build, release, run**: Strict separation ✓ (CI/CD)
  6. **Processes**: Stateless ✓ (Lambda)
  7. **Port binding**: Export via port ✓ (vabamorf HTTP)
  8. **Concurrency**: Scale via processes ✓ (Lambda auto-scale)
  9. **Disposability**: Fast startup, graceful shutdown ⚠️ (cold starts)
  10. **Dev/prod parity**: Keep environments similar ⚠️ (needs local dev)
  11. **Logs**: Treat as event streams ✓ (CloudWatch)
  12. **Admin processes**: Run as one-off tasks ⚠️ (no admin CLI)

## 4. CIS Benchmarks — Center for Internet Security
- **Link**: https://www.cisecurity.org/cis-benchmarks
- **AWS CIS Benchmark**: https://www.cisecurity.org/benchmark/amazon_web_services
- **Scope**: Security configuration best practices for AWS services
- **HAK action**: Run AWS Security Hub with CIS benchmark checks enabled

## 5. Terraform Best Practices
- **Link**: https://www.terraform-best-practices.com/
- **Additional**: https://developer.hashicorp.com/terraform/cloud-docs/recommended-practices
- **Key practices**: Module structure, state management, variable naming, resource tagging, plan before apply, remote state

## 6. Infrastructure as Code (IaC) Security — Checkov
- **Link**: https://www.checkov.io/
- **Scope**: Static analysis for Terraform, CloudFormation, Kubernetes
- **HAK action**: Add Checkov to CI for Terraform security scanning

## 7. Docker Best Practices
- **Link**: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- **Additional**: https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
- **Key practices**: Multi-stage builds, non-root user, minimal base image, .dockerignore, no secrets in images, health checks

## 8. OWASP Docker Security Cheat Sheet
- **Link**: https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
- **Key areas**: Image security, container runtime, network, logging, secrets management

## 9. GitOps Principles
- **Link**: https://opengitops.dev/
- **Principles**: Declarative, versioned, pulled automatically, continuously reconciled
- **HAK relevance**: Infrastructure defined in Terraform (declarative), versioned in git

## 10. Observability — OpenTelemetry
- **Link**: https://opentelemetry.io/
- **Scope**: Vendor-neutral observability framework (traces, metrics, logs)
- **HAK action**: Consider AWS X-Ray integration for distributed tracing across Lambda functions
