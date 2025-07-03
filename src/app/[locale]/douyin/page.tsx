import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { DouyinClient } from "./douyin-client"

export default async function DouyinPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return <DouyinClient dict={dict} locale={locale} />
} 