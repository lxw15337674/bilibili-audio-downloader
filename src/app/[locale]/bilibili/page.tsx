import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { BilibiliClient } from "./bilibili-client"

export default async function BilibiliPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return <BilibiliClient dict={dict} locale={locale} />
} 