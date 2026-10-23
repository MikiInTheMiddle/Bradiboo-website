import type {ReactNode} from 'react';
import Link from 'next/link';
import {CookiePreferencesButton} from './cookie-consent';
import {cookiePolicyPath,privacyPolicyURL,socialLinks} from '@/lib/legal';
function SocialIcon({name}:{name:string}){
 const shapes:Record<string,ReactNode>={
  Instagram:<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></>,
  YouTube:<><path d="M21 8a3 3 0 0 0-2-3c-4-.5-10-.5-14 0a3 3 0 0 0-2 3c-.3 2.7-.3 5.3 0 8a3 3 0 0 0 2 3c4 .5 10 .5 14 0a3 3 0 0 0 2-3c.3-2.7.3-5.3 0-8Z"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/></>,
  Facebook:<path d="M14 21v-8h3l.5-4H14V7c0-1 .4-2 2-2h2V2.5c-.7-.2-1.8-.5-3-.5-3 0-5 2-5 5v2H7v4h3v8"/>,
  LinkedIn:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7m4 0v-7m0 3c0-4 5-4 5 0v4"/><circle cx="8" cy="7" r=".8" fill="currentColor" stroke="none"/></>,
  TikTok:<path d="M16 3c.4 2.4 1.8 4 4 4.3v3.1a9 9 0 0 1-4-1.2v7.1a5.8 5.8 0 1 1-5-5.7v3.2a2.6 2.6 0 1 0 1.8 2.5V3Z" fill="currentColor" stroke="none"/>,
 };
 return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{shapes[name]}</svg>;
}
export function FooterLinks(){
 return <><nav className="footer-socials" aria-label="Social">{socialLinks.map(item=><a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} title={item.label}><SocialIcon name={item.label}/></a>)}</nav><div className="footer-contact"><a href="mailto:ciao@bradiboo.com">ciao@bradiboo.com · Scrivici</a></div><nav className="footer-legal" aria-label="Informazioni legali"><Link href={cookiePolicyPath}>Cookie Policy</Link><CookiePreferencesButton/><a href={privacyPolicyURL}>Privacy Policy</a></nav></>;
}

export function FooterNote({text}:{text:string}){return <small>{text.split(/(bradiboo@pec\.it)/g).map((part,index)=>part==='bradiboo@pec.it'?<a key={index} href="mailto:bradiboo@pec.it">{part}</a>:part)}</small>;}
