import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Second Chances - Vintage & Pre-loved Fashion',
  description: 'Shop curated, one-of-a-kind pre-loved fashion. Each piece tells a story. Find your next favourite item from our community of thoughtful sellers.',
  keywords: 'thrift, vintage, pre-loved, secondhand, fashion, sustainable',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 64px - 140px)' }}>
            {children}
          </main>
          <Footer />
          <Toaster
            toastOptions={{
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                background: '#FAFAF8',
                border: '1px solid #DEDED1',
                color: '#2C2B26',
              },
            }}
            position="bottom-right"
          />
        </CartProvider>
      </body>
    </html>
  )
}
