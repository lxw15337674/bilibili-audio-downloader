import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { HomeClient } from "./home-client"

export default async function Home({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return <HomeClient locale={locale} dict={dict} />
} 