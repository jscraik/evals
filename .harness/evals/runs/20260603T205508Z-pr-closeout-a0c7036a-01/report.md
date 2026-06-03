# Evals Smoke Run

| Field | Value |
| --- | --- |
| Run ID | 20260603T205508Z-pr-closeout-a0c7036a-01 |
| Execution mode | synthetic |
| Case ID | pr-closeout |
| Suite ID | smoke |
| Status | passed |
| Deterministic verdict | pass |
| Baseline presence_status | missing |
| Baseline comparison_status | not_compared |
| Baseline promotion_status | not_requested |

## Output

~~~text
{
  "case_id": "pr-closeout",
  "suite_id": "smoke",
  "execution_mode": "synthetic",
  "artifact_root": ".harness/evals/runs/20260603T205508Z-pr-closeout-a0c7036a-01",
  "logs": [
    "case pr-closeout wrote artifact bundle",
    "deterministic scorers completed",
    "baseline missing: presence_status=missing comparison_status=not_compared promotion_status=not_requested"
  ]
}
~~~

## Deterministic Assertions

| Status | Assertion | Actual | Expected | Evidence |
| --- | --- | --- | --- | --- |
| pass | Given synthetic execution exit code: should match expected exit code | 0 | 0 | execution.exit_code, expected.exit_code |
| pass | Given execution stdout: should contain every required output fragment | all fragments present | ["artifact bundle","deterministic scorers","baseline missing"] | execution.stdout, execution.output_format, expected.required_output_contains |
| pass | Given planned final artifact set: should include every required artifact name | ["result.json","report.md","command-log.json","manifest.json","scorer-results.json","baseline-result.json","trace-events.jsonl"] | ["result.json","report.md","command-log.json","manifest.json","scorer-results.json","baseline-result.json"] | expected.required_artifacts, planned_final_artifact_set |
| pass | Given baseline presence and comparison packet: should match expected presence without comparison error | {"presence_status":"missing","comparison_status":"not_compared"} | {"presence_status":"missing","comparison_status":"not error"} | baseline.presence_status, testCase.baseline.expected_presence, testCase.baseline.artifact_path, baseline.comparison_status |

## Artifacts

- .harness/evals/runs/20260603T205508Z-pr-closeout-a0c7036a-01/result.json
- .harness/evals/runs/20260603T205508Z-pr-closeout-a0c7036a-01/report.md
- .harness/evals/runs/20260603T205508Z-pr-closeout-a0c7036a-01/command-log.json
- .harness/evals/runs/20260603T205508Z-pr-closeout-a0c7036a-01/manifest.json
- .harness/evals/runs/20260603T205508Z-pr-closeout-a0c7036a-01/scorer-results.json
- .harness/evals/runs/20260603T205508Z-pr-closeout-a0c7036a-01/baseline-result.json
- .harness/evals/runs/20260603T205508Z-pr-closeout-a0c7036a-01/trace-events.jsonl

## Judge Policy

No LLM judge output participates in pass, fail, block, promote, or closure decisions for this smoke run.
