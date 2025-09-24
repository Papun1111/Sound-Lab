import type { Metadata } from 'next';

import './globals.css';


// Define metadata for Search Engine Optimization (SEO)
export const metadata: Metadata = {
  title: 'Sound-lab',
  description: 'Watch YouTube videos in sync with friends. Vote on what to watch next in real-time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" />
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Bubblegum+Sans&display=swap" rel="stylesheet"/>
      </head>
      <body >
    
        {children}
      </body>
    </html>
  );
}