# Audio API Lambda - TDD Implementation Plan

## Setup

- [x] **Setup 1:** Create package.json with dependencies (AWS SDK, Jest, TypeScript)
- [x] **Setup 2:** Create tsconfig.json
- [x] **Setup 3:** Create Jest configuration
- [x] **Setup 4:** Create test utilities (mock S3, mock SQS)

## Feature 1: Hash Calculation

- [x] **Test 1.1:** Test hash calculation for simple text input
- [x] **Impl 1.1:** Implement hash calculation function (SHA-256)

- [x] **Test 1.2:** Test hash calculation returns consistent results for same input
- [x] **Impl 1.2:** Ensure hash function is deterministic

- [x] **Test 1.3:** Test hash calculation throws error on empty input
- [x] **Impl 1.3:** Add input validation to hash function

## Feature 2: S3 Cache Check

- [x] **Test 2.1:** Test S3 check returns true when file exists
- [x] **Impl 2.1:** Implement S3 file existence check using headObject

- [x] **Test 2.2:** Test S3 check returns false when file does not exist
- [x] **Impl 2.2:** Handle 404 NotFound error from S3

- [x] **Test 2.3:** Test S3 check handles connection errors gracefully
- [x] **Impl 2.3:** Add error handling and retry logic for S3

## Feature 3: SQS Message Publishing

- [x] **Test 3.1:** Test SQS message is sent with correct payload
- [x] **Impl 3.1:** Implement SQS sendMessage with text and hash

- [x] **Test 3.2:** Test SQS message includes all required fields (text, hash, timestamp)
- [x] **Impl 3.2:** Create proper message structure

- [x] **Test 3.3:** Test SQS handles publish errors
- [x] **Impl 3.3:** Add error handling for SQS operations

## Feature 4: Lambda Handler - Cache Hit Path

- [x] **Test 4.1:** Test handler returns URL when file exists in S3
- [x] **Impl 4.1:** Implement cache hit response path

- [x] **Test 4.2:** Test response includes status "ready" and correct URL format
- [x] **Impl 4.2:** Format URL correctly using bucket name and hash

- [x] **Test 4.3:** Test handler does NOT send SQS message on cache hit
- [x] **Impl 4.3:** Ensure SQS is only called when needed

## Feature 5: Lambda Handler - Cache Miss Path

- [x] **Test 5.1:** Test handler sends SQS message when file not in S3
- [x] **Impl 5.1:** Implement cache miss path with SQS call

- [x] **Test 5.2:** Test response includes status "processing" and hash
- [x] **Impl 5.2:** Return correct response format for processing state

- [x] **Test 5.3:** Test handler returns hash for frontend polling
- [x] **Impl 5.3:** Include hash in response

## Feature 6: Input Validation

- [x] **Test 6.1:** Test handler rejects empty text
- [x] **Impl 6.1:** Add validation for text field

- [x] **Test 6.2:** Test handler rejects missing text field
- [x] **Impl 6.2:** Validate request body structure

- [x] **Test 6.3:** Test handler rejects text longer than max length (e.g., 1000 chars)
- [x] **Impl 6.3:** Add max length validation

## Feature 7: Environment Configuration

- [x] **Test 7.1:** Test config correctly computes S3 bucket name from environment
- [x] **Impl 7.1:** Implement service discovery for S3 bucket

- [x] **Test 7.2:** Test config correctly computes SQS queue URL from environment
- [x] **Impl 7.2:** Implement service discovery for SQS queue

- [x] **Test 7.3:** Test config throws error when environment is missing
- [x] **Impl 7.3:** Add environment validation on startup

## Feature 8: Integration & Error Handling

- [x] **Test 8.1:** Test full workflow end-to-end (cache miss scenario) - COVERED BY EXISTING TESTS
- [x] **Impl 8.1:** Verify all components work together

- [x] **Test 8.2:** Test full workflow end-to-end (cache hit scenario) - COVERED BY EXISTING TESTS
- [x] **Impl 8.2:** Verify cache hit path works correctly

- [x] **Test 8.3:** Test handler returns 400 on validation errors - IMPLEMENTED
- [x] **Impl 8.3:** Add global error handler

- [x] **Test 8.4:** CORS will be configured in API Gateway (infrastructure level)
- [x] **Impl 8.4:** Not needed in Lambda code

## Coverage Check

- [x] **Final:** Run coverage report and ensure >80% coverage - **97.72% achieved!**
- [x] **Final:** Fix any uncovered branches - All branches covered (100%)

## Total: ~40 steps (20 tests + 20 implementations)
