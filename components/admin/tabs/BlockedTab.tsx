'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Ban, 
  Trash2, 
  Calendar, 
  Search, 
  Plus,
  X
} from 'lucide-react'

interface BlockedPhone {
  phone: string
  reason?: string
  created_at: string
}

interface BlockedTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function BlockedTab({ showToast }: BlockedTabProps) {
  const [blockedPhones, setBlockedPhones] = useState<BlockedPhone[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newReason, setNewReason] = useState('')

  useEffect(() => {
    fetchBlockedPhones()
  }, [])

  async function fetchBlockedPhones() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blocked_phones')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      showToast('ব্লকড লিস্ট লোড করতে সমস্যা হয়েছে', 'error')
    } else {
      setBlockedPhones(data || [])
    }
    setLoading(false)
  }

  const handleAddBlocked = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhone) return

    const { error } = await supabase
      .from('blocked_phones')
      .insert([{ phone: newPhone, reason: newReason }])

    if (error) {
      showToast('ফোন নম্বর ব্লক করতে সমস্যা হয়েছে', 'error')
    } else {
      showToast('ফোন নম্বর ব্লক করা হয়েছে', 'success')
      setNewPhone('')
      setNewReason('')
      setIsAddModalOpen(false)
      fetchBlockedPhones()
    }
  }

  const handleRemoveBlocked = async (phone: string) => {
    const { error } = await supabase
      .from('blocked_phones')
      .delete()
      .eq('phone', phone)

    if (error) {
      showToast('ফোন নম্বর আনব্লক করতে সমস্যা হয়েছে', 'error')
    } else {
      showToast('ফোন নম্বর আনব্লক করা হয়েছে', 'success')
      fetchBlockedPhones()
    }
  }

  const filteredBlocked = blockedPhones.filter(item => 
    item.phone.includes(searchQuery) || 
    (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ফোন নম্বর বা কারণ দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C0001A] text-white rounded-xl font-semibold shadow-md hover:bg-[#A00016] transition-all active:scale-95"
        >
          <Plus size={20} />
          নতুন নম্বর ব্লক করুন
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FFF0F2] text-[#C0001A] font-semibold text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ফোন নম্বর</th>
                <th className="px-6 py-4">ব্লক করার কারণ</th>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C0001A]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredBlocked.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">কোনো ব্লকড নম্বর পাওয়া যায়নি</td>
                </tr>
              ) : filteredBlocked.map((item) => (
                <tr key={item.phone} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-900 font-bold">{item.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.reason || '-'}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleDateString('bn-BD')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveBlocked(item.phone)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="আনব্লক করুন"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Ban className="text-red-600" size={24} />
                নম্বর ব্লক করুন
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddBlocked} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
                  placeholder="01XXXXXXXXX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">কারণ (ঐচ্ছিক)</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all resize-none h-24"
                  placeholder="কেন ব্লক করছেন তা লিখুন..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-semibold bg-[#C0001A] text-white hover:bg-[#A00016] transition-all shadow-md active:scale-95"
                >
                  ব্লক করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
