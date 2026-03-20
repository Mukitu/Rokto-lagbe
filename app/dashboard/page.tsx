'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import { BloodRequest, Rating } from '@/types'
import { formatDate, getBloodGroupColor } from '@/lib/utils'
import { BLOOD_GROUPS, DISTRICTS, DOCTOR_SPECIALITIES, VEHICLE_TYPES } from '@/lib/constants'
import Toast from '@/components/Toast'
import RatingModal from '@/components/RatingModal'
import { CheckCircle, XCircle, Clock, Star, LogOut, Settings, User as UserIcon, Eye, EyeOff, Droplet, LayoutDashboard, History, MessageSquare, Heart, PhoneCall } from 'lucide-react'
import Image from 'next/image'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut, refreshUser } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [activeTab, setActiveTab] = useState<'requests' | 'my_requests' | 'donation_history' | 'received_ratings' | 'settings'>('requests')
  const [incomingRequests, setIncomingRequests] = useState<BloodRequest[]>([])
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([])
  const [donationHistory, setDonationHistory] = useState<BloodRequest[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [givenRatings, setGivenRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedRequestForRating, setSelectedRequestForRating] = useState<BloodRequest | null>(null)
  const [isDonorRating, setIsDonorRating] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: '',
    blood_group: '',
    district: '',
    upazila: '',
    bio: '',
    is_donor: false,
    is_doctor: false,
    is_ambulance: false,
    hide_phone: false,
    doctor_speciality: '',
    chamber_address: '',
    visit_fee: '',
    vehicle_type: '',
    vehicle_number: ''
  })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      setProfileForm({
        name: user.name || '',
        blood_group: user.blood_group || '',
        district: user.district || '',
        upazila: user.upazila || '',
        bio: user.bio || '',
        is_donor: user.is_donor || false,
        is_doctor: user.is_doctor || false,
        is_ambulance: user.is_ambulance || false,
        hide_phone: user.hide_phone || false,
        doctor_speciality: user.doctor_speciality || '',
        chamber_address: user.chamber_address || '',
        visit_fee: user.visit_fee || '',
        vehicle_type: user.vehicle_type || '',
        vehicle_number: user.vehicle_number || ''
      })
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch requests where I am the requester
      let finalMyReqs: any[] = []
      const { data: myReqs, error: myReqsError } = await supabase
        .from('blood_requests')
        .select(`
          *,
          donor:users!blood_requests_donor_id_fkey(name, phone, blood_group),
          ratings(id, stars, comment, rater_id, receiver_id)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      if (myReqsError) {
        console.warn('Join with donor failed, trying simple fetch:', myReqsError)
        // Fallback to simple fetch if join fails
        const { data: simpleMyReqs, error: simpleMyReqsError } = await supabase
          .from('blood_requests')
          .select('*')
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false })
        
        if (simpleMyReqsError) throw simpleMyReqsError
        finalMyReqs = simpleMyReqs || []
      } else {
        finalMyReqs = myReqs || []
      }
      setMyRequests(finalMyReqs.filter(req => req.status !== 'accepted'))

      // Fetch requests where I am the donor
      let finalIncReqs: any[] = []
      const { data: incReqs, error: incReqsError } = await supabase
        .from('blood_requests')
        .select(`
          *,
          requester:users!blood_requests_requester_id_fkey(name, phone),
          ratings(id, stars, comment, rater_id, receiver_id)
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })

      if (incReqsError) {
        console.warn('Join with requester failed, trying simple fetch:', incReqsError)
        const { data: simpleIncReqs, error: simpleIncError } = await supabase
          .from('blood_requests')
          .select('*')
          .eq('donor_id', user.id)
          .order('created_at', { ascending: false })
        
        if (simpleIncError) throw simpleIncError
        finalIncReqs = simpleIncReqs || []
      } else {
        finalIncReqs = incReqs || []
      }
      setIncomingRequests(finalIncReqs.filter(req => req.status === 'pending'))

      // Process History
      const acceptedMyReqs = finalMyReqs.filter(req => req.status === 'accepted')
      const acceptedIncReqs = finalIncReqs.filter(req => req.status === 'accepted')
      
      const combinedHistory = [...acceptedMyReqs, ...acceptedIncReqs].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setDonationHistory(combinedHistory)

      // Fetch ratings received
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*, rater:users!ratings_rater_id_fkey(name)')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
      
      if (ratingsError) {
        console.warn('Join with rater failed, trying simple fetch:', ratingsError)
        const { data: simpleRatings } = await supabase
          .from('ratings')
          .select('*')
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false })
        if (simpleRatings) setRatings(simpleRatings)
      } else if (ratingsData) {
        setRatings(ratingsData)
      }

      // Fetch ratings given
      const { data: givenData, error: givenError } = await supabase
        .from('ratings')
        .select('*, receiver:users!ratings_receiver_id_fkey(name)')
        .eq('rater_id', user.id)
        .order('created_at', { ascending: false })
      
      if (givenError) {
        console.warn('Join with receiver failed, trying simple fetch:', givenError)
        const { data: simpleGiven } = await supabase
          .from('ratings')
          .select('*')
          .eq('rater_id', user.id)
          .order('created_at', { ascending: false })
        if (simpleGiven) setGivenRatings(simpleGiven)
      } else if (givenData) {
        setGivenRatings(givenData)
      }

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      showToast(`তথ্য লোড করতে সমস্যা হয়েছে: ${err.message || 'অজানা ত্রুটি'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestStatus = async (id: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase.from('blood_requests').update({ status }).eq('id', id)
      if (error) throw error
      showToast(`অনুরোধটি ${status === 'accepted' ? 'গ্রহণ' : 'বাতিল'} করা হয়েছে`, 'success')
      fetchDashboardData()
      
      if (status === 'accepted' && user) {
        // Increment total donations
        await supabase.from('users').update({ total_donations: (user.total_donations || 0) + 1 }).eq('id', user.id)
        refreshUser()
      }
    } catch (err) {
      showToast('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে', 'error')
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setUpdatingProfile(true)
    try {
      const { error } = await supabase.from('users').update({
        name: profileForm.name,
        blood_group: profileForm.blood_group,
        district: profileForm.district,
        upazila: profileForm.upazila,
        bio: profileForm.bio || null,
        is_donor: profileForm.is_donor,
        is_doctor: profileForm.is_doctor,
        is_ambulance: profileForm.is_ambulance,
        hide_phone: profileForm.hide_phone,
        doctor_speciality: profileForm.doctor_speciality || null,
        chamber_address: profileForm.chamber_address || null,
        visit_fee: profileForm.visit_fee || null,
        vehicle_type: profileForm.vehicle_type || null,
        vehicle_number: profileForm.vehicle_number || null,
      }).eq('id', user.id)
      
      if (error) throw error
      showToast('প্রোফাইল আপডেট হয়েছে', 'success')
      refreshUser()
    } catch (err) {
      showToast('প্রোফাইল আপডেট করতে সমস্যা হয়েছে', 'error')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword.length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'error')
      return
    }
    setUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
      if (error) throw error
      showToast('পাসওয়ার্ড পরিবর্তন হয়েছে', 'success')
      setPasswordForm({ newPassword: '' })
    } catch (err) {
      showToast('পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে', 'error')
    } finally {
      setUpdatingPassword(false)
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Profile */}
        <div className="w-full md:w-80 shrink-0">
          <div className="card p-6 text-center sticky top-20">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {user.photo_url ? (
                <Image src={user.photo_url} alt={user.name} fill className="rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <UserIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`badge ${getBloodGroupColor(user.blood_group)}`}>{user.blood_group}</span>
              {user.is_verified && <span className="badge bg-blue-50 text-blue-700">✓ যাচাইকৃত</span>}
            </div>
            <p className="text-gray-600 mt-2">{user.phone}</p>
            <p className="text-sm text-gray-500">{user.upazila}, {user.district}</p>

            <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#C0001A]">{user.total_donations}</div>
                <div className="text-xs text-gray-500">রক্তদান</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                  {user.avg_rating.toFixed(1)} <Star className="w-4 h-4 fill-current" />
                </div>
                <div className="text-xs text-gray-500">{user.total_ratings} রেটিং</div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <button 
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'requests' ? 'bg-red-50 text-[#C0001A] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" /> আমার কাছে অনুরোধ
                </div>
                {incomingRequests.length > 0 && <span className="bg-[#C0001A] text-white text-[10px] px-1.5 py-0.5 rounded-full">{incomingRequests.length}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('my_requests')}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'my_requests' ? 'bg-red-50 text-[#C0001A] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" /> আমার করা অনুরোধ
                </div>
                {myRequests.length > 0 && <span className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">{myRequests.length}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('donation_history')}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'donation_history' ? 'bg-red-50 text-[#C0001A] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Droplet className="w-5 h-5" /> রক্তদানের ইতিহাস
                </div>
                {donationHistory.length > 0 && <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{donationHistory.length}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('received_ratings')}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'received_ratings' ? 'bg-red-50 text-[#C0001A] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5" /> রেটিং ও মন্তব্য
                </div>
                <div className="flex gap-1">
                  {ratings.length > 0 && <span className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full" title="প্রাপ্ত">{ratings.length}</span>}
                  {givenRatings.length > 0 && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full" title="প্রদত্ত">{givenRatings.length}</span>}
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-red-50 text-[#C0001A] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <Settings className="w-5 h-5" /> সেটিংস
              </button>
              {(user.is_admin || user.is_super_admin) && (
                <button 
                  onClick={() => router.push('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors mt-4 font-medium"
                >
                  <Settings className="w-5 h-5" /> অ্যাডমিন প্যানেল
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors mt-4"
              >
                <LogOut className="w-5 h-5" /> লগআউট
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">লোড হচ্ছে...</div>
          ) : (
            <>
              {activeTab === 'requests' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">আমার কাছে আসা অনুরোধ</h2>
                  {incomingRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      <p className="text-gray-500">কোনো নতুন অনুরোধ নেই</p>
                    </div>
                  ) : (
                    incomingRequests.map(req => (
                      <div key={req.id} className="card p-5">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                          <div>
                            <h3 className="font-bold text-lg">রোগী: {req.patient_name}</h3>
                            <p className="text-sm text-gray-600">অনুরোধকারী: {req.requester?.name} ({req.requester?.phone})</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(req.created_at)}</p>
                          </div>
                          <span className="badge bg-yellow-100 text-yellow-800">অপেক্ষমান</span>
                        </div>
                        
                          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1 mb-4">
                            <p><span className="font-medium text-[#C0001A]">রক্তের গ্রুপ:</span> {req.blood_group}</p>
                            {req.hospital_name && <p><span className="font-medium">হাসপাতাল:</span> {req.hospital_name}</p>}
                            {req.disease_name && <p><span className="font-medium">রোগ:</span> {req.disease_name}</p>}
                            {req.patient_phone && <p><span className="font-medium">রোগীর ফোন:</span> {req.patient_phone}</p>}
                            {req.message && <p><span className="font-medium">বার্তা:</span> {req.message}</p>}
                          </div>

                        {req.status === 'pending' && (
                          <div className="flex gap-3">
                            <button onClick={() => handleRequestStatus(req.id, 'accepted')} className="flex-1 btn-primary bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 inline mr-2" /> গ্রহণ করুন
                            </button>
                            <button onClick={() => handleRequestStatus(req.id, 'declined')} className="flex-1 btn-outline text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="w-4 h-4 inline mr-2" /> বাতিল করুন
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'my_requests' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">আমার করা অনুরোধ</h2>
                  {myRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      <p className="text-gray-500">আপনি কোনো অনুরোধ করেননি</p>
                    </div>
                  ) : (
                    myRequests.map(req => (
                      <div key={req.id} className="card p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">দাতা: {req.donor?.name}</h3>
                            <p className="text-sm text-gray-600">রোগী: {req.patient_name}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(req.created_at)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`badge ${
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {req.status === 'pending' ? 'অপেক্ষমান' : req.status === 'accepted' ? 'গৃহীত' : 'বাতিল'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1 mb-4">
                          <p><span className="font-medium text-[#C0001A]">রক্তের গ্রুপ:</span> {req.blood_group}</p>
                          {req.hospital_name && <p><span className="font-medium">হাসপাতাল:</span> {req.hospital_name}</p>}
                          {req.disease_name && <p><span className="font-medium">রোগ:</span> {req.disease_name}</p>}
                          {req.patient_phone && <p><span className="font-medium">রোগীর ফোন:</span> {req.patient_phone}</p>}
                          {req.message && <p><span className="font-medium">বার্তা:</span> {req.message}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'donation_history' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">রক্তদানের ইতিহাস</h2>
                    <button onClick={fetchDashboardData} className="text-sm text-[#C0001A] hover:underline flex items-center gap-1">
                      <Clock className="w-4 h-4" /> রিফ্রেশ করুন
                    </button>
                  </div>
                  {donationHistory.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      <p className="text-gray-500">এখনও কোনো রক্তদানের রেকর্ড নেই</p>
                    </div>
                  ) : (
                    donationHistory.map(req => {
                      const isDonor = req.donor_id === user.id;
                      const otherParty = isDonor ? req.requester : req.donor;
                      const otherPartyLabel = isDonor ? 'অনুরোধকারী' : 'দাতা';
                      const isRated = isDonor ? req.is_donor_rated : req.is_requester_rated;

                      return (
                        <div key={req.id} className="card p-5 border-l-4 border-l-[#C0001A]">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">রোগী: {req.patient_name}</h3>
                              <p className="text-sm text-gray-600">{otherPartyLabel}: {otherParty?.name || 'অজানা'}</p>
                              <p className="text-sm text-gray-600">হাসপাতাল: {req.hospital_name}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(req.created_at)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">সম্পন্ন</span>
                              <button 
                                onClick={() => {
                                  setSelectedRequestForRating(req)
                                  setIsDonorRating(isDonor)
                                  setRatingModalOpen(true)
                                }}
                                className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded hover:bg-yellow-200 transition-colors"
                              >
                                {isRated ? 'রেটিং পরিবর্তন' : 'রেটিং দিন'}
                              </button>
                              
                              {otherParty?.phone && (
                                <a href={`tel:${otherParty.phone}`} className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded hover:bg-green-200 transition-colors flex items-center gap-1">
                                  <PhoneCall className="w-3 h-3" /> কল করুন
                                </a>
                              )}

                              {req.ratings && Array.isArray(req.ratings) && (
                                <div className="flex flex-col items-end gap-1">
                                  {req.ratings.find((r: any) => r.receiver_id === user.id) && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-500">প্রাপ্ত:</span>
                                      <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => {
                                          const r = (req.ratings as any).find((r: any) => r.receiver_id === user.id);
                                          return (
                                            <Star key={i} className={`w-3 h-3 ${i < r.stars ? 'fill-current' : 'text-gray-300'}`} />
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  {req.ratings.find((r: any) => r.rater_id === user.id) && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-500">প্রদত্ত:</span>
                                      <div className="flex text-blue-500">
                                        {[...Array(5)].map((_, i) => {
                                          const r = (req.ratings as any).find((r: any) => r.rater_id === user.id);
                                          return (
                                            <Star key={i} className={`w-3 h-3 ${i < r.stars ? 'fill-current' : 'text-gray-300'}`} />
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {req.ratings && Array.isArray(req.ratings) && req.ratings.find((r: any) => r.receiver_id === user.id) && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded text-xs italic text-gray-700">
                              "{ (req.ratings as any).find((r: any) => r.receiver_id === user.id).comment }"
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'received_ratings' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">রেটিং ও মন্তব্য</h2>
                    <button onClick={fetchDashboardData} className="text-sm text-[#C0001A] hover:underline flex items-center gap-1">
                      <Clock className="w-4 h-4" /> রিফ্রেশ করুন
                    </button>
                  </div>
                    {ratings.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">এখনও কোনো রেটিং পাননি</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ratings.map(rating => (
                          <div key={rating.id} className="card p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < rating.stars ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-sm font-bold text-gray-700">{rating.stars}.0</span>
                            </div>
                            {rating.comment && (
                              <p className="text-gray-700 text-sm italic mb-3">"{rating.comment}"</p>
                            )}
                            <div className="flex justify-between items-end">
                              <p className="text-xs text-gray-500">- {rating.rater?.name || 'অজানা ব্যবহারকারী'} • {formatDate(rating.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  
                  <div className="pt-8 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">আপনার দেওয়া রেটিং</h2>
                    {givenRatings.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">আপনি এখনও কাউকে রেটিং দেননি</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {givenRatings.map(rating => (
                          <div key={rating.id} className="card p-5 border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < rating.stars ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-sm font-bold text-gray-700">{rating.stars}.0</span>
                            </div>
                            {rating.comment && (
                              <p className="text-gray-700 text-sm italic mb-3">"{rating.comment}"</p>
                            )}
                            <div className="flex justify-between items-end">
                              <p className="text-xs text-gray-500">কাকে: {rating.receiver?.name || 'অজানা'} • {formatDate(rating.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div className="card p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">প্রোফাইল আপডেট করুন</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">আপনার নাম *</label>
                          <input type="text" required className="input-field" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">রক্তের গ্রুপ *</label>
                          <select required className="input-field" value={profileForm.blood_group} onChange={e => setProfileForm({...profileForm, blood_group: e.target.value})}>
                            <option value="">নির্বাচন করুন</option>
                            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">জেলা *</label>
                          <select required className="input-field" value={profileForm.district} onChange={e => setProfileForm({...profileForm, district: e.target.value})}>
                            <option value="">নির্বাচন করুন</option>
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">উপজেলা/থানা *</label>
                          <input type="text" required className="input-field" value={profileForm.upazila} onChange={e => setProfileForm({...profileForm, upazila: e.target.value})} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">আপনার সম্পর্কে (Bio)</label>
                        <textarea className="input-field" rows={3} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} placeholder="আপনার সম্পর্কে কিছু লিখুন..."></textarea>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
                        <h3 className="font-bold text-gray-900 mb-3">আপনার সেবাসমূহ</h3>
                        
                        <label className="flex items-center gap-3 mb-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" className="w-5 h-5 text-[#C0001A] rounded focus:ring-[#C0001A]" checked={profileForm.hide_phone} onChange={e => setProfileForm({...profileForm, hide_phone: e.target.checked})} />
                          <span className="font-medium text-gray-800">আমার ফোন নম্বর হাইড রাখুন (অনুরোধ গ্রহণ করলে দেখা যাবে)</span>
                        </label>

                        <label className="flex items-center gap-3 mb-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" className="w-5 h-5 text-[#C0001A] rounded focus:ring-[#C0001A]" checked={profileForm.is_donor} onChange={e => setProfileForm({...profileForm, is_donor: e.target.checked})} />
                          <span className="font-medium text-gray-800">আমি রক্তদান / গ্রহণ করতে ইচ্ছুক</span>
                        </label>

                        <label className="flex items-center gap-3 mb-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" className="w-5 h-5 text-[#C0001A] rounded focus:ring-[#C0001A]" checked={profileForm.is_doctor} onChange={e => setProfileForm({...profileForm, is_doctor: e.target.checked})} />
                          <span className="font-medium text-gray-800">আমি একজন ডাক্তার</span>
                        </label>
                        {profileForm.is_doctor && (
                          <div className="pl-8 pr-2 pb-2 space-y-3">
                            <select className="input-field text-sm" value={profileForm.doctor_speciality} onChange={e => setProfileForm({...profileForm, doctor_speciality: e.target.value})}>
                              <option value="">বিশেষত্ব নির্বাচন করুন</option>
                              {DOCTOR_SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <input type="text" placeholder="হাসপাতাল / চেম্বারের নাম" className="input-field text-sm" value={profileForm.chamber_address} onChange={e => setProfileForm({...profileForm, chamber_address: e.target.value})} />
                            <input type="text" placeholder="ভিজিট ফি (যেমন: ৫০০ টাকা)" className="input-field text-sm" value={profileForm.visit_fee} onChange={e => setProfileForm({...profileForm, visit_fee: e.target.value})} />
                          </div>
                        )}

                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" className="w-5 h-5 text-[#C0001A] rounded focus:ring-[#C0001A]" checked={profileForm.is_ambulance} onChange={e => setProfileForm({...profileForm, is_ambulance: e.target.checked})} />
                          <span className="font-medium text-gray-800">আমার অ্যাম্বুলেন্স আছে</span>
                        </label>
                        {profileForm.is_ambulance && (
                          <div className="pl-8 pr-2 pt-2 pb-2 space-y-3">
                            <select className="input-field text-sm" value={profileForm.vehicle_type} onChange={e => setProfileForm({...profileForm, vehicle_type: e.target.value})}>
                              <option value="">গাড়ির ধরন নির্বাচন করুন</option>
                              {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <input type="text" placeholder="অ্যাম্বুলেন্স নম্বর (যেমন: ঢাকা মেট্রো-ছ ১১-১১১১)" className="input-field text-sm" value={profileForm.vehicle_number} onChange={e => setProfileForm({...profileForm, vehicle_number: e.target.value})} />
                          </div>
                        )}
                      </div>

                      <button type="submit" disabled={updatingProfile} className="btn-primary w-full mt-4">
                        {updatingProfile ? 'আপডেট হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
                      </button>
                    </form>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">পাসওয়ার্ড পরিবর্তন করুন</h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            minLength={6} 
                            className="input-field pr-10" 
                            value={passwordForm.newPassword} 
                            onChange={e => setPasswordForm({ newPassword: e.target.value })} 
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <button type="submit" disabled={updatingPassword} className="btn-primary w-full">
                        {updatingPassword ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <RatingModal 
        isOpen={ratingModalOpen}
        receiverId={isDonorRating ? (selectedRequestForRating?.requester_id || '') : (selectedRequestForRating?.donor_id || '')}
        requestId={selectedRequestForRating?.id || ''}
        currentUser={user}
        isDonorRating={isDonorRating}
        onClose={() => setRatingModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData()
        }}
        showToast={showToast}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
