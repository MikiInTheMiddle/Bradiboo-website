import {getPayload} from 'payload';
import config from '../payload.config';
import {writeFile} from 'node:fs/promises';
const p=await getPayload({config});
const idOf=(v:any)=>v&&typeof v==='object'?v.id:v;
try{
 const docs=(await p.find({collection:'contents',depth:0,limit:1000})).docs;
 await writeFile(`work/backups/production-hierarchy-${Date.now()}.json`,JSON.stringify(docs,null,2));
 const groups=new Map<string,number>();
 for(const [slug,title] of [['serie','Serie'],['miniserie','Miniserie'],['format','Format']]){
  let record=(await p.find({collection:'production-containers',where:{slug:{equals:slug}},limit:1,depth:0})).docs[0];
  if(!record){
   const page=(await p.find({collection:'pages',where:{path:{equals:`/guarda/${slug}`}},depth:0,limit:1})).docs[0];
   const hero=(page?.blocks as any[])?.find(b=>b.blockType==='hero');
   record=await p.create({collection:'production-containers',data:{title,slug,url:`/guarda/${slug}`,description:hero?.note||undefined,cover:idOf(hero?.backgroundImage||hero?.media)||undefined,coverMobile:idOf(hero?.mobileImage)||undefined}});
  }
  groups.set(slug,record.id);
 }
 for(const doc of [...docs].sort((a,b)=>Number(a.kind==='episodio')-Number(b.kind==='episodio'))){
  if(doc.recordType)continue;
  const episode=doc.kind==='episodio';
  const parent=docs.find(d=>d.id===idOf(doc.parent)&&d.id!==doc.id);
  const kind=episode?parent?.kind||'serie':doc.kind;
  await p.update({collection:'contents',id:doc.id,context:{hierarchyMigration:true},data:{recordType:episode?'episode':'production',container:groups.get(kind)||groups.get('format'),...(!episode&&idOf(doc.parent)===doc.id?{parent:null}:{})}});
  console.log(doc.id,doc.title,'→',episode?'episodio':'produzione',kind);
 }
 const after=(await p.find({collection:'contents',depth:0,limit:1000})).docs;
 for(const doc of docs){
  const next=after.find(d=>d.id===doc.id)!;
  for(const key of ['title','slug','cover','coverMobile','url','description','highlight','highlightOrder','playbackURL','watchKind','themeTerms','keywordTerms','characters'] as const){
   if(JSON.stringify(doc[key])!==JSON.stringify(next[key]))throw new Error(`Campo modificato: ${doc.id}.${key}`);
  }
  if(idOf(doc.parent)!==doc.id&&idOf(doc.parent)!==idOf(next.parent))throw new Error('Associazione episodio modificata');
 }
 console.log('OK: ID, metadati editoriali, media, playback e associazioni esistenti conservati.');
}finally{await p.destroy();}
