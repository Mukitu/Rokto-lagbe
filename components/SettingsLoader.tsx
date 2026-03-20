'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SettingsLoader() {
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase.from('admin_settings').select('*')
        if (!data) return

        const settings: Record<string, string> = {}
        data.forEach(s => {
          settings[s.key] = s.value
        })

        // 1. Update Site Info
        if (settings.site_name) {
          document.title = `${settings.site_name} — ${settings.site_tagline || 'রক্ত দিন, জীবন বাঁচান'}`
          const siteNameElements = document.querySelectorAll('.site-name')
          siteNameElements.forEach(el => {
            el.textContent = settings.site_name
          })
        }
        if (settings.site_tagline) {
          const siteTaglineElements = document.querySelectorAll('.site-tagline')
          siteTaglineElements.forEach(el => {
            el.textContent = settings.site_tagline
          })
        }

        // 2. Inject Banners
        for (let i = 1; i <= 3; i++) {
          const bannerEnabled = settings[`banner${i}_enabled`] === 'true'
          const bannerImg = settings[`banner${i}_image`]
          const bannerLink = settings[`banner${i}_link`]
          const bannerAlt = settings[`banner${i}_alt`]
          
          const bannerEl = document.getElementById(`custom-banner-${i}`)
          if (bannerEl) {
            if (bannerEnabled && bannerImg) {
              const content = bannerLink 
                ? `<a href="${bannerLink}" target="_blank" rel="noopener noreferrer">
                    <img src="${bannerImg}" alt="${bannerAlt || 'Banner'}" class="w-full rounded-2xl shadow-sm object-cover max-h-48" />
                   </a>`
                : `<img src="${bannerImg}" alt="${bannerAlt || 'Banner'}" class="w-full rounded-2xl shadow-sm object-cover max-h-48" />`
              bannerEl.innerHTML = content
            } else {
              bannerEl.innerHTML = ''
            }
          }
        }

        // 3. Inject AdSense
        if (settings.adsense_enabled === 'true' && settings.adsense_publisher_id) {
          const pubId = settings.adsense_publisher_id
          
          const injectAd = (elementId: string, slotId: string) => {
            const el = document.getElementById(elementId)
            if (el && slotId) {
              el.innerHTML = `
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="${pubId}"
                     data-ad-slot="${slotId}"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
              `
              try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
              } catch (e) {}
            }
          }

          injectAd('adsense-header', settings.adsense_slot_header)
          injectAd('adsense-home', settings.adsense_slot_infeed)
          injectAd('adsense-profile', settings.adsense_slot_profile)
          injectAd('adsense-footer', settings.adsense_slot_infeed) // Reuse infeed for footer
        }

        // 4. Inject Adsterra
        if (settings.adsterra_enabled === 'true') {
          const injectScript = (elementId: string, script: string) => {
            const el = document.getElementById(elementId)
            if (el && script) {
              el.innerHTML = script
              // Execute scripts if any
              const scripts = el.getElementsByTagName('script')
              for (let i = 0; i < scripts.length; i++) {
                const s = document.createElement('script')
                if (scripts[i].src) {
                  s.src = scripts[i].src
                } else {
                  s.textContent = scripts[i].textContent
                }
                document.body.appendChild(s)
              }
            }
          }

          injectScript('adsterra-header', settings.adsterra_header)
          injectScript('adsterra-home', settings.adsterra_infeed)
          injectScript('adsterra-footer', settings.adsterra_footer)
          
          if (settings.adsterra_popunder) {
            const div = document.createElement('div')
            div.innerHTML = settings.adsterra_popunder
            document.body.appendChild(div)
          }
        }

      } catch (e) {
        console.error('Failed to load settings', e)
      }
    }

    // Load settings after a short delay to ensure DOM elements are ready
    const timer = setTimeout(loadSettings, 1000)
    return () => clearTimeout(timer)
  }, [])

  return null
}
