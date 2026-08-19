import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'lib', 'embedplay-catalog.ts');
const postersDir = path.join(root, 'public', 'posters');
const source = await fs.readFile(catalogPath, 'utf8');
const externalPosterPattern = /poster: "(https:\/\/media\.themoviedb\.org\/t\/p\/w500\/[^\"]+)",/g;
const matches = [...source.matchAll(externalPosterPattern)];

if (!matches.length) {
  console.log('Nenhum pôster externo do Embed Play foi encontrado.');
  process.exit(0);
}

await fs.mkdir(postersDir, { recursive: true });
const failures = [];
let updated = source;
let downloaded = 0;
let reused = 0;

function isImage(buffer, contentType) {
  const magic = buffer.subarray(0, 12);
  return contentType.startsWith('image/') ||
    magic.subarray(0, 3).toString('hex') === 'ffd8ff' ||
    magic.subarray(0, 8).toString() === '\x89PNG\\r\\n\x1a\n' ||
    magic.subarray(0, 4).toString() === 'RIFF';
}

for (const match of matches) {
  const originalUrl = match[1];
  const filenameMatch = originalUrl.match(/\/([^/]+)\.(jpg|jpeg|png|webp)$/i);
  const filename = `embedplay-${filenameMatch?.[1] ?? String(matches.indexOf(match) + 1)}.jpg`;
  const localPath = path.join(postersDir, filename);
  const publicPath = `/posters/${filename}`;
  let valid = false;

  try {
    const existing = await fs.readFile(localPath);
    valid = existing.length > 1000;
    if (valid) reused += 1;
  } catch {
    // O arquivo ainda não existe; será baixado abaixo.
  }

  if (!valid) {
    const imageUrl = originalUrl.replace('media.themovied.org', 'image.tmdb.org');
    try {
      const response = await fetch(imageUrl, {
        headers: { 'user-agent': 'CineTV poster maintenance script' },
      });
      const contentType = response.headers.get('content-type') ?? '';
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!response.ok || !isImage(buffer, contentType) || buffer.length < 1000) {
        throw new Error(`resposta inválida: HTTP ${response.status}, ${contentType}, ${buffer.length} bytes`);
      }
      await fs.writeFile(localPath, buffer);
      downloaded += 1;
    } catch (error) {
      failures.push({ originalUrl, error: String(error) });
      continue;
    }
  }

  updated = updated.replaceAll(`poster: "${originalUrl}"`, `poster: "${publicPath}"`);
  updated = updated.replaceAll(`hero: "${originalUrl}"`, `hero: "${publicPath}"`);
}

await fs.writeFile(catalogPath, updated);
console.log(JSON.stringify({ total: matches.length, downloaded, reused, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
