export function simulatedRunOutput(testCase) {
  return [
    "case " + testCase.case_id + " wrote artifact bundle",
    "deterministic scorers completed",
    "baseline missing: presence_status=missing comparison_status=not_compared promotion_status=not_requested"
  ].join("\n");
}

export function scoreRuntime(testCase, execution) {
  const results = [];
  if (testCase.scorers.includes("exit-code")) {
    const passed = execution.exit_code === testCase.expected.exit_code;
    results.push({
      scorer_id: "exit-code",
      scorer_version: "1.0.0",
      status: passed ? "pass" : "fail",
      inputs_inspected: ["execution.exit_code", "expected.exit_code"],
      evidence: "actual=" + execution.exit_code + "; expected=" + testCase.expected.exit_code,
      failure_reason: passed ? null : "exit code did not match expected value"
    });
  }
  if (testCase.scorers.includes("required-output")) {
    const missing = testCase.expected.required_output_contains.filter((needle) => !execution.stdout.includes(needle));
    results.push({
      scorer_id: "required-output",
      scorer_version: "1.0.0",
      status: missing.length === 0 ? "pass" : "fail",
      inputs_inspected: ["execution.stdout", "expected.required_output_contains"],
      evidence: missing.length === 0 ? "all required output fragments found" : "missing: " + missing.join(", "),
      failure_reason: missing.length === 0 ? null : "required output fragment missing"
    });
  }
  return results;
}

export function scoreArtifactCompleteness(testCase, plannedArtifactNames) {
  if (!testCase.scorers.includes("artifact-completeness")) return [];
  const planned = new Set(plannedArtifactNames);
  const missing = testCase.expected.required_artifacts.filter((name) => !planned.has(name));
  return [{
    scorer_id: "artifact-completeness",
    scorer_version: "1.0.0",
    status: missing.length === 0 ? "pass" : "fail",
    inputs_inspected: ["expected.required_artifacts", "planned_final_artifact_set"],
    evidence: missing.length === 0 ? "all required artifact names are planned for the final bundle" : "missing from final plan: " + missing.join(", "),
    failure_reason: missing.length === 0 ? null : "required artifact missing from final artifact plan"
  }];
}

export function verdictFor(scorerResults) {
  return scorerResults.every((item) => item.status === "pass") ? "pass" : "fail";
}
