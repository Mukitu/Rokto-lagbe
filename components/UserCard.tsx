'use client'
import { NearbyUser, User } from '@/types'
import { getInitials, getAvatarBg, getBloodGroupColor, formatDistance } from '@/lib/utils'
import Image from 'next/image'
import { Phone, Send, Map, User as UserIcon, Star, MapPin, Droplet, Stethoscope, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserCardProps {
  user: NearbyUser
  currentUser?: User | null
  onRequest?: (user: NearbyUser) => void
  onShowRoute?: (lat: number, lng: number, name: string) => void
  showToast?: (msg: string, type: 'success'|'error'|'info') => void
}

export default function UserCard({ user, currentUser, onRequest, onShowRoute, showToast }: UserCardProps) {
  const router = useRouter()

  const handleCall = () => {
    if (!currentUser) {
      showToast?.('এই সুবিধা পেতে লগইন করুন', 'error')
      router.push('/login')
      return
    }
    if (user.hide_phone) {
      showToast?.('এই ব্যবহারকারীর নম্বর হাইড করা আছে। অনুরোধ পাঠান।', 'info')
      return
    }
    window.location.href = `tel:${user.phone}`
  }

  const handleRequest = () => {
    if (!currentUser) {
      showToast?.('এই সুবিধা পেতে লগইন করুন', 'error')
      router.push('/login')
      return
    }
    onRequest?.(user)
  }

  return (
    <div className="card-hover p-4 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        {user.photo_url ? (
          <Image src={user.photo_url} alt={user.name} width={64} height={64} className="rounded-full object-cover shrink-0" />
        ) : (
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ backgroundColor: getAvatarBg(user.blood_group) }}
          >
            {getInitials(user.name)}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-900 truncate">{user.name}</h3>
            <span className={`badge shrink-0 ${getBloodGroupColor(user.blood_group)}`}>
              {user.blood_group}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1 mb-2">
            {user.is_donor && <span className="badge bg-red-50 text-red-700 border-red-100"><Droplet className="w-3 h-3 mr-1"/> রক্তদাতা</span>}
            {user.is_doctor && <span className="badge bg-green-50 text-green-700 border-green-100"><Stethoscope className="w-3 h-3 mr-1"/> ডাক্তার</span>}
            {user.is_ambulance && <span className="badge bg-orange-50 text-orange-700 border-orange-100"><Truck className="w-3 h-3 mr-1"/> অ্যাম্বুলেন্স</span>}
            {user.is_verified && <span className="badge bg-blue-50 text-blue-700 border-blue-100">✓ যাচাইকৃত</span>}
          </div>
          
          <div className="text-sm text-gray-600 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{user.upazila}, {user.district}</span>
            </div>
            {user.distance_km !== undefined && (
              <div className="text-[#C0001A] font-medium">
                📏 {formatDistance(user.distance_km)}
              </div>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-gray-500">
                <Droplet className="w-4 h-4" /> {user.total_donations} বার
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" /> {user.avg_rating.toFixed(1)} ({user.total_ratings})
              </span>
            </div>
          </div>
        </div>
      </div>

      {user.bio && (
        <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-lg">
          {user.bio}
        </p>
      )}

      {(user.is_doctor || user.is_ambulance) && (
        <div className="text-sm bg-gray-50 p-2 rounded-lg flex flex-col gap-1">
          {user.is_doctor && (
            <div><span className="font-semibold text-gray-700">বিশেষত্ব:</span> {user.doctor_speciality} • <span className="font-semibold text-gray-700">ফি:</span> {user.visit_fee || 'উল্লেখ নেই'}</div>
          )}
          {user.is_ambulance && (
            <div><span className="font-semibold text-gray-700">গাড়ি:</span> {user.vehicle_type}</div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-2 pt-4 border-t border-gray-100">
        <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-xl font-medium transition-colors">
          <Phone className="w-4 h-4" /> কল
        </button>
        {user.is_donor && (
          <button onClick={handleRequest} className="flex-1 flex items-center justify-center gap-2 bg-[#FFF0F2] hover:bg-[#FFE0E5] text-[#C0001A] px-3 py-2 rounded-xl font-medium transition-colors">
            <Send className="w-4 h-4" /> অনুরোধ
          </button>
        )}
        {user.lat && user.lng && onShowRoute && (
          <button onClick={() => onShowRoute(user.lat!, user.lng!, user.name)} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl font-medium transition-colors">
            <Map className="w-4 h-4" /> রুট
          </button>
        )}
        <button onClick={() => router.push(`/profile/${user.id}`)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
          <UserIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
