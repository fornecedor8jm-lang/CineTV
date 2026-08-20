import fs from 'node:fs/promises';

const base = 'https://www.pobreflixtvon.org/serie/quem-ama-cuida/temporada-1/episodio-';
const results = [];
for (let number = 1; number <= 20; number += 1) {
  const url = `${base}${number}`;
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'CineTV episode link indexer; public link metadata only' }, signal: AbortSignal.timeout(25000) });
    const html = await response.text();
    const urls = [...html.matchAll(/data-url="([^"]+)"/gi)].map((match) => match[1]);
    const date = html.match(/Exibi[^<]*<[^>]*>\s*([^<]+)/i)?.[1]?.trim() ?? '';
    results.push({ number, url, status: response.status, dublado: urls[0] ?? null, legendado: urls[1] ?? null, date });
  } catch (error) {
    results.push({ number, url, status: 0, dublado: null, legendado: null, date: '', error: String(error) });
  }
  console.log(`consultado ${number}/20`);
}
await fs.writeFile('/home/ubuntu/quem-ama-cuida-pobreflix-s1.json', JSON.stringify({ source: 'https://www.pobreflixtvon.org/serie/quem-ama-cuida/temporada-1', total: results.length, results }, null, 2) + '\n');
console.log(JSON.stringify({ total: results.length, withDublado: results.filter((r) => r.dublado).length, withLegendado: results.filter((r) => r.legendado).length }, null, 2));
