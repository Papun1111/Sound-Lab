import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Import the Inter font for a clean, modern look
const inter = Inter({ subsets: ['latin'] });

// Define metadata for Search Engine Optimization (SEO)
export const metadata: Metadata = {
  title: 'SpotTube - Collaborative YouTube Streaming',
  description: 'Watch YouTube videos in sync with friends. Vote on what to watch next in real-time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* The `children` prop will be the content of your individual pages */}
        {children}
      </body>
    </html>
  );
}