'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  ImageIcon, 
  Save, 
  Link as LinkIcon, 
  Type, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react'

interface BannersTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function BannersTab({ showToast }: BannersTabProps) {
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
      showToast('সেটিংস লোড করতে সমস্যা হয়েছে', 'error')
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
      'banner1_image', 'banner1_link', 'banner1_alt', 'banner1_enabled',
      'banner2_image', 'banner2_link', 'banner2_alt', 'banner2_enabled',
      'banner3_image', 'banner3_link', 'banner3_alt', 'banner3_enabled'
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
      showToast(`সেটিংস সেভ করতে সমস্যা হয়েছে: ${error.message}`, 'error')
    } else {
      showToast('ব্যানার সেটিংস সেভ করা হয়েছে', 'success')
    }
    setSaving(false)
  }

  const toggleBanner = (num: number) => {
    const key = `banner${num}_enabled`
    setSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true'
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C0001A]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSave} className="space-y-6">
        {[1, 2, 3].map((num) => (
          <div key={num} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 bg-[#FFF0F2] border-b border-red-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C0001A] text-white rounded-lg">
                  <ImageIcon size={20} />
                </div>
                <h3 className="font-bold text-gray-900">ব্যানার {num}</h3>
              </div>
              
              <button
                type="button"
                onClick={() => toggleBanner(num)}
                className={`flex items-center gap-2 transition-all ${settings[`banner${num}_enabled`] === 'true' ? 'text-green-600' : 'text-gray-400'}`}
              >
                {settings[`banner${num}_enabled`] === 'true' ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <ImageIcon size={14} className="text-gray-400" />
                    ইমেজ ইউআরএল (Image URL)
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all text-sm"
                    placeholder="https://example.com/banner.jpg"
                    value={settings[`banner${num}_image`] || ''}
                    onChange={(e) => setSettings({...settings, [`banner${num}_image`]: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <LinkIcon size={14} className="text-gray-400" />
                    লিঙ্ক (Link)
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all text-sm"
                    placeholder="https://example.com"
                    value={settings[`banner${num}_link`] || ''}
                    onChange={(e) => setSettings({...settings, [`banner${num}_link`]: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <Type size={14} className="text-gray-400" />
                    অল্ট টেক্সট (Alt Text)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all text-sm"
                    placeholder="ব্যানারের বর্ণনা"
                    value={settings[`banner${num}_alt`] || ''}
                    onChange={(e) => setSettings({...settings, [`banner${num}_alt`]: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden min-h-[150px]">
                {settings[`banner${num}_image`] ? (
                  <img 
                    src={settings[`banner${num}_image`]} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x150?text=Invalid+Image+URL'
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">ইমেজ প্রিভিউ এখানে দেখা যাবে</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

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
              সব ব্যানার সেভ করুন
            </>
          )}
        </button>
      </form>
    </div>
  )
}
