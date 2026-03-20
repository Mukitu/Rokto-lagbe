'use client'
import { useState, useEffect } from 'react'
import Modal from './Modal'
import { User, ToastType } from '@/types'
import { supabase } from '@/lib/supabase'
import { Star } from 'lucide-react'

interface RatingModalProps {
  isOpen: boolean
  receiverId: string
  requestId: string
  currentUser: User | null
  isDonorRating?: boolean
  onClose: () => void
  onSuccess: () => void
  showToast: (msg: string, type: ToastType) => void
}

export default function RatingModal({ isOpen, receiverId, requestId, currentUser, isDonorRating, onClose, onSuccess, showToast }: RatingModalProps) {
  const [loading, setLoading] = useState(false)
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (isOpen && requestId) {
      const fetchExistingRating = async () => {
        const { data } = await supabase
          .from('ratings')
          .select('stars, comment')
          .eq('request_id', requestId)
          .eq('rater_id', currentUser.id)
          .maybeSingle()
        
        if (data) {
          setStars(data.stars)
          setComment(data.comment || '')
        } else {
          setStars(0)
          setComment('')
        }
      }
      fetchExistingRating()
    }
  }, [isOpen, requestId])

  if (!currentUser) return null

  const handleSubmit = async () => {
    if (stars === 0) {
      showToast('দয়া করে রেটিং দিন', 'error')
      return
    }

    setLoading(true)
    try {
      // Check if rating already exists from this specific rater
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('request_id', requestId)
        .eq('rater_id', currentUser.id)
        .maybeSingle()

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update({
            stars,
            comment: comment || null
          })
          .eq('id', existingRating.id)
        if (error) throw error
      } else {
        // Insert new rating
        const { error } = await supabase.from('ratings').insert({
          rater_id: currentUser.id,
          receiver_id: receiverId,
          request_id: requestId,
          stars,
          comment: comment || null
        })
        if (error) throw error
      }

      // Mark request as rated by this party
      const updateData: any = { is_rated: true }
      if (isDonorRating) {
        updateData.is_donor_rated = true
      } else {
        updateData.is_requester_rated = true
      }
      await supabase.from('blood_requests').update(updateData).eq('id', requestId)

      showToast('রেটিং দেওয়া হয়েছে ✓', 'success')
      onSuccess()
      onClose()
    } catch (err) {
      showToast('রেটিং দিতে সমস্যা হয়েছে', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="এই ডোনার কেমন ছিলেন?">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(star)}
            >
              <Star 
                className={`w-10 h-10 ${
                  star <= (hover || stars) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            </button>
          ))}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">মন্তব্য (ঐচ্ছিক)</label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <div className="flex w-full gap-3 mt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-ghost bg-gray-100 hover:bg-gray-200 text-gray-700">
            এখন না
          </button>
          <button onClick={handleSubmit} disabled={loading || stars === 0} className="flex-1 btn-primary">
            {loading ? 'অপেক্ষা করুন...' : 'রেটিং দিন'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
