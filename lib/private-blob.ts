import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types';
import { getStorageFilePath } from '@payloadcms/plugin-cloud-storage/utilities';
import { del, get, put } from '@vercel/blob';
import { getRangeRequestInfo, isXmlMimeType, UPLOAD_CONTENT_SECURITY_POLICY } from 'payload/internal';

const privateBlobAdapter: Adapter = ({ collection, prefix }) => ({
  name: 'bradiboo-private-blob',
  handleUpload: async ({ file, storageFilePath }) => {
    await put(storageFilePath, file.buffer, { access: 'private', contentType: file.mimeType, addRandomSuffix: false, allowOverwrite: true });
  },
  handleDelete: async ({ storageFilePath }) => { await del(storageFilePath); },
  staticHandler: async (req, { doc, params }) => {
    // Payload checks media.read before invoking this handler.
    if (params.filename.includes('/') || params.filename.includes('\\')) return new Response(null, { status: 404 });
    // Authenticated read access returns true, so Payload may skip the lookup.
    if (!doc) doc = (await req.payload.find({ collection: 'media', where: { filename: { equals: params.filename } }, depth: 0, limit: 1, overrideAccess: false, req })).docs[0];
    if (!doc) return new Response(null, { status: 404 });
    const pathname = await getStorageFilePath({ collection, collectionPrefix: prefix, doc, filename: params.filename, req });
    const range = getRangeRequestInfo({ fileSize: Number((doc as { filesize?: number }).filesize), rangeHeader: req.headers.get('range') });
    if (range.type === 'invalid') return new Response(null, { status: range.status, headers: range.headers });
    const result = await get(pathname, { access: 'private', headers: range.type === 'partial' ? { Range: `bytes=${range.rangeStart}-${range.rangeEnd}` } : undefined });
    if (!result || result.statusCode !== 200) return new Response(null, { status: 404 });
    const headers = new Headers(range.headers);
    headers.set('Content-Type', result.blob.contentType);
    headers.set('Content-Disposition', result.blob.contentDisposition);
    headers.set('Cache-Control', 'private, no-store');
    headers.set('X-Content-Type-Options', 'nosniff');
    if (isXmlMimeType(result.blob.contentType)) headers.set('Content-Security-Policy', UPLOAD_CONTENT_SECURITY_POLICY);
    return new Response(result.stream, { status: range.status, headers });
  },
});

export const privateMediaStorage = cloudStoragePlugin({
  enabled: Boolean(process.env.BLOB_STORE_ID),
  alwaysInsertFields: true,
  collections: { media: { adapter: privateBlobAdapter, prefix: 'media' } },
});
