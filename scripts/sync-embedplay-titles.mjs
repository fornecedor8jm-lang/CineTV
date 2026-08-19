import fs from 'node:fs/promises';
import path from 'node:path';

const catalogPath = path.join(process.cwd(), 'lib', 'embedplay-catalog.ts');
let source = await fs.readFile(catalogPath, 'utf8');
const blocks = source.split(/(?=  \{\n    id: )/).filter((block) => block.includes('id: "embedplay-'));
const entities = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' };
const decode = (value) => value.replace(/&amp;|&quot;|&#39;|&#x27;|&apos;|&lt;|&gt;|&nbsp;/g, (token) => entities[token]).trim();

function parseBlock(block) {
  const id = block.match(/id: "([^"]+)"/)?.[1];
  const type = block.match(/type: "([^"]+)"/)?.[1];
  const watchUrl = block.match(/watchUrl: "([^"]+)"/)?.[1];
  const title = block.match(/title: "([^"]*)"/)?.[1];
  return { id, type, watchUrl, title };
}

function titleFromHtml(html, type) {
  const raw = html.match(/<title>\s*Assistir\s+(.+?)\s+Online\s*<\/title>/is)?.[1];
  if (!raw) return null;
  let title = decode(raw.replace(/\s+/g, ' '));
  if (type === 'Série') {
    title = title.replace(/\s+\[S\d+E\d+\].*$/i, '').trim();
  } else {
    title = title.replace(/\s+-\s+(?:19|20)\d{2}\s*$/i, '').trim();
  }
  if (!title || /not found|não encontrado|error|erro/i.test(title)) return null;
  return title;
}

async function fetchTitle(item) {
  try {
    const response = await fetch(item.watchUrl, { headers: { 'user-agent': 'CineTV Embed Play title sync' } });
    const html = await response.text();
    return { ...item, officialTitle: response.ok ? titleFromHtml(html, item.type) : null, status: response.status };
  } catch (error) {
    return { ...item, officialTitle: null, status: String(error) };
  }
}

const items = blocks.map(parseBlock).filter((item) => item.id && item.watchUrl);
const results = [];
for (let index = 0; index < items.length; index += 8) {
  const batch = await Promise.all(items.slice(index, index + 8).map(fetchTitle));
  results.push(...batch);
  console.log(`consultados ${Math.min(index + 8, items.length)}/${items.length}`);
}

let updated = source;
let changed = 0;
const unresolved = [];
for (const result of results) {
  if (!result.officialTitle || result.officialTitle === result.title) {
    if (!result.officialTitle) unresolved.push(result);
    continue;
  }
  const blockPattern = new RegExp(`(id: "${result.id.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}"[\\s\\S]*?title: )"[^\"]*"`);
  updated = updated.replace(blockPattern, `$1"${result.officialTitle.replaceAll('"', '\\"')}"`);
  changed += 1;
}
await fs.writeFile(catalogPath, updated);
await fs.writeFile(path.join(process.cwd(), 'scripts', 'embedplay-title-sync-report.json'), JSON.stringify({ total: results.length, changed, unresolved }, null, 2) + '\n');
console.log(JSON.stringify({ total: results.length, changed, unresolved: unresolved.length }, null, 2));
