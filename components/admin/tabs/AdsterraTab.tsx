'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Globe, 
  Save, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react'

interface AdsterraTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function AdsterraTab({ showToast }: AdsterraTabProps) {
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
      'adsterra_header', 
      'adsterra_infeed', 
      'adsterra_footer', 
      'adsterra_popunder', 
      'adsterra_enabled'
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
      showToast('Adsterra সেটিংস সেভ করা হয়েছে', 'success')
    }
    setSaving(false)
  }

  const toggleEnabled = () => {
    setSettings(prev => ({
      ...prev,
      adsterra_enabled: prev.adsterra_enabled === 'true' ? 'false' : 'true'
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
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Adsterra সেটিংস</h2>
              <p className="text-sm text-gray-500">আপনার সাইটে Adsterra বিজ্ঞাপন নিয়ন্ত্রণ করুন</p>
            </div>
          </div>
          
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-2 transition-all ${settings.adsterra_enabled === 'true' ? 'text-green-600' : 'text-gray-400'}`}
          >
            {settings.adsterra_enabled === 'true' ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start gap-3">
            <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm text-orange-700">
              Adsterra বিজ্ঞাপন দেখানোর জন্য আপনার স্ক্রিপ্ট কোডগুলো সঠিকভাবে প্রদান করুন।
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Header Ad Script</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all font-mono text-xs h-24 resize-none"
                placeholder="<script>...</script>"
                value={settings.adsterra_header || ''}
                onChange={(e) => setSettings({...settings, adsterra_header: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">In-feed Ad Script</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all font-mono text-xs h-24 resize-none"
                placeholder="<script>...</script>"
                value={settings.adsterra_infeed || ''}
                onChange={(e) => setSettings({...settings, adsterra_infeed: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Footer Ad Script</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all font-mono text-xs h-24 resize-none"
                placeholder="<script>...</script>"
                value={settings.adsterra_footer || ''}
                onChange={(e) => setSettings({...settings, adsterra_footer: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Popunder Ad Script</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all font-mono text-xs h-24 resize-none"
                placeholder="<script>...</script>"
                value={settings.adsterra_popunder || ''}
                onChange={(e) => setSettings({...settings, adsterra_popunder: e.target.value})}
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
