import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)

export function phoneToEmail(phone: string): string {
  return phone.replace(/\D/g, '') + '@roktosetu.app'
}
