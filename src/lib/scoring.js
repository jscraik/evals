import { buildAssertionResult } from "./assertion-results.js";

function commandFor(context) {
  return context?.reproduceCommand || "pnpm evals run fixtures/smoke/pr-closeout.case.json --json";
}

function withAssertion(result, assertion) {
  return {
    ...result,
    assertions: [assertion]
  };
}

/**
 * Produce the simulated stdout output for a run of the given test case.
 * @param {Object} testCase - Test case object; only `case_id` is read to populate the first line.
 * @returns {string} A three-line string:
 *   1. `case <case_id> wrote artifact bundle`
 *   2. `deterministic scorers completed`
 *   3. `baseline missing: presence_status=missing comparison_status=not_compared promotion_status=not_requested`
 */
export function simulatedRunOutput(testCase) {
  return simulatedRunOutputLines(testCase).join("\n");
}

/**
 * Produce the individual simulated stdout log fragments for a run of the given test case.
 * @param {Object} testCase - Test case object; only `case_id` is read to populate the first line.
 * @returns {string[]} Ordered synthetic log fragments.
 */
export function simulatedRunOutputLines(testCase) {
  return [
    "case " + testCase.case_id + " wrote artifact bundle",
    "deterministic scorers completed",
    "baseline missing: presence_status=missing comparison_status=not_compared promotion_status=not_requested"
  ];
}

function parseJsonStdout(execution) {
  if (execution.output_format !== "json") return { ok: true, parsed: null };
  try {
    return { ok: true, parsed: JSON.parse(execution.stdout) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Generate scorer results for the runtime-related checks configured on a test case.
 *
 * @param {Object} testCase - Test case configuration. Must include `scorers` (array of enabled scorer ids) and `expected` (object that may contain `exit_code` and `required_output_contains`).
 * @param {Object} execution - Execution outcome to evaluate. Expected properties: `exit_code` (number) and `stdout` (string).
 * @returns {Array<Object>} An array of scorer result objects. Each object contains `scorer_id`, `scorer_version`, `status` (`"pass"` or `"fail"`), `inputs_inspected` (array of inspected input paths), `evidence` (summary of observed vs expected), and `failure_reason` (null when passing, otherwise a short message).
 */
export function scoreRuntime(testCase, execution, context = {}) {
  const results = [];
  if (testCase.scorers.includes("exit-code")) {
    const passed = execution.exit_code === testCase.expected.exit_code;
    const evidenceRefs = ["execution.exit_code", "expected.exit_code"];
    const evidence = "actual=" + execution.exit_code + "; expected=" + testCase.expected.exit_code;
    results.push(withAssertion({
        scorer_id: "exit-code",
        scorer_version: "1.0.0",
        status: passed ? "pass" : "fail",
        inputs_inspected: evidenceRefs,
        evidence,
        failure_reason: passed ? null : "exit code did not match expected value"
      },
      buildAssertionResult({
        assertionId: "exit-code.matches-expected",
        given: "synthetic execution exit code",
        should: "match expected exit code",
        actual: execution.exit_code,
        expected: testCase.expected.exit_code,
        status: passed ? "pass" : "fail",
        evidenceRefs,
        reproduceCommand: commandFor(context),
        diagnostic: passed ? evidence : "exit code did not match expected value; " + evidence
      })
    ));
  }
  if (testCase.scorers.includes("required-output")) {
    const jsonStdout = parseJsonStdout(execution);
    if (!jsonStdout.ok) {
      const evidenceRefs = ["execution.stdout", "execution.output_format", "expected.required_output_contains"];
      const evidence = "stdout declared output_format=json but JSON parse failed: " + jsonStdout.error;
      results.push(withAssertion({
          scorer_id: "required-output",
          scorer_version: "1.0.0",
          status: "fail",
          inputs_inspected: evidenceRefs,
          evidence,
          failure_reason: "required output stdout was not parseable JSON"
        },
        buildAssertionResult({
          assertionId: "required-output.contains-fragments",
          given: "declared JSON stdout",
          should: "parse and contain required output fragments",
          actual: "JSON parse failed: " + jsonStdout.error,
          expected: testCase.expected.required_output_contains,
          status: "fail",
          evidenceRefs,
          reproduceCommand: commandFor(context),
          diagnostic: evidence
        })
      ));
      return results;
    }
    const missing = testCase.expected.required_output_contains.filter((needle) => !execution.stdout.includes(needle));
    const evidenceRefs = execution.output_format === "json"
      ? ["execution.stdout", "execution.output_format", "expected.required_output_contains"]
      : ["execution.stdout", "expected.required_output_contains"];
    const evidence = missing.length === 0
      ? (execution.output_format === "json" ? "stdout parsed as JSON; all required output fragments found" : "all required output fragments found")
      : "missing: " + missing.join(", ");
    results.push(withAssertion({
        scorer_id: "required-output",
        scorer_version: "1.0.0",
        status: missing.length === 0 ? "pass" : "fail",
        inputs_inspected: evidenceRefs,
        evidence,
        failure_reason: missing.length === 0 ? null : "required output fragment missing"
      },
      buildAssertionResult({
        assertionId: "required-output.contains-fragments",
        given: "execution stdout",
        should: "contain every required output fragment",
        actual: missing.length === 0 ? "all fragments present" : { missing },
        expected: testCase.expected.required_output_contains,
        status: missing.length === 0 ? "pass" : "fail",
        evidenceRefs,
        reproduceCommand: commandFor(context),
        diagnostic: evidence
      })
    ));
  }
  return results;
}

/**
 * Produce an artifact-completeness scorer result when the test case enables that scorer.
 *
 * @param {Object} testCase - Test case object containing `scorers` and `expected.required_artifacts`.
 * @param {string[]} plannedArtifactNames - Names planned for the final artifact bundle.
 * @returns {Object[]} An empty array if the `artifact-completeness` scorer is not enabled; otherwise a single-element array with a scorer result object whose `status` is `pass` when every name in `expected.required_artifacts` is present in `plannedArtifactNames`, and `fail` otherwise. The result object includes `scorer_id`, `scorer_version`, `inputs_inspected`, `evidence`, and `failure_reason`.
 */
export function scoreArtifactCompleteness(testCase, plannedArtifactNames, context = {}) {
  if (!testCase.scorers.includes("artifact-completeness")) return [];
  const planned = new Set(plannedArtifactNames);
  const missing = testCase.expected.required_artifacts.filter((name) => !planned.has(name));
  const evidenceRefs = ["expected.required_artifacts", "planned_final_artifact_set"];
  const evidence = missing.length === 0 ? "all required artifact names are planned for the final bundle" : "missing from final plan: " + missing.join(", ");
  return [withAssertion({
    scorer_id: "artifact-completeness",
    scorer_version: "1.0.0",
    status: missing.length === 0 ? "pass" : "fail",
    inputs_inspected: evidenceRefs,
    evidence,
    failure_reason: missing.length === 0 ? null : "required artifact missing from final artifact plan"
  }, buildAssertionResult({
    assertionId: "artifact-completeness.required-artifacts-planned",
    given: "planned final artifact set",
    should: "include every required artifact name",
    actual: plannedArtifactNames,
    expected: testCase.expected.required_artifacts,
    status: missing.length === 0 ? "pass" : "fail",
    evidenceRefs,
    reproduceCommand: commandFor(context),
    diagnostic: evidence
  }))];
}

/**
 * Determine whether an observed baseline presence matches the test case's expected presence.
 * @param {Object} testCase - Test case object; expected to include `scorers` (array) and optionally `baseline.expected_presence` (string, default "missing").
 * @param {Object} baseline - Observed baseline result; expected to include `presence_status`, `comparison_evidence` and `artifact_path`.
 * @returns {Object[]} An array containing a single `baseline-presence` scorer result object when the scorer is enabled, or an empty array otherwise.
 */
export function scoreBaselinePresence(testCase, baseline, context = {}) {
  if (!testCase.scorers.includes("baseline-presence")) return [];
  const expected = testCase.baseline?.expected_presence || "missing";
  const passed = baseline.presence_status === expected && baseline.comparison_status !== "error";
  const evidenceRefs = ["baseline.presence_status", "testCase.baseline.expected_presence", "testCase.baseline.artifact_path", "baseline.comparison_status"];
  const evidence = "observed=" + baseline.presence_status + "; expected=" + expected + "; " + baseline.comparison_evidence;
  return [withAssertion({
    scorer_id: "baseline-presence",
    scorer_version: "1.0.0",
    status: passed ? "pass" : "fail",
    inputs_inspected: evidenceRefs,
    evidence,
    failure_reason: passed ? null : "observed baseline presence or comparison status did not match expected baseline contract"
  }, buildAssertionResult({
    assertionId: "baseline-presence.matches-contract",
    given: "baseline presence and comparison packet",
    should: "match expected presence without comparison error",
    actual: {
      presence_status: baseline.presence_status,
      comparison_status: baseline.comparison_status
    },
    expected: {
      presence_status: expected,
      comparison_status: "not error"
    },
    status: passed ? "pass" : "fail",
    evidenceRefs,
    reproduceCommand: commandFor(context),
    diagnostic: passed ? evidence : "baseline contract mismatch; " + evidence
  }))];
}

/**
 * Determine the overall verdict from a list of scorer results.
 *
 * If `scorerResults` is not a non-empty array the verdict is `"fail"`. Otherwise the verdict
 * is `"pass"` only when every element has `status === "pass"`, and `"fail"` if any element does not.
 * @param {Array<Object>} scorerResults - Array of scorer result objects, each expected to have a `status` property.
 * @returns {string} `"pass"` if every scorer result has `status === "pass"`, `"fail"` otherwise.
 */
export function verdictFor(scorerResults) {
  if (!Array.isArray(scorerResults) || scorerResults.length === 0) return "fail";
  return scorerResults.every((item) => item.status === "pass") ? "pass" : "fail";
}
