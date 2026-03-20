'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Blog } from '@/types/blog'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBlogs(data || [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">আমাদের ব্লগ</h1>
            <p className="text-lg text-gray-600">রক্তদান এবং স্বাস্থ্য বিষয়ক সর্বশেষ তথ্য ও টিপস পড়ুন।</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C0001A]"></div>
              <p className="text-gray-500 font-medium">ব্লগ লোড হচ্ছে...</p>
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs.map((blog) => (
                <Link 
                  key={blog.id} 
                  href={`/blog/${blog.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={blog.image_url}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(blog.created_at).toLocaleDateString('bn-BD')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        অ্যাডমিন
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#C0001A] transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {blog.description}
                    </p>
                    <div className="flex items-center text-[#C0001A] font-semibold text-sm gap-1">
                      আরও পড়ুন <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500">বর্তমানে কোনো ব্লগ পোস্ট নেই।</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
