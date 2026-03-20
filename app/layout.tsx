import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SettingsLoader from '@/components/SettingsLoader'

export const metadata: Metadata = {
  title: 'রক্ত লাগবে — রক্ত দিন, জীবন বাঁচান',
  description: 'বাংলাদেশের সেরা রক্তদাতা, ডাক্তার ও অ্যাম্বুলেন্স খোঁজার প্ল্যাটফর্ম',
  keywords: 'রক্ত, blood donor, Bangladesh, ambulance, doctor',
}

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className="flex flex-col min-h-screen">
        <SettingsLoader />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Script
          id="google-maps"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places,geometry`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
