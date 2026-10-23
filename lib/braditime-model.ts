export type BraditimeCard = { id: string; label: string; href: string; image?: string; description?: string };
type Row = { id: number; slug: string; title: string; status?: string; language?: { code?: string }; abstract?: { short?: string }; postVisual?: { cover?: { images?: Record<string, { url?: string }> } }; postTaxonomy?:Record<string,unknown>; postCharacter?: { characterMain?: unknown; characterSecondary?: unknown } };
function safeURL(value: string | undefined) { try { const u = new URL(value || ''); return ['https:', 'http:'].includes(u.protocol) ? u.href : undefined; } catch { return undefined; } }
function characterSlugs(value: unknown): string[] {
 if (Array.isArray(value)) return value.flatMap(characterSlugs);
 if (value && typeof value === 'object') {
  const v = value as Record<string, unknown>;
  return [typeof v.slug === 'string' ? v.slug : '', typeof v.post_name === 'string' ? v.post_name : '', ...characterSlugs(v.nodes)].filter(Boolean);
 }
 return [];
}
export function normalizeActivities(data: unknown, options: { locale: string; limit: number; destination: string; character?: string; characters?: string[]; selectedIDs?: string[]; themes?:string[]; keywords?:string[] }): BraditimeCard[] {
 if (!Array.isArray(data)) throw new Error('Formato API inatteso');
 const destination = safeURL(options.destination);
 if (!destination) throw new Error('Destinazione non configurata');
 return (data as Row[]).filter(row => row && typeof row.slug === 'string' && typeof row.title === 'string')
 .filter((row,index,rows) => (typeof row.id === 'number' || typeof row.id === 'string') && rows.findIndex(other=>String(other.id)===String(row.id))===index)
 .filter(row => (!row.status || row.status === 'publish' || row.status === 'published') && (options.locale === 'all' || row.language?.code === options.locale))
 .filter(row => { const filters=options.characters || (options.character ? [options.character] : []); return !filters.length || filters.some(slug=>[...characterSlugs(row.postCharacter?.characterMain),...characterSlugs(row.postCharacter?.characterSecondary)].includes(slug)); })
 .filter(row => !options.themes?.length||options.themes.some(slug=>characterSlugs(row.postTaxonomy?.tax_topic).includes(slug)))
 .filter(row => !options.keywords?.length||options.keywords.some(slug=>characterSlugs(row.postTaxonomy?.tax_keyword).includes(slug)))
 .filter(row => !options.selectedIDs || options.selectedIDs.includes(String(row.id)))
 .sort((a,b)=>options.selectedIDs ? options.selectedIDs.indexOf(String(a.id))-options.selectedIDs.indexOf(String(b.id)) : 0)
 .slice(0, Math.max(1, Math.min(1000, options.limit)))
 .map(row => ({ id: String(row.id), label: row.title, href: new URL(encodeURIComponent(row.slug), destination.endsWith('/') ? destination : destination + '/').href,
 description: row.abstract?.short?.replace(/<[^>]*>/g, '').slice(0,500), image: safeURL(row.postVisual?.cover?.images?.landscape?.url || row.postVisual?.cover?.images?.square?.url) }));
}
