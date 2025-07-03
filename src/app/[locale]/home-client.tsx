'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocalStorageState } from 'ahooks';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/types"
import { LanguageSwitcher } from "@/components/language-switcher"

interface DownloadRecord {
    url: string;
    title: string;
    timestamp: number;
}

interface HomeClientProps {
    locale: Locale;
    dict: Dictionary;
}

export function HomeClient({ locale, dict }: HomeClientProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();
    const [downloadHistory, setDownloadHistory] = useLocalStorageState<DownloadRecord[]>('download-history', {
        defaultValue: []
    });

    // 折叠区域状态管理
    const [whyChooseUsOpen, setWhyChooseUsOpen] = useState(true);
    const [userGuideOpen, setUserGuideOpen] = useState(true);
    const [privacyTermsOpen, setPrivacyTermsOpen] = useState(true);
    const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

    // 自动折叠逻辑 - 只在没有下载历史时生效
    useEffect(() => {
        if (!hasAutoCollapsed && (!downloadHistory || downloadHistory.length === 0)) {
            const timer = setTimeout(() => {
                setWhyChooseUsOpen(false);
                setUserGuideOpen(false);
                setPrivacyTermsOpen(false);
                setHasAutoCollapsed(true);
            }, 3000); // 3秒后自动折叠

            return () => clearTimeout(timer);
        }
    }, [hasAutoCollapsed, downloadHistory]);

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // URL格式验证
        if (!url.trim()) {
            setError(dict.errors.emptyUrl);
            setLoading(false);
            return;
        }

        // 验证是否为B站域名
        const bilibiliDomainRegex = /^https?:\/\/(www\.)?bilibili\.com\//;
        if (!bilibiliDomainRegex.test(url.trim())) {
            setError(dict.errors.invalidUrl);
            setLoading(false);
            return;
        }

        try {
            // 构建下载链接
            const downloadUrl = `https://bhwa233-api.vercel.app/api/bilibili-audio/download?url=${encodeURIComponent(url)}`;

            // 获取备用标题（视频ID）
            const urlMatch = url.match(/\/video\/([^/?]+)/);
            const videoId = urlMatch ? urlMatch[1] : 'unknown';
            const fallbackTitle = `${dict.form.fallbackTitle}_${videoId}`;

            // 并发执行：同时开始下载和获取标题
            const downloadPromise = new Promise<void>((resolve) => {
                // 后台下载：创建隐藏的 a 标签触发下载
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = ''; // 让浏览器自动处理文件名
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                resolve();
            });

            const titlePromise = axios.get(`/api/bilibili-title?url=${encodeURIComponent(url)}`)
                .then(response => {
                    const data = response.data;
                    return { title: data?.data?.title || fallbackTitle, hasError: false, errorMessage: undefined };
                })
                .catch(error => {
                    if (axios.isAxiosError(error) && error.response?.status === 400) {
                        // 400错误：链接格式问题或视频不存在
                        const errorData = error.response.data || {};
                        return {
                            title: fallbackTitle,
                            hasError: true,
                            errorMessage: errorData.error || dict.errors.videoLinkInvalid
                        };
                    } else {
                        return {
                            title: fallbackTitle,
                            hasError: true,
                            errorMessage: axios.isAxiosError(error) ? (error.response?.data?.error || dict.errors.getVideoInfoFailed) : dict.errors.networkError
                        };
                    }
                });

            // 等待两个操作完成
            const [, titleResult] = await Promise.all([downloadPromise, titlePromise]);

            // 处理标题获取结果
            const title = titleResult.title;

            const newRecord: DownloadRecord = {
                url,
                title,
                timestamp: Date.now(),
            };
            setDownloadHistory([newRecord, ...(downloadHistory || []).slice(0, 19)]);
            setUrl('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : dict.errors.downloadError;
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: dict.errors.downloadFailed,
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        setDownloadHistory([]);
        toast({
            title: dict.history.cleared,
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Language Switcher */}
            <div className="absolute top-4 right-4 z-10">
                <LanguageSwitcher currentLocale={locale} dict={dict} />
            </div>

            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-hidden">
                <div className="max-w-2xl mx-auto h-full flex flex-col gap-4">
                    <Card className="shrink-0">
                        <CardHeader>
                            <h1 className="text-2xl text-center font-semibold tracking-tight">
                                <CardTitle>{dict.page.title}</CardTitle>
                            </h1>
                            <p className="text-xs text-muted-foreground text-center pt-1">
                                {dict.page.description}
                            </p>
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
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleDownload} className="space-y-6">
                                <div className="space-y-2">
                                    <Textarea
                                        id="url"
                                        value={url}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUrl(e.target.value)}
                                        placeholder={dict.form.placeholder}
                                        required
                                        className="min-h-[80px] resize-none break-all"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={async () => {
                                                try {
                                                    const text = await navigator.clipboard.readText();
                                                        setUrl(text);
                                                } catch (err) {
                                                    console.error('Failed to read clipboard:', err);
                                                    toast({
                                                        variant: "destructive",
                                                        title: dict.errors.clipboardFailed,
                                                        description: dict.errors.clipboardPermission,
                                                    });
                                                }
                                            }}
                                        >
                                            {dict.form.pasteButton}
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 flex items-center justify-center gap-2"
                                            disabled={loading || !url.trim()}
                                        >
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {loading ? dict.form.downloading : dict.form.downloadButton}
                                        </Button>
                                    </div>
                                </div>
                                {error && (
                                    <p className="text-sm text-destructive text-center">{error}</p>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* 只在没有下载历史时显示可折叠区域 */}
                    {(!downloadHistory || downloadHistory.length === 0) && (
                        <>
                            {/* Why Choose Us - Collapsible Section */}
                            <Collapsible
                                open={whyChooseUsOpen}
                                onOpenChange={setWhyChooseUsOpen}
                                className="shrink-0"
                            >
                                <Card>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="text-left">
                                                    <CardTitle className="text-xl">{dict.collapsible.whyChooseUs.title}</CardTitle>
                                                    <CardDescription>{dict.collapsible.whyChooseUs.description}</CardDescription>
                                                </div>
                                                <ChevronDown
                                                    className={`h-5 w-5 transition-transform duration-200 ${whyChooseUsOpen ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 space-y-6">
                                            {/* Features Content */}
                                            <div>
                                                <h3 className="font-semibold text-lg mb-4 text-center">{dict.features.title}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="text-center p-4">
                                                        <h4 className="font-semibold text-base mb-2">{dict.features.quality.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.features.quality.description}</p>
                                                    </div>
                                                    <div className="text-center p-4">
                                                        <h4 className="font-semibold text-base mb-2">{dict.features.speed.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.features.speed.description}</p>
                                                    </div>
                                                    <div className="text-center p-4">
                                                        <h4 className="font-semibold text-base mb-2">{dict.features.free.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.features.free.description}</p>
                                                    </div>
                                                    <div className="text-center p-4">
                                                        <h4 className="font-semibold text-base mb-2">{dict.features.privacy.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.features.privacy.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Technical Content */}
                                            <div className="border-t pt-6">
                                                <h3 className="font-semibold text-lg mb-4 text-center">{dict.technical.title}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="text-center p-4">
                                                        <h4 className="font-semibold text-base mb-2">{dict.technical.extraction.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.technical.extraction.description}</p>
                                                    </div>
                                                    <div className="text-center p-4">
                                                        <h4 className="font-semibold text-base mb-2">{dict.technical.formats.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.technical.formats.description}</p>
                                                    </div>
                                                    <div className="text-center p-4">
                                                        <h4 className="font-semibold text-base mb-2">{dict.technical.compatibility.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.technical.compatibility.description}</p>
                                                    </div>
                                                    <div className="text-center p-4">
                                                        <h4 className="font-semibold text-base mb-2">{dict.technical.reliability.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.technical.reliability.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* User Guide - Collapsible Section */}
                            <Collapsible
                                open={userGuideOpen}
                                onOpenChange={setUserGuideOpen}
                                className="shrink-0"
                            >
                                <Card>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="text-left">
                                                    <CardTitle className="text-xl">{dict.collapsible.userGuide.title}</CardTitle>
                                                    <CardDescription>{dict.collapsible.userGuide.description}</CardDescription>
                                                </div>
                                                <ChevronDown
                                                    className={`h-5 w-5 transition-transform duration-200 ${userGuideOpen ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 space-y-6">
                                            {/* Steps Content */}
                                            <div>
                                                <h3 className="font-semibold text-lg mb-4 text-center">{dict.steps.title}</h3>
                                                <div className="space-y-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                                                        <div>
                                                            <h4 className="font-semibold text-base mb-1">{dict.steps.step1.title}</h4>
                                                            <p className="text-sm text-muted-foreground">{dict.steps.step1.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                                                        <div>
                                                            <h4 className="font-semibold text-base mb-1">{dict.steps.step2.title}</h4>
                                                            <p className="text-sm text-muted-foreground">{dict.steps.step2.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                                                        <div>
                                                            <h4 className="font-semibold text-base mb-1">{dict.steps.step3.title}</h4>
                                                            <p className="text-sm text-muted-foreground">{dict.steps.step3.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FAQ Content */}
                                            <div className="border-t pt-6">
                                                <h3 className="font-semibold text-lg mb-4 text-center">{dict.faq.title}</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-semibold text-base mb-2">{dict.faq.format.question}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.faq.format.answer}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-base mb-2">{dict.faq.quality.question}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.faq.quality.answer}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-base mb-2">{dict.faq.limit.question}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.faq.limit.answer}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-base mb-2">{dict.faq.safety.question}</h4>
                                                        <p className="text-sm text-muted-foreground">{dict.faq.safety.answer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Privacy & Terms - Collapsible Section */}
                            <Collapsible
                                open={privacyTermsOpen}
                                onOpenChange={setPrivacyTermsOpen}
                                className="shrink-0"
                            >
                                <Card>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="text-left">
                                                    <CardTitle >{dict.collapsible.privacyTerms.title}</CardTitle>
                                                    <CardDescription>{dict.collapsible.privacyTerms.description}</CardDescription>
                                                </div>
                                                <ChevronDown
                                                    className={`h-5 w-5 transition-transform duration-200 ${privacyTermsOpen ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0 space-y-6">
                                            {/* Privacy Policy Content */}
                                            <div>
                                                <h3 className="font-semibold text-lg mb-4">{dict.privacy.title}</h3>

                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">{dict.privacy.introduction.title}</h4>
                                                        <p className="text-muted-foreground">{dict.privacy.introduction.content}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2">{dict.privacy.collection.title}</h4>
                                                        <ul className="space-y-1 text-muted-foreground ml-4">
                                                            <li>• {dict.privacy.collection.noPersonalData}</li>
                                                            <li>• {dict.privacy.collection.technicalData}</li>
                                                            <li>• {dict.privacy.collection.usageData}</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2">{dict.privacy.usage.title}</h4>
                                                        <ul className="space-y-1 text-muted-foreground ml-4">
                                                            <li>• {dict.privacy.usage.serviceProvision}</li>
                                                            <li>• {dict.privacy.usage.improvement}</li>
                                                            <li>• {dict.privacy.usage.security}</li>
                                                            <li>• {dict.privacy.usage.analytics}</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2">{dict.privacy.storage.title}</h4>
                                                        <ul className="space-y-1 text-muted-foreground ml-4">
                                                            <li>• {dict.privacy.storage.noStorage}</li>
                                                            <li>• {dict.privacy.storage.temporary}</li>
                                                            <li>• {dict.privacy.storage.security}</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2">{dict.privacy.thirdParty.title}</h4>
                                                        <ul className="space-y-1 text-muted-foreground ml-4">
                                                            <li>• {dict.privacy.thirdParty.analytics}</li>
                                                            <li>• {dict.privacy.thirdParty.ads}</li>
                                                            <li>• {dict.privacy.thirdParty.hosting}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Legal Terms Content */}
                                            <div className="border-t pt-6">
                                                <h3 className="font-semibold text-lg mb-4">{dict.legal.title}</h3>
                                                <div className="space-y-3 text-sm">
                                                    <p className="text-muted-foreground">{dict.legal.personalUse}</p>
                                                    <p className="text-muted-foreground">{dict.legal.copyright}</p>
                                                    <p className="text-muted-foreground">{dict.legal.support}</p>
                                                    <p className="text-muted-foreground font-medium">{dict.legal.disclaimer}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        </>
                    )}

                    {downloadHistory && downloadHistory.length > 0 && (
                        <Card className="flex-1 min-h-0 flex flex-col ">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold tracking-tight">
                                        <CardTitle>{dict.history.title}</CardTitle>
                                    </h2>
                                    <CardDescription>{dict.history.description}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={clearHistory}>
                                    {dict.history.clear}
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-0 p-6 pt-0 ">
                                <div className="h-full overflow-y-auto space-y-2 pr-2">
                                    {downloadHistory.map((record) => (
                                        <div key={record.timestamp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-sm p-2 hover:bg-muted/50 rounded-lg">
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate font-medium" title={record.title}>
                                                    {record.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm')}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        window.open(record.url, '_blank');
                                                    }}
                                                >
                                                    {dict.history.viewSource}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setUrl(record.url);
                                                        toast({
                                                            title: dict.history.linkFilled,
                                                            description: dict.history.clickToRedownload,
                                                        });
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                >
                                                    {dict.history.redownload}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
} 