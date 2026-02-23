# Auth for public endpoints — message to team

Hey guys,

I want to bring up something we need to discuss with the client.

Right now our speech synthesis and morphology endpoints are completely open — no auth, anyone on the internet can hit them. And here's the catch: **we can't turn on auto-scaling** in this setup. If we do, we're basically competing with every bot on the internet using our project budget. That's not a fight we win.

So auto-scaling is off. Which means the system is really easy to overwhelm — two laptops and a curl script is literally all it takes to fill the queue and make the service unavailable for real users.

We do have WAF rate limits, geo-blocking, queue caps — but those are all just speed bumps. They slow an attacker down, they don't stop them. And the fundamental problem is: **we can't tell a real user from an attacker.** Every limit we set also hits legitimate users.

**The fix is simple:** put all the generative endpoints behind login.

The good news — everything is already built:
- TARA and Google login — working
- JWT tokens with auto-refresh — working
- API Gateway authorizer — already used by SimpleStore
- The frontend already sends the auth token for synthesis — the backend just ignores it

Impact on users is minimal. They log in once via TARA or Google, and the session can last months with auto-refresh. Teachers and students already log in to work with lessons — this just extends the same model.

**What this gives us:**
- We can **safely turn on auto-scaling** — because we know the load is from real users
- We can set **per-user rate limits** natively in API Gateway — one user's heavy usage doesn't affect others
- System **availability actually goes up** — we handle peak loads instead of returning errors
- Budget is protected — creating a bot account requires a real eID or real Google account, that's a completely different class of attack than anonymous curl
- Full monitoring — every request tied to a user, can disable specific abusers

**In short: auth doesn't restrict the system, it lets us actually run it properly.**

Can we set up a call with the client to discuss this? I have a full technical proposal ready with threat scenarios, cost numbers, and implementation steps if needed.

I think this should happen soon — the longer we run without auth on these endpoints, the higher the risk of someone flooding the service or burning through the budget.

Alex

---

*Full technical details: `internal/PROPOSAL-Auth-Public-Endpoints.md`*
