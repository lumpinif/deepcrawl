#!/usr/bin/env tsx

import { readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

const FOLDERS_TO_CLEAN = ['.turbo', '.next', '.wrangler', 'node_modules'];
const FILES_TO_CLEAN = ['pnpm-lock.yaml'];

interface CleanStats {
  foldersRemoved: number;
  filesRemoved: number;
  errors: string[];
}

const cleanFolder = async (folderPath: string): Promise<boolean> => {
  try {
    const stats = await stat(folderPath);
    if (stats.isDirectory()) {
      await rm(folderPath, { recursive: true, force: true });
      return true;
    }
  } catch (error) {
    // Folder doesn't exist or can't be accessed
    return false;
  }
  return false;
};

const cleanFile = async (filePath: string): Promise<boolean> => {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      await rm(filePath, { force: true });
      return true;
    }
  } catch (error) {
    // File doesn't exist or can't be accessed
    return false;
  }
  return false;
};

const traverseAndClean = async (
  dirPath: string,
  stats: CleanStats,
): Promise<void> => {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Check if this is a folder we want to clean
        if (FOLDERS_TO_CLEAN.includes(entry.name)) {
          console.log(`🗑️  Removing folder ${fullPath}`);
          const removed = await cleanFolder(fullPath);
          if (removed) {
            stats.foldersRemoved++;
          }
        } else {
          // Recursively traverse subdirectories (but skip common non-project folders)
          if (
            !entry.name.startsWith('.') ||
            entry.name === '.next' ||
            entry.name === '.turbo' ||
            entry.name === '.wrangler'
          ) {
            await traverseAndClean(fullPath, stats);
          }
        }
      } else if (entry.isFile()) {
        // Check if this is a file we want to clean
        if (FILES_TO_CLEAN.includes(entry.name)) {
          console.log(`🗑️  Removing file ${fullPath}`);
          const removed = await cleanFile(fullPath);
          if (removed) {
            stats.filesRemoved++;
          }
        }
      }
    }
  } catch (error) {
    const errorMessage = `Failed to process directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`;
    console.warn(`⚠️  ${errorMessage}`);
    stats.errors.push(errorMessage);
  }
};

const main = async (): Promise<void> => {
  console.log('🧹 Starting cleanup of Turborepo build artifacts...\n');

  const stats: CleanStats = {
    foldersRemoved: 0,
    filesRemoved: 0,
    errors: [],
  };

  // Get the project root (parent of scripts folder)
  const projectRoot = join(process.cwd(), '..');

  console.log(`📁 Scanning project root: ${projectRoot}\n`);

  await traverseAndClean(projectRoot, stats);

  console.log('\n✅ Cleanup complete!');
  console.log(`📊 Summary:`);
  console.log(`   • Folders removed: ${stats.foldersRemoved}`);
  console.log(`   • Files removed: ${stats.filesRemoved}`);

  if (stats.errors.length > 0) {
    console.log(`   • Errors encountered: ${stats.errors.length}`);
    console.log('\n❌ Errors:');
    for (const error of stats.errors) {
      console.log(`   ${error}`);
    }
    process.exit(1);
  }

  console.log('\n🎉 All build artifacts cleaned successfully!');
};

// Run the script if it's being executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}
