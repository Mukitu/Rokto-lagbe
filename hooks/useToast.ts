'use client'
import { useState, useCallback } from 'react'
import { ToastType } from '@/types'

interface ToastItem {
  id: string; message: string; type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = Math.random().toString(36).slice(2)
      setToasts(p => [...p, { id, message, type }])
      setTimeout(() => {
        setToasts(p => p.filter(t => t.id !== id))
      }, 3500)
    }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(p => p.filter(t => t.id !== id))
  }, [])

  return { toasts, showToast, removeToast }
}
