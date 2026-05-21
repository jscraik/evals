import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { rel, repoRelativePath } from "./paths.js";
import { schemaCheckFromObject } from "./schema.js";

export const requiredTraceEventTypes = [
  "run_started",
  "command_result",
  "scorer_result",
  "baseline_result",
  "artifact_manifest",
  "validation_result",
  "run_finished"
];

const artifactBearingTraceEventTypes = new Set(requiredTraceEventTypes.filter((eventType) => eventType !== "run_started"));

/**
 * Build the canonical local trace timeline for a completed eval run.
 * @param {object} input - Trace construction input.
 * @returns {object[]} Ordered trace event objects.
 */
export function buildTraceEvents(input) {
  const {
    runId,
    caseId,
    startedAt,
    finishedAt,
    execution,
    deterministicVerdict,
    status,
    baseline,
    paths,
    validationStatus,
    validationErrors
  } = input;
  const occurredAt = new Date().toISOString();
  const validationDetail = validationErrors.length === 0
    ? "Latest run artifact validation passed."
    : "Latest run artifact validation failed: " + validationErrors.join("; ");
  const definitions = [
    {
      event_type: "run_started",
      occurred_at: startedAt.toISOString(),
      status: "started",
      artifact_path: null,
      exit_code: null,
      detail: "Started eval run in " + execution.execution_mode + " mode."
    },
    {
      event_type: "command_result",
      occurred_at: execution.finished_at,
      status: execution.exit_code === 0 ? "passed" : "failed",
      artifact_path: paths.commandLogPath,
      exit_code: execution.exit_code,
      detail: "Command completed: " + execution.command
    },
    {
      event_type: "scorer_result",
      occurred_at: occurredAt,
      status: deterministicVerdict,
      artifact_path: paths.scorerResultsPath,
      exit_code: null,
      detail: "Deterministic scorer verdict: " + deterministicVerdict + "."
    },
    {
      event_type: "baseline_result",
      occurred_at: occurredAt,
      status: baseline.presence_status,
      artifact_path: paths.baselineResultPath,
      exit_code: null,
      detail: "Baseline comparison status: " + baseline.comparison_status + "."
    },
    {
      event_type: "artifact_manifest",
      occurred_at: occurredAt,
      status: "written",
      artifact_path: paths.manifestPath,
      exit_code: null,
      detail: "Artifact manifest written for local proof bundle."
    },
    {
      event_type: "validation_result",
      occurred_at: occurredAt,
      status: validationStatus,
      artifact_path: paths.latestPath,
      exit_code: null,
      detail: validationDetail
    },
    {
      event_type: "run_finished",
      occurred_at: finishedAt.toISOString(),
      status,
      artifact_path: paths.resultPath,
      exit_code: execution.exit_code,
      detail: "Finished eval run with deterministic verdict: " + deterministicVerdict + "."
    }
  ];

  return definitions.map((event, index) => ({
    schema_version: 1,
    run_id: runId,
    case_id: caseId,
    sequence: index + 1,
    ...event
  }));
}

/**
 * Write trace events as newline-delimited JSON.
 * @param {string} path - Destination trace-events.jsonl path.
 * @param {object[]} events - Ordered trace event objects.
 */
export function writeTraceEvents(path, events) {
  const lines = events.map((event) => JSON.stringify(event));
  writeFileSync(path, lines.join("\n") + "\n", "utf8");
}

/**
 * Validate a trace-events JSONL file and its lifecycle invariants.
 * @param {string} tracePath - Absolute path to trace-events.jsonl.
 * @param {{runId: string, caseId: string}} expected - Expected run and case identifiers.
 * @returns {{label: string, schema_path: string, data_path: string, status: "pass"|"fail", errors: string[]}}
 */
export function validateTraceEventsFile(tracePath, expected) {
  const errors = [];
  const dataPath = rel(tracePath);
  if (!existsSync(tracePath)) {
    return traceCheck(dataPath, ["trace events file is missing: " + dataPath]);
  }

  const events = [];
  const lines = readFileSync(tracePath, "utf8").split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) errors.push("trace events file must contain at least one event");

  for (const [index, line] of lines.entries()) {
    let event;
    try {
      event = JSON.parse(line);
    } catch (error) {
      errors.push("line " + (index + 1) + ": JSON parse failed: " + error.message);
      continue;
    }
    events.push(event);
    const check = schemaCheckFromObject("traceEvent", event, dataPath + ":" + (index + 1));
    errors.push(...check.errors.map((item) => "line " + (index + 1) + " " + item));
  }

  errors.push(...traceInvariantErrors(events, expected));
  return traceCheck(dataPath, errors);
}

function traceCheck(dataPath, errors) {
  return {
    label: "trace events",
    schema_path: "schemas/trace-event.schema.json",
    data_path: dataPath,
    status: errors.length === 0 ? "pass" : "fail",
    errors
  };
}

function traceInvariantErrors(events, expected) {
  const errors = [];
  const eventTypes = events.map((event) => event?.event_type);
  for (const [index, requiredType] of requiredTraceEventTypes.entries()) {
    if (eventTypes[index] !== requiredType) {
      errors.push("trace event " + (index + 1) + ": expected " + requiredType + ", got " + (eventTypes[index] || "missing"));
    }
  }
  if (events.length !== requiredTraceEventTypes.length) {
    errors.push("trace events: expected " + requiredTraceEventTypes.length + " events, got " + events.length);
  }

  for (const [index, event] of events.entries()) {
    if (!event || typeof event !== "object") continue;
    const expectedSequence = index + 1;
    if (event.sequence !== expectedSequence) errors.push("trace event " + expectedSequence + ": expected sequence " + expectedSequence + ", got " + event.sequence);
    if (event.run_id !== expected.runId) errors.push("trace event " + expectedSequence + ": expected run_id " + expected.runId + ", got " + event.run_id);
    if (event.case_id !== expected.caseId) errors.push("trace event " + expectedSequence + ": expected case_id " + expected.caseId + ", got " + event.case_id);
    if (artifactBearingTraceEventTypes.has(event.event_type) || event.artifact_path) {
      const pathErrors = [];
      repoRelativePath(event.artifact_path, "trace event " + expectedSequence + " artifact_path", pathErrors);
      errors.push(...pathErrors);
    }
  }

  const validationEvent = events.find((event) => event?.event_type === "validation_result");
  if (validationEvent && validationEvent.status !== "passed") {
    errors.push("trace validation_result status: expected passed, got " + validationEvent.status);
  }

  return errors;
}
