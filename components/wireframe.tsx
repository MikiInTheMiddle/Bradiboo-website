import Link from 'next/link';
import type { WireBlock, WirePage } from '@/lib/wireframe';

const primary = [
  {label:'Braditriboo',href:'/braditriboo'}, {label:'Guarda',href:'/guarda'},
  {label:'Shop ↗',href:'/shop'},
];

export function WireShell({children}:{children:React.ReactNode}){
  return <><header className="wf-header"><Link href="/" className="wf-logo">BRADIBOO</Link><nav>{primary.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}</nav><Link className="wf-studio" href="/studio">Studio</Link></header>{children}<footer className="wf-footer"><strong>BRADIBOO · STRUCTURE WIREFRAME</strong><nav><Link href="/mappa-sito">Mappa del sito</Link><Link href="/studio">Bradiboo Studio</Link><Link href="/studio/contatti">Contatti</Link></nav><small>Nessun contenuto o scelta visuale è definitivo. I riquadri rappresentano blocchi candidati per il Content Studio.</small></footer></>;
}

function Block({block,index}:{block:WireBlock;index:number}){
  return <section className={`wf-block wf-${block.type}${block.status === 'draft' ? ' wf-draft' : ''}`}><div className="wf-block-label">BLOCK {String(index+1).padStart(2,'0')} · {block.label} · TYPE: {block.type}{block.status === 'draft' ? ' · DRAFT / NON PUBBLICATO' : ''}</div><div className="wf-block-content"><div><h2>{block.title}</h2>{block.note&&<p>{block.note}</p>}</div>{block.items&&<div className="wf-items">{block.items.map(item=><Link href={item.href} key={`${item.href}-${item.label}`}><span className="wf-placeholder" aria-hidden="true"/><strong>{item.label}</strong><small>{item.href}</small></Link>)}</div>}</div></section>;
}

export function WirePageView({page}:{page:WirePage}){
  return <WireShell><main className="wf-main"><div className={`wf-page-meta${page.status === 'draft' ? ' wf-page-draft' : ''}`}><div><span>PAGE TEMPLATE</span><h1>{page.title}</h1>{page.status === 'draft' && <b>DRAFT / NON PUBBLICATA</b>}</div><div><span>ROUTE</span><code>{page.path}</code><p>{page.purpose}</p></div></div>{page.blocks.map((block,index)=><Block block={block} index={index} key={`${block.label}-${index}`}/>)}</main></WireShell>;
}
