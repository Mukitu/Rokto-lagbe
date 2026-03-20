'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  User as UserIcon,
  ArrowRight
} from 'lucide-react'

interface Rating {
  id: string
  rater_id: string
  receiver_id: string
  request_id?: string
  stars: number
  comment?: string
  created_at: string
  rater?: { name: string; phone: string }
  receiver?: { name: string; phone: string }
}

interface RatingsTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function RatingsTab({ showToast }: RatingsTabProps) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRatings()
  }, [])

  async function fetchRatings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        rater:rater_id(name, phone),
        receiver:receiver_id(name, phone)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      showToast('রেটিং লোড করতে সমস্যা হয়েছে', 'error')
    } else {
      setRatings(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FFF0F2] text-[#C0001A] font-semibold text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">রেটিং দাতা ও গ্রহীতা</th>
                <th className="px-6 py-4">রেটিং ও মন্তব্য</th>
                <th className="px-6 py-4">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C0001A]"></div>
                    </div>
                  </td>
                </tr>
              ) : ratings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">কোনো রেটিং পাওয়া যায়নি</td>
                </tr>
              ) : ratings.map((rating) => (
                <tr key={rating.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                          <UserIcon className="text-blue-500" size={14} />
                        </div>
                        <div className="h-4 w-px bg-gray-200 my-1"></div>
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                          <UserIcon className="text-green-500" size={14} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="text-xs">
                          <div className="font-bold text-gray-800">{rating.rater?.name || 'অজানা'}</div>
                          <div className="text-gray-500 font-mono">{rating.rater?.phone || '-'}</div>
                        </div>
                        <div className="text-xs">
                          <div className="font-bold text-gray-800">{rating.receiver?.name || 'অজানা'}</div>
                          <div className="text-gray-500 font-mono">{rating.receiver?.phone || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={star <= rating.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} 
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 flex items-start gap-2 max-w-xs">
                        <MessageSquare className="text-gray-400 mt-1 flex-shrink-0" size={14} />
                        <p className="italic">{rating.comment || 'কোনো মন্তব্য নেই'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(rating.created_at).toLocaleDateString('bn-BD')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
