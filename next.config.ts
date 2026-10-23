import { withPayload } from '@payloadcms/next/withPayload';
export default withPayload({
  outputFileTracingIncludes: {
    '/*': [
      // libSQL loads its platform binding dynamically; pnpm keeps it beside the package.
      './node_modules/.pnpm/libsql@*/node_modules/@libsql/**/*',
      './node_modules/.pnpm/@libsql+*/node_modules/@libsql/*/{index.node,package.json}',
    ],
  },
});
