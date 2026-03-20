'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  Droplets, 
  Stethoscope, 
  Truck, 
  Clock, 
  CheckCircle, 
  Ban 
} from 'lucide-react'

interface User {
  id: string
  name: string
  phone: string
  blood_group: string
  district: string
  created_at: string
}

interface AdminStats {
  total_users: number
  total_donors: number
  total_doctors: number
  total_ambulances: number
  today_requests: number
  accepted_requests: number
  total_blocked: number
  recent_users: Partial<User>[]
}

export default function DashboardTab() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase.rpc('get_admin_stats')
      if (error) {
        console.error('Error fetching stats:', error)
      } else {
        setStats(data)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C0001A]"></div>
      </div>
    )
  }

  const statsCards = [
    { 
      id: 'total_users', 
      label: 'মোট ব্যবহারকারী', 
      value: stats?.total_users || 0, 
      icon: Users, 
      color: 'border-blue-500' 
    },
    { 
      id: 'total_donors', 
      label: 'রক্তদাতা', 
      value: stats?.total_donors || 0, 
      icon: Droplets, 
      color: 'border-red-500' 
    },
    { 
      id: 'total_doctors', 
      label: 'ডাক্তার', 
      value: stats?.total_doctors || 0, 
      icon: Stethoscope, 
      color: 'border-green-500' 
    },
    { 
      id: 'total_ambulances', 
      label: 'অ্যাম্বুলেন্স', 
      value: stats?.total_ambulances || 0, 
      icon: Truck, 
      color: 'border-orange-500' 
    },
    { 
      id: 'today_requests', 
      label: 'আজকের অনুরোধ', 
      value: stats?.today_requests || 0, 
      icon: Clock, 
      color: 'border-purple-500' 
    },
    { 
      id: 'accepted_requests', 
      label: 'গৃহীত অনুরোধ', 
      value: stats?.accepted_requests || 0, 
      icon: CheckCircle, 
      color: 'border-teal-500' 
    },
    { 
      id: 'total_blocked', 
      label: 'ব্লকড লিস্ট', 
      value: stats?.total_blocked || 0, 
      icon: Ban, 
      color: 'border-gray-500' 
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <div 
              key={card.id} 
              className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${card.color} flex items-center justify-between`}
            >
              <div>
                <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                <div className="text-sm text-gray-500 font-medium">{card.label}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Icon size={24} className="text-gray-400" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">সাম্প্রতিক নিবন্ধন</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FFF0F2] text-[#C0001A] font-semibold text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">নাম</th>
                <th className="px-6 py-4">ফোন</th>
                <th className="px-6 py-4">রক্ত</th>
                <th className="px-6 py-4">জেলা</th>
                <th className="px-6 py-4">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recent_users?.map((user, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{user.phone}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#C0001A]">{user.blood_group}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.district}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('bn-BD') : '-'}
                  </td>
                </tr>
              ))}
              {(!stats?.recent_users || stats.recent_users.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">কোনো তথ্য পাওয়া যায়নি</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
