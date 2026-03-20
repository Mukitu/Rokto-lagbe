'use client'

import { useEffect, useState } from 'react'
import { Heart, ShieldCheck, Users, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AboutPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('admin_settings')
        .select('*')
      
      if (data) {
        const settingsMap: Record<string, string> = {}
        data.forEach(item => {
          settingsMap[item.key] = item.value
        })
        setSettings(settingsMap)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C0001A]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        {settings.about_photo_url ? (
          <div className="relative aspect-square w-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md mb-6">
            <img 
              src={settings.about_photo_url} 
              alt={settings.about_name || 'About'} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <Heart className="w-16 h-16 mx-auto text-[#C0001A] mb-4 fill-current" />
        )}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {settings.about_name || 'রক্ত লাগবে সম্পর্কে'}
        </h1>
        <p className="text-xl text-gray-600">
          {settings.about_subtitle && settings.about_subtitle.trim() !== '' 
            ? settings.about_subtitle 
            : 'বাংলাদেশের একটি সমন্বিত ইমার্জেন্সি সার্ভিস প্ল্যাটফর্ম'}
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700">
        <div className="mb-6 whitespace-pre-wrap">
          {settings.about_description && settings.about_description.trim() !== '' ? (
            settings.about_description
          ) : (
            <>
              <strong>রক্ত লাগবে</strong> একটি অলাভজনক উদ্যোগ, যার মূল লক্ষ্য হলো জরুরি মুহূর্তে মানুষের পাশে দাঁড়ানো। 
              রক্তের প্রয়োজন, জরুরি ডাক্তার কিংবা অ্যাম্বুলেন্স—সবকিছু এক প্ল্যাটফর্মে নিয়ে আসার জন্যই আমাদের এই প্রচেষ্টা।
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="card p-6 border-t-4 border-[#C0001A]">
            <Users className="w-10 h-10 text-[#C0001A] mb-4" />
            <h3 className="text-xl font-bold mb-2">আমাদের লক্ষ্য</h3>
            <p className="text-gray-600">
              বাংলাদেশের প্রতিটি জেলায়, প্রতিটি উপজেলায় জরুরি স্বাস্থ্যসেবা সহজলভ্য করা। 
              যেন রক্তের অভাবে বা সঠিক সময়ে অ্যাম্বুলেন্স না পাওয়ার কারণে কোনো প্রাণ না ঝরে।
            </p>
          </div>
          <div className="card p-6 border-t-4 border-blue-500">
            <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">নিরাপত্তা ও গোপনীয়তা</h3>
            <p className="text-gray-600">
              আমরা ব্যবহারকারীদের তথ্যের সর্বোচ্চ নিরাপত্তা নিশ্চিত করি। 
              শুধুমাত্র নিবন্ধিত ব্যবহারকারীরাই একে অপরের সাথে যোগাযোগ করতে পারেন।
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#C0001A]" />
          কেন রক্ত লাগবে ব্যবহার করবেন?
        </h2>
        <ul className="space-y-4 list-none pl-0">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#C0001A] flex items-center justify-center shrink-0 mt-1">✓</span>
            <span><strong>লোকেশন ভিত্তিক সার্চ:</strong> আপনার সবচেয়ে কাছের রক্তদাতা, ডাক্তার বা অ্যাম্বুলেন্স খুঁজে বের করুন সহজেই।</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#C0001A] flex items-center justify-center shrink-0 mt-1">✓</span>
            <span><strong>সরাসরি যোগাযোগ:</strong> কোনো মাধ্যম ছাড়াই সরাসরি কল বা রিকোয়েস্ট পাঠানোর সুবিধা।</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#C0001A] flex items-center justify-center shrink-0 mt-1">✓</span>
            <span><strong>রেটিং সিস্টেম:</strong> ব্যবহারকারীদের রেটিং দেখে সঠিক সেবা নিশ্চিত করুন।</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-[#C0001A] flex items-center justify-center shrink-0 mt-1">✓</span>
            <span><strong>সম্পূর্ণ ফ্রি:</strong> এই প্ল্যাটফর্ম ব্যবহার করতে কোনো ফি দিতে হয়বিধা।</span>
          </li>
        </ul>

        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 className="text-2xl font-bold mb-4">আমাদের সাথে যুক্ত হোন</h3>
          <p className="text-gray-600 mb-6">
            আপনিও পারেন একটি জীবন বাঁচাতে। আজই রেজিস্ট্রেশন করে রক্তদাতা হিসেবে যুক্ত হোন।
          </p>
          <a 
            href={settings.about_link || "/register"} 
            className="btn-primary inline-block"
            target={settings.about_link ? "_blank" : undefined}
            rel={settings.about_link ? "noopener noreferrer" : undefined}
          >
            {settings.about_link ? "আরও জানুন" : "একাউন্ট খুলুন"}
          </a>
        </div>
      </div>
    </div>
  )
}
