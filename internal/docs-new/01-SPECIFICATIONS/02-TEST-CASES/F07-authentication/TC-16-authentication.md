# TC-16: Authentication Flow

**User Story:** US-22, US-23, US-24  
**Feature:** F07 Authentication  
**Priority:** Critical  
**Type:** Functional

## Description

Verify login, profile display, and logout functionality.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Not logged in (clear localStorage if needed)

## Test Data

| Field | Valid | Invalid |
|-------|-------|---------|
| Isikukood | `39901010011` | `12345678901` |

## Test Steps

### Login Flow

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Verify header | "Logi sisse" button visible | ☐ |
| 2 | Click "Logi sisse" | Login modal opens | ☐ |
| 3 | Verify modal | Tabs for Smart-ID/Mobiil-ID/ID-kaart | ☐ |
| 4 | Enter valid isikukood: `39901010011` | Value in input | ☐ |
| 5 | Click "Sisene" | Modal closes | ☐ |
| 6 | Verify header | Profile with name appears | ☐ |
| 7 | Verify "Logi sisse" button | No longer visible | ☐ |

### Invalid Isikukood

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open login modal | Modal visible | ☐ |
| 2 | Enter invalid: `12345678901` | Value in input | ☐ |
| 3 | Click "Sisene" | Error message appears | ☐ |
| 4 | Verify error | Error text visible | ☐ |
| 5 | Modal remains open | Can retry | ☐ |

### Session Persistence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Login successfully | Profile visible | ☐ |
| 2 | Refresh page (F5) | Page reloads | ☐ |
| 3 | Verify profile | Still logged in | ☐ |
| 4 | Check localStorage | User data present under 'eki_user' | ☐ |

### View Profile

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | While logged in, click profile area | Dropdown opens | ☐ |
| 2 | Verify content | Name and masked isikukood | ☐ |
| 3 | Verify logout option | "Logi välja" visible | ☐ |

### Logout

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click profile dropdown | Dropdown opens | ☐ |
| 2 | Click "Logi välja" | Dropdown closes | ☐ |
| 3 | Verify header | "Logi sisse" button returns | ☐ |
| 4 | Check localStorage | 'eki_user' removed | ☐ |

### Logout While on Tasks View

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Login and navigate to Tasks | Tasks view visible | ☐ |
| 2 | Logout | Logged out | ☐ |
| 3 | Verify navigation | Redirected to Synthesis view | ☐ |

### Protected Route Access

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Logout | Not authenticated | ☐ |
| 2 | Click "Ülesanded" in nav | Login modal appears | ☐ |
| 3 | Login successfully | Redirects to Tasks view | ☐ |

## Notes

- Current implementation uses mock user database
- Real eID integration pending for production
- All three auth tabs (Smart-ID/Mobiil-ID/ID-kaart) use same flow currently
