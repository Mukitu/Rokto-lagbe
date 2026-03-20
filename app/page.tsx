'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Droplet, Stethoscope, Truck, Search, UserPlus, MapPin, PhoneCall } from 'lucide-react'
import { BLOOD_GROUPS, DISTRICTS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import { getInitials, getAvatarBg, getBloodGroupColor } from '@/lib/utils'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [blood, setBlood] = useState('')
  const [district, setDistrict] = useState('')
  const [stats, setStats] = useState({ donors: 0, users: 0 })
  const [recentUsers, setRecentUsers] = useState<Partial<User>[]>([])
  const [recentBlogs, setRecentBlogs] = useState<any[]>([])

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
        const { count: donorsCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_donor', true)
        setStats({ donors: donorsCount || 0, users: usersCount || 0 })

        const { data } = await supabase.from('users')
          .select('id, name, blood_group, district, photo_url')
          .order('created_at', { ascending: false })
          .limit(5)
        if (data) setRecentUsers(data)

        const { data: blogData } = await supabase.from('blogs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
        if (blogData) setRecentBlogs(blogData)
      } catch (e) {}
    }
    fetchHomeData()
  }, [])

  const handleSearch = () => {
    router.push(`/search?type=blood&blood=${encodeURIComponent(blood)}&district=${encodeURIComponent(district)}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-[#8B0000] via-[#C0001A] to-[#E8001E] text-white py-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Heart className="w-12 h-12 mx-auto mb-6 animate-heartbeat fill-white text-white" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-md">রক্ত দিন, জীবন বাঁচান</h1>
          <h2 className="text-xl md:text-2xl opacity-90 mb-10 font-medium">এক একাউন্টে রক্ত, ডাক্তার ও অ্যাম্বুলেন্স সেবা</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-xl max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
            <select 
              className="input-field text-gray-900 border-gray-200"
              value={blood}
              onChange={e => setBlood(e.target.value)}
            >
              <option value="">রক্তের গ্রুপ ▼</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            <select 
              className="input-field text-gray-900 border-gray-200"
              value={district}
              onChange={e => setDistrict(e.target.value)}
            >
              <option value="">জেলা ▼</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={handleSearch} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
              <Search className="w-5 h-5" /> খুঁজুন
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-lg font-semibold">
            <div className="flex flex-col items-center"><span className="text-3xl font-bold">{stats.donors}+</span><span className="opacity-80">রক্তদাতা</span></div>
            <div className="flex flex-col items-center"><span className="text-3xl font-bold">৬৪</span><span className="opacity-80">জেলা</span></div>
            <div className="flex flex-col items-center"><span className="text-3xl font-bold">{stats.users}+</span><span className="opacity-80">ব্যবহারকারী</span></div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </section>

      <div id="custom-banner-1" className="my-4 max-w-7xl mx-auto px-4 w-full" />
      <div id="adsterra-home" className="my-4 max-w-7xl mx-auto px-4 w-full flex justify-center" />

      {/* SERVICES */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <h2 className="section-title text-center mb-10">আমাদের সেবাসমূহ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => router.push('/search?type=blood')} className="card-hover cursor-pointer text-center group">
            <div className="w-16 h-16 mx-auto bg-red-100 text-[#C0001A] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Droplet className="w-8 h-8 fill-current" />
            </div>
            <h3 className="text-xl font-bold mb-2">রক্তদান</h3>
            <p className="text-gray-600">কাছের রক্তদাতা খুঁজুন এবং সরাসরি যোগাযোগ করুন</p>
          </div>
          <div onClick={() => router.push('/search?type=doctor')} className="card-hover cursor-pointer text-center group">
            <div className="w-16 h-16 mx-auto bg-green-100 text-[#0A7A40] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">ডাক্তার</h3>
            <p className="text-gray-600">আপনার এলাকায় বিশেষজ্ঞ ডাক্তার খুঁজুন</p>
          </div>
          <div onClick={() => router.push('/search?type=ambulance')} className="card-hover cursor-pointer text-center group">
            <div className="w-16 h-16 mx-auto bg-orange-100 text-[#D97706] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">অ্যাম্বুলেন্স</h3>
            <p className="text-gray-600">দ্রুত অ্যাম্বুলেন্স সেবা পেতে যোগাযোগ করুন</p>
          </div>
        </div>
      </section>

      <div id="adsense-home" className="max-w-4xl mx-auto px-4 py-4 w-full" />
      <div id="custom-banner-2" className="my-4 max-w-7xl mx-auto px-4 w-full" />

      {/* HOW IT WORKS */}
      <section className="bg-white py-16 px-4 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-12">কীভাবে কাজ করে?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gray-200 -z-10"></div>
            
            <div className="flex flex-col items-center text-center bg-white">
              <div className="w-16 h-16 bg-[#FFF0F2] text-[#C0001A] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                <UserPlus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">১. একাউন্ট খুলুন</h3>
              <p className="text-gray-600">রক্তের গ্রুপ দিয়ে রেজিস্ট্রেশন করুন</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white">
              <div className="w-16 h-16 bg-[#FFF0F2] text-[#C0001A] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">২. লোকেশন দিন</h3>
              <p className="text-gray-600">কাছের সেবা দেখতে লোকেশন আপডেট করুন</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white">
              <div className="w-16 h-16 bg-[#FFF0F2] text-[#C0001A] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                <PhoneCall className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">৩. যোগাযোগ করুন</h3>
              <p className="text-gray-600">সরাসরি কল করে সেবা গ্রহণ করুন</p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT REGISTRATIONS */}
      {recentUsers.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto w-full">
          <h2 className="section-title mb-6">সম্প্রতি যোগ দিয়েছেন</h2>
          <div id="custom-banner-3" className="my-8" />
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x">
            {recentUsers.map(u => (
              <div key={u.id} onClick={() => router.push(`/profile/${u.id}`)} className="card min-w-[200px] flex-shrink-0 snap-start flex flex-col items-center text-center p-4 cursor-pointer hover:border-[#C0001A] transition-colors">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3"
                  style={{ backgroundColor: getAvatarBg(u.blood_group!) }}
                >
                  {getInitials(u.name!)}
                </div>
                <h4 className="font-bold text-gray-900 truncate w-full">{u.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`badge ${getBloodGroupColor(u.blood_group!)}`}>{u.blood_group}</span>
                  <span className="text-xs text-gray-500 truncate">{u.district}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BLOG SECTION */}
      {recentBlogs.length > 0 && (
        <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="section-title mb-0">আমাদের ব্লগ</h2>
              <button 
                onClick={() => router.push('/blog')}
                className="text-[#C0001A] font-bold hover:underline"
              >
                সবগুলো দেখুন →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentBlogs.map((blog) => (
                <div 
                  key={blog.id} 
                  onClick={() => router.push(`/blog/${blog.id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={blog.image_url}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#C0001A] transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {blog.description}
                    </p>
                    <div className="text-xs text-gray-400">
                      {new Date(blog.created_at).toLocaleDateString('bn-BD')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div id="custom-banner-2" className="my-4 max-w-7xl mx-auto px-4 w-full" />
    </div>
  )
}
