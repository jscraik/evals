/**
 * Constructs a Markdown report for an Evals smoke run.
 *
 * The report includes a table of identifying and baseline fields, an "Output"
 * section containing `execution.stdout` in a fenced `text` block, an "Artifacts"
 * bullet list generated from `paths`, and a fixed "Judge Policy" disclaimer.
 *
 * @param {Object} params - Parameters for report generation.
 * @param {string} params.runId - Identifier for the run.
 * @param {Object} params.testCase - Test case metadata.
 * @param {string} params.testCase.case_id - Test case identifier.
 * @param {string} params.testCase.suite_id - Test suite identifier.
 * @param {string} params.status - Run status.
 * @param {string} params.deterministicVerdict - Deterministic verdict for the run.
 * @param {Object} params.baseline - Baseline result metadata.
 * @param {string} params.baseline.presence_status - Baseline presence status.
 * @param {string} params.baseline.comparison_status - Baseline comparison status.
 * @param {string} params.baseline.promotion_status - Baseline promotion status.
 * @param {Object} params.execution - Execution output data.
 * @param {string} params.execution.execution_mode - Execution mode recorded for provenance.
 * @param {string} params.execution.stdout - Execution standard output to include in the report.
 * @param {string[]} params.paths - Array of artifact file paths to list under "Artifacts".
 * @returns {string} A Markdown-formatted report string containing the run table, output block, artifacts list and judge policy.
 */
export function buildReport({ runId, testCase, status, deterministicVerdict, baseline, execution, paths }) {
  return "# Evals Smoke Run\n\n" +
    "| Field | Value |\n| --- | --- |\n" +
    "| Run ID | " + runId + " |\n" +
    "| Execution mode | " + execution.execution_mode + " |\n" +
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
