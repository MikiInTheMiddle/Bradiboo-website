export function youtubeEmbed(value?: string | null): string | undefined {
 try {const u=new URL(value||'');if(!['https:'].includes(u.protocol))return;
 if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(u.hostname))return;
 const id=u.hostname==='youtu.be'?u.pathname.split('/')[1]:u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
 return id&&/^[\w-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:undefined;
 }catch{return;}
}
export function safeLink(value?: string | null) {return value && (/^\/(?!\/)/.test(value)||/^(https?:\/\/|mailto:)/.test(value)) ? value : undefined;}
