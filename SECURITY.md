# Security

## Supported Scope

This repository currently contains an offline local eval runner, JSON schemas,
synthetic fixtures, and local artifact evidence. It does not run a hosted
service, expose a network endpoint, or require cloud credentials for the
phase-one smoke command.

## Reporting

Report security issues through GitHub private vulnerability reporting if it is
available for this repository. If it is not available, contact the repository
owner directly and avoid posting exploit details in public issues or pull
requests.

## Data Handling

Phase-one fixtures must be synthetic. Do not add private transcripts, private
issue or PR content, credentials, tokens, customer data, or unredacted secrets to
fixtures or generated artifact bundles.

Generated artifacts are local proof, not telemetry. They must not be uploaded to
a hosted service or treated as external reporting authority unless a later ADR or
spec explicitly adds that behavior.

## Required Local Check

Before sharing or committing fixture/eval artifacts, run:

~~~bash
credential_pattern='sk-[A-Za-z0-9_-]{20,}|(api[_-]?key|token|secret|password)\s*[:=]\s*["'"'"']?[A-Za-z0-9_./+=-]{16,}|-{5}BEGIN (RSA|OPENSSH|PRIVATE) KEY-{5}'
rg -n -o --replace "credential-like pattern redacted" "$credential_pattern" fixtures schemas src scripts test tests .harness/evals .harness/research .harness/specs .harness/plan .harness/linear
~~~

No output means the lightweight phase-one credential pattern check found no
matches. This check looks for credential-shaped values instead of standalone
prose words, redacts matched values, and is not a full secret scanner or a
replacement for human review.

## Dependency And Runtime Boundary

The phase-one runner must not depend at runtime on sibling repos such as
'coding-harness' or 'agent-skills'. Those repositories may be referenced as
prior art only.

Do not add network access, cloud execution, telemetry exporters, plugin systems,
or required LLM judge gates without a later ADR or spec that opens that scope.
