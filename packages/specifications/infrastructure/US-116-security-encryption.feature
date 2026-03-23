@ready
Feature: Security — Encryption and Supply Chain (US-116)

  Data protection, TLS enforcement, cookie security,
  and supply chain integrity for the HAK platform.

  Scenario: 1.1 S3 buckets block public access
    Given the S3 bucket configurations in Terraform
    When public access settings are inspected
    Then the website bucket has public access blocked
    And CloudFront uses Origin Access Control for S3

  Scenario: 1.2 All data in transit uses TLS
    Given the CloudFront and API Gateway configurations
    When TLS policies are inspected
    Then CloudFront enforces HTTPS for all connections
    And API Gateway endpoints use HTTPS only

  Scenario: 1.3 Auth cookies use secure attributes
    Given the TARA authentication flow sets cookies
    When cookie attributes are inspected
    Then cookies use Secure, HttpOnly, and SameSite=Lax

  Scenario: 1.4 Dependencies use lockfile integrity
    Given the pnpm-lock.yaml file
    When package integrity is verified
    Then all packages have integrity hashes
    And pnpm install --frozen-lockfile succeeds in CI

  Scenario: 1.5 Container images are scanned
    Given Docker images for vabamorf-api and Merlin worker
    When images are scanned with Trivy in CI
    Then zero critical vulnerabilities are found
