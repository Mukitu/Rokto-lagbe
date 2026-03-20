'use client'

import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Droplets, 
  Star, 
  Ban, 
  DollarSign, 
  Globe, 
  Image as ImageIcon, 
  Settings, 
  Info, 
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react'

interface AdminLayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userName: string
  onLogout: () => void
  children: React.ReactNode
}

export default function AdminLayout({ 
  activeTab, 
  onTabChange, 
  userName, 
  onLogout, 
  children 
}: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'users', label: 'ব্যবহারকারী', icon: Users },
    { id: 'requests', label: 'অনুরোধসমূহ', icon: Droplets },
    { id: 'ratings', label: 'রেটিং', icon: Star },
    { id: 'blocked', label: 'ব্লকড লিস্ট', icon: Ban },
    { id: 'adsense', label: 'AdSense', icon: DollarSign },
    { id: 'adsterra', label: 'Adsterra', icon: Globe },
    { id: 'banners', label: 'ব্যানার', icon: ImageIcon },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
    { id: 'blogs', label: 'ব্লগ', icon: FileText },
    { id: 'about', label: 'সম্পর্কে পেজ', icon: Info },
  ]

  const handleTabChange = (id: string) => {
    onTabChange(id)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#1A0A0A] text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🩸</span>
          <span className="font-bold text-[#C0001A]">Admin Panel</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop) / Mobile Menu */}
      <aside className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-56 bg-[#1A0A0A] text-white min-h-screen fixed md:sticky top-0 z-40 transition-all duration-300
      `}>
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🩸</span>
            <span className="font-bold text-[#C0001A] text-lg">Admin Panel</span>
          </div>
          <hr className="border-gray-800 my-4" />
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-[#C0001A] text-white' 
                    : 'text-gray-400 hover:bg-[#2D0A0F] hover:text-white'}
                `}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto p-6 md:absolute md:bottom-0 md:w-full">
          <hr className="border-gray-800 mb-4" />
          <div className="text-xs text-gray-500 mb-2 truncate">{userName}</div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={18} />
            লগআউট
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
