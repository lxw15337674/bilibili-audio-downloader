'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/types"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HomeClientProps {
    locale: Locale;
    dict: Dictionary;
}

export function HomeClient({ locale, dict }: HomeClientProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="absolute top-4 right-4 z-10">
                <LanguageSwitcher currentLocale={locale} dict={dict} />
            </div>

            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="max-w-2xl mx-auto flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <h1 className="text-2xl text-center font-semibold tracking-tight">
                                <CardTitle>{dict.home.title}</CardTitle>
                            </h1>
                            <p className="text-xs text-muted-foreground text-center pt-1">
                                {dict.home.description}
                            </p>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <Link href={`/${locale}/bilibili`} passHref>
                                <Button className="w-full justify-between h-12">
                                    {dict.home.bilibiliButton}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href={`/${locale}/douyin`} passHref>
                                <Button className="w-full justify-between h-12">
                                    {dict.home.douyinButton}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <p className="text-center text-xs text-muted-foreground">
                        {dict.page.feedback}
                        <a
                            href="https://github.com/lxw15337674/bilibili-audio-downloader-report/issues/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                        >
                            {dict.page.feedbackLinkText}
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
} 