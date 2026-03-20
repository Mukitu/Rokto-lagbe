'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Droplet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials, getAvatarBg } from '@/lib/utils'
import Image from 'next/image'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navLinks = [
    { name: 'হোম', href: '/' },
    { name: 'খুঁজুন', href: '/search' },
    { name: 'ব্লগ', href: '/blog' },
    { name: 'সম্পর্কে', href: '/about' },
  ]

  if (user) {
    navLinks.push({ name: 'ড্যাশবোর্ড', href: '/dashboard' })
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#8B0000] to-[#C0001A] shadow-md">
      <div id="adsense-header" className="max-w-7xl mx-auto px-4 w-full flex justify-center" />
      <div id="adsterra-header" className="max-w-7xl mx-auto px-4 w-full flex justify-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white">
            <Droplet className="w-6 h-6 fill-current" />
            <span className="text-xl font-bold tracking-wide site-name">রক্ত লাগবে</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-white hover:text-white/80 transition-colors ${
                  pathname === link.href ? 'font-bold underline underline-offset-4' : 'font-medium'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.is_super_admin && (
                  <Link href="/admin" className="text-sm font-bold text-yellow-300 hover:text-yellow-100">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  {user.photo_url ? (
                    <Image src={user.photo_url} alt={user.name} width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: getAvatarBg(user.blood_group) }}
                    >
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span className="text-white font-medium text-sm">{user.name}</span>
                </div>
                <button onClick={signOut} className="text-white/80 hover:text-white text-sm font-medium">
                  লগআউট
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" prefetch={false} className="text-white font-medium hover:text-white/80">
                  লগইন
                </Link>
                <Link href="/register" className="bg-white text-[#C0001A] px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                  রেজিস্ট্রেশন
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#8B0000] border-t border-white/10 animate-slideDown overflow-hidden">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white text-lg ${
                  pathname === link.href ? 'font-bold' : 'font-medium'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="h-px bg-white/20 my-2" />
            
            {user ? (
              <div className="flex flex-col gap-4">
                {user.is_super_admin && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-yellow-300 font-bold">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  {user.photo_url ? (
                    <Image src={user.photo_url} alt={user.name} width={40} height={40} className="rounded-full object-cover" />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: getAvatarBg(user.blood_group) }}
                    >
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                  className="text-left text-white/80 font-medium"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium">
                  লগইন
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-[#C0001A] px-4 py-2 rounded-lg font-bold text-center">
                  রেজিস্ট্রেশন
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
