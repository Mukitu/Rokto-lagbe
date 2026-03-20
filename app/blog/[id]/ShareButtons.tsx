 'use client'

import { useState, useEffect } from 'react'
import { Facebook, Twitter, MessageCircle, Share2, Copy, Check } from 'lucide-react'

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!shareUrl) return null

  return (
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
  )
}
