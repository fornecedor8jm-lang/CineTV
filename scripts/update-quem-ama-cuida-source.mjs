import fs from 'node:fs/promises';
import path from 'node:path';

const catalogPath = path.join(process.cwd(), 'lib', 'migrated-catalog.ts');
const source = await fs.readFile(catalogPath, 'utf8');
const data = JSON.parse(await fs.readFile('/home/ubuntu/quem-ama-cuida-pobreflix-s1.json', 'utf8'));
const episodes = data.results.filter((item) => item.status === 200 && item.legendado).map((item) => ({ number: item.number, title: `Capítulo ${item.number}`, watchUrl: item.legendado.replace('https://vidsrc-embed.ru', 'https://vsembed.ru') }));
if (episodes.length !== 20) throw new Error(`Esperados 20 episódios com canal legendado; encontrados ${episodes.length}`);
const episodeSource = episodes.map((episode) => `      { number: ${episode.number}, title: '${episode.title}', watchUrl: '${episode.watchUrl}' },`).join('\n');
const replacement = `  {\n    id: 'xonados-quem-ama-cuida', title: 'Quem Ama Cuida', year: '2026', type: 'Série',\n    genres: ['Novela', 'Drama'], tags: ['Novela', 'Drama'], synopsis: 'Capítulos da primeira temporada de Quem Ama Cuida, organizados a partir da nova fonte de reprodução.',\n    poster: '/posters/quem-ama-cuida.jpg', hero: '/posters/quem-ama-cuida.jpg', seasons: '1 temporada', language: 'Português',\n    imdbRating: undefined, rating: '', watchUrl: '${episodes[0].watchUrl}', watchLabel: 'Assistir episódio', embedPlayId: '', trailerUrl: '', availability: 'Player incorporado', featured: false,\n    seriesSeasons: [{ number: 1, episodes: [\n${episodeSource}\n    ]}],\n  },\n  {\n    id: 'xonados-casa-do-patrao'`;
const pattern = /  \{\n    id: 'xonados-quem-ama-cuida'[\s\S]*?\n  \},\n  \{\n    id: 'xonados-casa-do-patrao'/;
if (!pattern.test(source)) throw new Error('Bloco de Quem Ama Cuida não encontrado');
await fs.writeFile(catalogPath, source.replace(pattern, replacement));
console.log(JSON.stringify({ updated: 'xonados-quem-ama-cuida', episodes: episodes.length, source: episodes[0].watchUrl }, null, 2));
