# JSC-370 Adversarial Review

## Findings (Severity Ordered)

### 1) Medium — Timing abuse: `check --json` can crash between smoke-case validation and context read, dropping structured proof output
- Evidence:
  - Trigger: one process runs `pnpm evals check --json` while another process edits/removes `fixtures/smoke/pr-closeout.case.json` in the same time window.
  - Step 1: `checkCommand` validates the smoke fixture once via `validateCaseFile(smokeCasePath)` ([src/commands/validation.js](/private/tmp/evals-jsc370/src/commands/validation.js:85)).
  - Step 2: it immediately performs a second independent read/parse with `readJson(absoluteSmokeCasePath)` to build `expectedContext` ([src/commands/validation.js](/private/tmp/evals-jsc370/src/commands/validation.js:86)) without try/catch.
  - Step 3: if the file changes after step 1 (deleted, truncated, malformed), `readJson` throws and the exception is not handled in `checkCommand`.
  - Failure outcome: command exits via uncaught exception instead of returning the normal validation JSON envelope, so downstream automation expecting stable `check --json` shape loses diagnosable proof context.
- Remediation:
  - Compute expected context from the already-validated parse result (single read path), or wrap the second read in guarded error handling that converts parse/read failures into normal validation errors with `status: failed`.
- Validation ownership:
  - introduced by current patch

### 2) Medium — Concurrent read/write race: latest pointer publication is non-atomic and can transiently produce invalid latest state
- Evidence:
  - Trigger: `run` publishes latest while `state`/`check` reads latest at the same time.
  - Step 1: publisher writes canonical latest directly with `writeJson(latestPath, latest)` ([src/commands/run.js](/private/tmp/evals-jsc370/src/commands/run.js:319)).
  - Step 2: `writeJson` uses `writeFileSync(path, JSON.stringify(...) + "\n")` in place ([src/lib/json.js](/private/tmp/evals-jsc370/src/lib/json.js:10)), which truncates and rewrites the target path rather than temp-file+rename publication.
  - Step 3: readers (`validateLatestRun` via `readJson`) may open the file during rewrite ([src/lib/latest-run.js](/private/tmp/evals-jsc370/src/lib/latest-run.js:39)).
  - Failure outcome: intermittent `latest_invalid`/parse failures in `state` or `check`, creating flaky false negatives in local or CI validation even though run artifacts are otherwise correct.
- Remediation:
  - Publish `latest.json` atomically (write temp file in same directory, fsync if needed, then rename), so readers see either the old complete pointer or the new complete pointer, never a partial write.
- Validation ownership:
  - pre-existing

## Residual Risks
- Run ID collision handling is tested for sequential same-process allocation, but no multi-process stress harness verifies contention behavior under concurrent CLI invocations.

## Testing Gaps
- No regression test simulates mutation/deletion of `fixtures/smoke/pr-closeout.case.json` between the two reads in `checkCommand`.
- No regression test exercises concurrent `run` publication and `check/state` reads to assert latest-pointer atomicity guarantees.

## Resolution

These findings were remediated in the JSC-370 slice:

- validateCaseFile now delegates to validateCaseFileContract, which returns the parsed case document used by checkCommand. The command no longer performs a second independent readJson call to derive expected proof context.
- latest.json publication now uses writeJsonAtomic, which writes a same-directory temporary file and renames it into place after run-local latest-candidate validation.
- Regression coverage includes the smoke-path expected-context flow, latest proof-context mismatch, run ID collision allocation, invalid latest-candidate non-publication, and artifact validation before shared latest publication.
- A follow-up review found an additional JSON-contract edge case where schema-failed or malformed latest validation could omit proof-context fields. That is now covered by tests for schema-invalid and malformed latest inputs.

WROTE: artifacts/reviews/jsc-370-adversarial-reviewer.md
