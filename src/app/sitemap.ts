import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://downloader.bhwa233.com'

    return i18n.locales.map((locale) => ({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: locale === i18n.defaultLocale ? 1.0 : 0.9,
    }))
} 