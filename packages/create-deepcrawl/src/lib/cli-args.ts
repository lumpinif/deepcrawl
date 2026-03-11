export type CliArgs = {
  dryRun: boolean;
  targetPath?: string;
  templateSource?: string;
  templateBranch?: string;
};

function readFlagValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}.`);
  }
  return value;
}

export function parseCliArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === undefined) {
      continue;
    }

    if (arg === '--') {
      continue;
    }

    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (arg === '--template-source') {
      args.templateSource = readFlagValue(argv, i, arg);
      i += 1;
      continue;
    }

    if (arg === '--template-branch') {
      args.templateBranch = readFlagValue(argv, i, arg);
      i += 1;
      continue;
    }

    if (!arg.startsWith('--')) {
      if (args.targetPath) {
        throw new Error(
          'Only one target path may be provided. Example: npm create deepcrawl ../my-app',
        );
      }
      args.targetPath = arg;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (args.templateSource && !args.templateBranch) {
    throw new Error(
      'The internal --template-source override requires --template-branch.',
    );
  }

  return args;
}
