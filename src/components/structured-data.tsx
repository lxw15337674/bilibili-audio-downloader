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
        "url": `https://bilibili-audio-downloader.vercel.app/${locale}`,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "permissions": "browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": locale === 'en' ? [
            "Extract MP3 audio from Bilibili videos",
            "Download Douyin videos without watermark",
            "Auto-detect video platform",
            "High-quality audio and video downloads",
            "Free online tool",
            "No registration required",
            "Support multiple video formats",
            "Browser-based processing"
        ] : [
            "提取B站视频MP3音频",
            "下载抖音无水印视频",
            "自动识别视频平台",
            "高清音频视频下载",
            "免费在线工具",
            "无需注册",
            "支持多种视频格式",
            "浏览器处理"
        ]
    }

    // FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": locale === 'en' ? [
            {
                "@type": "Question",
                "name": "How to download Bilibili audio?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Paste the Bilibili video link into the input field, click download, and the MP3 audio will be extracted and downloaded automatically."
                }
            },
            {
                "@type": "Question",
                "name": "How to download Douyin videos without watermark?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Paste the Douyin video link, the tool will automatically detect the platform and provide a watermark-free download link."
                }
            },
            {
                "@type": "Question",
                "name": "Is this tool free to use?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, this is a completely free online tool with no registration required. You can download unlimited videos and audio files."
                }
            }
        ] : [
            {
                "@type": "Question",
                "name": "如何下载B站音频？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "将B站视频链接粘贴到输入框中，点击下载，系统会自动提取并下载MP3音频文件。"
                }
            },
            {
                "@type": "Question",
                "name": "如何下载抖音无水印视频？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "粘贴抖音视频链接，工具会自动识别平台并提供无水印下载链接。"
                }
            },
            {
                "@type": "Question",
                "name": "这个工具免费吗？",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "是的，这是一个完全免费的在线工具，无需注册。您可以无限制下载视频和音频文件。"
                }
            }
        ]
    }

    // HowTo Schema
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": locale === 'en' ? "How to download Bilibili audio and Douyin videos" : "如何下载B站音频和抖音视频",
        "description": dict.metadata.description,
        "step": locale === 'en' ? [
            {
                "@type": "HowToStep",
                "name": "Copy video link",
                "text": "Copy the Bilibili or Douyin video link from your browser"
            },
            {
                "@type": "HowToStep",
                "name": "Paste link",
                "text": "Paste the video link into the input field on our website"
            },
            {
                "@type": "HowToStep",
                "name": "Auto-detect platform",
                "text": "The tool will automatically detect whether it's Bilibili or Douyin"
            },
            {
                "@type": "HowToStep",
                "name": "Download",
                "text": "Click the download button to get your MP3 audio or watermark-free video"
            }
        ] : [
            {
                "@type": "HowToStep",
                "name": "复制视频链接",
                "text": "从浏览器复制B站或抖音视频链接"
            },
            {
                "@type": "HowToStep",
                "name": "粘贴链接",
                "text": "将视频链接粘贴到网站的输入框中"
            },
            {
                "@type": "HowToStep",
                "name": "自动识别平台",
                "text": "工具会自动识别是B站还是抖音"
            },
            {
                "@type": "HowToStep",
                "name": "下载",
                "text": "点击下载按钮获取MP3音频或无水印视频"
            }
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