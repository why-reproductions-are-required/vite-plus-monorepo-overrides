import { spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const vp = process.platform === 'win32' ? 'vp.cmd' : 'vp';

class VerificationFailure extends Error {
  constructor(status = 1) {
    super('Verification failed');
    this.status = status;
  }
}

function run(args) {
  return spawnSync(vp, args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function printOutput(result) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}

function expectSuccess(label, args) {
  const result = run(args);
  if (result.status !== 0) {
    console.error(`\n✗ ${label} failed: vp ${args.join(' ')}`);
    printOutput(result);
    throw new VerificationFailure(result.status ?? 1);
  }
  process.stdout.write(`✓ ${label}\n`);
}

function expectFailure(label, args, pattern) {
  const result = run(args);
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status === 0) {
    console.error(`\n✗ ${label} unexpectedly passed: vp ${args.join(' ')}`);
    throw new VerificationFailure();
  }
  if (!pattern.test(output)) {
    console.error(`\n✗ ${label} failed for the wrong reason: vp ${args.join(' ')}`);
    printOutput(result);
    throw new VerificationFailure();
  }
  process.stdout.write(`✓ ${label}\n`);
}

function withFile(relativePath, content, callback) {
  const filePath = join(repoRoot, relativePath);
  writeFileSync(filePath, content);
  try {
    callback(relativePath);
  } finally {
    rmSync(filePath, { force: true });
  }
}

function verify() {
  expectSuccess('root config passes check', ['check']);
  expectSuccess('workspace package builds run recursively', ['run', '-r', 'build']);

  withFile(
    'apps/api/src/__verify_console_allowed.ts',
    "console.log('api package console logging is allowed by lint.overrides');\n",
    (file) => {
      expectSuccess('api lint override allows console.log', ['lint', file]);
    },
  );

  withFile(
    'packages/ui/src/__verify_console_failure.ts',
    "console.log('ui package console logging should still fail');\n",
    (file) => {
      expectFailure(
        'base lint rule still rejects console.log outside api',
        ['lint', file],
        /no-console/,
      );
    },
  );

  withFile(
    'apps/web/src/__verify_react_failure.tsx',
    'export function BrokenComponent() {\n  return <span></span>;\n}\n',
    (file) => {
      expectFailure(
        'react lint override is active for web files',
        ['lint', file],
        /self-closing-comp/,
      );
    },
  );

  process.stdout.write('✓ monorepo overrides are verified\n');
}

try {
  verify();
} catch (error) {
  if (error instanceof VerificationFailure) {
    process.exit(error.status);
  }
  throw error;
}
