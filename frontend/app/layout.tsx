import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TicketPro — Тасалбарын Премиум Платформ',
    template: '%s | TicketPro',
  },
  description: 'Концерт, үзвэр үйлчилгээ, музей, баяр наадам болон шууд тоглолтын тасалбар захиалаарай.',
  keywords: ['тасалбар', 'концерт', 'арга хэмжээ', 'үзвэр', 'Монгол', 'шууд тоглолт', 'наадам'],
  authors: [{ name: 'TicketPro' }],
  openGraph: {
    type: 'website',
    locale: 'mn_MN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'TicketPro',
    title: 'TicketPro — Тасалбарын Премиум Платформ',
    description: 'Концерт, үзвэр үйлчилгээ, музей болон шууд тоглолтын тасалбар захиалаарай.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TicketPro — Тасалбарын Премиум Платформ',
    description: 'Концерт, үзвэр үйлчилгээ, музей болон шууд тоглолтын тасалбар захиалаарай.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="mn" suppressHydrationWarning data-scroll-behavior="smooth" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(15, 23, 42, 0.95)',
                  color: '#fff',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: { primary: '#34d399', secondary: '#0f172a' },
                },
                error: {
                  iconTheme: { primary: '#f87171', secondary: '#0f172a' },
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
