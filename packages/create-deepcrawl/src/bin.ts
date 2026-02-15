import { run } from './run.js';

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run');
  return { dryRun };
}

run(parseArgs(process.argv.slice(2))).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : null;
  process.stderr.write(`create-deepcrawl failed: ${message}\n`);
  if (stack) {
    process.stderr.write(`${stack}\n`);
  }
  process.exit(1);
});
