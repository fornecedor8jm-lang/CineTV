import fs from 'node:fs/promises';

const base = 'https://www.oskaras.com/assistir-os-dez-mandamentos-1-temp-capitulo-';
const total = 177;
const concurrency = 4;
const results = [];

function extractIframe(html) {
  const match = html.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/i);
  return match?.[1] ?? null;
}

async function fetchChapter(number) {
  const url = `${base}${String(number).padStart(2, '0')}/`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'CineTV chapter indexer; public link metadata only' },
        signal: AbortSignal.timeout(25000),
      });
      const html = await response.text();
      return {
        number,
        url,
        status: response.status,
        iframe: response.ok ? extractIframe(html) : null,
        ok: response.ok && Boolean(extractIframe(html)),
      };
    } catch (error) {
      if (attempt === 3) return { number, url, status: 0, iframe: null, ok: false, error: String(error) };
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

let next = 1;
async function worker() {
  while (true) {
    const number = next;
    next += 1;
    if (number > total) return;
    const result = await fetchChapter(number);
    results.push(result);
    if (number % 10 === 0 || number === total) console.log(`consultados ${number}/${total}`);
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
results.sort((a, b) => a.number - b.number);
await fs.writeFile('/home/ubuntu/os-dez-mandamentos-s1.json', JSON.stringify({ source: 'https://www.oskaras.com/novelas-biblicas/os-10-mand-1-temp/', total, results }, null, 2) + '\n');
console.log(JSON.stringify({ total, valid: results.filter((r) => r.ok).length, missing: results.filter((r) => !r.ok).length, iframes: [...new Set(results.filter((r) => r.iframe).map((r) => new URL(r.iframe, r.url).href))].length }, null, 2));
