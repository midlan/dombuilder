import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load dom2url.js functions into this scope via Function constructor.
// Node 18+ provides the required globals (Blob, CompressionStream, etc.).
const code = readFileSync(join(root, 'dom2url.js'), 'utf8');
const load = new Function(code + '\nreturn { encodeInstructions, decodeInstructions };');
const { encodeInstructions, decodeInstructions } = load();

const examplesDir = join(__dirname, 'examples');
const files = readdirSync(examplesDir).filter(f => f.endsWith('.html'));

let passed = 0;
let failed = 0;

for (const file of files) {
    const input = readFileSync(join(examplesDir, file), 'utf8');
    const encoded = await encodeInstructions(input);
    const decoded = await decodeInstructions(encoded);

    if (input === decoded) {
        console.log(`  PASS  ${file}  (${input.length} bytes -> ${encoded.length} chars)`);
        passed++;
    } else {
        console.error(`  FAIL  ${file}`);
        console.error(`    expected length: ${input.length}`);
        console.error(`    got length:      ${decoded.length}`);
        failed++;
    }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
