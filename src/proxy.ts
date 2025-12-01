import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { i18n } from './lib/i18n/config'

// Accept-Language 到 locale 的映射
const localeMapping: Record<string, string> = {
    'zh-TW': 'zh-tw',
    'zh-HK': 'zh-tw',
    'zh-MO': 'zh-tw',
    'zh-Hant': 'zh-tw',
    'zh-Hant-TW': 'zh-tw',
    'zh-Hant-HK': 'zh-tw',
    'zh-Hant-MO': 'zh-tw',
    'zh-CN': 'zh',
    'zh-Hans': 'zh',
    'zh-Hans-CN': 'zh',
    'zh': 'zh', // 默认简体
}

function getLocaleFromCookie(request: NextRequest): string | null {
    const cookieLocale = request.cookies.get('preferred-locale')?.value
    return cookieLocale && i18n.locales.includes(cookieLocale as (typeof i18n.locales)[number]) ? cookieLocale : null
}

function getLocaleFromAcceptLanguage(request: NextRequest): string {
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

    const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

    // 先尝试精确匹配
    for (const lang of languages) {
        if (localeMapping[lang]) {
            return localeMapping[lang]
        }
    }

    // 再尝试使用 intl-localematcher
    try {
        return match(languages, i18n.locales, i18n.defaultLocale)
    } catch {
        return i18n.defaultLocale
    }
}

function getLocale(request: NextRequest): string {
    // 首先检查 URL 中是否已有语言前缀
    const pathname = request.nextUrl.pathname
    const pathnameHasLocale = i18n.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) {
        return pathname.split('/')[1]
    }

    // 检查 Cookie 中的语言偏好
    const cookieLocale = getLocaleFromCookie(request)
    if (cookieLocale) {
        return cookieLocale
    }

    // 从 Accept-Language header 获取首选语言
    return getLocaleFromAcceptLanguage(request)
}

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // 跳过 API 路由和静态文件
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.')
    ) {
        return
    }

    // 检查路径名中是否有任何支持的区域设置
    const pathnameHasLocale = i18n.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) return

    // 如果没有区域设置则重定向
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`

    const response = NextResponse.redirect(request.nextUrl)

    // 设置 Cookie 记住用户语言偏好（仅在基于浏览器检测时设置）
    if (!getLocaleFromCookie(request)) {
        response.cookies.set('preferred-locale', locale, {
            path: '/',
            maxAge: 31536000, // 1年
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        })
    }

    return response
}

export const config = {
    matcher: [
        // 匹配所有路径除了以下情况：
        // - api 路由
        // - _next 静态文件
        // - 包含点的文件 (如 .ico, .png 等)
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
    ],
} 