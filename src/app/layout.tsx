import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Bloomly.io',
    default: 'Bloomly.io - AI-Powered Instagram Content Creator for Boutiques',
  },
  description: 'Create stunning Instagram content for your fashion boutique in minutes with AI-powered design tools, templates, and direct publishing.',
  keywords: [
    'instagram content creator',
    'fashion boutique marketing',
    'ai design tools',
    'social media templates',
    'boutique instagram posts',
    'fashion marketing automation',
    'instagram publishing',
    'boutique social media',
  ],
  authors: [{ name: 'Bloomly.io' }],
  creator: 'Bloomly.io',
  publisher: 'Bloomly.io',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bloomly.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bloomly.io',
    title: 'Bloomly.io - AI-Powered Instagram Content Creator',
    description: 'Create stunning Instagram content for your fashion boutique in minutes with AI-powered design tools.',
    siteName: 'Bloomly.io',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bloomly.io - AI-Powered Instagram Content Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bloomly.io - AI-Powered Instagram Content Creator',
    description: 'Create stunning Instagram content for your fashion boutique in minutes with AI-powered design tools.',
    images: ['/twitter-image.png'],
    creator: '@bloomly',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${montserrat.variable}`}>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="preconnect" href="https://graph.instagram.com" />
        
        {/* PWA configuration */}
        <meta name="application-name" content="Bloomly.io" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bloomly.io" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Splash screens for iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_14_Pro_Max__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash_screens/iPhone_14_Pro__iPhone_13_Pro__iPhone_12_Pro_portrait.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        
        {/* Performance optimization */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                maxWidth: '350px',
              },
              success: {
                style: {
                  background: '#10b981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}