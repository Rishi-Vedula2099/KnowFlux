import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Navigation from '@/components/layout/navigation';
import AnimatedBackground from '@/components/layout/AnimatedBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KnowFlux | AI Adaptive RAG Platform',
  description: 'Enterprise Knowledge Intelligence Platform driven by intelligent routing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="ol-root relative min-h-screen w-full overflow-hidden flex">
          <AnimatedBackground />
          <div className="ol-layout relative z-1 flex w-full h-screen overflow-hidden">
            <Navigation />
            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
              {children}
            </main>
          </div>
        </div>
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
