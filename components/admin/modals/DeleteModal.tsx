'use client'

import React from 'react'
import { X, Trash2 } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
}

export default function DeleteModal({ isOpen, onClose, onConfirm, userName }: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 className="text-red-600" size={24} />
            ব্যবহারকারী ডিলিট করুন
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            আপনি কি নিশ্চিত যে আপনি <span className="font-bold text-gray-900">{userName}</span>-কে ডিলিট করতে চান?
          </p>
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <Trash2 size={20} />
            </div>
            <p className="text-sm text-red-600 font-medium">
              সতর্কতা: এই অ্যাকশনটি অপরিবর্তনীয়। ব্যবহারকারীর সমস্ত তথ্য চিরতরে মুছে যাবে।
            </p>
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
            onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-md active:scale-95"
          >
            ডিলিট করুন
          </button>
        </div>
      </div>
    </div>
  )
}
