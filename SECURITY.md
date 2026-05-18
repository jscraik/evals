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
rg -n "sk-|api[_-]?key|token|secret|password|BEGIN (RSA|OPENSSH|PRIVATE) KEY" fixtures .harness/evals
~~~

No output means the lightweight phase-one credential pattern check found no
matches. This check is not a full secret scanner and does not replace human
review.

## Dependency And Runtime Boundary

The phase-one runner must not depend at runtime on sibling repos such as
'coding-harness' or 'agent-skills'. Those repositories may be referenced as
prior art only.

Do not add network access, cloud execution, telemetry exporters, plugin systems,
or required LLM judge gates without a later ADR or spec that opens that scope.
