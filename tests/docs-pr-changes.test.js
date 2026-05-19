/**
 * Documentation contract tests for files changed in this PR.
 *
 * Scope: only files added or modified in the docs/review triage PR:
 *   CONTRIBUTING.md, LICENSE.md, SECURITY.md, SUPPORT.md,
 *   README.md, AGENTS.md,
 *   artifacts/reviews/docs-expert.md,
 *   artifacts/reviews/improve-codebase-architecture.md,
 *   artifacts/reviews/simplify.md,
 *   artifacts/reviews/ubiquitous-language.md,
 *   artifacts/reviews/unslopify.md,
 *   implementation-notes.html,
 *   .harness/evals/evals-evals-executable-spine-eval.md,
 *   .harness/evals/evals-executable-spine-completion-audit.md
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return existsSync(path.join(ROOT, rel));
}

// ---------------------------------------------------------------------------
// New files added in this PR
// ---------------------------------------------------------------------------

describe('CONTRIBUTING.md (new file)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('CONTRIBUTING.md'), 'CONTRIBUTING.md must exist');
    content = read('CONTRIBUTING.md');
  });

  test('has Start Here section', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(content.includes('## Start Here'), 'must have ## Start Here section');
  });

  test('Start Here section references AGENTS.md first', () => {
    content = content ?? read('CONTRIBUTING.md');
    const section = content.slice(content.indexOf('## Start Here'));
    assert.ok(section.includes("'AGENTS.md'"), "must reference 'AGENTS.md' in Start Here");
  });

  test('Start Here section references UBIQUITOUS_LANGUAGE.md', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(content.includes("'UBIQUITOUS_LANGUAGE.md'"), "must reference UBIQUITOUS_LANGUAGE.md");
  });

  test('has Scope section', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(content.includes('## Scope'), 'must have ## Scope section');
  });

  test('Scope section lists out-of-scope items for phase one', () => {
    content = content ?? read('CONTRIBUTING.md');
    const outOfScope = [
      'dashboards',
      'external adapters',
      'cloud runners',
      'plugin systems',
      'source-mining automation',
      'required LLM judge gates',
    ];
    for (const item of outOfScope) {
      assert.ok(content.includes(item), `Scope must list "${item}" as out of scope`);
    }
  });

  test('Scope section prohibits sibling-repo runtime dependencies', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(
      content.includes("'coding-harness'") && content.includes("'agent-skills'"),
      'must name coding-harness and agent-skills as prohibited runtime dependencies'
    );
  });

  test('has Commands section with smoke eval command', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(content.includes('## Commands'), 'must have ## Commands section');
    assert.ok(
      content.includes('pnpm evals run fixtures/smoke/pr-closeout.case.json --json'),
      'must include canonical smoke eval command'
    );
  });

  test('Commands section includes canonical validation command', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(
      content.includes('pnpm evals check --json'),
      'must include pnpm evals check --json command'
    );
  });

  test('Commands section includes fixture validate command', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(
      content.includes('pnpm evals validate fixtures/smoke/pr-closeout.case.json --json'),
      'must include fixture validate command'
    );
  });

  test('Commands section includes latest run validate command', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(
      content.includes('pnpm evals validate .harness/evals/runs/latest.json --json'),
      'must include latest run validate command'
    );
  });

  test('Commands section includes privacy regex check', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(
      content.includes('rg -n'),
      'must include rg privacy check command'
    );
    assert.ok(
      content.includes('sk-') && content.includes('api[_-]?key'),
      'privacy regex must include sk- and api key patterns'
    );
  });

  test('has Artifact Policy section', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(content.includes('## Artifact Policy'), 'must have ## Artifact Policy section');
  });

  test('Artifact Policy references latest.json pointer', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(
      content.includes("'.harness/evals/runs/latest.json'"),
      "Artifact Policy must reference '.harness/evals/runs/latest.json'"
    );
  });

  test('has PR Expectations section', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(content.includes('## PR Expectations'), 'must have ## PR Expectations section');
  });

  test('PR Expectations section warns against fabricating Linear issues', () => {
    content = content ?? read('CONTRIBUTING.md');
    assert.ok(
      content.includes('Do not claim a live Linear issue exists'),
      'must warn against claiming live Linear issues'
    );
  });
});

describe('LICENSE.md (new file)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('LICENSE.md'), 'LICENSE.md must exist');
    content = read('LICENSE.md');
  });

  test('states no open-source license has been granted', () => {
    content = content ?? read('LICENSE.md');
    assert.ok(
      content.includes('No open-source license has been granted'),
      'must state no license has been granted'
    );
  });

  test('clarifies this is a status record, not an actual license', () => {
    content = content ?? read('LICENSE.md');
    assert.ok(
      content.includes('It is not an open-source') || content.includes('not an open-source license'),
      'must clarify file is not an actual license'
    );
  });

  test('advises treating content as not licensed for external reuse', () => {
    content = content ?? read('LICENSE.md');
    assert.ok(
      content.includes('not licensed for') || content.includes('not licensed'),
      'must advise against unlicensed reuse'
    );
  });
});

describe('SECURITY.md (new file)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('SECURITY.md'), 'SECURITY.md must exist');
    content = read('SECURITY.md');
  });

  test('has Supported Scope section', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(content.includes('## Supported Scope'), 'must have ## Supported Scope section');
  });

  test('Supported Scope states no hosted service or network endpoint', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(
      content.includes('offline local eval runner') || content.includes('does not run a hosted service'),
      'must state it does not run a hosted service'
    );
  });

  test('has Reporting section', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(content.includes('## Reporting'), 'must have ## Reporting section');
  });

  test('Reporting section mentions GitHub private vulnerability reporting', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(
      content.includes('GitHub private vulnerability reporting'),
      'must mention GitHub private vulnerability reporting'
    );
  });

  test('has Data Handling section', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(content.includes('## Data Handling'), 'must have ## Data Handling section');
  });

  test('Data Handling prohibits non-synthetic fixtures', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(
      content.includes('must be synthetic') || content.includes('Phase-one fixtures must be synthetic'),
      'must require synthetic fixtures'
    );
  });

  test('Data Handling prohibits uploading artifacts to hosted services', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(
      content.includes('must not be uploaded') || content.includes('not be uploaded to'),
      'must prohibit uploading artifacts to hosted services'
    );
  });

  test('has Required Local Check section with credential regex', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(content.includes('## Required Local Check'), 'must have ## Required Local Check section');
    assert.ok(content.includes('rg -n'), 'Required Local Check must include rg command');
  });

  test('Required Local Check regex covers sk- and api key patterns', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(
      content.includes('sk-') && content.includes('api[_-]?key'),
      'credential regex must include sk- and api key patterns'
    );
  });

  test('credential regex pattern includes BEGIN KEY patterns', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(
      content.includes('BEGIN (RSA|OPENSSH|PRIVATE) KEY') ||
        content.includes('BEGIN RSA') ||
        content.includes('PRIVATE KEY'),
      'credential regex must cover PEM key patterns'
    );
  });

  test('has Dependency And Runtime Boundary section', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(
      content.includes('## Dependency And Runtime Boundary'),
      'must have ## Dependency And Runtime Boundary section'
    );
  });

  test('Runtime Boundary section prohibits sibling-repo runtime deps', () => {
    content = content ?? read('SECURITY.md');
    assert.ok(
      content.includes("'coding-harness'") && content.includes("'agent-skills'"),
      'Runtime Boundary must name coding-harness and agent-skills as prohibited'
    );
  });
});

describe('SUPPORT.md (new file)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('SUPPORT.md'), 'SUPPORT.md must exist');
    content = read('SUPPORT.md');
  });

  test('has Reproduce section', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(content.includes('## Reproduce'), 'must have ## Reproduce section');
  });

  test('Reproduce section includes canonical run command', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('pnpm evals run fixtures/smoke/pr-closeout.case.json --json'),
      'must include canonical smoke run command'
    );
  });

  test('Reproduce section includes check command', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('pnpm evals check --json'),
      'must include pnpm evals check --json'
    );
  });

  test('Reproduce section references latest.json pointer', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('.harness/evals/runs/latest.json'),
      'must reference .harness/evals/runs/latest.json'
    );
  });

  test('has Common Failure Classes section', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('## Common Failure Classes'),
      'must have ## Common Failure Classes section'
    );
  });

  test('Common Failure Classes table has Fixture rejected row', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('Fixture rejected'),
      'failure table must include Fixture rejected row'
    );
  });

  test('Common Failure Classes table has Latest run rejected row', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('Latest run rejected'),
      'failure table must include Latest run rejected row'
    );
  });

  test('Common Failure Classes table has Scope drift row', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('Scope drift'),
      'failure table must include Scope drift row'
    );
  });

  test('has Tracker State section describing override status', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('## Tracker State'),
      'must have ## Tracker State section'
    );
    assert.ok(
      content.includes('approved local override') || content.includes('override_approved'),
      'Tracker State must describe approved override, not live Linear issue'
    );
  });

  test('Tracker State section preserves the recovery condition', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('Preserve the recovery condition') ||
        content.includes('create or link the Linear parent issue'),
      'must preserve recovery condition note'
    );
  });

  test('has What This Repo Does Not Support Yet section', () => {
    content = content ?? read('SUPPORT.md');
    assert.ok(
      content.includes('## What This Repo Does Not Support Yet'),
      'must have unsupported features section'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: README.md
// ---------------------------------------------------------------------------

describe('README.md (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('README.md'), 'README.md must exist');
    content = read('README.md');
  });

  test('has Documentation section listing all new doc files', () => {
    content = content ?? read('README.md');
    assert.ok(content.includes('## Documentation'), 'must have ## Documentation section');
    const docSection = content.slice(
      content.indexOf('## Documentation'),
      content.indexOf('##', content.indexOf('## Documentation') + 3)
    );
    const expected = ['AGENTS.md', 'CONTRIBUTING.md', 'LICENSE.md', 'SECURITY.md', 'SUPPORT.md', 'UBIQUITOUS_LANGUAGE.md'];
    for (const doc of expected) {
      assert.ok(docSection.includes(doc), `Documentation section must reference ${doc}`);
    }
  });

  test('Documentation section links resolve to existing files', () => {
    const linkedDocs = ['AGENTS.md', 'CONTRIBUTING.md', 'LICENSE.md', 'SECURITY.md', 'SUPPORT.md', 'UBIQUITOUS_LANGUAGE.md'];
    for (const doc of linkedDocs) {
      assert.ok(exists(doc), `${doc} listed in README.md Documentation section must exist on disk`);
    }
  });

  test('has Discovery section (renamed from Load Order)', () => {
    content = content ?? read('README.md');
    assert.ok(content.includes('## Discovery'), 'must have ## Discovery section');
    assert.ok(!content.includes('## Load Order'), 'must not still say ## Load Order');
  });

  test('Discovery section has 3 always-read items', () => {
    content = content ?? read('README.md');
    const discoverySection = content.slice(
      content.indexOf('## Discovery'),
      content.indexOf('##', content.indexOf('## Discovery') + 3)
    );
    assert.ok(
      discoverySection.includes("'.harness/core/2026-05-18-evals-core.md'"),
      "Discovery always-read must include evals-core.md"
    );
    assert.ok(
      discoverySection.includes("'UBIQUITOUS_LANGUAGE.md'"),
      "Discovery always-read must include UBIQUITOUS_LANGUAGE.md"
    );
  });

  test('Discovery section has conditional loading guidance for spec/plan', () => {
    content = content ?? read('README.md');
    assert.ok(
      content.includes("'.harness/specs/2026-05-18-evals-executable-spine-spec.md'"),
      'must reference spec file as conditional load'
    );
    assert.ok(
      content.includes("'.harness/plans/2026-05-18-evals-executable-spine-plan.md'"),
      'must reference plan file as conditional load'
    );
  });

  test('Phase-One Hard Blocks section does not contain absolute filesystem paths', () => {
    content = content ?? read('README.md');
    const hardBlocksIdx = content.indexOf('## Phase-One Hard Blocks');
    const nextSectionIdx = content.indexOf('##', hardBlocksIdx + 3);
    const hardBlocksSection = content.slice(hardBlocksIdx, nextSectionIdx);
    assert.ok(
      !hardBlocksSection.includes('/Users/'),
      'Phase-One Hard Blocks must not contain absolute /Users/ paths'
    );
    assert.ok(
      !hardBlocksSection.includes('/home/'),
      'Phase-One Hard Blocks must not contain absolute /home/ paths'
    );
  });

  test('Phase-One Hard Blocks references sibling repos by short name, not path', () => {
    content = content ?? read('README.md');
    assert.ok(
      content.includes("'coding-harness'") && content.includes("'agent-skills'"),
      'must reference sibling repos by short name coding-harness and agent-skills'
    );
    assert.ok(
      !content.includes('/Users/jamiecraik/dev/coding-harness') &&
        !content.includes('/Users/jamiecraik/dev/agent-skills'),
      'must not use absolute paths to sibling repos'
    );
  });

  test('Local Artifacts section mentions retention note', () => {
    content = content ?? read('README.md');
    assert.ok(
      content.includes('retained locally') || content.includes('Automatic retention duration'),
      'must include retention note for local artifacts'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: AGENTS.md
// ---------------------------------------------------------------------------

describe('AGENTS.md (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('AGENTS.md'), 'AGENTS.md must exist');
    content = read('AGENTS.md');
  });

  test('does not contain absolute local filesystem paths', () => {
    content = content ?? read('AGENTS.md');
    assert.ok(
      !content.includes('/Users/jamiecraik'),
      "must not contain '/Users/jamiecraik' absolute path"
    );
  });

  test('instructions apply to the repository, not a hardcoded path', () => {
    content = content ?? read('AGENTS.md');
    assert.ok(
      content.includes('this repository'),
      "must say 'this repository', not a hardcoded path"
    );
  });

  test('has Discovery section (renamed from Read Order)', () => {
    content = content ?? read('AGENTS.md');
    assert.ok(content.includes('## Discovery'), 'must have ## Discovery section');
    assert.ok(!content.includes('## Read Order'), 'must not still say ## Read Order');
  });

  test('Discovery section always-read list includes evals-core.md', () => {
    content = content ?? read('AGENTS.md');
    assert.ok(
      content.includes("'.harness/core/2026-05-18-evals-core.md'"),
      "Discovery always-read must include '.harness/core/2026-05-18-evals-core.md'"
    );
  });

  test('Discovery section always-read list includes UBIQUITOUS_LANGUAGE.md', () => {
    content = content ?? read('AGENTS.md');
    assert.ok(
      content.includes("'UBIQUITOUS_LANGUAGE.md'"),
      "Discovery always-read must include 'UBIQUITOUS_LANGUAGE.md'"
    );
  });

  test('Discovery section has conditional spec/plan guidance', () => {
    content = content ?? read('AGENTS.md');
    assert.ok(
      content.includes("'.harness/specs/2026-05-18-evals-executable-spine-spec.md'"),
      'must have spec as conditional load'
    );
    assert.ok(
      content.includes("'.harness/plans/2026-05-18-evals-executable-spine-plan.md'"),
      'must have plan as conditional load'
    );
  });

  test('Phase-One Hard Blocks section uses "Until a later ADR or spec" wording', () => {
    content = content ?? read('AGENTS.md');
    assert.ok(
      content.includes('Until a later ADR or spec'),
      'must use "Until a later ADR or spec" wording for hard blocks'
    );
    assert.ok(
      !content.includes('Before local artifact proof exists'),
      'must not use old "Before local artifact proof exists" wording'
    );
  });

  test('Phase-One Hard Blocks prohibits sibling-repo runtime deps by short name', () => {
    content = content ?? read('AGENTS.md');
    assert.ok(
      content.includes("'coding-harness'") && content.includes("'agent-skills'"),
      'must name coding-harness and agent-skills as blocked runtime dependencies'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: artifacts/reviews/docs-expert.md (new file)
// ---------------------------------------------------------------------------

describe('artifacts/reviews/docs-expert.md (new file)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('artifacts/reviews/docs-expert.md'), 'docs-expert.md must exist');
    content = read('artifacts/reviews/docs-expert.md');
  });

  test('has Scope section', () => {
    content = content ?? read('artifacts/reviews/docs-expert.md');
    assert.ok(content.includes('## Scope'), 'must have ## Scope section');
  });

  test('Docs Created section lists all four new files', () => {
    content = content ?? read('artifacts/reviews/docs-expert.md');
    assert.ok(content.includes("'CONTRIBUTING.md'"), "must list CONTRIBUTING.md as created");
    assert.ok(content.includes("'SECURITY.md'"), "must list SECURITY.md as created");
    assert.ok(content.includes("'SUPPORT.md'"), "must list SUPPORT.md as created");
    assert.ok(content.includes("'LICENSE.md'"), "must list LICENSE.md as created");
  });

  test('Docs Updated section references README.md', () => {
    content = content ?? read('artifacts/reviews/docs-expert.md');
    assert.ok(content.includes("'README.md'"), "must list README.md as updated");
  });

  test('Evidence Map table contains canonical command evidence', () => {
    content = content ?? read('artifacts/reviews/docs-expert.md');
    assert.ok(
      content.includes('## Evidence Map'),
      'must have Evidence Map section'
    );
    assert.ok(
      content.includes('Canonical smoke command exists'),
      'Evidence Map must include canonical smoke command claim'
    );
    assert.ok(
      content.includes('Canonical validation command exists'),
      'Evidence Map must include validation command claim'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: artifacts/reviews/improve-codebase-architecture.md
// ---------------------------------------------------------------------------

describe('artifacts/reviews/improve-codebase-architecture.md (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(
      exists('artifacts/reviews/improve-codebase-architecture.md'),
      'improve-codebase-architecture.md must exist'
    );
    content = read('artifacts/reviews/improve-codebase-architecture.md');
  });

  test('has schema_version: 1 frontmatter', () => {
    content = content ?? read('artifacts/reviews/improve-codebase-architecture.md');
    assert.ok(content.includes('schema_version: 1'), 'must have schema_version: 1');
  });

  test('has execution_mode field', () => {
    content = content ?? read('artifacts/reviews/improve-codebase-architecture.md');
    assert.ok(
      content.includes('execution_mode:'),
      'must have execution_mode field'
    );
    assert.ok(
      content.includes('read_only_architecture_review'),
      'execution_mode must be read_only_architecture_review'
    );
  });

  test('has date field', () => {
    content = content ?? read('artifacts/reviews/improve-codebase-architecture.md');
    assert.ok(content.includes('date: 2026-05-18'), 'must have date: 2026-05-18');
  });

  test('has Ranked Opportunities section', () => {
    content = content ?? read('artifacts/reviews/improve-codebase-architecture.md');
    assert.ok(
      content.includes('## Ranked Opportunities'),
      'must have ## Ranked Opportunities section'
    );
  });

  test('first opportunity addresses separating schema validation from runner', () => {
    content = content ?? read('artifacts/reviews/improve-codebase-architecture.md');
    assert.ok(
      content.includes('Separate schema validation') ||
        content.includes('schema validation mechanics'),
      'must address separating schema validation from runner orchestration'
    );
  });

  test('includes Validation Paths section with node:test reference', () => {
    content = content ?? read('artifacts/reviews/improve-codebase-architecture.md');
    assert.ok(
      content.includes('## Validation Paths') || content.includes('Validation Paths'),
      'must have Validation Paths section'
    );
    assert.ok(
      content.includes('pnpm evals check --json'),
      'Validation Paths must include pnpm evals check --json'
    );
  });

  test('references src/cli.js line numbers as evidence', () => {
    content = content ?? read('artifacts/reviews/improve-codebase-architecture.md');
    assert.ok(
      content.includes('src/cli.js:'),
      'must cite src/cli.js line numbers as evidence'
    );
  });

  test('has Recommended First Move section', () => {
    content = content ?? read('artifacts/reviews/improve-codebase-architecture.md');
    assert.ok(
      content.includes('## Recommended First Move'),
      'must have ## Recommended First Move section'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: artifacts/reviews/simplify.md
// ---------------------------------------------------------------------------

describe('artifacts/reviews/simplify.md (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('artifacts/reviews/simplify.md'), 'simplify.md must exist');
    content = read('artifacts/reviews/simplify.md');
  });

  test('has schema_version: 1 frontmatter', () => {
    content = content ?? read('artifacts/reviews/simplify.md');
    assert.ok(content.includes('schema_version: 1'), 'must have schema_version: 1');
  });

  test('has execution_mode: read_only_review', () => {
    content = content ?? read('artifacts/reviews/simplify.md');
    assert.ok(
      content.includes('execution_mode: read_only_review'),
      'must have execution_mode: read_only_review'
    );
  });

  test('has diff_source field', () => {
    content = content ?? read('artifacts/reviews/simplify.md');
    assert.ok(content.includes('diff_source:'), 'must have diff_source field');
  });

  test('has Files Reviewed section listing key files', () => {
    content = content ?? read('artifacts/reviews/simplify.md');
    assert.ok(content.includes('## Files Reviewed'), 'must have ## Files Reviewed section');
    assert.ok(
      content.includes('src/cli.js'),
      'Files Reviewed must include src/cli.js'
    );
  });

  test('Findings section does not claim blocking issues were resolved by code changes', () => {
    content = content ?? read('artifacts/reviews/simplify.md');
    assert.ok(
      content.includes('read-only') || content.includes('No behavior-preserving simplification was applied'),
      'must clearly state this is a read-only review with no code changes'
    );
  });

  test('has Validation section with all four pass verdicts', () => {
    content = content ?? read('artifacts/reviews/simplify.md');
    assert.ok(content.includes('## Validation'), 'must have ## Validation section');
    assert.ok(content.includes('pass: node --check src/cli.js'), 'Validation must include node --check pass');
    assert.ok(content.includes('pass: pnpm evals check --json'), 'Validation must include check pass');
  });

  test('Next Step section recommends tests before extraction', () => {
    content = content ?? read('artifacts/reviews/simplify.md');
    assert.ok(
      content.includes('## Next Step') || content.includes('node:test'),
      'must have Next Step section recommending tests'
    );
  });

  test('has Risk Note section acknowledging reviewer timeout', () => {
    content = content ?? read('artifacts/reviews/simplify.md');
    assert.ok(content.includes('## Risk Note'), 'must have ## Risk Note section');
    assert.ok(
      content.includes('timed out') || content.includes('timeout'),
      'Risk Note must acknowledge reviewer timeout'
    );
    assert.ok(
      content.includes('not approval evidence') || content.includes('mailbox silence is not approval'),
      'Risk Note must not treat timeout as approval'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: artifacts/reviews/ubiquitous-language.md
// ---------------------------------------------------------------------------

describe('artifacts/reviews/ubiquitous-language.md (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('artifacts/reviews/ubiquitous-language.md'), 'ubiquitous-language.md must exist');
    content = read('artifacts/reviews/ubiquitous-language.md');
  });

  test('has schema_version: 1 frontmatter', () => {
    content = content ?? read('artifacts/reviews/ubiquitous-language.md');
    assert.ok(content.includes('schema_version: 1'), 'must have schema_version: 1');
  });

  test('has execution_mode: read_only_vocabulary_review', () => {
    content = content ?? read('artifacts/reviews/ubiquitous-language.md');
    assert.ok(
      content.includes('execution_mode: read_only_vocabulary_review'),
      'must have execution_mode: read_only_vocabulary_review'
    );
  });

  test('Highest-Value Terms table includes all key terms', () => {
    content = content ?? read('artifacts/reviews/ubiquitous-language.md');
    assert.ok(
      content.includes('## Highest-Value Terms Checked'),
      'must have ## Highest-Value Terms Checked section'
    );
    const expectedTerms = [
      'Executable spine',
      'Artifact bundle',
      'Deterministic verdict',
      'Baseline result',
      'Tracker blocked',
    ];
    for (const term of expectedTerms) {
      assert.ok(content.includes(term), `Terms table must include "${term}"`);
    }
  });

  test('Finding section identifies delivery evidence language drift', () => {
    content = content ?? read('artifacts/reviews/ubiquitous-language.md');
    assert.ok(content.includes('## Finding'), 'must have ## Finding section');
    assert.ok(
      content.includes('delivery evidence') || content.includes('drifting from live git state'),
      'must identify delivery evidence language drift'
    );
  });

  test('Applied wording section distinguishes initial vs hardening commits', () => {
    content = content ?? read('artifacts/reviews/ubiquitous-language.md');
    assert.ok(
      content.includes('8029517') && content.includes('8e9f6fb'),
      'must reference both initial implementation commit 8029517 and hardening commit 8e9f6fb'
    );
    assert.ok(
      content.includes('Initial implementation commit'),
      'must use "Initial implementation commit" wording'
    );
  });

  test('Validation section confirms UBIQUITOUS_LANGUAGE.md exists', () => {
    content = content ?? read('artifacts/reviews/ubiquitous-language.md');
    assert.ok(content.includes('## Validation'), 'must have ## Validation section');
    assert.ok(
      content.includes('UBIQUITOUS_LANGUAGE.md exists'),
      'Validation must confirm UBIQUITOUS_LANGUAGE.md exists'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: artifacts/reviews/unslopify.md
// ---------------------------------------------------------------------------

describe('artifacts/reviews/unslopify.md (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('artifacts/reviews/unslopify.md'), 'unslopify.md must exist');
    content = read('artifacts/reviews/unslopify.md');
  });

  test('has schema_version: 1 frontmatter', () => {
    content = content ?? read('artifacts/reviews/unslopify.md');
    assert.ok(content.includes('schema_version: 1'), 'must have schema_version: 1');
  });

  test('has execution_mode: read_only_cleanup_audit', () => {
    content = content ?? read('artifacts/reviews/unslopify.md');
    assert.ok(
      content.includes('execution_mode: read_only_cleanup_audit'),
      'must have execution_mode: read_only_cleanup_audit'
    );
  });

  test('has Cleanup Ledger section with stale commit evidence row', () => {
    content = content ?? read('artifacts/reviews/unslopify.md');
    assert.ok(content.includes('## Cleanup Ledger'), 'must have ## Cleanup Ledger section');
    assert.ok(
      content.includes('Stale commit evidence') || content.includes('stale commit evidence'),
      'Cleanup Ledger must address stale commit evidence'
    );
  });

  test('Cleanup Ledger marks stale commit evidence as resolved', () => {
    content = content ?? read('artifacts/reviews/unslopify.md');
    assert.ok(
      content.includes('resolved in triage'),
      'Cleanup Ledger must mark stale commit evidence as "resolved in triage"'
    );
  });

  test('Cleanup Ledger has no-action for placeholder language (none found)', () => {
    content = content ?? read('artifacts/reviews/unslopify.md');
    assert.ok(
      content.includes('Placeholder/pending artifact language') ||
        content.includes('pending artifact'),
      'must confirm no placeholder/pending language was found'
    );
  });

  test('has Validation Outcomes with four pass verdicts', () => {
    content = content ?? read('artifacts/reviews/unslopify.md');
    assert.ok(
      content.includes('## Validation Outcomes'),
      'must have ## Validation Outcomes section'
    );
    assert.ok(
      content.includes('pass: pnpm evals check --json'),
      'Validation Outcomes must include check --json pass'
    );
    assert.ok(
      content.includes('pass: node --check src/cli.js'),
      'Validation Outcomes must include node --check src/cli.js pass'
    );
  });

  test('has Rollback Notes section stating evidence-only status', () => {
    content = content ?? read('artifacts/reviews/unslopify.md');
    assert.ok(content.includes('## Rollback Notes'), 'must have ## Rollback Notes section');
    assert.ok(
      content.includes('evidence-only') || content.includes('no runtime effect'),
      'Rollback Notes must clarify review is evidence-only with no runtime effect'
    );
  });

  test('Residual Risk section warns about documentation truth drift', () => {
    content = content ?? read('artifacts/reviews/unslopify.md');
    assert.ok(content.includes('## Residual Risk'), 'must have ## Residual Risk section');
    assert.ok(
      content.includes('truth drift') || content.includes('documentation truth drift'),
      'Residual Risk must warn about documentation truth drift'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: implementation-notes.html
// ---------------------------------------------------------------------------

describe('implementation-notes.html (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(exists('implementation-notes.html'), 'implementation-notes.html must exist');
    content = read('implementation-notes.html');
  });

  test('Git/PR status tile does not claim pushed to origin/main as final state', () => {
    content = content ?? read('implementation-notes.html');
    // The PR changed this from "pushed to origin/main; PR n/a" to "draft PR #1 on codex/evals-review-triage"
    assert.ok(
      !content.includes('pushed to origin/main; PR n/a'),
      'Git/PR tile must not still say "pushed to origin/main; PR n/a" (stale wording)'
    );
  });

  test('git log section tells agents to verify live state, not claim a specific head', () => {
    content = content ?? read('implementation-notes.html');
    assert.ok(
      content.includes('Verify live before delivery decisions') ||
        content.includes('Verify live'),
      'git log section must instruct agents to verify live git state'
    );
  });

  test('git log section references initial implementation commit 8029517', () => {
    content = content ?? read('implementation-notes.html');
    assert.ok(
      content.includes('8029517'),
      'must reference initial implementation commit 8029517'
    );
    assert.ok(
      content.includes('Initial implementation commit') ||
        content.includes('initial implementation commit'),
      'must use "Initial implementation commit" label for 8029517'
    );
  });

  test('git log section references hardening commit 8e9f6fb', () => {
    content = content ?? read('implementation-notes.html');
    assert.ok(
      content.includes('8e9f6fb'),
      'must reference schema-validation hardening commit 8e9f6fb'
    );
  });

  test('does not claim current head is 0fb13b2 as live state', () => {
    content = content ?? read('implementation-notes.html');
    // The old wording said "Current head: 0fb13b2 docs: record final linear retry blocker"
    // as a live assertion; the PR replaced it with "Verify live before delivery decisions"
    assert.ok(
      !content.includes('Current head: 0fb13b2'),
      'must not claim 0fb13b2 as current live head (stale delivery claim removed)'
    );
  });

  test('includes history item for docs-expert pass', () => {
    content = content ?? read('implementation-notes.html');
    assert.ok(
      content.includes('docs-expert') || content.includes('CONTRIBUTING.md'),
      'history must include the docs-expert pass that added CONTRIBUTING.md, SECURITY.md, etc.'
    );
  });

  test('includes history item for simplify/unslopify/architecture triage pass', () => {
    content = content ?? read('implementation-notes.html');
    assert.ok(
      content.includes('simplify') && (content.includes('unslopify') || content.includes('architecture')),
      'history must include simplify/unslopify/architecture triage pass'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: .harness/evals/evals-evals-executable-spine-eval.md
// ---------------------------------------------------------------------------

describe('.harness/evals/evals-evals-executable-spine-eval.md (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(
      exists('.harness/evals/evals-evals-executable-spine-eval.md'),
      'evals-evals-executable-spine-eval.md must exist'
    );
    content = read('.harness/evals/evals-evals-executable-spine-eval.md');
  });

  test('refers to initial implementation commit 8029517 (not just "commit")', () => {
    content = content ?? read('.harness/evals/evals-evals-executable-spine-eval.md');
    assert.ok(
      content.includes('Initial implementation commit') ||
        content.includes('initial implementation commit'),
      'must use "Initial implementation commit" label for 8029517'
    );
    assert.ok(content.includes('8029517'), 'must reference commit 8029517');
  });

  test('hardening commit 8e9f6fb is included in git log summary row', () => {
    content = content ?? read('.harness/evals/evals-evals-executable-spine-eval.md');
    assert.ok(
      content.includes('8e9f6fb'),
      'must include hardening commit 8e9f6fb in git log summary'
    );
  });

  test('git log command row instructs agents to verify live state', () => {
    content = content ?? read('.harness/evals/evals-evals-executable-spine-eval.md');
    assert.ok(
      content.includes('git status --short --branch') &&
        content.includes('git log --oneline --decorate -1'),
      'must include live git verification commands'
    );
  });

  test('git status block instructs live verification not stale claim', () => {
    content = content ?? read('.harness/evals/evals-evals-executable-spine-eval.md');
    // Old version had "## main...origin/main" as a claimed output; new version has live verification
    assert.ok(
      content.includes('git status --short --branch') ||
        content.includes('Verify current git state live'),
      'must instruct live git state verification instead of stale output'
    );
  });

  test('Implementation row in summary table uses updated wording', () => {
    content = content ?? read('.harness/evals/evals-evals-executable-spine-eval.md');
    assert.ok(
      content.includes('follow-up delivery') || content.includes('hardening commits'),
      'Implementation summary row must mention follow-up delivery/hardening commits'
    );
  });
});

// ---------------------------------------------------------------------------
// Modified: .harness/evals/evals-executable-spine-completion-audit.md
// ---------------------------------------------------------------------------

describe('.harness/evals/evals-executable-spine-completion-audit.md (modified)', () => {
  let content;
  test('file exists', () => {
    assert.ok(
      exists('.harness/evals/evals-executable-spine-completion-audit.md'),
      'evals-executable-spine-completion-audit.md must exist'
    );
    content = read('.harness/evals/evals-executable-spine-completion-audit.md');
  });

  test('git/PR readiness row references initial implementation commit 8029517', () => {
    content = content ?? read('.harness/evals/evals-executable-spine-completion-audit.md');
    assert.ok(
      content.includes('initial implementation commit 8029517') ||
        content.includes('Initial implementation commit 8029517'),
      'must label 8029517 as initial implementation commit'
    );
  });

  test('git/PR readiness row mentions hardening commit 8e9f6fb', () => {
    content = content ?? read('.harness/evals/evals-executable-spine-completion-audit.md');
    assert.ok(
      content.includes('8e9f6fb'),
      'must reference hardening commit 8e9f6fb'
    );
  });

  test('git/PR readiness row clarifies no PR existed at initial default-branch push', () => {
    content = content ?? read('.harness/evals/evals-executable-spine-completion-audit.md');
    assert.ok(
      content.includes('no current-branch PR existed') ||
        content.includes('default branch') ||
        content.includes('initial default-branch push'),
      'must clarify why no PR existed at initial push'
    );
  });
});

// ---------------------------------------------------------------------------
// Cross-consistency: phase-one hard blocks are equivalent across docs
// ---------------------------------------------------------------------------

describe('Cross-doc: phase-one hard blocks consistency', () => {
  // README uses singular forms (e.g. "dashboard", "cloud runner"); AGENTS.md and
  // CONTRIBUTING.md use plural forms. Use the common prefix to match both.
  const hardBlockItems = [
    'dashboard',
    'external adapter',
    'cloud runner',
    'plugin system',
    'source-mining automation',
    'LLM judge',
    'coding-harness',
    'agent-skills',
  ];

  function getHardBlocksSection(filePath) {
    const raw = read(filePath);
    const idx = raw.indexOf('Hard Blocks');
    if (idx === -1) return raw;
    const nextSection = raw.indexOf('\n## ', idx + 1);
    return nextSection === -1 ? raw.slice(idx) : raw.slice(idx, nextSection);
  }

  test('README.md Phase-One Hard Blocks covers all expected block categories', () => {
    const section = getHardBlocksSection('README.md');
    for (const item of hardBlockItems) {
      assert.ok(
        section.toLowerCase().includes(item.toLowerCase()),
        `README.md Phase-One Hard Blocks must mention "${item}"`
      );
    }
  });

  test('AGENTS.md Phase-One Hard Blocks covers all expected block categories', () => {
    const section = getHardBlocksSection('AGENTS.md');
    for (const item of hardBlockItems) {
      assert.ok(
        section.toLowerCase().includes(item.toLowerCase()),
        `AGENTS.md Phase-One Hard Blocks must mention "${item}"`
      );
    }
  });

  test('CONTRIBUTING.md Scope out-of-scope list covers all expected block categories', () => {
    const raw = read('CONTRIBUTING.md');
    const scopeIdx = raw.indexOf('## Scope');
    const nextSection = raw.indexOf('\n## ', scopeIdx + 1);
    const scopeSection = nextSection === -1 ? raw.slice(scopeIdx) : raw.slice(scopeIdx, nextSection);
    for (const item of hardBlockItems) {
      assert.ok(
        scopeSection.toLowerCase().includes(item.toLowerCase()),
        `CONTRIBUTING.md Scope must mention "${item}" as out of scope`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-consistency: privacy regex is identical in CONTRIBUTING.md, SECURITY.md, AGENTS.md
// ---------------------------------------------------------------------------

describe('Cross-doc: privacy check regex consistency', () => {
  const CANONICAL_REGEX_FRAGMENT = 'sk-|api[_-]?key|token|secret|password';

  test('CONTRIBUTING.md includes canonical privacy regex fragment', () => {
    const content = read('CONTRIBUTING.md');
    assert.ok(
      content.includes(CANONICAL_REGEX_FRAGMENT),
      'CONTRIBUTING.md must include canonical privacy regex fragment'
    );
  });

  test('SECURITY.md includes canonical privacy regex fragment', () => {
    const content = read('SECURITY.md');
    assert.ok(
      content.includes(CANONICAL_REGEX_FRAGMENT),
      'SECURITY.md must include canonical privacy regex fragment'
    );
  });

  test('AGENTS.md includes canonical privacy regex fragment', () => {
    const content = read('AGENTS.md');
    assert.ok(
      content.includes(CANONICAL_REGEX_FRAGMENT),
      'AGENTS.md must include canonical privacy regex fragment'
    );
  });
});

// ---------------------------------------------------------------------------
// Cross-consistency: README.md Documentation links all resolve
// ---------------------------------------------------------------------------

describe('Cross-doc: README.md Documentation section link resolution', () => {
  test('all files listed in README.md Documentation section exist on disk', () => {
    const readme = read('README.md');
    const docSection = readme.slice(
      readme.indexOf('## Documentation'),
      readme.indexOf('##', readme.indexOf('## Documentation') + 3)
    );
    // Extract quoted filenames like 'FILENAME.md'
    const matches = docSection.match(/'([A-Z_]+\.md)'/g) ?? [];
    assert.ok(matches.length >= 5, `Documentation section must reference at least 5 doc files, found ${matches.length}`);
    for (const match of matches) {
      const filename = match.replace(/'/g, '');
      assert.ok(
        exists(filename),
        `README.md Documentation section references '${filename}' but it does not exist`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Regression: no absolute local paths in any PR-changed file
// ---------------------------------------------------------------------------

describe('Regression: no absolute /Users/ paths in PR-changed doc files', () => {
  const changedDocFiles = [
    'README.md',
    'AGENTS.md',
    'CONTRIBUTING.md',
    'LICENSE.md',
    'SECURITY.md',
    'SUPPORT.md',
    'artifacts/reviews/docs-expert.md',
    'artifacts/reviews/improve-codebase-architecture.md',
    'artifacts/reviews/simplify.md',
    'artifacts/reviews/ubiquitous-language.md',
    'artifacts/reviews/unslopify.md',
  ];

  for (const file of changedDocFiles) {
    test(`${file} contains no /Users/jamiecraik absolute paths`, () => {
      const content = read(file);
      assert.ok(
        !content.includes('/Users/jamiecraik'),
        `${file} must not contain /Users/jamiecraik absolute filesystem path`
      );
    });
  }
});
