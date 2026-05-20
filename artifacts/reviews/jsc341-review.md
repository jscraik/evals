# JSC-341 Review Disposition

Date: 2026-05-20
Branch: jscraik/jsc-341-evals-closure-latest-consistency

## Scope

Review of the closure/latest consistency patch for the eval artifact bundle
trust boundary.

## Findings And Disposition

Reviewer provenance: Architecture, Simplicity, and Testing are AI-assisted
development review aspects recorded during implementation; Codex Review and
CodeRabbit rows are automated PR review systems on PR #8. Evidence sources are
the changed runtime files, generated artifact bundle, validation commands, and
GitHub review comments.

| Review Aspect / Source | Finding | Disposition |
| --- | --- | --- |
| Architecture | Expected artifact paths were reconstructed independently in the validator and could drift from the run producer. | Fixed by adding `src/lib/artifact-bundle.js` and routing both `src/commands/run.js` and `src/lib/latest-run.js` through the same artifact layout contract. |
| Simplicity | Repeated filtered contract iteration and implicit duplicate artifact behavior increased ambiguity. | Fixed by exporting pre-split manifest/result-ref contracts and making duplicate artifact types fail explicitly. |
| Testing | Metadata drift, result artifact-ref hash drift, and baseline command-log linkage drift were not covered. | Fixed by adding focused seam tests in `test/cli.test.js`. |
| Codex Review | Baseline consistency assumed every baseline ref was a command-log ref, which would reject valid present-baseline artifacts. | Fixed by validating `baseline.current_artifact_ref` by declared type: command-log refs must match latest command-log evidence; baseline-artifact refs must be repo-relative, present, and SHA-matched. |
| Codex Review | Latest/manifest/result artifact path comparisons were separator-sensitive and could false-fail on Windows-style paths. | Fixed by normalizing artifact path separators before consistency comparisons. |
| CodeRabbit | Review disposition provenance was ambiguous because the table used `Reviewer` for review dimensions and automated systems without identifying source type. | Fixed by adding this provenance note and renaming the table header to `Review Aspect / Source`. |
| CodeRabbit | Baseline-artifact SHA validation had a happy-path seam but no negative tamper seam. | Fixed by adding `latest validation rejects baseline-artifact hash drift`, which mutates a present baseline after run and requires `closure latest consistency` to fail closed. |

## Validation

| Command | Outcome |
| --- | --- |
| `pnpm test` | pass, 62 tests |
| `pnpm evals check --json` | pass, includes `closure latest consistency` |
| `pnpm verify` | pass, refreshed latest proof at `.harness/evals/runs/20260520T213437Z-pr-closeout-4df36134/` |
| `git diff --check` | pass |
| `node -e "const fs=require('fs'); const s=fs.readFileSync('.harness/implementation-notes/2026-05-20-evals-trust-boundary-notes.html','utf8'); if(!s.includes('JSC-341')) process.exit(1); console.log('implementation notes parse/read: pass')"` | pass |

## Residual Risk

`src/lib/latest-run.js` now owns several proof-bundle invariants. That is
acceptable for this slice because `latest.json` validation is the existing
public trust boundary, but future additions should consider extracting a
dedicated latest-bundle consistency module if this grows again.
