/* eslint-disable */
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const candidatePaths = [
  path.join(rootDir, 'apps/web/node_modules/@dt-frames/ui/es/resolver.js'),
  path.join(rootDir, 'node_modules/@dt-frames/ui/es/resolver.js'),
];
const resolverPath = candidatePaths.find((file) => fs.existsSync(file));

if (!resolverPath) {
  console.log('resolver.js not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(resolverPath, 'utf8');
const original = content;

// src/ -> es/
content = content.replace(/@dt-frames\/ui\/src\//g, '@dt-frames/ui/es/');

// /index.ts -> /index (resolved via ./es/* export pattern to .js)
content = content.replace(/\/index\.ts\b/g, '/index');

// /styles/index.scss -> /style.css
content = content.replace(/\/styles\/index\.scss/g, '/style.css');

if (content !== original) {
  fs.writeFileSync(resolverPath, content);
  console.log('Patched @dt-frames/ui/es/resolver.js for workspace package compatibility');
} else {
  console.log('resolver.js already patched, skipping');
}
