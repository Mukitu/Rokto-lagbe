'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/Toast'
import AdminLayout from '@/components/admin/AdminLayout'

// Tabs
import DashboardTab from '@/components/admin/tabs/DashboardTab'
import UsersTab from '@/components/admin/tabs/UsersTab'
import RequestsTab from '@/components/admin/tabs/RequestsTab'
import RatingsTab from '@/components/admin/tabs/RatingsTab'
import BlockedTab from '@/components/admin/tabs/BlockedTab'
import AdsenseTab from '@/components/admin/tabs/AdsenseTab'
import AdsterraTab from '@/components/admin/tabs/AdsterraTab'
import BannersTab from '@/components/admin/tabs/BannersTab'
import SettingsTab from '@/components/admin/tabs/SettingsTab'
import BlogsTab from '@/components/admin/tabs/BlogsTab'
import AboutTab from '@/components/admin/tabs/AboutTab'

export default function AdminPage() {
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }
    // Only admins and super admins can access the admin panel
    if (!user.is_super_admin && !user.is_admin) {
      router.push('/')
      return
    }
    setIsChecking(false)
  }, [user, loading, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C0001A]"></div>
          <p className="text-gray-500 font-medium">অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!user || (!user.is_super_admin && !user.is_admin)) return null

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />
      case 'users':
        return <UsersTab showToast={showToast} />
      case 'requests':
        return <RequestsTab />
      case 'ratings':
        return <RatingsTab />
      case 'blocked':
        return <BlockedTab showToast={showToast} />
      case 'adsense':
        return <AdsenseTab showToast={showToast} />
      case 'adsterra':
        return <AdsterraTab showToast={showToast} />
      case 'banners':
        return <BannersTab showToast={showToast} />
      case 'settings':
        return <SettingsTab showToast={showToast} />
      case 'blogs':
        return <BlogsTab showToast={showToast} />
      case 'about':
        return <AboutTab showToast={showToast} />
      default:
        return <DashboardTab />
    }
  }

  return (
    <>
      <AdminLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={user.name || user.phone}
        onLogout={handleLogout}
      >
        {renderTabContent()}
      </AdminLayout>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  )
}
