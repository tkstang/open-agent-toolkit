import { createSearchConfig } from '@open-agent-toolkit/docs-config';
import { DocsLayout } from '@open-agent-toolkit/docs-theme';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

import './globals.css';
import { source } from '@/lib/source';

const search = createSearchConfig();

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <RootProvider search={search}>
          <DocsLayout
            branding={{
              title: '{{SITE_NAME}}',
              description: '{{SITE_DESCRIPTION}}',
            }}
            tree={source.getPageTree()}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
