import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thailand Journal — Perspektiven aus Thailand',
  description: 'Designvorschau eines unabhängigen Thailand-Nachrichtenportals mit fiktiven Beispieldaten.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
