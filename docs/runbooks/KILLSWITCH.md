# Account Kill-Switch Runbook (`aws-budget-killswitch`)

HAK and the other account services (`465168436856`, `eu-west-1`) are protected by the two-tier Stateless AWS Kill-Switch managed in `askend-lab/infra` (`terraform/killswitch.tf`, `terraform/budget.tf`, `lambdas/killswitch/index.py`, `.github/workflows/killswitch.yml`).

## When this fires

The `aws-budget-killswitch` Lambda automatically triggers `kill` when either:
1. **Fast metric trigger (< 5 minutes):** Regional CloudWatch Alarm `aws-budget-killswitch-lambda-invocations` exceeds `20,000` Lambda invocations in 5 minutes across `eu-west-1`.
2. **Budget ceiling:** Monthly AWS Budget `account-monthly-budget` reaches `100% ACTUAL` spend.

When triggered, `kill` immediately:
- Sets `ReservedConcurrentExecutions = 0` on all application Lambdas (`merlin-api-*`, `vabamorf-api-*`, `simplestore-*`, `tara-auth-*`, `wieiswie-dev-api`, `trello-mcp`) so API invocations return `429` at `$0` cost.
- Sets API Gateway v2 and v1 stages to `ThrottlingRateLimit = 0.0 / ThrottlingBurstLimit = 0`.
- Suspends ECS `merlin-worker` auto-scaling and sets `desiredCount = 0` on `hak-merlin-dev` and `hak-merlin-prod`.
- Stops running EC2/RDS instances.
- Emails an admin summary to `aleksei.bljahhin@gmail.com`.

`devbox-hub-*-dev` Lambdas and `aws-budget-killswitch` itself are intentionally **not** killed so DevBox Hub communication and the restore path remain available.

## How to restore service (`restore`)

Run the GitHub Actions workflow in `askend-lab/infra` with `action=restore`:

```bash
gh workflow run killswitch.yml --repo askend-lab/infra -f action=restore
```

Or invoke the Lambda directly:

```bash
aws --region eu-west-1 lambda invoke \
  --function-name aws-budget-killswitch \
  --cli-binary-format raw-in-base64-out \
  --payload '{"action":"restore"}' /tmp/restore-out.json && cat /tmp/restore-out.json
```

`restore` removes the `ReservedConcurrentExecutions = 0` limits (returning Lambdas to the unreserved pool), restores API Gateway throttling to `25 rps / 50 burst`, unsuspends ECS scaling, and resumes normal service in ~1 second.

## Manual emergency actions (`kill` / `drill`)

- **Manual kill:** `gh workflow run killswitch.yml --repo askend-lab/infra -f action=kill`
- **Controlled live drill:** `gh workflow run killswitch.yml --repo askend-lab/infra -f action=drill` (creates a temporary `$1` budget, fires the killswitch, verifies `0` concurrency/throttling/ECS suspension, then auto-restores in `finally`).

See `askend-lab/infra/terraform/README.md` → "Stateless AWS Kill-Switch (`aws-budget-killswitch`)" for full architecture details.
