import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Podeck',
  description: 'Podeck 프로젝트',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen text-gray-900 antialiased">{children}</body>
    </html>
  );
}
