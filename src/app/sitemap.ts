import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://bilibili-audio-downloader.vercel.app'

    return i18n.locales.map((locale) => ({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1.0,
        alternates: {
            languages: {
                'zh-Hans': `${baseUrl}/zh`,
                'zh-Hant': `${baseUrl}/zh-tw`,
                'zh-TW': `${baseUrl}/zh-tw`,
                'en': `${baseUrl}/en`,
                'x-default': `${baseUrl}/zh`,
            }
        }
    }))
} 