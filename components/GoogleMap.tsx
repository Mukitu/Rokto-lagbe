'use client'
import { useEffect, useRef, useState } from 'react'
import { NearbyUser } from '@/types'

interface GoogleMapProps {
  results: NearbyUser[]
  searchType: string
  userLocation?: { lat: number; lng: number } | null
  onMarkerClick?: (user: NearbyUser) => void
  routeTarget?: { lat: number; lng: number; name: string } | null
  onCloseRoute?: () => void
}

export default function GoogleMap({ results, searchType, userLocation, onMarkerClick, routeTarget, onCloseRoute }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null)

  useEffect(() => {
    if (!mapRef.current || !window.google) return

    const initialMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 23.6850, lng: 90.3563 },
      zoom: 7,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] }
      ]
    })
    setMap(initialMap)
    
    const renderer = new window.google.maps.DirectionsRenderer({
      map: initialMap,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#C0001A', strokeWeight: 4 }
    })
    setDirectionsRenderer(renderer)
  }, [])

  useEffect(() => {
    if (!map || !window.google) return

    markers.forEach(m => m.setMap(null))
    const newMarkers: google.maps.Marker[] = []
    const bounds = new window.google.maps.LatLngBounds()

    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        title: 'আমার অবস্থান'
      })
      newMarkers.push(userMarker)
      bounds.extend(userLocation)
    }

    results.forEach(user => {
      if (!user.lat || !user.lng) return
      
      let fillColor = '#C0001A'
      if (user.is_doctor && searchType === 'doctor') fillColor = '#0A7A40'
      if (user.is_ambulance && searchType === 'ambulance') fillColor = '#D97706'

      const marker = new window.google.maps.Marker({
        position: { lat: user.lat, lng: user.lng },
        map,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 22),
        },
        title: user.name
      })

      marker.addListener('click', () => {
        onMarkerClick?.(user)
      })

      newMarkers.push(marker)
      bounds.extend({ lat: user.lat, lng: user.lng })
    })

    setMarkers(newMarkers)

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds)
      if (newMarkers.length === 1) {
        map.setZoom(12)
      }
    }
  }, [map, results, userLocation, searchType])

  useEffect(() => {
    if (!map || !window.google || !directionsRenderer) return

    if (routeTarget && userLocation) {
      const directionsService = new window.google.maps.DirectionsService()
      directionsService.route({
        origin: userLocation,
        destination: { lat: routeTarget.lat, lng: routeTarget.lng },
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result)
          const leg = result.routes[0].legs[0]
          setRouteInfo({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || ''
          })
        }
      })
    } else {
      directionsRenderer.setDirections({ routes: [] } as any)
      setRouteInfo(null)
    }
  }, [routeTarget, userLocation, map, directionsRenderer])

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
      
      {routeInfo && routeTarget && userLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 animate-fadeIn">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-gray-900">{routeTarget.name} এর রুট</h4>
              <p className="text-sm text-gray-600">দূরত্ব: {routeInfo.distance} • সময়: {routeInfo.duration}</p>
            </div>
            <button onClick={onCloseRoute} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${routeTarget.lat},${routeTarget.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
          >
            গুগল ম্যাপে খুলুন
          </a>
        </div>
      )}
    </div>
  )
}
