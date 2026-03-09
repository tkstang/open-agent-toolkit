import type { ReactNode } from 'react';

export interface DocsPageProps {
  children?: ReactNode;
}

export function DocsPage({ children }: DocsPageProps) {
  return <>{children}</>;
}
