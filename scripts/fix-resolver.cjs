/* eslint-disable */
const fs = require("fs");
const path = require("path");

const resolverPath = path.join(__dirname, "../node_modules/@dt-frames/ui/es/resolver.js");

if (!fs.existsSync(resolverPath)) {
  console.log("resolver.js not found, skipping patch");
  process.exit(0);
}

let content = fs.readFileSync(resolverPath, "utf8");
const original = content;

// src/ -> es/
content = content.replace(/@dt-frames\/ui\/src\//g, "@dt-frames/ui/es/");

// /index.ts -> /index (resolved via ./es/* export pattern to .js)
content = content.replace(/\/index\.ts\b/g, "/index");

// /styles/index.scss -> /style.css
content = content.replace(/\/styles\/index\.scss/g, "/style.css");

if (content !== original) {
  fs.writeFileSync(resolverPath, content);
  console.log("Patched @dt-frames/ui/es/resolver.js for npm package compatibility");
} else {
  console.log("resolver.js already patched, skipping");
}