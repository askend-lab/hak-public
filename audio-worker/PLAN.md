# Audio Worker - TDD Implementation Plan

## Overview
Fargate worker that reads from SQS, calls Merlin TTS, and uploads MP3 to S3.

## Setup
- [x] Create package.json with dependencies
- [x] Create tsconfig.json
- [x] Create Jest configuration
- [ ] Install dependencies

## Feature 1: SQS Message Polling
- [ ] **Test 1.1:** Poll receives message from queue
- [ ] **Impl 1.1:** Implement SQS receiveMessage
- [ ] **Test 1.2:** Parse message body (text, hash)
- [ ] **Impl 1.2:** Parse JSON message
- [ ] **Test 1.3:** Delete message after processing
- [ ] **Impl 1.3:** Implement deleteMessage

## Feature 2: TTS Generation (Merlin)
- [ ] **Test 2.1:** Call Merlin API with text
- [ ] **Impl 2.1:** HTTP POST to Merlin endpoint
- [ ] **Test 2.2:** Handle base64 audio response
- [ ] **Impl 2.2:** Decode base64 to buffer
- [ ] **Test 2.3:** Handle Merlin errors gracefully
- [ ] **Impl 2.3:** Error handling and retry

## Feature 3: S3 Upload
- [ ] **Test 3.1:** Upload audio buffer to S3
- [ ] **Impl 3.1:** Implement S3 putObject
- [ ] **Test 3.2:** Use correct key format (cache/{hash}.mp3)
- [ ] **Impl 3.2:** Generate S3 key from hash
- [ ] **Test 3.3:** Set correct content type
- [ ] **Impl 3.3:** Set Content-Type: audio/mpeg

## Feature 4: Worker Loop
- [ ] **Test 4.1:** Process messages in loop
- [ ] **Impl 4.1:** Implement polling loop
- [ ] **Test 4.2:** Handle empty queue (long polling)
- [ ] **Impl 4.2:** Use WaitTimeSeconds
- [ ] **Test 4.3:** Graceful shutdown
- [ ] **Impl 4.3:** Handle SIGTERM

## Feature 5: Integration
- [ ] **Test 5.1:** End-to-end flow test
- [ ] **Impl 5.1:** Integration test with mocks
