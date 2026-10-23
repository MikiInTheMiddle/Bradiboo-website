'use client';
import {createContext,useContext,useEffect,useRef,useState,type IframeHTMLAttributes,type ReactNode} from 'react';
import {cookieIntroduction,cookiePreferencesIntroduction,cookiePolicyPath,privacyPolicyURL} from '@/lib/legal';
const storageKey='bradiboo-consent-v1';
type Consent={necessary:true;analytics:boolean;externalMedia:boolean;savedAt:number};
const Context=createContext({externalMedia:false,open:()=>{}});
export function CookiePreferencesButton(){const {open}=useContext(Context);return <button type="button" onClick={open}>Preferenze cookie</button>;}
export function CookieConsent({children}:{children:ReactNode}){
 const [consent,setConsent]=useState<Consent>();const [ready,setReady]=useState(false);
 const [analytics,setAnalytics]=useState(false);const [externalMedia,setExternalMedia]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.necessary===true&&typeof saved.analytics==='boolean'&&typeof saved.externalMedia==='boolean'&&Date.now()-saved.savedAt<180*86400000){setConsent(saved);setAnalytics(saved.analytics);setExternalMedia(saved.externalMedia);}}catch{}
  setReady(true);
 },[]);
 const open=()=>{setAnalytics(consent?.analytics??false);setExternalMedia(consent?.externalMedia??false);dialog.current?.showModal();};
 const save=(analysis:boolean,media:boolean)=>{
  const next:Consent={necessary:true,analytics:analysis,externalMedia:media,savedAt:Date.now()};
  try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{}
  setConsent(next);setAnalytics(analysis);setExternalMedia(media);dialog.current?.close();
  window.dispatchEvent(new CustomEvent('bradiboo:consent',{detail:next}));
 };
 return <Context.Provider value={{externalMedia:consent?.externalMedia??false,open}}>{children}
  {ready&&!consent&&<section className="cookie-banner" aria-labelledby="cookie-banner-title"><h2 id="cookie-banner-title">Questo sito web utilizza i cookie</h2><p>{cookieIntroduction}</p><p><a href={cookiePolicyPath}>Cookie Policy</a> · <a href={privacyPolicyURL}>Privacy Policy</a></p><div className="cookie-actions"><button type="button" onClick={()=>save(true,true)}>Accetta tutto</button><button type="button" onClick={()=>save(false,false)}>Rifiuta tutto</button><button type="button" onClick={open}>Gestisci preferenze</button></div></section>}
  <dialog ref={dialog} className="cookie-preferences" aria-labelledby="cookie-preferences-title"><div className="cookie-dialog-heading"><h2 id="cookie-preferences-title">Gestisci preferenze cookie</h2><button type="button" aria-label="Chiudi preferenze cookie" onClick={()=>dialog.current?.close()}>×</button></div><p>{cookieIntroduction} {cookiePreferencesIntroduction}</p><fieldset><legend>Cookie strettamente necessari</legend><label><input type="checkbox" checked disabled/> Sempre attivi</label><p>Memorizzano le preferenze e permettono il funzionamento del sito.</p></fieldset><fieldset><legend>Analitici</legend><label><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)}/> Consenti cookie analitici</label><p>Permettono di capire come viene utilizzato il sito e migliorare i contenuti.</p></fieldset><fieldset><legend>Video e contenuti esterni</legend><label><input type="checkbox" checked={externalMedia} onChange={e=>setExternalMedia(e.target.checked)}/> Consenti il caricamento dei video YouTube</label><p>I video incorporati si collegano a YouTube solo dopo il consenso.</p></fieldset><p>Per maggiori informazioni puoi <a href="mailto:ciao@bradiboo.com">contattarci</a> o leggere la <a href={cookiePolicyPath}>Cookie Policy</a>.</p><div className="cookie-actions"><button type="button" onClick={()=>save(true,true)}>Accetta tutto</button><button type="button" onClick={()=>save(false,false)}>Rifiuta tutto</button><button type="button" onClick={()=>save(analytics,externalMedia)}>Accetta selezione corrente</button></div></dialog>
 </Context.Provider>;
}
export function ConsentVideo(props:IframeHTMLAttributes<HTMLIFrameElement>){
 const {externalMedia,open}=useContext(Context);
 return externalMedia?<iframe {...props}/>:<div className="consent-video"><p>Per vedere il video, abilita i contenuti esterni nelle preferenze cookie.</p><button type="button" onClick={open}>Gestisci preferenze</button></div>;
}
