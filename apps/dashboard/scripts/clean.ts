#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

/**
 * Recursively remove a directory and its contents
 * @param {string} dirPath - Path to the directory to remove
 */
function removeDir(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    console.log(`🧹 Removing ${dirPath}... \n`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Successfully removed ${dirPath} \n`);
  } else {
    console.log(`ℹ️  ${dirPath} does not exist, skipping... \n`);
  }
}

/**
 * Clean build artifacts
 */
function clean() {
  console.log('🚀 Starting clean process... \n');

  console.log('🔥 Full cleaning mode \n');
  const dirsToClean = ['.next', '.turbo'];
  dirsToClean.forEach((dir) => {
    const fullPath = path.resolve(process.cwd(), dir);
    removeDir(fullPath);
  });

  console.log('✨ Clean process completed! \n');
}

// Run the clean function
clean();
