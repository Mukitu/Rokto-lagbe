export type BloodGroup =
  'A+' | 'A-' | 'B+' | 'B-' |
  'O+' | 'O-' | 'AB+' | 'AB-'

export type SearchType = 'blood' | 'doctor' | 'ambulance'
export type RequestStatus = 'pending' | 'accepted' | 'declined'
export type VehicleType = 'AC' | 'Non-AC' | 'ICU'
export type ToastType = 'success' | 'error' | 'info'

export interface User {
  id: string
  auth_id: string
  name: string
  phone: string
  email?: string
  district: string
  upazila: string
  bio?: string
  photo_url?: string
  blood_group: BloodGroup
  is_donor: boolean
  is_doctor: boolean
  doctor_speciality?: string
  chamber_address?: string
  visit_fee?: string
  is_ambulance: boolean
  vehicle_type?: VehicleType
  vehicle_number?: string
  lat?: number
  lng?: number
  total_donations: number
  avg_rating: number
  total_ratings: number
  is_active: boolean
  is_verified: boolean
  is_blocked: boolean
  block_reason?: string
  is_admin: boolean
  is_super_admin: boolean
  hide_phone?: boolean
  last_seen?: string
  created_at: string
}

export interface NearbyUser extends User {
  distance_km?: number
}

export interface BloodRequest {
  id: string
  requester_id: string
  donor_id: string
  blood_group: BloodGroup
  patient_name?: string
  hospital_name?: string
  patient_phone?: string
  disease_name?: string
  message?: string
  status: RequestStatus
  is_rated?: boolean
  is_donor_rated?: boolean
  is_requester_rated?: boolean
  created_at: string
  requester?: Partial<User>
  donor?: Partial<User>
}

export interface Rating {
  id: string
  rater_id: string
  receiver_id: string
  request_id?: string
  stars: number
  comment?: string
  created_at: string
  rater?: Partial<User>
  receiver?: Partial<User>
}

export interface SearchFilters {
  searchType: SearchType
  blood?: string
  district?: string
  speciality?: string
  vehicle?: string
  radius?: number
}

export interface AdminStats {
  total_users: number
  total_donors: number
  total_doctors: number
  total_ambulances: number
  today_requests: number
  accepted_requests: number
  total_blocked: number
  recent_users: Partial<User>[]
}
