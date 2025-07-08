#!/bin/bash

# Exit on error
set -e

echo "🚀 Preparing to publish @deepcrawl-sdk/ts..."

# Clean and build
echo "📦 Building package..."
pnpm run clean
pnpm run build

# Backup current package.json
echo "💾 Backing up package.json..."
cp package.json package.json.backup

# Use publish package.json
echo "📝 Switching to publish configuration..."
cp package.publish.json package.json

# Publish to npm
echo "🎉 Publishing to npm..."
npm publish

# Restore original package.json
echo "♻️  Restoring development package.json..."
mv package.json.backup package.json

echo "✅ Published successfully!"