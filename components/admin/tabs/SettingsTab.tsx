'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  Phone, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react'

interface SettingsTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function SettingsTab({ showToast }: SettingsTabProps) {
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
      'site_name', 
      'site_tagline', 
      'contact_email', 
      'contact_phone', 
      'maintenance_mode'
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
      showToast('জেনারেল সেটিংস সেভ করা হয়েছে', 'success')
    }
    setSaving(false)
  }

  const toggleMaintenance = () => {
    setSettings(prev => ({
      ...prev,
      maintenance_mode: prev.maintenance_mode === 'true' ? 'false' : 'true'
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
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">জেনারেল সেটিংস</h2>
              <p className="text-sm text-gray-500">সাইটের মূল তথ্যগুলো পরিবর্তন করুন</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                সাইটের নাম (Site Name)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                placeholder="রক্ত লাগবে"
                value={settings.site_name || ''}
                onChange={(e) => setSettings({...settings, site_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ট্যাগলাইন (Tagline)</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                placeholder="রক্তের বন্ধনে গড়ি সুন্দর পৃথিবী"
                value={settings.site_tagline || ''}
                onChange={(e) => setSettings({...settings, site_tagline: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  কন্টাক্ট ইমেইল
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                  placeholder="contact@roktosetu.com"
                  value={settings.contact_email || ''}
                  onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  কন্টাক্ট ফোন
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                  placeholder="01XXXXXXXXX"
                  value={settings.contact_phone || ''}
                  onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                />
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-500 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-red-900">মেইনটেন্যান্স মোড (Maintenance Mode)</h4>
                  <p className="text-xs text-red-700">চালু থাকলে ব্যবহারকারীরা সাইটটি ব্যবহার করতে পারবে না।</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleMaintenance}
                className={`flex items-center gap-2 transition-all ${settings.maintenance_mode === 'true' ? 'text-red-600' : 'text-gray-400'}`}
              >
                {settings.maintenance_mode === 'true' ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
              </button>
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
