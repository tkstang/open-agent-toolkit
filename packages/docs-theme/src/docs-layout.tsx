import type { ReactNode } from 'react';
import type { BrandingConfig } from './types.js';

export interface DocsLayoutProps {
  branding: BrandingConfig;
  children: ReactNode;
}

export function DocsLayout({ children }: DocsLayoutProps) {
  return <>{children}</>;
}
