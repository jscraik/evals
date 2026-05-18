---
schema_version: 1
title: Evals Linear Retry Evidence
date: 2026-05-18
linear_status: linear_blocked
---

# Evals Linear Retry Evidence

## Attempt

### Retry 1

Tried to create the Linear parent issue from the spec payload:

- team: JSC
- title: Build local eval runner and artifact contract
- priority: 2
- state: Todo
- labels: Repo > evals, Eval, Reliability, Developer Experience, Roadmap: Now

The retry also planned child issues for:

- Compress evals documentation authority into README and AGENTS
- Define canonical eval schemas and smoke fixture contract
- Implement local eval runner and artifact bundle writer
- Add deterministic scorers, baseline comparator, and closure eval

## Result

Blocked.

Exact failure:

~~~text
unsupported call: mcp__codex_apps__linear_save_issue
~~~

### Retry 2

Fresh retry during the completion audit on 2026-05-18:

- searched Linear for "Build local eval runner and artifact contract" and
  "Evals Executable Spine";
- search returned no existing issue results;
- tried to create the parent issue with the same JSC team, Todo state, priority
  2, required labels, and source-artifact links.

Exact failure:

~~~text
unsupported call: mcp__codex_apps__linear_save_issue
~~~

### Retry 3

Fresh retry after git commit and push on 2026-05-18:

- searched Linear for "Build local eval runner and artifact contract";
- search returned no existing issue results;
- fetched the JSC/Jscraik team successfully;
- tried to create the parent issue with implementation evidence including
  commit '8029517', remote 'https://github.com/jscraik/evals', latest run
  '20260518T195651Z-pr-closeout-f8d3bda9', and the source spec/plan/reuse map.

Exact failure:

~~~text
unsupported call: mcp__codex_apps__linear_save_issue
~~~

### Retry 4

Final retry after confirming the repository was clean and pushed at
'c9c9aab' on 'origin/main':

- searched Linear for "Build local eval runner and artifact contract" or
  "Evals Executable Spine";
- search returned no existing issue results;
- fetched the JSC/Jscraik team successfully;
- checked for '.harness/linear/*override*.md' and found no override artifact;
- tried to create the parent issue with implementation commit '8029517',
  current pushed head 'c9c9aab', remote 'https://github.com/jscraik/evals',
  latest run '20260518T195651Z-pr-closeout-f8d3bda9', and the source
  spec/plan/reuse map.

Exact failure:

~~~text
unsupported call: mcp__codex_apps__linear_save_issue
~~~

## Status

'linear_status' remains 'linear_blocked'.

Local implementation may proceed only as tracker-blocked preparation. Do not
claim tracker-complete, PR-ready, or milestone-complete delivery until the
Linear parent issue exists or Jamie records the approved tracker override
required by the spec.
