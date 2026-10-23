import type {Payload} from 'payload';
export type HeadlessTerm={id:number;name:string;slug:string;taxonomy:'topic'|'keyword'};
export function decodeTermName(value:string){const named:Record<string,string>={amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '};return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi,(full,key:string)=>{if(key[0]!=='#')return named[key.toLowerCase()]||full;const code=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):parseInt(key.slice(1),10);return code>0&&code<=0x10ffff?String.fromCodePoint(code):full;});}
export async function fetchHeadlessTerms(base:string):Promise<HeadlessTerm[]>{
 const catalogs=await Promise.all((['topic','keyword'] as const).map(async taxonomy=>{
  const terms:HeadlessTerm[]=[];
  for(let page=1;page<=100;page++){
   const url=new URL(`wp-json/wp/v2/${taxonomy}`,base.endsWith('/')?base:base+'/');url.search=new URLSearchParams({per_page:'100',hide_empty:'false',page:String(page)}).toString();
   const response=await fetch(url,{signal:AbortSignal.timeout(15000),cache:'no-store'});
   if(!response.ok)throw new Error(`Headless ${taxonomy}: HTTP ${response.status}`);
   const data:unknown=await response.json();if(!Array.isArray(data))throw new Error('Formato tassonomia non valido');
   for(const term of data){if(!term||!Number.isInteger(term.id)||typeof term.name!=='string'||typeof term.slug!=='string'||term.taxonomy!==taxonomy)throw new Error('Termine headless non valido');terms.push({id:term.id,name:decodeTermName(term.name),slug:term.slug,taxonomy});}
   const pages=Number(response.headers.get('X-WP-TotalPages'));
   if((pages>0&&page>=pages)||data.length<100)return terms;
  }
  throw new Error('Troppe pagine nel dizionario headless');
 }));return catalogs.flat();
}
let running=false;
export async function syncWatchTerms(payload:Payload){
 if(running)throw new Error('Sincronizzazione già in corso. Riprova tra poco.');running=true;
 try{
  const base=process.env.BRADITIME_API_BASE;if(!base)throw new Error('Headless non configurato');
  // Fetch both complete vocabularies before changing local records.
  const incoming=await fetchHeadlessTerms(base);let created=0,updated=0;
  for(const term of incoming){
   const match=(await payload.find({collection:'watch-terms',where:{or:[{and:[{taxonomy:{equals:term.taxonomy}},{wordpressID:{equals:term.id}}]},{key:{equals:`${term.taxonomy}:${term.slug}`}}]},limit:1,depth:0})).docs[0];
   const data={name:term.name,slug:term.slug,taxonomy:term.taxonomy,source:'wordpress' as const,wordpressID:term.id,syncedAt:new Date().toISOString()};
   if(match){await payload.update({collection:'watch-terms',id:match.id,data,context:{taxonomySync:true}});updated++;}
   else{await payload.create({collection:'watch-terms',data,context:{taxonomySync:true}});created++;}
  }
  return {created,updated,total:incoming.length};
 }finally{running=false;}
}
