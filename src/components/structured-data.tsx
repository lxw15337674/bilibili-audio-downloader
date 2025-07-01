import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'

interface StructuredDataProps {
    locale: Locale
    dict: Dictionary
}

export function StructuredData({ locale, dict }: StructuredDataProps) {
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": dict.metadata.siteName,
        "alternateName": "Bilibili Audio Downloader",
        "description": dict.metadata.description,
        "url": `https://bilibili-audio-downloader.vercel.app/${locale}`,
        "inLanguage": locale === 'zh' ? 'zh-CN' : locale === 'zh-tw' ? 'zh-TW' : 'en-US',
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `https://bilibili-audio-downloader.vercel.app/${locale}`
            },
            "query-input": "required name=search_term_string"
        },
        "creator": {
            "@type": "Organization",
            "name": "Bilibili Audio Downloader"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Bilibili Audio Downloader"
        }
    }

    const webApplicationSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": dict.metadata.siteName,
        "description": dict.metadata.description,
        "url": `https://bilibili-audio-downloader.vercel.app/${locale}`,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "permissions": "browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": [
            "Extract audio from Bilibili videos",
            "Download MP3 files",
            "Free online tool",
            "No registration required"
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteSchema)
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(webApplicationSchema)
                }}
            />
        </>
    )
} 