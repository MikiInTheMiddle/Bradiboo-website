import type {get} from '@vercel/blob';
type BlobResult = NonNullable<Awaited<ReturnType<typeof get>>>;

/** Call only after authorization, including for conditional/304 requests. */
export function privateMediaResponse(result: BlobResult, range: {status:number;headers:HeadersInit}, csp?: string) {
  const headers = new Headers(result.statusCode === 304 ? undefined : range.headers);
  // The browser may retain bytes but MUST revalidate every use. Shared caches
  // must never store either an editor's preview or an anonymous response.
  headers.set('Cache-Control', 'private, no-cache');
  headers.set('Vercel-CDN-Cache-Control', 'private, no-store');
  headers.set('ETag', result.blob.etag);
  headers.set('X-Content-Type-Options', 'nosniff');
  if (result.statusCode === 304) return new Response(null, {status:304,headers});
  headers.set('Content-Type', result.blob.contentType);
  headers.set('Content-Disposition', result.blob.contentDisposition);
  if (csp) headers.set('Content-Security-Policy', csp);
  return new Response(result.stream, {status:range.status,headers});
}
