import { parseCliArgs } from './lib/cli-args.js';
import { isUserAbortError } from './lib/user-abort.js';
import { run } from './run.js';
import { renderDeepcrawlHeader } from './ui/brand.js';
import { getCancelMessage } from './ui/messages.js';

const args = parseCliArgs(process.argv.slice(2));

process.stdout.write(
  [
    '',
    renderDeepcrawlHeader(),
    '',
    'Create and deploy Deepcrawl from your terminal.',
    'Tip: run npm create deepcrawl ../my-app to skip the folder questions.',
    '',
  ].join('\n'),
);

run(args).catch((error) => {
  if (isUserAbortError(error)) {
    process.stderr.write(`${getCancelMessage()}\n`);
    process.exit(1);
  }
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : null;
  process.stderr.write(`create-deepcrawl failed: ${message}\n`);
  if (stack) {
    process.stderr.write(`${stack}\n`);
  }
  process.exit(1);
});
