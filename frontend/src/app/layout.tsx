import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Navigation from '@/components/layout/navigation';

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
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Navigation />
          <main className="flex-1 w-full flex flex-col relative overflow-hidden">
            {children}
          </main>
        </div>
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
