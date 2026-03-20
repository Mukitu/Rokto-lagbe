'use client'

import React, { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface BlockModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  userName: string
}

export default function BlockModal({ isOpen, onClose, onConfirm, userName }: BlockModalProps) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            ব্যবহারকারী ব্লক করুন
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            আপনি কি নিশ্চিত যে আপনি <span className="font-bold text-gray-900">{userName}</span>-কে ব্লক করতে চান?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ব্লক করার কারণ (ঐচ্ছিক)</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C0001A] focus:border-transparent outline-none transition-all resize-none h-24"
              placeholder="কেন ব্লক করছেন তা লিখুন..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-all"
          >
            বাতিল
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-md active:scale-95"
          >
            ব্লক করুন
          </button>
        </div>
      </div>
    </div>
  )
}
