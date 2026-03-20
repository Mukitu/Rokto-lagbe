'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Ban, 
  Trash2, 
  CheckCircle, 
  XCircle,
  User as UserIcon,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import BlockModal from '../modals/BlockModal'
import DeleteModal from '../modals/DeleteModal'

interface User {
  id: string
  auth_id: string
  name: string
  phone: string
  district: string
  upazila: string
  photo_url?: string
  blood_group: string
  is_donor: boolean
  is_doctor: boolean
  is_ambulance: boolean
  is_active: boolean
  is_verified: boolean
  is_blocked: boolean
  block_reason?: string
  is_admin: boolean
  is_super_admin: boolean
  total_donations: number
  avg_rating: number
  total_ratings: number
  created_at: string
}

interface UsersTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  currentUser: User | null
}

export default function UsersTab({ showToast, currentUser }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      showToast('ব্যবহারকারী লোড করতে সমস্যা হয়েছে', 'error')
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  const handleBlock = async (reason: string) => {
    if (!selectedUser) return
    
    const { data, error } = await supabase.rpc('admin_block_user', {
      target_user_id: selectedUser.id,
      block_reason_text: reason
    })

    if (error) {
      showToast('ব্যবহারকারী ব্লক করতে সমস্যা হয়েছে', 'error')
    } else {
      showToast(`${selectedUser.name}-কে ব্লক করা হয়েছে`, 'success')
      fetchUsers()
      setIsBlockModalOpen(false)
    }
  }

  const handleUnblock = async (user: User) => {
    const { data, error } = await supabase.rpc('admin_unblock_user', {
      target_user_id: user.id
    })

    if (error) {
      showToast('ব্যবহারকারী আনব্লক করতে সমস্যা হয়েছে', 'error')
    } else {
      showToast(`${user.name}-কে আনব্লক করা হয়েছে`, 'success')
      fetchUsers()
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    
    const { data, error } = await supabase.rpc('admin_delete_user', {
      target_user_id: selectedUser.id
    })

    if (error) {
      showToast('ব্যবহারকারী ডিলিট করতে সমস্যা হয়েছে', 'error')
    } else {
      showToast(`${selectedUser.name}-কে ডিলিট করা হয়েছে`, 'success')
      fetchUsers()
      setIsDeleteModalOpen(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.phone.includes(searchQuery)
    
    if (filterType === 'all') return matchesSearch
    if (filterType === 'donors') return matchesSearch && user.is_donor
    if (filterType === 'doctors') return matchesSearch && user.is_doctor
    if (filterType === 'ambulances') return matchesSearch && user.is_ambulance
    if (filterType === 'blocked') return matchesSearch && user.is_blocked
    if (filterType === 'admins') return matchesSearch && (user.is_admin || user.is_super_admin)
    
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'সবাই' },
            { id: 'donors', label: 'রক্তদাতা' },
            { id: 'doctors', label: 'ডাক্তার' },
            { id: 'ambulances', label: 'অ্যাম্বুলেন্স' },
            { id: 'blocked', label: 'ব্লকড' },
            { id: 'admins', label: 'অ্যাডমিন' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${filterType === type.id 
                  ? 'bg-[#C0001A] text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
              `}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FFF0F2] text-[#C0001A] font-semibold text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ব্যবহারকারী</th>
                <th className="px-6 py-4">রক্তের গ্রুপ</th>
                <th className="px-6 py-4">অবস্থান</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C0001A]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">কোনো ব্যবহারকারী পাওয়া যায়নি</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {user.photo_url ? (
                          <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          {user.name}
                          {user.is_super_admin && <ShieldCheck className="text-red-600" size={14} title="Super Admin" />}
                          {user.is_admin && !user.is_super_admin && <ShieldAlert className="text-orange-500" size={14} title="Admin" />}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-red-50 text-[#C0001A] font-bold text-xs border border-red-100">
                      {user.blood_group}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{user.district}</div>
                    <div className="text-xs text-gray-500">{user.upazila}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {user.is_blocked ? (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold">
                          <XCircle size={12} /> ব্লকড
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
                          <CheckCircle size={12} /> সচল
                        </span>
                      )}
                      <div className="flex gap-1">
                        {user.is_donor && <span className="w-2 h-2 rounded-full bg-red-500" title="রক্তদাতা"></span>}
                        {user.is_doctor && <span className="w-2 h-2 rounded-full bg-green-500" title="ডাক্তার"></span>}
                        {user.is_ambulance && <span className="w-2 h-2 rounded-full bg-orange-500" title="অ্যাম্বুলেন্স"></span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.is_blocked ? (
                        <button
                          onClick={() => handleUnblock(user)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="আনব্লক করুন"
                        >
                          <CheckCircle size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setIsBlockModalOpen(true)
                          }}
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                          title="ব্লক করুন"
                          disabled={user.is_super_admin}
                        >
                          <Ban size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDeleteModalOpen(true)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="ডিলিট করুন"
                        disabled={user.is_super_admin}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleBlock}
        userName={selectedUser?.name || ''}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        userName={selectedUser?.name || ''}
      />
    </div>
  )
}
