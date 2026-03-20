'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Map as MapIcon, List, Filter } from 'lucide-react'
import { BLOOD_GROUPS, DISTRICTS, DOCTOR_SPECIALITIES, VEHICLE_TYPES } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { NearbyUser, SearchFilters } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import UserCard from '@/components/UserCard'
import GoogleMap from '@/components/GoogleMap'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import RequestModal from '@/components/RequestModal'
import Toast from '@/components/Toast'

function SearchContent() {
  const searchParams = useSearchParams()
  const { user: currentUser } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [filters, setFilters] = useState<SearchFilters>({
    type: (searchParams.get('type') as any) || 'blood',
    blood_group: searchParams.get('blood') || '',
    district: searchParams.get('district') || '',
    upazila: '',
    speciality: '',
    vehicle_type: '',
    radius_km: 10
  })

  const [results, setResults] = useState<NearbyUser[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  
  const [selectedDonor, setSelectedDonor] = useState<NearbyUser | null>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [routeTarget, setRouteTarget] = useState<{lat: number, lng: number, name: string} | null>(null)

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLocation(loc)
          setLoading(false)
          return loc
        },
        () => {
          showToast('লোকেশন পাওয়া যায়নি। ডিফল্ট লোকেশন ব্যবহার করা হচ্ছে।', 'info')
          const loc = { lat: 23.6850, lng: 90.3563 }
          setUserLocation(loc)
          setLoading(false)
          return loc
        },
        { timeout: 10000 }
      )
    } else {
      showToast('আপনার ব্রাউজার লোকেশন সাপোর্ট করে না।', 'error')
    }
  }

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (filters.type === 'blood' && filters.blood_group && filters.district) {
      handleSearch()
    } else if (filters.type !== 'blood' && filters.district) {
      handleSearch()
    }
  }, [filters.type, filters.blood_group, filters.district]) // Auto search on initial params

  const handleSearch = async (isNearby = false) => {
    setLoading(true)
    try {
      let query = supabase.from('users').select('*').eq('is_blocked', false)

      if (isNearby) {
        query = query.eq('is_donor', true)
        if (filters.blood_group) query = query.eq('blood_group', filters.blood_group)
      } else {
        if (filters.type === 'blood') {
          query = query.eq('is_donor', true)
          if (filters.blood_group) query = query.eq('blood_group', filters.blood_group)
        } else if (filters.type === 'doctor') {
          query = query.eq('is_doctor', true)
          if (filters.speciality) query = query.eq('doctor_speciality', filters.speciality)
        } else if (filters.type === 'ambulance') {
          query = query.eq('is_ambulance', true)
          if (filters.vehicle_type) query = query.eq('vehicle_type', filters.vehicle_type)
        }

        if (filters.district) query = query.eq('district', filters.district)
        if (filters.upazila) query = query.eq('upazila', filters.upazila)
      }

      const { data, error } = await query

      if (error) throw error

      let finalResults = data as NearbyUser[]

      // Calculate distance if location available
      if (userLocation && finalResults.length > 0) {
        finalResults = finalResults.map(u => {
          if (u.lat && u.lng) {
            const R = 6371 // km
            const dLat = (u.lat - userLocation.lat) * Math.PI / 180
            const dLon = (u.lng - userLocation.lng) * Math.PI / 180
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(u.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            u.distance_km = R * c
          }
          return u
        })
        finalResults.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999))
      }

      setResults(finalResults)
    } catch (err) {
      showToast('খুঁজতে সমস্যা হয়েছে', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleShowRoute = (lat: number, lng: number, name: string) => {
    setRouteTarget({ lat, lng, name })
    setViewMode('map')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <button 
            onClick={() => handleSearch(true)}
            className="w-full mb-4 py-4 bg-white border border-blue-200 rounded-2xl flex items-center justify-center gap-3 text-[#2563EB] font-bold shadow-sm hover:bg-blue-50 transition-all active:scale-95"
          >
            <MapPin className="w-6 h-6" /> আমার কাছের খুঁজুন
          </button>
          
          <div className="card p-4 sticky top-20">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" /> ফিল্টার
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সেবার ধরন</label>
                <select 
                  className="input-field"
                  value={filters.type}
                  onChange={e => setFilters({...filters, type: e.target.value as any})}
                >
                  <option value="blood">রক্তদাতা</option>
                  <option value="doctor">ডাক্তার</option>
                  <option value="ambulance">অ্যাম্বুলেন্স</option>
                </select>
              </div>

              {filters.type === 'blood' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">রক্তের গ্রুপ</label>
                  <select 
                    className="input-field"
                    value={filters.blood_group}
                    onChange={e => setFilters({...filters, blood_group: e.target.value})}
                  >
                    <option value="">সব গ্রুপ</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              )}

              {filters.type === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিশেষত্ব</label>
                  <select 
                    className="input-field"
                    value={filters.speciality}
                    onChange={e => setFilters({...filters, speciality: e.target.value})}
                  >
                    <option value="">সব বিশেষত্ব</option>
                    {DOCTOR_SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {filters.type === 'ambulance' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">গাড়ির ধরন</label>
                  <select 
                    className="input-field"
                    value={filters.vehicle_type}
                    onChange={e => setFilters({...filters, vehicle_type: e.target.value})}
                  >
                    <option value="">সব ধরন</option>
                    {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">জেলা</label>
                <select 
                  className="input-field"
                  value={filters.district}
                  onChange={e => setFilters({...filters, district: e.target.value})}
                >
                  <option value="">সব জেলা</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">উপজেলা (ঐচ্ছিক)</label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="উপজেলার নাম..."
                  value={filters.upazila}
                  onChange={e => setFilters({...filters, upazila: e.target.value})}
                />
              </div>

              <button onClick={handleSearch} className="btn-primary w-full flex justify-center items-center gap-2">
                <Search className="w-5 h-5" /> খুঁজুন
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              ফলাফল <span className="text-[#C0001A]">({results.length})</span>
            </h1>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#C0001A]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <List className="w-4 h-4" /> তালিকা
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-[#C0001A]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <MapIcon className="w-4 h-4" /> ম্যাপ
              </button>
            </div>
          </div>

          <div id="custom-banner-1" className="mb-6 w-full" />

          {loading ? (
            <LoadingSkeleton />
          ) : results.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">কোনো ফলাফল পাওয়া যায়নি</h3>
              <p className="text-gray-500">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  currentUser={currentUser}
                  onRequest={(u) => {
                    setSelectedDonor(u)
                    setIsRequestModalOpen(true)
                  }}
                  onShowRoute={handleShowRoute}
                  showToast={showToast}
                />
              ))}
            </div>
          ) : (
            <div className="h-[600px]">
              <GoogleMap 
                results={results} 
                searchType={filters.type}
                userLocation={userLocation}
                routeTarget={routeTarget}
                onCloseRoute={() => setRouteTarget(null)}
                onMarkerClick={(u) => {
                  setSelectedDonor(u)
                  setIsRequestModalOpen(true)
                }}
              />
            </div>
          )}
        </div>
      </div>

      <RequestModal 
        isOpen={isRequestModalOpen}
        donor={selectedDonor}
        currentUser={currentUser}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {}}
        showToast={showToast}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">লোড হচ্ছে...</div>}>
      <SearchContent />
    </Suspense>
  )
}
