import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerConfigPath = join(__dirname, '..', 'worker-configuration.d.ts');

// Read the generated file
let content = readFileSync(workerConfigPath, 'utf-8');

// Replace the AUTH_WORKER import path
const searchPattern =
  /AUTH_WORKER: Service<typeof import\("\.\.\/auth\/src\/index"\)\.default>;/g;
const replacement = `/* NOTE: CRITICAL WORKAROUND: MANUALLY OVERRIDE THIS TO THE WORKSPACE PATH INSTEAD OF RELATIVE PATH AFTER GENERATING THE TYPES EVERYTIME. OR USE PNPM RUN CF-TYPEGEN WORKFLOW TO AUTOMATE THIS */
		AUTH_WORKER: Service<typeof import("@deepcrawl/auth/src/index").default>;`;

content = content.replace(searchPattern, replacement);

// Write back to file
writeFileSync(workerConfigPath, content, 'utf-8');

console.log('🧑‍🏭 AUTH_WORKER import path has been overridden successfully');
