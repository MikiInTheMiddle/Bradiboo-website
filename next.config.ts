import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';
const httpSQLite = process.env.LIBSQL_HTTP_ONLY === 'true';
const config: NextConfig = {
  // Opt-in for a single CLI release after a successful local type check.
  // This variable is never stored in project settings; Git builds check types.
  typescript: { ignoreBuildErrors: process.env.BRADIBOO_PRECHECKED_BUILD === 'true' },
  transpilePackages: httpSQLite ? ['@libsql/client'] : [],
  webpack(config, { isServer }) {
    if (httpSQLite && isServer) {
      config.resolve.alias = { ...config.resolve.alias, '@libsql/client$': '@libsql/client/web' };
    }
    return config;
  },
  outputFileTracingExcludes: { '/*': ['./media/**/*', './work/**/*', './bradiboo.db*'] },
  outputFileTracingIncludes: httpSQLite ? {} : {
    '/*': [
      './node_modules/.pnpm/libsql@*/node_modules/@libsql/**/*',
      './node_modules/.pnpm/@libsql+*/node_modules/@libsql/*/{index.node,package.json}',
    ],
  },
};
export default withPayload(config);
