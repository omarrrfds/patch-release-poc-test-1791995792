// Trimmed, faithful reproduction of the parsing + dispatch logic in
// gemini-cli's real scripts/releasing/patch-trigger.js / getBranchInfo().
// Same behavior: trust the merged PR's head branch name, no cross-check.

const { execFileSync } = require('node:child_process');

const headRef = process.env.HEAD_REF;
if (!headRef) throw new Error('HEAD_REF not set');

const parts = headRef.split('/');
const version = parts[1];
let prNum;
let channel = 'stable';

if (parts.length >= 6 && (parts[3] === 'stable' || parts[3] === 'preview')) {
  channel = parts[3];
  const m = parts[5].match(/pr-(\d+)/);
  prNum = m ? m[1] : undefined;
}

const releaseRef = `release/${version}-pr-${prNum}`;

console.log('Parsed from attacker-controlled branch name:', {
  headRef,
  channel,
  version,
  prNum,
  releaseRef,
});

execFileSync(
  'gh',
  [
    'workflow',
    'run',
    'publish.yml',
    '--ref',
    'main',
    '--field',
    `release_ref=${releaseRef}`,
    '--field',
    `original_pr=${prNum || ''}`,
  ],
  { stdio: 'inherit', env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN } },
);

console.log('Dispatched publish.yml with release_ref =', releaseRef);
