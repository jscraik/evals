export function buildReport({ runId, testCase, status, deterministicVerdict, baseline, execution, paths }) {
  return "# Evals Smoke Run\n\n" +
    "| Field | Value |\n| --- | --- |\n" +
    "| Run ID | " + runId + " |\n" +
    "| Case ID | " + testCase.case_id + " |\n" +
    "| Suite ID | " + testCase.suite_id + " |\n" +
    "| Status | " + status + " |\n" +
    "| Deterministic verdict | " + deterministicVerdict + " |\n" +
    "| Baseline presence_status | " + baseline.presence_status + " |\n" +
    "| Baseline comparison_status | " + baseline.comparison_status + " |\n" +
    "| Baseline promotion_status | " + baseline.promotion_status + " |\n\n" +
    "## Output\n\n~~~text\n" + execution.stdout + "\n~~~\n\n" +
    "## Artifacts\n\n" +
    paths.map((path) => "- " + path).join("\n") + "\n\n" +
    "## Judge Policy\n\nNo LLM judge output participates in pass, fail, block, promote, or closure decisions for this smoke run.\n";
}
