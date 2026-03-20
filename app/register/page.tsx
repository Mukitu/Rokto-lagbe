'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { BLOOD_GROUPS, DISTRICTS, DOCTOR_SPECIALITIES, VEHICLE_TYPES } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase'
import Toast from '@/components/Toast'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, user, loading: authLoading } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    blood_group: '',
    district: '',
    upazila: '',
    is_donor: false,
    is_doctor: false,
    is_ambulance: false,
    doctor_speciality: '',
    chamber_address: '',
    visit_fee: '',
    vehicle_type: '',
    vehicle_number: '',
    lat: null as number | null,
    lng: null as number | null,
  })

  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard')
  }, [user, authLoading, router])

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }))
          showToast('লোকেশন নেওয়া হয়েছে ✓', 'success')
        },
        () => showToast('লোকেশন নেওয়া সম্ভব হয়নি', 'error')
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.password || !formData.blood_group || !formData.district || !formData.upazila) {
        showToast('সব তথ্য পূরণ করুন', 'error')
        return
      }
      if (formData.password.length < 6) {
        showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', 'error')
        return
      }
      setStep(2)
      return
    }

    setLoading(true)
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase কানেক্ট করা নেই! দয়া করে AI Studio-এর Settings থেকে NEXT_PUBLIC_SUPABASE_URL এবং NEXT_PUBLIC_SUPABASE_ANON_KEY যোগ করুন।')
      }

      await signUp({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        blood_group: formData.blood_group,
        district: formData.district,
        upazila: formData.upazila,
        is_donor: formData.is_donor,
        is_doctor: formData.is_doctor,
        is_ambulance: formData.is_ambulance,
        doctor_speciality: formData.doctor_speciality || undefined,
        chamber_address: formData.chamber_address || undefined,
        visit_fee: formData.visit_fee || undefined,
        vehicle_type: formData.vehicle_type || undefined,
        vehicle_number: formData.vehicle_number || undefined,
        lat: formData.lat || undefined,
        lng: formData.lng || undefined
      })
      showToast('রেজিস্ট্রেশন সফল হয়েছে!', 'success')
      router.push('/dashboard')
    } catch (err: any) {
      showToast(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">একাউন্ট খুলুন</h1>
          <p className="text-gray-600">রক্ত লাগবে পরিবারের সদস্য হোন</p>
        </div>

        <div className="flex mb-8">
          <div className={`flex-1 h-2 rounded-l-full ${step >= 1 ? 'bg-[#C0001A]' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-2 rounded-r-full ${step >= 2 ? 'bg-[#C0001A]' : 'bg-gray-200'}`}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <div className="animate-fadeIn">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">আপনার নাম *</label>
                  <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর * (১১ ডিজিট)</label>
                  <input type="tel" required pattern="01[3-9][0-9]{8}" placeholder="01XXXXXXXXX" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড *</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      minLength={6} 
                      className="input-field pr-10" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">রক্তের গ্রুপ *</label>
                    <select required className="input-field" value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})}>
                      <option value="">নির্বাচন করুন</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">জেলা *</label>
                    <select required className="input-field" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
                      <option value="">নির্বাচন করুন</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">উপজেলা/থানা *</label>
                  <input type="text" required className="input-field" value={formData.upazila} onChange={e => setFormData({...formData, upazila: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 active:scale-95 w-full mt-6">পরবর্তী ধাপ</button>
            </div>
          ) : (
            <div className="animate-fadeIn space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">আপনি কি সেবা দিতে চান?</h3>
                
                <label className="flex items-center gap-3 mb-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                  <input type="checkbox" className="w-5 h-5 text-[#C0001A] rounded focus:ring-[#C0001A]" checked={formData.is_donor} onChange={e => setFormData({...formData, is_donor: e.target.checked})} />
                  <span className="font-medium text-gray-800">আমি রক্তদান / গ্রহণ করতে ইচ্ছুক</span>
                </label>

                <label className="flex items-center gap-3 mb-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                  <input type="checkbox" className="w-5 h-5 text-[#C0001A] rounded focus:ring-[#C0001A]" checked={formData.is_doctor} onChange={e => setFormData({...formData, is_doctor: e.target.checked})} />
                  <span className="font-medium text-gray-800">আমি একজন ডাক্তার</span>
                </label>
                {formData.is_doctor && (
                  <div className="pl-8 pr-2 pb-2 space-y-3">
                    <select className="input-field text-sm" value={formData.doctor_speciality} onChange={e => setFormData({...formData, doctor_speciality: e.target.value})}>
                      <option value="">বিশেষত্ব নির্বাচন করুন</option>
                      {DOCTOR_SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" placeholder="হাসপাতাল / চেম্বারের নাম" className="input-field text-sm" value={formData.chamber_address} onChange={e => setFormData({...formData, chamber_address: e.target.value})} />
                    <input type="text" placeholder="ভিজিট ফি (যেমন: ৫০০ টাকা)" className="input-field text-sm" value={formData.visit_fee} onChange={e => setFormData({...formData, visit_fee: e.target.value})} />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                  <input type="checkbox" className="w-5 h-5 text-[#C0001A] rounded focus:ring-[#C0001A]" checked={formData.is_ambulance} onChange={e => setFormData({...formData, is_ambulance: e.target.checked})} />
                  <span className="font-medium text-gray-800">আমার অ্যাম্বুলেন্স আছে</span>
                </label>
                {formData.is_ambulance && (
                  <div className="pl-8 pr-2 pt-2 pb-2 space-y-3">
                    <select className="input-field text-sm" value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})}>
                      <option value="">গাড়ির ধরন নির্বাচন করুন</option>
                      {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <input type="text" placeholder="অ্যাম্বুলেন্স নম্বর (যেমন: ঢাকা মেট্রো-ছ ১১-১১১১)" className="input-field text-sm" value={formData.vehicle_number} onChange={e => setFormData({...formData, vehicle_number: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">সঠিক লোকেশন (ঐচ্ছিক)</h3>
                <p className="text-sm text-blue-700 mb-3">ম্যাপে আপনাকে সহজে খুঁজে পেতে লোকেশন দিন</p>
                <button type="button" onClick={getLocation} className="w-full bg-white text-blue-600 border border-blue-200 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  {formData.lat ? '✓ লোকেশন নেওয়া হয়েছে' : '📍 বর্তমান লোকেশন নিন'}
                </button>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 btn-outline">পেছনে</button>
                <button type="submit" disabled={loading} className="flex-1 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                  {loading ? 'অপেক্ষা করুন...' : 'একাউন্ট খুলুন'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center mt-6 text-gray-600">
          আগে থেকে একাউন্ট আছে? <Link href="/login" prefetch={false} className="text-[#C0001A] font-bold hover:underline">লগইন করুন</Link>
        </p>
      </div>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
