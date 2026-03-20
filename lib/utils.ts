export function getInitials(name: string): string {
  return name.split(' ')
    .map(n => n[0]).join('')
    .toUpperCase().substring(0, 2)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('bn-BD', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} মিটার দূরে`
  return `${km.toFixed(1)} কি.মি দূরে`
}

export function validatePhone(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(phone.replace(/\D/g, ''))
}

export function getBloodGroupColor(bg: string): string {
  const colors: Record<string, string> = {
    'A+': 'bg-red-100 text-red-800 border-red-200',
    'A-': 'bg-red-200 text-red-900 border-red-300',
    'B+': 'bg-blue-100 text-blue-800 border-blue-200',
    'B-': 'bg-blue-200 text-blue-900 border-blue-300',
    'O+': 'bg-green-100 text-green-800 border-green-200',
    'O-': 'bg-green-200 text-green-900 border-green-300',
    'AB+': 'bg-purple-100 text-purple-800 border-purple-200',
    'AB-': 'bg-purple-200 text-purple-900 border-purple-300',
  }
  return colors[bg] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getAvatarBg(bloodGroup: string): string {
  const colors: Record<string, string> = {
    'A+': '#C0001A', 'A-': '#8B0000',
    'B+': '#1D4ED8', 'B-': '#1E3A8A',
    'O+': '#0A7A40', 'O-': '#065F46',
    'AB+': '#7C3AED', 'AB-': '#5B21B6',
  }
  return colors[bloodGroup] || '#6B7280'
}
