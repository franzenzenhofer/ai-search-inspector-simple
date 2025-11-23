#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Read package.json
const packagePath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Increment patch version
const versionParts = pkg.version.split('.');
versionParts[2] = parseInt(versionParts[2]) + 1;
pkg.version = versionParts.join('.');

// Write back to package.json
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// Generate build info TypeScript file
const buildDate = new Date().toISOString();
const buildInfo = `// Auto-generated during build - do not edit manually
export const BUILD_VERSION = "${pkg.version}";
export const BUILD_DATE = "${buildDate}";
export const BUILD_TIMESTAMP = ${Date.now()};
`;

const buildInfoPath = path.join(rootDir, 'src', 'buildInfo.ts');
fs.writeFileSync(buildInfoPath, buildInfo, 'utf8');

console.log(`✓ Version incremented to ${pkg.version}`);
console.log(`✓ Build info generated: ${buildDate}`);
