import {publicRead} from '@/lib/public-cache';
import type {ReactNode} from 'react';
import {getPayload} from 'payload';
import config from '@/payload.config';
import {WatchNavigationMenu} from './watch-navigation-menu';
import {cache} from 'react';
const loadNavigationGroups=async()=>{
 const payload=await getPayload({config});
 const [characters,containers,productions]=await Promise.all([
  payload.find({collection:'characters',limit:100,depth:0,sort:'id'}),
  payload.find({collection:'production-containers',limit:100,depth:0,sort:'id',overrideAccess:false}),
  payload.find({collection:'contents',where:{and:[{recordType:{equals:'production'}},{_status:{equals:'published'}}]},limit:1000,sort:'id',depth:0,overrideAccess:false}),
 ]);
 return {
  characters:characters.docs.map(character=>({id:character.id,title:character.name,url:`/braditriboo/${character.slug}`,productions:[]})),
  watch:containers.docs.filter(c=>c.url&&c.showInExplore!==false).map(c=>({id:c.id,title:c.title,url:c.url!,productions:productions.docs.filter(p=>p.showInExplore!==false&&(typeof p.container==='object'?p.container?.id:p.container)===c.id&&p.url).map(p=>({id:p.id,title:p.title,url:p.url!}))})),
 };
};
export const getNavigationGroups=cache(publicRead('navigation-groups',loadNavigationGroups));
/** Desktop and mobile share the same published hierarchy. */
export async function WatchNavigation({currentPath,children}:{currentPath:string;children:ReactNode}){
 const groups=await getNavigationGroups();
 const cast=currentPath==='/braditriboo'||currentPath.startsWith('/braditriboo/');
 return <WatchNavigationMenu currentPath={currentPath} children={children} label={cast?'Personaggi della Braditriboo':'Contenitori di Guarda'} containers={cast?groups.characters:groups.watch}/>;
}
