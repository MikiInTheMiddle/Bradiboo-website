import { getPayload } from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
const videos=[
 {id:'kxC0C3DmwVs',watchKind:'format' as const,character:'petronilla',keywords:['movimento'] as ('movimento')[]},
 {id:'SS2Xsp6ykxo',watchKind:'breve' as const,character:undefined,keywords:[]},
 {id:'bEz8muyZIlQ',watchKind:'format' as const,character:'nancy',keywords:['arte'] as ('arte')[]},
 {id:'RBTSexoOZKU',watchKind:'format' as const,character:undefined,keywords:['musica'] as ('musica')[]},
];
for(const v of videos){
 const slug=`video-${v.id.toLowerCase()}`;
 const found=await payload.find({collection:'contents',where:{slug:{equals:slug}},limit:1});
 if(found.docs.length)continue;
 const url=`https://www.youtube.com/watch?v=${v.id}`;
 const response=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
 if(!response.ok)throw new Error(`YouTube metadata: ${response.status}`);
 const meta=await response.json();
 const thumbnail=await fetch(meta.thumbnail_url);if(!thumbnail.ok)throw new Error('Thumbnail unavailable');
 const data=Buffer.from(await thumbnail.arrayBuffer());
 const media=await payload.create({collection:'media',data:{alt:meta.title},file:{data,mimetype:'image/jpeg',name:`youtube-${v.id}.jpg`,size:data.length}});
 const cast=v.character?await payload.find({collection:'characters',where:{slug:{equals:v.character}},limit:1}):undefined;
 await payload.create({collection:'contents',data:{title:meta.title,slug,kind:'episodio',watchKind:v.watchKind,url,description:'Video dal canale YouTube Bradiboo. Temi e associazioni editoriali modificabili in Payload.',cover:media.id,characters:cast?.docs.map(c=>c.id)||[],watchKeywords:v.keywords,playbackSource:'youtube',playbackURL:url,_status:'published'}});
 console.log(`Collegato: ${meta.title}`);
}
await payload.destroy();
