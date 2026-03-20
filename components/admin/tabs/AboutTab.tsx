'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Info, 
  Save, 
  User, 
  FileText, 
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react'

interface AboutTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function AboutTab({ showToast }: AboutTabProps) {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
    
    if (error) {
      showToast('এবাউট পেজ সেটিংস লোড করতে সমস্যা হয়েছে', 'error')
    } else {
      const settingsMap: Record<string, string> = {}
      data?.forEach(item => {
        settingsMap[item.key] = item.value
      })
      setSettings(settingsMap)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const keysToSave = [
      'about_photo_url', 
      'about_name', 
      'about_subtitle',
      'about_description', 
      'about_link'
    ]

    const updates = keysToSave.map(key => ({
      key,
      value: settings[key] || ''
    }))

    const { error } = await supabase
      .from('admin_settings')
      .upsert(updates, { onConflict: 'key' })

    if (error) {
      console.error('Error saving settings:', error)
      showToast(`এবাউট পেজ সেটিংস সেভ করতে সমস্যা হয়েছে: ${error.message}`, 'error')
    } else {
      showToast('এবাউট পেজ সেটিংস সেভ করা হয়েছে', 'success')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C0001A]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 bg-[#FFF0F2] border-b border-red-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C0001A] text-white rounded-lg">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">এবাউট পেজ সেটিংস</h2>
              <p className="text-sm text-gray-500">এবাউট পেজের কন্টেন্ট পরিবর্তন করুন</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <ImageIcon size={14} className="text-gray-400" />
                  ফটো ইউআরএল (Photo URL)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                  placeholder="https://example.com/photo.jpg"
                  value={settings.about_photo_url || ''}
                  onChange={(e) => setSettings({...settings, about_photo_url: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  নাম (Name)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                  placeholder="রক্ত লাগবে টিম"
                  value={settings.about_name || ''}
                  onChange={(e) => setSettings({...settings, about_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FileText size={14} className="text-gray-400" />
                  সাবটাইটেল (Subtitle)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                  placeholder="বাংলাদেশের একটি সমন্বিত ইমার্জেন্সি সার্ভিস প্ল্যাটফর্ম"
                  value={settings.about_subtitle || ''}
                  onChange={(e) => setSettings({...settings, about_subtitle: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <ExternalLink size={14} className="text-gray-400" />
                  লিঙ্ক (Link)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                  placeholder="https://facebook.com/roktosetu"
                  value={settings.about_link || ''}
                  onChange={(e) => setSettings({...settings, about_link: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText size={14} className="text-gray-400" />
                  বিবরণ (Description)
                </label>
                <textarea
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="রক্ত লাগবে সম্পর্কে কিছু লিখুন..."
                  value={settings.about_description || ''}
                  onChange={(e) => setSettings({...settings, about_description: e.target.value})}
                />
              </div>

              {settings.about_photo_url && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">ফটো প্রিভিউ</p>
                  <div className="relative aspect-square w-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img 
                      src={settings.about_photo_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#C0001A] text-white rounded-xl font-bold shadow-lg hover:bg-[#A00016] transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Save size={20} />
                এবাউট পেজ সেভ করুন
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
