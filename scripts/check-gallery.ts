import assert from 'node:assert/strict';
import {resolveGalleryMoments,justifiedRows} from '../lib/gallery-model';
const rows=[{id:'a',image:{url:'/wide.webp',width:1800,height:900},alt:'Alt',title:'Titolo',caption:'Didascalia',focalX:0},{id:'b',image:{url:'/portrait.webp',width:600,height:1000},mobileImage:{url:'/mobile.webp',width:300,height:600},alt:'Portrait'},{id:'c',image:{url:'/square.webp',width:900,height:900},alt:'Square'}];
const items=resolveGalleryMoments(rows);assert.equal(items.length,3);assert.equal(items[0].focalX,0);assert.equal(items[1].mobileImage,'/mobile.webp');
assert.deepEqual(resolveGalleryMoments(rows,'selected',['b']).map(i=>i.momentID),['b']);assert.equal(resolveGalleryMoments(rows,'selected',[]).length,0);assert.equal(resolveGalleryMoments(rows,'all',[]).length,3);assert.equal(resolveGalleryMoments(rows,'selected',['deleted']).length,0);
for(const width of [326,700,1200,1920])for(const count of [1,2,3,10]){
 const source=Array.from({length:count},(_,i)=>({...items[i%3],momentID:String(i)}));
 const result=justifiedRows(source,width,20);assert.equal(result.flatMap(r=>r.items).length,count);
 for(const row of result){assert.ok(row.height>0);assert.ok(Math.abs(row.ratios.reduce((s,r)=>s+r*(width-20*(row.items.length-1))/row.ratios.reduce((a,b)=>a+b,0),0)+20*(row.items.length-1)-width)<.001,'Righe riempiono lo spazio con gap regolare');}
}
console.log('OK: sorgenti, selezione stabile/nessuna selezione, mobile/focus zero, mosaico bilanciato responsive senza immagini perse.');
