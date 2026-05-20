import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://podeck.vercel.app'),
  title: 'Podeck',
  description: '포켓몬 카드로 덱을 만들고 무한의 탑에 도전하세요.',
  openGraph: {
    title: 'Podeck',
    description: '당신의 포켓몬과 함께 무한의 탑을 공략해 보세요!',
    siteName: 'Podeck',
    images: [
      {
        url: '/images/meta/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Podeck 홈 화면 썸네일',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Podeck',
    description: '당신의 포켓몬과 함께 무한의 탑을 공략해 보세요!',
    images: ['/images/meta/thumbnail.png'],
  },
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
