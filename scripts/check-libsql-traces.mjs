import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
const routes=[
 '.next/server/app/(frontend)/page.js.nft.json',
 '.next/server/app/(frontend)/[...slug]/page.js.nft.json',
 '.next/server/app/(payload)/api/[...slug]/route.js.nft.json',
];
for(const file of routes){
 const {files}=JSON.parse(await readFile(file,'utf8'));
 assert.ok(files.some(f=>f.includes('/libsql/index.js')),`${file}: driver libsql mancante`);
 assert.ok(files.some(f=>f.includes('/@libsql/client/')&&f.endsWith('.js')),`${file}: client libSQL mancante`);
 assert.ok(files.some(f=>f.includes('libsql')&&f.endsWith('.node')),`${file}: binding nativo libSQL mancante`);
 for(const f of files.filter(f=>f.includes('libsql'))){await access(path.resolve(path.dirname(file),f));}
 console.log('Driver, client e binding nativo inclusi:',file);
}
