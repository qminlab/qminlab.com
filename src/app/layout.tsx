import type { ReactNode } from 'react';

// The <html> shell lives in app/[locale]/layout.tsx so each language page sets its own lang.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
