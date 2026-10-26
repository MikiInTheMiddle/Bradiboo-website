'use client';
export default function PublicPageError({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <main className="public-page-error"><img src="/bradiboo-logo.svg" width="173" height="35" alt="Bradiboo"/><h1>Un attimo di pausa</h1><p>Non siamo riusciti a caricare questa pagina. Puoi riprovare tra poco.</p><button type="button" onClick={()=>reset()}>Riprova</button><a href="/">Torna alla home</a></main>;
}
