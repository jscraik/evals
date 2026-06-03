export function stringifyAssertionValue(value) {
  if (value === undefined) {
    return "undefined";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch (_error) {
    return String(value);
  }
}

export function assertionLabel(assertion) {
  return `Given ${assertion.given}: should ${assertion.should}`;
}

export function buildAssertionResult({
  assertionId,
  given,
  should,
  actual,
  expected,
  status,
  evidenceRefs,
  reproduceCommand,
  diagnostic
}) {
  return {
    assertion_id: assertionId,
    given,
    should,
    actual: stringifyAssertionValue(actual),
    expected: stringifyAssertionValue(expected),
    status,
    evidence_refs: Array.isArray(evidenceRefs) && evidenceRefs.length > 0 ? evidenceRefs : ["deterministic-evals"],
    reproduce_command: reproduceCommand,
    diagnostic
  };
}

export function failedAssertionsFromScorerResults(scorerResults) {
  return scorerResults.flatMap((result) =>
    (result.assertions ?? []).filter((assertion) => assertion.status === "fail")
  );
}
