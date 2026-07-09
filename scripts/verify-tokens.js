import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir).filter(f => !f.endsWith('projects.ts') && !f.endsWith('lenis.ts') && !f.endsWith('main.tsx'));
let hasError = false;

const hexRegex = /#([0-9a-fA-F]{3,6})\b/g;
const arbitraryPxRegex = /-\[[^\]]*?\b([0-9]+px)\b[^\]]*?\]/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = hexRegex.exec(content)) !== null) {
    console.error(`Token violation in ${file}: Hardcoded hex color "${match[0]}"`);
    hasError = true;
  }
  while ((match = arbitraryPxRegex.exec(content)) !== null) {
    console.error(`Token violation in ${file}: Hardcoded px value "${match[0]}"`);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('Token check passed. Zero inline hex/px classes found outside configuration.');
}
