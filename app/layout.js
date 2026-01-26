import '@/app/globals.css';

export const metadata = {
  metadataBase: new URL('https://pastekit.apsolut.dev'),
  title: 'PasteKit',
  description: 'PasteKit - Clipboard snippet manager by Aleksandar Perisic',
  authors: [{ name: 'Aleksandar Perisic' }],
  openGraph: {
    type: 'website',
    title: 'PasteKit',
    description: 'PasteKit - Clipboard snippet manager by Aleksandar Perisic',
    images: ['/preview.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PasteKit',
    description: 'PasteKit - Clipboard snippet manager by Aleksandar Perisic',
    images: ['/preview.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  themeColor: '#5a834a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Nunito:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
