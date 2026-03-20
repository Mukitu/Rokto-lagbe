'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Blog } from '@/types/blog'
import Image from 'next/image'
import { Calendar, User, Facebook, Twitter, Instagram, MessageCircle, Share2, ArrowLeft, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function BlogDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (id) fetchBlog()
  }, [id])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setBlog(data)
    } catch (error) {
      console.error('Error fetching blog:', error)
      router.push('/blog')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = blog?.title || ''

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
    instagram: `https://www.instagram.com/` // Instagram doesn't support direct web sharing like this
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C0001A]"></div>
          <p className="text-gray-500 font-medium">ব্লগ লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!blog) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#C0001A] transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            ফিরে যান
          </Link>

          <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Featured Image */}
            <div className="relative h-64 md:h-[450px] w-full">
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-6 md:p-12">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#C0001A]" />
                  {new Date(blog.created_at).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <User size={18} className="text-[#C0001A]" />
                  অ্যাডমিন
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                {blog.title}
              </h1>

              {/* Content */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-12">
                {blog.description}
              </div>

              {/* Share Section */}
              <div className="border-t border-gray-100 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3 text-gray-900 font-bold">
                    <Share2 size={20} className="text-[#C0001A]" />
                    শেয়ার করুন:
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      <Facebook size={18} />
                      Facebook
                    </a>
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#1DA1F2] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      <Twitter size={18} />
                      Twitter
                    </a>
                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </a>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Ad Placeholder */}
          <div id="adsense-blog-footer" className="mt-12 min-h-[100px] flex items-center justify-center bg-gray-100 rounded-2xl border border-dashed border-gray-300 text-gray-400 text-sm">
            বিজ্ঞাপন এখানে প্রদর্শিত হবে
          </div>
        </div>
      </main>
    </div>
  )
}
