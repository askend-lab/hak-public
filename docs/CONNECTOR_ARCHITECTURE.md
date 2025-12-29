# Connector Architecture for Gherkin Testing

## Overview

Three main connectors abstract backend services for Gherkin acceptance tests. Each connector is swappable between real implementation and test mock.

## Connectors

### 1. AudioConnector

**Purpose:** Handles all audio synthesis operations

**Interface:**
```typescript
interface AudioConnector {
  synthesize(text: string, voiceModel?: VoiceModel): Promise<Blob>;
}
```

**Internals (hidden from Gherkin):**
- S3 cache check/storage
- Lambda synthesis calls
- Polling for audio completion
- Cache hit/miss logic

**Mock behavior:**
- Returns test WAV blob immediately
- Tracks calls for verification

### 2. VabamorfConnector

**Purpose:** Handles phonetic analysis and pronunciation variants

**Interface:**
```typescript
interface VabamorfConnector {
  analyze(text: string): Promise<VabamorfResponse>;
  getVariants(word: string): Promise<PhoneticVariant[]>;
}
```

**Internals (hidden from Gherkin):**
- API calls to Vabamorf service
- Response parsing

**Mock behavior:**
- Returns predefined phonetic text with markers
- Returns specific variants when requested

### 3. AuthConnector

**Purpose:** Handles user authentication

**Interface:**
```typescript
interface AuthConnector {
  login(userId: string): Promise<User>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
}
```

**Internals (hidden from Gherkin):**
- Cognito integration
- Session management

**Mock behavior:**
- Returns test user object
- Tracks auth state

## Gherkin Usage

Given steps configure mock responses:
```gherkin
Given AudioConnector returns WAV for "tere"
Given VabamorfConnector returns "te`re" for "tere"
Given user "alice@test.com" is logged in
```

Then steps verify connector was called:
```gherkin
Then AudioConnector was called with "te`re"
Then VabamorfConnector was called with "tere"
```

## Implementation Location

- Connectors: `packages/frontend/src/services/connectors/`
- Mocks: `packages/frontend/src/features/steps-ts/mocks/`
