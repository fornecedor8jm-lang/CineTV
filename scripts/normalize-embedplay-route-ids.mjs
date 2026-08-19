import fs from 'node:fs/promises';
import path from 'node:path';

const catalogPath = path.join(process.cwd(), 'lib', 'embedplay-catalog.ts');
const source = await fs.readFile(catalogPath, 'utf8');
const matches = source.match(/id: "embedplay-série-[0-9]+"/g) ?? [];
const updated = source.replaceAll('id: "embedplay-série-', 'id: "embedplay-serie-');
await fs.writeFile(catalogPath, updated);
console.log(JSON.stringify({ normalized: matches.length, catalogPath }, null, 2));
