---
schema_version: 1
title: Evals Executable Spine Tracker Override
date: 2026-05-18
linear_status: override_approved
approved_by: Jamie
approved_at: "2026-05-18T20:23:36Z"
---

# Evals Executable Spine Tracker Override

This artifact records Jamie's explicit approval to close the phase-one evals
executable spine without a live Linear parent issue, because all recovery paths
available in this workspace remain blocked.

## Required Override Fields

~~~yaml
linear_status: override_approved
approved_by: Jamie
approved_at: "2026-05-18T20:23:36Z"
reason: "Linear issue creation remains unavailable after repeated connector retries, team/status lookup succeeds, the team-ID create variant still fails, local CLI/API credentials are unavailable, and the in-app browser route reaches a Linear login screen instead of an authenticated issue composer. Local executable-spine implementation is complete, validated, committed, and pushed; this override permits tracker-blocked closure without claiming a live Linear issue exists."
blocked_payload: ".harness/linear/2026-05-18-evals-executable-spine-linear-plan.md"
failed_tool: mcp__codex_apps__linear_save_issue
exact_error: unsupported call: mcp__codex_apps__linear_save_issue
recovery_condition: "create/link Linear parent issue before future PR closure or milestone closure when Linear issue creation becomes available"
scope_limit: "phase-one documentation/schema/runner/artifact evidence already delivered; no expansion work"
~~~

## Recovery Evidence

| Recovery path | Evidence | Result |
| --- | --- | --- |
| Linear search | No matching issue for "Build local eval runner and artifact contract" or "Evals Executable Spine" | no tracker found |
| Linear team lookup | JSC/Jscraik team resolves as 52ae4e68-6b65-418d-a8d6-c27b61b6ec92 | connector read path works |
| Linear status lookup | JSC statuses are readable, including Todo | connector read path works |
| Linear create by team name | mcp__codex_apps__linear_save_issue | unsupported call |
| Linear create by team UUID | mcp__codex_apps__linear_save_issue | unsupported call |
| Local CLI/API fallback | no linear command and no LINEAR* credential exposed | unavailable |
| Browser fallback | in-app browser reaches Linear login screen | unavailable without authenticated session |

## Delivery Evidence

| Evidence | Value |
| --- | --- |
| Repository | https://github.com/jscraik/evals |
| Pre-override pushed head | 642ba51 |
| Implementation commit | 8029517 |
| Latest smoke run | 20260518T195651Z-pr-closeout-f8d3bda9 |
| Closure eval | .harness/evals/evals-evals-executable-spine-eval.md |
| Completion audit | .harness/evals/evals-executable-spine-completion-audit.md |
| Linear retry log | .harness/linear/2026-05-18-evals-linear-retry.md |

## Scope Boundary

This override does not create a Linear issue and must not be represented as one.
It only satisfies the spec's exceptional tracker override path for the already
delivered phase-one local executable spine.

The recovery condition remains active for future milestone normalization: create
or link the Linear parent issue when issue creation becomes available.

