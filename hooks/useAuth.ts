'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, phoneToEmail } from '@/lib/supabase'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (authId: string) => {
    try {
      const { data } = await supabase
        .from('users').select('*')
        .eq('auth_id', authId).single()
      if (data) setUser(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) loadProfile(data.session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_, session) => {
        if (session?.user) loadProfile(session.user.id)
        else { setUser(null); setLoading(false) }
      })
    return () => subscription.unsubscribe()
  }, [loadProfile])

  async function signUp(userData: {
    name: string; phone: string; password: string
    blood_group: string; district: string; upazila: string
    bio?: string; is_donor?: boolean; is_doctor?: boolean
    doctor_speciality?: string; chamber_address?: string
    visit_fee?: string; is_ambulance?: boolean
    vehicle_type?: string; vehicle_number?: string
    lat?: number; lng?: number
  }) {
    const email = phoneToEmail(userData.phone)
    const { data: auth, error } =
      await supabase.auth.signUp({ email, password: userData.password })
    if (error) throw error
    const { error: pe } = await supabase.from('users').insert({
      auth_id: auth.user!.id,
      name: userData.name, phone: userData.phone,
      email, blood_group: userData.blood_group,
      district: userData.district, upazila: userData.upazila,
      bio: userData.bio || null, is_donor: userData.is_donor ?? true,
      is_doctor: userData.is_doctor || false,
      doctor_speciality: userData.doctor_speciality || null,
      chamber_address: userData.chamber_address || null,
      visit_fee: userData.visit_fee || null,
      is_ambulance: userData.is_ambulance || false,
      vehicle_type: userData.vehicle_type || null,
      vehicle_number: userData.vehicle_number || null,
      lat: userData.lat || null, lng: userData.lng || null,
      last_seen: new Date().toISOString(),
    })
    if (pe) throw pe
    return auth
  }

  async function signIn(phone: string, password: string) {
    const { data, error } = await supabase.auth
      .signInWithPassword({ email: phoneToEmail(phone), password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser(
      { password: newPassword })
    if (error) throw error
  }

  async function refreshUser() {
    if (user?.auth_id) await loadProfile(user.auth_id)
  }

  return { user, loading, signUp, signIn, signOut,
    updatePassword, refreshUser }
}
