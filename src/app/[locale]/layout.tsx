import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { i18n } from "@/lib/i18n/config"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// 生成静态参数
export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ locale }))
}

// 动态生成 metadata
export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return {
        title: dict.metadata.title,
        description: dict.metadata.description,
        keywords: dict.metadata.keywords.split(','),
        openGraph: {
            title: dict.metadata.ogTitle,
            description: dict.metadata.ogDescription,
            url: `https://bilibili-audio-downloader.vercel.app/${locale}`,
            siteName: dict.metadata.siteName,
            locale: locale === 'zh' ? 'zh_CN' : locale === 'zh-tw' ? 'zh_TW' : 'en_US',
            type: 'website',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
            },
        },
        alternates: {
            canonical: `https://bilibili-audio-downloader.vercel.app/${locale}`,
            languages: {
                'zh-Hans': 'https://bilibili-audio-downloader.vercel.app/zh',
                'zh-Hant': 'https://bilibili-audio-downloader.vercel.app/zh-tw',
                'zh-TW': 'https://bilibili-audio-downloader.vercel.app/zh-tw',
                'en': 'https://bilibili-audio-downloader.vercel.app/en',
                'x-default': 'https://bilibili-audio-downloader.vercel.app/zh',
            },
        },
    }
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: Locale }>;
}>) {
    const { locale } = await params

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Toaster />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={true}
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
} 