'use client'
import { useState } from 'react'
import Modal from './Modal'
import { NearbyUser, User, ToastType } from '@/types'
import { supabase } from '@/lib/supabase'

interface RequestModalProps {
  isOpen: boolean
  donor: NearbyUser | null
  currentUser: User | null
  onClose: () => void
  onSuccess: () => void
  showToast: (msg: string, type: ToastType) => void
}

export default function RequestModal({ isOpen, donor, currentUser, onClose, onSuccess, showToast }: RequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    disease_name: '',
    hospital_name: '',
    message: ''
  })

  if (!donor || !currentUser) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser.is_blocked) {
      showToast('আপনার একাউন্ট ব্লক করা হয়েছে', 'error')
      return
    }
    if (!formData.patient_name.trim() || !formData.patient_phone.trim() || !formData.disease_name.trim() || !formData.hospital_name.trim()) {
      showToast('সবগুলো ঘর পূরণ করুন', 'error')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('blood_requests').insert({
        requester_id: currentUser.id,
        donor_id: donor.id,
        blood_group: donor.blood_group,
        patient_name: formData.patient_name,
        patient_phone: formData.patient_phone || null,
        disease_name: formData.disease_name || null,
        hospital_name: formData.hospital_name || null,
        message: formData.message || null,
        status: 'pending'
      })
      if (error) throw error
      showToast('অনুরোধ পাঠানো হয়েছে ✓', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error sending request:', err)
      showToast(`অনুরোধ পাঠাতে সমস্যা হয়েছে: ${err.message || ''}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${donor.name} কে রক্তের অনুরোধ`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="bg-red-50 text-red-800 p-3 rounded-xl text-sm mb-2 border border-red-100">
          <strong>রক্তের গ্রুপ:</strong> {donor.blood_group}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">রোগীর নাম *</label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.patient_name}
            onChange={e => setFormData({...formData, patient_name: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">রোগীর ফোন *</label>
          <input
            type="tel"
            required
            className="input-field"
            value={formData.patient_phone}
            onChange={e => setFormData({...formData, patient_phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">রোগের নাম *</label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.disease_name}
            onChange={e => setFormData({...formData, disease_name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">হাসপাতালের নাম *</label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.hospital_name}
            onChange={e => setFormData({...formData, hospital_name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">বার্তা (ঐচ্ছিক)</label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="জরুরী কোনো কথা থাকলে লিখতে পারেন..."
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button type="button" onClick={onClose} className="flex-1 btn-outline">
            বাতিল
          </button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary">
            {loading ? 'অপেক্ষা করুন...' : 'অনুরোধ পাঠান'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
