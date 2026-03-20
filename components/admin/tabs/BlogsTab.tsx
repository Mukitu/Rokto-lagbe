'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Blog } from '@/types/blog'
import Image from 'next/image'

interface BlogsTabProps {
  showToast: (message: string, type: 'success' | 'error') => void
}

export default function BlogsTab({ showToast }: BlogsTabProps) {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  })

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
    } catch (error: any) {
      console.error('Error fetching blogs:', error)
      showToast('ব্লগ লোড করতে সমস্যা হয়েছে', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog)
      setFormData({
        title: blog.title,
        description: blog.description,
        image_url: blog.image_url
      })
    } else {
      setEditingBlog(null)
      setFormData({
        title: '',
        description: '',
        image_url: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.image_url) {
      showToast('সবগুলো ঘর পূরণ করুন', 'error')
      return
    }

    try {
      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBlog.id)

        if (error) throw error
        showToast('ব্লগ আপডেট করা হয়েছে', 'success')
      } else {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new Error('User not found')

        // Fetching the internal user ID from the users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', userData.user.id)
          .single()

        if (profileError || !profile) throw new Error('User profile not found')

        const { error } = await supabase
          .from('blogs')
          .insert({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            author_id: profile.id // Using internal user ID
          })

        if (error) throw error
        showToast('নতুন ব্লগ পোস্ট করা হয়েছে', 'success')
      }
      
      setIsModalOpen(false)
      fetchBlogs()
    } catch (error: any) {
      console.error('Error saving blog:', error)
      // Extracting detailed error message from Supabase if available
      const errorMessage = error.error_description || error.message || (typeof error === 'object' ? JSON.stringify(error) : 'ব্লগ সেভ করতে সমস্যা হয়েছে')
      showToast(errorMessage, 'error')
    }
  }

  const handleDelete = async () => {
    if (!blogToDelete) return

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogToDelete)

      if (error) throw error
      showToast('ব্লগ ডিলিট করা হয়েছে', 'success')
      fetchBlogs()
    } catch (error: any) {
      console.error('Error deleting blog:', error)
      const errorMessage = error.error_description || error.message || (typeof error === 'object' ? JSON.stringify(error) : 'ব্লগ ডিলিট করতে সমস্যা হয়েছে')
      showToast(errorMessage, 'error')
    } finally {
      setIsDeleteModalOpen(false)
      setBlogToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setBlogToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ব্লগ ম্যানেজমেন্ট</h2>
          <p className="text-gray-500">আপনার ওয়েবসাইটের ব্লগ পোস্টগুলো এখান থেকে নিয়ন্ত্রণ করুন।</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-[#C0001A] text-white px-4 py-2 rounded-lg hover:bg-[#A00016] transition-colors"
        >
          <Plus size={20} />
          নতুন ব্লগ
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="ব্লগ খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0001A]/20 focus:border-[#C0001A]"
        />
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#C0001A]"></div>
            <p className="text-gray-500">ব্লগ লোড হচ্ছে...</p>
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-bottom border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">ছবি</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">শিরোনাম</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">তারিখ</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative h-12 w-20 rounded overflow-hidden bg-gray-100">
                        <Image
                          src={blog.image_url}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs md:max-w-md">
                        <h3 className="font-medium text-gray-900 truncate">{blog.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{blog.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/blog/${blog.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="দেখুন"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button
                          onClick={() => handleOpenModal(blog)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="এডিট"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(blog.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ডিলিট"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">কোনো ব্লগ পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingBlog ? 'ব্লগ এডিট করুন' : 'নতুন ব্লগ পোস্ট করুন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ব্লগ শিরোনাম
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ব্লগের শিরোনাম লিখুন"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0001A]/20 focus:border-[#C0001A]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ছবির URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0001A]/20 focus:border-[#C0001A]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ব্লগ বর্ণনা
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ব্লগের বিস্তারিত বর্ণনা লিখুন..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0001A]/20 focus:border-[#C0001A] resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C0001A] text-white rounded-lg hover:bg-[#A00016] transition-colors"
                >
                  {editingBlog ? 'আপডেট করুন' : 'পোস্ট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">আপনি কি নিশ্চিত?</h3>
              <p className="text-gray-500 mb-6">
                আপনি কি নিশ্চিত যে এই ব্লগটি ডিলিট করতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না।
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  হ্যাঁ, ডিলিট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
