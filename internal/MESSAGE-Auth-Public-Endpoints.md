# Securing Public API Endpoints — Request for Client Discussion

**From:** Alex (Development Team Lead)
**To:** [Project Manager], [Architect]
**Date:** 2026-02-23
**Subject:** Proposal to add authentication to speech synthesis and morphological analysis endpoints

---

## The Problem

Our speech synthesis and morphological analysis API endpoints are currently open to the entire internet without any authentication. This creates a real and immediate vulnerability:

**Auto-scaling is disabled.** We cannot enable it because without knowing who is making requests, auto-scaling means competing with the entire internet using our project budget. A bot swarm would trigger scaling, and we would pay for it.

**Without auto-scaling, the system is trivially easy to overwhelm.** Two laptops running a simple curl script are enough to flood the request queue and make the service unavailable for real users. Normal users would see timeouts and errors while the queue processes attacker traffic.

We have protective measures in place — WAF rate limiting (20 requests per 5 minutes per IP for synthesis), geo-blocking (restricted to Baltic/Nordic countries), and a queue depth cap (503 when queue exceeds 50 messages). These slow down an attacker but do not stop them. An attacker with 10 proxy IPs in allowed countries can send 2,400 synthesis requests per hour. Our protections are damage limitation, not access control.

**The core issue:** we cannot distinguish a legitimate user from an attacker. Every defensive measure we add is a blunt instrument that also affects real users.

---

## The Solution

Hide all generative endpoints (`/synthesize`, `/status`, `/analyze`, `/variants`) behind authentication via the existing AWS Cognito infrastructure.

**This is not new development.** The authentication system is already fully built and operational:
- TARA login (Estonian eID: ID-card, Mobile-ID, Smart-ID) — working
- Google social login — working
- JWT tokens with automatic refresh — working
- API Gateway authorizer — working (already used by the data storage service)

The frontend already sends the authentication token with synthesis requests — the backend simply ignores it today.

---

## Impact on Users

**Minimal.** Users log in once — via TARA or Google — and the system remembers them. The session token refreshes automatically; a user may not need to log in again for months.

Teachers and students already log in to create and access lessons. Adding authentication to speech synthesis extends the existing model — it is not a new requirement for the user.

---

## What This Enables

Once we know who is making requests:

1. **We can enable auto-scaling.** Load from authenticated users is predictable and traceable. Scaling up during peak usage becomes safe — we are serving real users, not bots.

2. **We can set per-user rate limits.** API Gateway supports this natively with JWT identity. One user's heavy usage does not degrade service for others.

3. **System availability increases.** With auto-scaling enabled and per-user isolation, the system handles peak loads gracefully instead of returning 503 errors.

4. **Budget is protected.** Bot account creation requires a real Estonian eID or a real Google account — this is a fundamentally different class of attack than sending anonymous HTTP requests. The attack surface shrinks from "anyone with curl" to "someone with a verified identity."

5. **We can monitor and act.** Every request is attributed to a user. Abuse is detectable, and a specific user can be disabled without affecting anyone else.

**In short: adding authentication does not restrict the system — it makes it possible to run it reliably.**

---

## Request

I would like us to discuss this with the client. The technical proposal with full details, threat calculations, and implementation steps is prepared (see `PROPOSAL-Auth-Public-Endpoints.md`).

The scope of backend changes is small. The main question is the client's agreement to require login for speech synthesis functionality.

I believe this conversation should happen soon — the current configuration is a known vulnerability, and the longer we operate without authentication on these endpoints, the higher the risk of a service disruption or budget incident.

---

*Supporting document: `internal/PROPOSAL-Auth-Public-Endpoints.md` — full technical proposal with threat scenarios, cost calculations, implementation details, and checklist of alternative measures.*
