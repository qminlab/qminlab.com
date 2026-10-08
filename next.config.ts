import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Static HTML export: the site has no server features, so it deploys to Cloudflare Pages as plain files.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // PREVIEW_RELATIVE=1 builds with relative asset paths for the flat preview bundle.
  assetPrefix: process.env.PREVIEW_RELATIVE ? '.' : undefined,
};

export default withNextIntl(nextConfig);
