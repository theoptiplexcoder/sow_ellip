//@ts-check
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js options go here
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js

  // libs/* source files are imported with `.js` extensions (TS "bundler"
  // moduleResolution convention) while the files on disk are `.ts`/`.tsx`.
  // Both bundlers need to be told to resolve `.js` specifiers against the
  // real source extensions.
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  webpack(config) {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    return config;
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env['SENTRY_ORG'],
  project: process.env['SENTRY_PROJECT'],
});
