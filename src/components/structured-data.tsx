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
        "alternateName": locale === 'en' ? "Bilibili & Douyin Downloader" : "Bilibili抖音下载器",
        "description": dict.metadata.description,
        "url": `https://downloader.bhwa233.com/${locale}`,
        "inLanguage": locale === 'zh' ? 'zh-CN' : locale === 'zh-tw' ? 'zh-TW' : 'en-US',
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `https://downloader.bhwa233.com/${locale}`
            },
            "query-input": "required name=search_term_string"
        },
        "creator": {
            "@type": "Organization",
            "name": dict.metadata.siteName
        },
        "publisher": {
            "@type": "Organization",
            "name": dict.metadata.siteName
        }
    }

    const webApplicationSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": dict.metadata.siteName,
        "description": dict.metadata.description,
        "url": `https://downloader.bhwa233.com/${locale}`,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "permissions": "browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": locale === 'en' ? dict.seo.features.en : dict.seo.features.zh
    }

    // FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": locale === 'en' ? dict.seo.faq.en.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        })) : dict.seo.faq.zh.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    }

    // HowTo Schema
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": locale === 'en' ? dict.seo.howTo.title.en : dict.seo.howTo.title.zh,
        "description": dict.metadata.description,
        "step": locale === 'en' ? dict.seo.howTo.steps.en.map(step => ({
            "@type": "HowToStep",
            "name": step.name,
            "text": step.text
        })) : dict.seo.howTo.steps.zh.map(step => ({
            "@type": "HowToStep",
            "name": step.name,
            "text": step.text
        }))
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema)
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(howToSchema)
                }}
            />
        </>
    )
} 