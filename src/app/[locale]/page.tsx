import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { UnifiedDownloader } from "./unified-downloader"

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return <UnifiedDownloader dict={dict} locale={locale} />
} 