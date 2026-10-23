import type {ReactNode} from 'react';
import {getPayload} from 'payload';
import config from '@/payload.config';
import {WatchNavigationMenu} from './watch-navigation-menu';
/** Menus follow the same central hierarchy as the page cards. */
export async function WatchNavigation({currentPath,children}:{currentPath:string;children:ReactNode}){
 const payload=await getPayload({config});
 if(currentPath==='/braditriboo'||currentPath.startsWith('/braditriboo/')){
  const characters=await payload.find({collection:'characters',limit:100,depth:0,sort:'id'});
  return <WatchNavigationMenu currentPath={currentPath} children={children} label="Personaggi della Braditriboo" containers={characters.docs.map(character=>({id:character.id,title:character.name,url:`/braditriboo/${character.slug}`,productions:[]}))}/>;
 }
 const [containers,productions]=await Promise.all([
  payload.find({collection:'production-containers',limit:100,depth:0,sort:'id',overrideAccess:false}),
  payload.find({collection:'contents',where:{and:[{recordType:{equals:'production'}},{_status:{equals:'published'}}]},limit:1000,sort:'id',depth:0,overrideAccess:false}),
 ]);
 const entries=containers.docs.filter(c=>c.url&&c.showInExplore!==false).map(c=>({id:c.id,title:c.title,url:c.url!,productions:productions.docs.filter(p=>p.showInExplore!==false&&(typeof p.container==='object'?p.container?.id:p.container)===c.id&&p.url).map(p=>({id:p.id,title:p.title,url:p.url!}))}));
 return <WatchNavigationMenu currentPath={currentPath} children={children} containers={entries}/>;
}
