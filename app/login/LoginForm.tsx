'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { isSupabaseConfigured } from '@/lib/supabase'
import Toast from '@/components/Toast'
import Link from 'next/link'
import { Heart, Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const { signIn, user, loading: authLoading } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard')
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) {
      showToast('ফোন নম্বর এবং পাসওয়ার্ড দিন', 'error')
      return
    }

    setLoading(true)
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase কানেক্ট করা নেই! দয়া করে AI Studio-এর Settings থেকে NEXT_PUBLIC_SUPABASE_URL এবং NEXT_PUBLIC_SUPABASE_ANON_KEY যোগ করুন।')
      }

      await signIn(phone, password)
      showToast('লগইন সফল হয়েছে', 'success')
      router.push('/dashboard')
    } catch (err: any) {
      showToast(err.message || 'লগইন ব্যর্থ হয়েছে', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 mx-auto text-[#C0001A] mb-4 fill-current" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">স্বাগতম</h1>
          <p className="text-gray-600">আপনার একাউন্টে প্রবেশ করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
            <input 
              type="tel" 
              required 
              pattern="01[3-9][0-9]{8}" 
              placeholder="01XXXXXXXXX" 
              className="input-field" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                className="input-field pr-10" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
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

          <button type="submit" disabled={loading} className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 w-full mt-2">
            {loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          একাউন্ট নেই? <Link href="/register" className="text-[#C0001A] font-bold hover:underline">নতুন একাউন্ট খুলুন</Link>
        </p>
      </div>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
