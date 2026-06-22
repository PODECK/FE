import type { NextConfig } from 'next';

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  turbopack: {
    rules: {
      '*.svg': {
        condition: {
          query: /[?&]react(?=&|$)/,
        },
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: unknown) => {
      if (typeof rule !== 'object' || rule === null || !('test' in rule)) {
        return false;
      }

      return rule.test instanceof RegExp && rule.test.test('.svg');
    });

    if (fileLoaderRule && typeof fileLoaderRule === 'object') {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /react/,
          use: ['@svgr/webpack'],
        },
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: { not: [/react/] },
        },
      );

      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      ...(supabaseHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseHostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
