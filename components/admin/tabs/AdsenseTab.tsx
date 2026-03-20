'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  DollarSign, 
  Save, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react'

interface AdsenseTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function AdsenseTab({ showToast }: AdsenseTabProps) {
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
      'adsense_publisher_id', 
      'adsense_slot_header', 
      'adsense_slot_infeed', 
      'adsense_slot_profile', 
      'adsense_enabled'
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
      showToast('AdSense সেটিংস সেভ করা হয়েছে', 'success')
    }
    setSaving(false)
  }

  const toggleEnabled = () => {
    setSettings(prev => ({
      ...prev,
      adsense_enabled: prev.adsense_enabled === 'true' ? 'false' : 'true'
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 bg-[#FFF0F2] border-b border-red-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C0001A] text-white rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Google AdSense সেটিংস</h2>
              <p className="text-sm text-gray-500">আপনার সাইটে বিজ্ঞাপন প্রদর্শন নিয়ন্ত্রণ করুন</p>
            </div>
          </div>
          
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-2 transition-all ${settings.adsense_enabled === 'true' ? 'text-green-600' : 'text-gray-400'}`}
          >
            {settings.adsense_enabled === 'true' ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
            <AlertCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm text-blue-700">
              বিজ্ঞাপন দেখানোর জন্য আপনার AdSense পাবলিশার আইডি এবং স্লট আইডিগুলো সঠিকভাবে প্রদান করুন।
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Publisher ID (pub-xxxxxxxxxxxxxxxx)</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all font-mono"
                placeholder="pub-xxxxxxxxxxxxxxxx"
                value={settings.adsense_publisher_id || ''}
                onChange={(e) => setSettings({...settings, adsense_publisher_id: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Header Ad Slot ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all font-mono"
                  placeholder="xxxxxxxxxx"
                  value={settings.adsense_slot_header || ''}
                  onChange={(e) => setSettings({...settings, adsense_slot_header: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">In-feed Ad Slot ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all font-mono"
                  placeholder="xxxxxxxxxx"
                  value={settings.adsense_slot_infeed || ''}
                  onChange={(e) => setSettings({...settings, adsense_slot_infeed: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Page Ad Slot ID</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all font-mono"
                placeholder="xxxxxxxxxx"
                value={settings.adsense_slot_profile || ''}
                onChange={(e) => setSettings({...settings, adsense_slot_profile: e.target.value})}
              />
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
                সেটিংস সেভ করুন
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
