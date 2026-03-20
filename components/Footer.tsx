import Link from 'next/link'
import { Droplet } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1A0A0A] text-white pt-12 pb-6">
      <div id="adsense-footer" className="max-w-7xl mx-auto px-4 w-full flex justify-center mb-8" />
      <div id="adsterra-footer" className="max-w-7xl mx-auto px-4 w-full flex justify-center mb-8" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-8">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <Droplet className="w-6 h-6 text-[#C0001A] fill-current" />
              <span className="text-2xl font-bold tracking-wide site-name">রক্ত লাগবে</span>
            </Link>
            <p className="text-gray-400 text-sm">রক্ত দিন, জীবন বাঁচান</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">হোম</Link>
            <Link href="/search" className="hover:text-white transition-colors">খুঁজুন</Link>
            <Link href="/about" className="hover:text-white transition-colors">সম্পর্কে</Link>
            <Link href="/register" className="hover:text-white transition-colors">যোগ দিন</Link>
            <Link href="/about" className="hover:text-white transition-colors">যোগাযোগ</Link>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 রক্ত লাগবে — জীবন বাঁচানোর প্ল্যাটফর্ম</p>
          <p>
            তৈরি করেছেন{' '}
            <a 
              href="https://mukituislamnishat.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white font-medium underline underline-offset-2"
            >
              নিশাত
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
