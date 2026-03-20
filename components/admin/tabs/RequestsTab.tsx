'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Droplets, 
  Hospital, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  User as UserIcon
} from 'lucide-react'

interface BloodRequest {
  id: string
  requester_id: string
  donor_id: string
  blood_group: string
  patient_name?: string
  hospital_name?: string
  patient_phone?: string
  disease_name?: string
  message?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  requester?: { name: string; phone: string }
  donor?: { name: string; phone: string }
}

interface RequestsTabProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function RequestsTab({ showToast }: RequestsTabProps) {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blood_requests')
      .select(`
        *,
        requester:requester_id(name, phone),
        donor:donor_id(name, phone)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      showToast('অনুরোধ লোড করতে সমস্যা হয়েছে', 'error')
    } else {
      setRequests(data || [])
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
                <th className="px-6 py-4">রোগী ও রক্ত</th>
                <th className="px-6 py-4">হাসপাতাল ও ফোন</th>
                <th className="px-6 py-4">অনুরোধকারী ও দাতা</th>
                <th className="px-6 py-4">স্ট্যাটাস ও তারিখ</th>
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
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">কোনো অনুরোধ পাওয়া যায়নি</td>
                </tr>
              ) : requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <Droplets className="text-red-600" size={16} />
                        {req.blood_group}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">{req.patient_name || 'অজানা রোগী'}</div>
                      <div className="text-xs text-gray-500 italic">{req.disease_name || 'অজানা রোগ'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-gray-700 flex items-center gap-2">
                        <Hospital className="text-gray-400" size={14} />
                        {req.hospital_name || 'অজানা হাসপাতাল'}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 font-mono">
                        <Phone className="text-gray-400" size={14} />
                        {req.patient_phone || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <UserIcon className="text-blue-500" size={12} />
                        </div>
                        <div className="text-xs">
                          <div className="font-bold text-gray-800">{req.requester?.name || 'অজানা'}</div>
                          <div className="text-gray-500 font-mono">{req.requester?.phone || '-'}</div>
                        </div>
                      </div>
                      {req.donor && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                            <UserIcon className="text-green-500" size={12} />
                          </div>
                          <div className="text-xs">
                            <div className="font-bold text-gray-800">{req.donor?.name || 'অজানা'}</div>
                            <div className="text-gray-500 font-mono">{req.donor?.phone || '-'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold uppercase border border-orange-100">
                          <Clock size={10} /> পেন্ডিং
                        </span>
                      )}
                      {req.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-600 text-[10px] font-bold uppercase border border-green-100">
                          <CheckCircle size={10} /> গৃহীত
                        </span>
                      )}
                      {req.status === 'declined' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-bold uppercase border border-red-100">
                          <XCircle size={10} /> বাতিল
                        </span>
                      )}
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(req.created_at).toLocaleDateString('bn-BD')}
                      </div>
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
