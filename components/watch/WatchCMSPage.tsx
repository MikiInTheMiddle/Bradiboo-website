import {PageClouds} from '@/components/page-clouds';
import {WatchModuleFrame} from './WatchModuleFrame';
import {styleWatchModule} from '@/lib/watch-module';
import {pageBackgroundStyle} from '@/lib/background';
import {notFound,redirect} from 'next/navigation';
import {getCMSPage} from '@/lib/cms';
import {getWatchData} from '@/lib/watch-data';
import {WireShell,WireBlocks} from '@/components/wireframe';
import {WatchExperience} from './WatchExperience';
export async function WatchCMSPage({path,selectedSlug}:{path:string;selectedSlug?:string}){
 const [page,data]=await Promise.all([getCMSPage(path),getWatchData()]);if(!page)notFound();if(page.redirectTo)redirect(page.redirectTo);
 const selected=data.items.find(i=>i.slug===selectedSlug)?.id;
 return <WireShell footerOverride={page.footerOverride} currentPath={path}><div className="wf-page-background" data-hero-background={page.backgroundMobileColor?'true':undefined} style={pageBackgroundStyle(page)}><PageClouds settings={page.cloudBackground}/><main className={`watch-page${path.endsWith('/telecomando')?' remote-page':''}`}><h1 className="watch-sr-only">{page.title}</h1>{page.blocks.map((block,index)=>block.type==='watchExperience'||block.type==='zapExperience'?data.items.length>0?<WatchModuleFrame block={block} key={`${index}-${block.type}`}><WatchExperience {...data} {...styleWatchModule(data,block)} remote={block.type==='zapExperience'} catalogTitle={block.title} catalogNote={block.note} initialItemID={selected} showHeading={block.showText!==false} showAudioControl={block.showAudioControl} cardLayout={block.cardLayout}/></WatchModuleFrame>:null:<WireBlocks key={index} blocks={[block]}/>)}</main></div></WireShell>;
}
