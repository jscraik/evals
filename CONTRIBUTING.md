# Contributing

This repository is in its phase-one executable-spine stage. Keep contributions
focused on the local runner, schemas, fixtures, artifact evidence, and
documentation that proves those surfaces work.

## Start Here

Before changing code or docs, read:

1. 'AGENTS.md'
2. '.harness/core/2026-05-18-evals-core.md'
3. 'UBIQUITOUS_LANGUAGE.md'
4. the specific schema, fixture, runner, or artifact file being changed

Load the full spec, plan, and local reuse map only when the task touches their
scope. 'AGENTS.md' defines that routing.

## Scope

Good phase-one changes:

- tighten the local CLI behavior;
- clarify canonical schemas;
- improve the synthetic smoke fixture;
- improve artifact validation or manifest hash proof;
- clarify closure evidence and tracker state;
- improve docs that help an agent or human run and verify the spine.

Out of scope until a later ADR or spec opens the next phase:

- dashboards or hosted run viewers;
- external adapters;
- cloud runners or hosted service dependencies;
- telemetry exporters as authority;
- plugin systems;
- source-mining automation;
- required LLM judge gates;
- runtime dependencies on 'coding-harness' or 'agent-skills'.

Sibling repos may be cited as prior art, but they must not become hidden
lifecycle authority or phase-one runtime dependencies.

## Commands

Run all deterministic verification (the CI gate command):

~~~bash
pnpm verify
~~~

Run regression tests:

~~~bash
pnpm test
~~~

Run the smoke eval:

~~~bash
pnpm evals run fixtures/smoke/pr-closeout.case.json --json
~~~

Validate the latest artifact bundle and canonical smoke fixture:

~~~bash
pnpm evals check --json
~~~

Validate one fixture:

~~~bash
pnpm evals validate fixtures/smoke/pr-closeout.case.json --json
~~~

Validate the latest run pointer:

~~~bash
pnpm evals validate .harness/evals/runs/latest.json --json
~~~

Use the lightweight privacy check before treating fixture or eval artifacts as
safe to share:

~~~bash
credential_pattern='sk-[A-Za-z0-9_-]{20,}|(api[_-]?key|token|secret|password)\s*[:=]\s*["'"'"']?[A-Za-z0-9_./+=-]{16,}|-{5}BEGIN (RSA|OPENSSH|PRIVATE) KEY-{5}'
rg -n -o --replace "credential-like pattern redacted" "$credential_pattern" fixtures schemas src scripts test tests .harness/evals .harness/research .harness/specs .harness/plan .harness/plans .harness/linear
~~~

This regex is a phase-one aid, not a complete secret scanner. It intentionally
looks for credential-shaped values rather than standalone prose words, and it
redacts matches in command output.

## Artifact Policy

Generated run artifacts live under '.harness/evals/runs/'. Keep committed
artifact bundles only when they are part of cited proof or closure evidence.

'.harness/evals/runs/latest.json' is the current pointer for validation. If a
new run changes it, validate the run before committing the pointer.

## License

By submitting a contribution, you agree that your contribution is licensed under
the Apache License, Version 2.0. Do not submit code, fixtures, schemas,
documentation, or generated artifacts that you do not have the right to
contribute under that license.

## PR Expectations

Before asking for review, include:

- the command surface changed, if any;
- validation commands and pass/fail outcomes;
- whether any generated artifact bundle was added or updated;
- whether the Linear tracker override remains accurate;
- any scope pressure toward dashboards, adapters, cloud execution, telemetry,
  plugin systems, source mining, or judge gates.

Do not claim a live Linear issue exists unless it has actually been created or
linked.
