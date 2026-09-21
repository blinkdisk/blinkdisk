# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for BlinkDisk: Session Replay, Error Tracking, and Support are enabled; health, error, and support responders are active; and a focused scout troop plus two Replay Vision monitors are armed. Findings will begin appearing in the [Self-driving inbox](https://eu.posthog.com/project/64598/inbox) within about 30 minutes as scouts and scanner observations run.

## AI data processing

Approved by the setup gate.

## GitHub

GitHub was already connected before this setup. No GitHub Issues responder was enabled because it was not selected in the connected-tools step.

## Products enabled

| Product | Result | Client configuration check |
|---|---|---|
| Session Replay | Already enabled | The web and desktop `posthog-js` providers do not disable session recording. |
| Error Tracking | Enabled | The web and desktop `posthog-js` providers have `capture_exceptions: true`. |
| Support (Conversations) | Enabled | An inbound channel is still required before support tickets can arrive. |

## Signal sources

| Signal source | Action | Notes |
|---|---|---|
| `health_checks` / `health_issue` | Enabled | Monitors PostHog instrumentation and setup health. |
| `error_tracking` / `issue_created` | Enabled | Watches newly created error issues. |
| `error_tracking` / `issue_reopened` | Enabled | Watches reopened error issues. |
| `error_tracking` / `issue_spiking` | Enabled | Watches error-volume spikes. |
| `conversations` / `ticket` | Enabled | Dormant until an inbound Support channel is connected. |
| `signals_scout` / `cross_source_issue` | Skipped | On by default; no opt-out row was present. |
| `session_replay` / `session_analysis_cluster` | Skipped | Retired route; replay coverage comes from the Replay Vision scanners below. |
| `replay_vision` | Skipped | Scanner `emits_signals: true` is the source authorization. |

## Connected tools

| Tool | Outcome |
|---|---|
| Sentry | Not used in this setup; it was offered first because the repository contains Sentry dependencies, but it was not selected. |
| GitHub Issues | Not used for Self-driving responders; the GitHub App was already connected, but GitHub Issues was not selected. |
| Linear, Jira, Zendesk | Not used; none was selected. |

## Scout troop

The verified budget is **100 runs/day**, with **0 runs used** and **100 remaining** at setup time. The early-access banner says: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

### Active scouts (6)

| Scout | What it watches |
|---|---|
| General | Cross-product correlations and otherwise-uncovered product surfaces. |
| Product analytics | Saved funnels, retention, lifecycle, stickiness, and path regressions. |
| Feature flags | Flag evaluation changes, response shifts, and flag debt. |
| Surveys | Survey score, response-volume, abandonment, targeting, and feedback-theme changes. |
| Revenue analytics | Revenue configuration and goal-risk signals; BlinkDisk uses Polar for subscriptions. |
| Backup setup continuity | Custom scout for the BlinkDisk vault-to-source setup path; described below. |

### Disabled scouts

The remaining 22 built-in scouts are disabled to keep the troop selective. Error Tracking is covered by its native responder and Session Replay is covered by Replay Vision, so their scouts remain disabled to avoid duplicate findings. The other disabled specialists cover surfaces not evidenced as actively used in this project (AI observability, APM, Conversations analytics, CSP, customer analytics, data pipelines/warehouse, experiments, logs, web analytics/vitals, and related operational surfaces); they can be enabled later from the inbox if those surfaces become relevant. Inbox validation was also disabled because this is a fresh Self-driving setup with no resolved reports to validate yet.

## Custom scouts

### Created: `signals-scout-backup-setup-continuity`

- **Surface:** BlinkDisk’s core backup setup path, based on `useCreateVault` and `useCreateSource` in `apps/desktop/src/hooks/mutations/`.
- **What it watches:** aggregate vault-creation volume, source-add volume, and their completion relationship.
- **Discriminator:** a sustained completed-day volume cliff, or a sustained fall in source additions relative to vault creations while setup entry volume is stable. It excludes partial days, low-volume cohorts, isolated one-day changes, and existing deduplicated reports.
- **Why it is separate:** the built-in product-analytics scout focuses on saved-flow conversion regressions while entrants hold; this scout also detects the otherwise-uncovered failure mode where setup demand itself drops or a provider-specific activation path degrades.
- **Privacy/noise posture:** it uses aggregate data only and explicitly avoids vault names, paths, account identifiers, and person properties.

The CloudBlink upgrade surface and backup/restore actions were considered but not given separate scouts: the repository does not show a sufficiently complete, distinct success/failure event pair for a high-confidence monitor. If this scout becomes noisy, set its config `emit` to `false` in PostHog to leave it running in dry-run mode.

## Replay Vision scanners

A Replay Vision scanner is an LLM that watches individual session recordings on a schedule and pushes verified visual breakage observations into the inbox. It is the only component of this setup that spends Replay Vision quota. Scanner findings arrive at half weight and require corroboration before becoming an inbox report.

The organization had 2,500 credits remaining when configured; both monitors are enabled and emit signals.

| Scanner | Status | Watches | Query scope | Sampling | Estimated monthly spend |
|---|---|---|---|---:|---:|
| Backup setup breakage | Created | Visible vault creation, storage-provider connection, source-add, backup-start, and stale-list failures. | Desktop application routes whose current URL contains `/#/`; this is the router namespace containing account, vault, source, and backup setup/completion screens. | 0.5 | 129 observations / 645 credits |
| Backup setup frustration | Created | Rage-click-driven struggle while configuring storage, creating vaults or sources, starting backups, or beginning restores. | `$rageclick` only, with no URL filter, preserving independence from the breakage monitor. | 1.0 | 43 observations / 215 credits |

The monitors were created after confirming existing session recordings and an empty scanner inventory. Their combined current estimate is 860 credits/month; their first observations can be rated in Replay Vision to generate configuration recommendations.

## Follow-ups

- [ ] Connect an inbound Support/Conversations channel (email, inbox, or Slack) in PostHog so the enabled ticket responder can receive support tickets.
- [ ] Review early scanner observations in Replay Vision and rate useful or noisy results; ratings create recommendations you can review for each scanner.
- [ ] Enable additional disabled scouts only when their underlying product surface becomes active, to preserve the focused troop and run budget.

## What happens next

Fresh scout configurations are picked up by the coordinator within about 30 minutes and draw from the verified 100-runs-per-day budget. Replay Vision monitors begin scanning matching recordings on their schedule. Self-driving clusters corroborated findings into reports in the [inbox](https://eu.posthog.com/project/64598/inbox), where immediately actionable reports can start coding tasks.

## Files modified or created

- Created `posthog-self-driving-report.md`.
- No application source files were modified.
