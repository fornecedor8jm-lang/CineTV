import fs from 'node:fs/promises';
import path from 'node:path';

const input = JSON.parse(await fs.readFile('/home/ubuntu/os-dez-mandamentos-s1.json', 'utf8'));
const chapters = input.results.filter((item) => item.ok && item.iframe);
const episodes = chapters.map((item) => ({
  number: item.number,
  title: `Capítulo ${String(item.number).padStart(2, '0')}`,
  watchUrl: new URL(item.iframe, item.url).href,
}));
const json = JSON.stringify(episodes);
const moduleSource = `import type { CatalogItem } from './data';\n\nexport const osDezMandamentosCatalog: CatalogItem[] = [\n  {\n    id: 'os-dez-mandamentos-1-temporada',\n    title: 'Os Dez Mandamentos — 1ª temporada',\n    year: '2015',\n    type: 'Série',\n    genres: ['Novela', 'Drama', 'História'],\n    tags: ['Novela bíblica', 'Record TV', 'Os Dez Mandamentos'],\n    synopsis: 'Primeira temporada de Os Dez Mandamentos, com capítulos organizados em ordem de exibição.',\n    poster: '/posters/os-dez-mandamentos.jpg',\n    hero: '/posters/os-dez-mandamentos.jpg',\n    seasons: '1 temporada',\n    language: 'Português',\n    imdbRating: undefined,\n    rating: '',\n    watchUrl: ${JSON.stringify(episodes[0]?.watchUrl ?? '')},\n    watchLabel: 'Assistir capítulo',\n    embedPlayId: '',\n    trailerUrl: '',\n    availability: 'Player incorporado',\n    featured: false,\n    seriesSeasons: [{ number: 1, episodes: ${json} }],\n  },\n];\n`;
await fs.writeFile(path.join(process.cwd(), 'lib', 'os-dez-mandamentos.ts'), moduleSource);
console.log(JSON.stringify({ chapters: episodes.length, missing: input.results.filter((item) => !item.ok).map((item) => item.number) }, null, 2));
