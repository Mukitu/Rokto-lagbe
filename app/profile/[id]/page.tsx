'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Rating } from '@/types'
import { getInitials, getAvatarBg, getBloodGroupColor, formatDate } from '@/lib/utils'
import { Star, MapPin, Droplet, Stethoscope, Truck, Phone, ArrowLeft, ShieldCheck, Clock, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { BloodRequest } from '@/types'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  
  const [profile, setProfile] = useState<User | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [incomingRequests, setIncomingRequests] = useState<BloodRequest[]>([])
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([])
  const [donationHistory, setDonationHistory] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'requests' | 'my_requests' | 'history'>('info')

  useEffect(() => {
    async function fetchProfile() {
      if (!params.id) return
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (userError) throw userError
        setProfile(userData)

        // Fetch ratings
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('*, rater:users!rater_id(name, photo_url)')
          .eq('receiver_id', params.id)
          .order('created_at', { ascending: false })
        
        if (ratingsData) setRatings(ratingsData)

        // Fetch user's requests (publicly visible for trust)
        const { data: requestsData } = await supabase
          .from('blood_requests')
          .select('*, requester:users!requester_id(name), donor:users!donor_id(name)')
          .or(`requester_id.eq.${params.id},donor_id.eq.${params.id}`)
          .order('created_at', { ascending: false })

        if (requestsData) {
          setIncomingRequests(requestsData.filter(r => r.donor_id === params.id && r.status === 'pending'))
          setMyRequests(requestsData.filter(r => r.requester_id === params.id))
          setDonationHistory(requestsData.filter(r => r.donor_id === params.id && r.status === 'accepted'))
        }

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [params.id])

  const canSeePhone = () => {
    if (!profile) return false
    if (!profile.hide_phone) return true
    if (!currentUser) return false
    // If hidden, only visible if there's an accepted request between them
    return donationHistory.some(r => r.requester_id === currentUser.id) || 
           myRequests.some(r => r.donor_id === currentUser.id && r.status === 'accepted')
  }

  if (loading) return <div className="text-center py-20">লোড হচ্ছে...</div>
  if (!profile) return <div className="text-center py-20">প্রোফাইল পাওয়া যায়নি</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> পেছনে যান
      </button>

      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#C0001A] to-[#E8001E]"></div>
        
        <div id="adsense-profile" className="w-full flex justify-center py-2" />
        
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 mb-4">
            <div className="relative w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
              {profile.photo_url ? (
                <Image src={profile.photo_url} alt={profile.name} fill className="object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                  style={{ backgroundColor: getAvatarBg(profile.blood_group) }}
                >
                  {getInitials(profile.name)}
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left mb-2">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                {profile.name}
                {profile.is_verified && <ShieldCheck className="w-6 h-6 text-blue-500" title="Verified" />}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-gray-600">
                <MapPin className="w-4 h-4" /> {profile.upazila}, {profile.district}
              </div>
            </div>

            <div className="flex gap-2">
              {canSeePhone() ? (
                <a href={`tel:${profile.phone}`} className="btn-primary flex items-center gap-2">
                  <Phone className="w-4 h-4" /> কল করুন
                </a>
              ) : (
                <div className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  নম্বর হাইড করা
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
            <span className={`badge text-lg px-4 py-1 ${getBloodGroupColor(profile.blood_group)}`}>
              {profile.blood_group}
            </span>
            {profile.is_donor && <span className="badge bg-red-50 text-red-700 border-red-100 text-sm"><Droplet className="w-4 h-4 mr-1"/> রক্তদাতা</span>}
            {profile.is_doctor && <span className="badge bg-green-50 text-green-700 border-green-100 text-sm"><Stethoscope className="w-4 h-4 mr-1"/> ডাক্তার</span>}
            {profile.is_ambulance && <span className="badge bg-orange-50 text-orange-700 border-orange-100 text-sm"><Truck className="w-4 h-4 mr-1"/> অ্যাম্বুলেন্স</span>}
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'info' ? 'border-[#C0001A] text-[#C0001A]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              তথ্য
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'requests' ? 'border-[#C0001A] text-[#C0001A]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              কাছে আসা অনুরোধ ({incomingRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab('my_requests')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'my_requests' ? 'border-[#C0001A] text-[#C0001A]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              করা অনুরোধ ({myRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#C0001A] text-[#C0001A]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              হিস্ট্রি ও রেটিং ({donationHistory.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.total_donations}</div>
                    <div className="text-sm text-gray-500">মোট রক্তদান</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                      {profile.avg_rating.toFixed(1)} <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    </div>
                    <div className="text-sm text-gray-500">{profile.total_ratings} রেটিং</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 mt-1">{profile.last_donation_date ? formatDate(profile.last_donation_date) : 'তথ্য নেই'}</div>
                    <div className="text-sm text-gray-500">শেষ রক্তদান</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 mt-1">{formatDate(profile.created_at)}</div>
                    <div className="text-sm text-gray-500">যুক্ত হয়েছেন</div>
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">সম্পর্কে</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {(profile.is_doctor || profile.is_ambulance) && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">পেশাগত তথ্য</h3>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                      {profile.is_doctor && (
                        <>
                          <p><span className="font-medium text-gray-700">বিশেষত্ব:</span> {profile.doctor_speciality}</p>
                          <p><span className="font-medium text-gray-700">হাসপাতাল:</span> {profile.chamber_address}</p>
                          <p><span className="font-medium text-gray-700">ভিজিট ফি:</span> {profile.visit_fee || 'উল্লেখ নেই'}</p>
                        </>
                      )}
                      {profile.is_ambulance && (
                        <>
                          <p><span className="font-medium text-gray-700">গাড়ির ধরন:</span> {profile.vehicle_type}</p>
                          <p><span className="font-medium text-gray-700">গাড়ির নম্বর:</span> {profile.vehicle_number}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                {incomingRequests.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-8">কোনো অনুরোধ নেই</p>
                ) : (
                  incomingRequests.map(req => (
                    <div key={req.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">রোগী: {req.patient_name}</h4>
                        <span className="text-xs text-gray-400">{formatDate(req.created_at)}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">রক্তের গ্রুপ:</span> {req.blood_group}</p>
                        <p><span className="font-medium">হাসপাতাল:</span> {req.hospital_name}</p>
                        <p><span className="font-medium">রোগ:</span> {req.disease_name}</p>
                        <p><span className="font-medium">বার্তা:</span> {req.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'my_requests' && (
              <div className="space-y-4">
                {myRequests.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-8">কোনো অনুরোধ করেননি</p>
                ) : (
                  myRequests.map(req => (
                    <div key={req.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">ডোনার: {req.donor?.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          req.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status === 'accepted' ? 'গৃহীত' : req.status === 'pending' ? 'অপেক্ষমান' : 'বাতিল'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">রক্তের গ্রুপ:</span> {req.blood_group}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(req.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> রক্তদানের হিস্ট্রি
                  </h3>
                  {donationHistory.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">কোনো রেকর্ড নেই</p>
                  ) : (
                    <div className="space-y-3">
                      {donationHistory.map(req => (
                        <div key={req.id} className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                          <p className="text-sm font-medium text-gray-900">রোগী: {req.patient_name}</p>
                          <p className="text-xs text-gray-500">{formatDate(req.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" /> প্রাপ্ত রেটিং ও মন্তব্য
                  </h3>
                  {ratings.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">কোনো রেটিং নেই</p>
                  ) : (
                    <div className="space-y-4">
                      {ratings.map(rating => (
                        <div key={rating.id} className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 overflow-hidden">
                                {rating.rater?.photo_url ? (
                                  <Image src={rating.rater.photo_url} alt="Rater" width={32} height={32} className="object-cover" />
                                ) : (
                                  rating.rater?.name?.charAt(0) || 'U'
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">{rating.rater?.name || 'অজ্ঞাত ব্যবহারকারী'}</p>
                                <p className="text-xs text-gray-500">{formatDate(rating.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < rating.stars ? 'fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          {rating.comment && <p className="text-gray-700 text-sm mt-2">{rating.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
