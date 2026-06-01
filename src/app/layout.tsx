import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/shared/lib/cn';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const mazeSnippet = `
(function (m, a, z, e) {
  var s, t, u, v;
  try {
    t = m.sessionStorage.getItem('maze-us');
  } catch (err) {}

  if (!t) {
    t = new Date().getTime();
    try {
      m.sessionStorage.setItem('maze-us', t);
    } catch (err) {}
  }

  u = document.currentScript || (function () {
    var w = document.getElementsByTagName('script');
    return w[w.length - 1];
  })();
  v = u && u.nonce;

  s = a.createElement('script');
  s.src = z + '?apiKey=' + e;
  s.async = true;
  if (v) s.setAttribute('nonce', v);
  a.getElementsByTagName('head')[0].appendChild(s);
  m.mazeUniversalSnippetApiKey = e;
})(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'c4f0c09d-c9ac-4730-ba8e-b63f05076607');
`;

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
    <html lang="ko" className={cn('font-sans', inter.variable)}>
      <head>
        <Script id="maze-universal-snippet" strategy="afterInteractive">
          {mazeSnippet}
        </Script>
      </head>
      <body className="min-h-screen text-gray-900 antialiased">
        {children} <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
