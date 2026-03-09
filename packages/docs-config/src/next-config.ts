import type { NextConfig } from 'next';

export interface DocsConfigOptions {
  title: string;
  description?: string;
  logo?: string;
}

export function createDocsConfig(_options: DocsConfigOptions): NextConfig {
  return {
    output: 'export',
    images: { unoptimized: true },
    reactStrictMode: true,
  };
}
