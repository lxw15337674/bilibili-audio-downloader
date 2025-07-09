'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Download, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import type { Dictionary } from '@/lib/i18n/types';
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/language-switcher";
import { API_ENDPOINTS } from '@/lib/config';
import { downloadFile } from '@/lib/utils';
import { detectPlatform, getPlatformDisplayName, normalizeUrl, type Platform, type PlatformInfo } from '@/lib/platformDetector';
import { DownloadHistory, useDownloadHistory, type DownloadRecord } from './download-history';

interface UnifiedDownloaderProps {
    dict: Dictionary;
    locale: Locale;
}

interface DouyinParseResult {
    title: string;
    downloadUrl: string;
    originalUrl: string;
}

export function UnifiedDownloader({ dict, locale }: UnifiedDownloaderProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({ platform: 'unknown', confidence: 0 });
    const [douyinResult, setDouyinResult] = useState<DouyinParseResult | null>(null);

    const { toast } = useToast();
    const { downloadHistory, addToHistory, clearHistory } = useDownloadHistory();

    // 实时检测URL平台
    useEffect(() => {
        if (url.trim()) {
            const info = detectPlatform(url.trim());
            setPlatformInfo(info);

            // 显示检测结果的提示
            if (info.platform !== 'unknown' && info.confidence > 0.6) {
                const platformName = getPlatformDisplayName(info.platform);
                console.log(`Detected platform: ${platformName} (confidence: ${info.confidence})`);
            }
        } else {
            setPlatformInfo({ platform: 'unknown', confidence: 0 });
        }
    }, [url]);

    // 获取动态placeholder
    const getPlaceholder = () => {
        if (platformInfo.platform === 'bilibili' && platformInfo.confidence > 0.6) {
            return dict.unified.placeholderBilibili;
        } else if (platformInfo.platform === 'douyin' && platformInfo.confidence > 0.6) {
            return dict.unified.placeholderDouyin;
        }
        return dict.unified.placeholder;
    };

    // 处理B站下载
    const handleBilibiliDownload = async (videoUrl: string) => {
        const downloadUrl = `${API_ENDPOINTS.bilibili.download}?url=${encodeURIComponent(videoUrl)}`;
        const urlMatch = videoUrl.match(/\/video\/([^/?]+)/);
        const videoId = urlMatch ? urlMatch[1] : 'unknown';
        const fallbackTitle = `${dict.form.fallbackTitle}_${videoId}`;

        const downloadPromise = new Promise<void>((resolve) => {
            downloadFile(downloadUrl);
            resolve();
        });

        const titlePromise = axios.get(`${API_ENDPOINTS.bilibili.title}?url=${encodeURIComponent(videoUrl)}`)
            .then(response => ({ title: response.data?.data?.title || fallbackTitle }))
            .catch(() => ({ title: fallbackTitle }));

        const [{ title }] = await Promise.all([titlePromise, downloadPromise]);

        const newRecord: DownloadRecord = {
            url: videoUrl,
            title,
            timestamp: Date.now(),
        };
        addToHistory(newRecord);
    };

    // 处理抖音下载
    const handleDouyinDownload = async (videoUrl: string) => {
        const response = await axios.get(API_ENDPOINTS.douyin.parse, {
            params: { url: videoUrl }
        });

        if (response.data) {
            const result: DouyinParseResult = {
                title: response.data.title,
                downloadUrl: response.data.downloadUrl,
                originalUrl: videoUrl
            };

            setDouyinResult(result);

            const newRecord: DownloadRecord = {
                url: videoUrl,
                title: response.data.title,
                timestamp: Date.now(),
            };
            addToHistory(newRecord);

            toast({
                title: dict.toast.douyinParseSuccess,
                duration: 3000
            });
        } else {
            throw new Error('Failed to parse Douyin video');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setDouyinResult(null);

        if (!url.trim()) {
            setError(dict.errors.emptyUrl);
            setLoading(false);
            return;
        }

        try {
            const normalizedUrl = normalizeUrl(url.trim());
            const detectedPlatform = detectPlatform(normalizedUrl);

            if (detectedPlatform.confidence < 0.3) {
                setError(dict.errors.unsupportedPlatform);
                setLoading(false);
                return;
            }

            // 对于低置信度检测，显示警告但仍然尝试处理
            if (detectedPlatform.confidence < 0.6) {
                toast({
                    title: "检测置信度较低",
                    description: "将尝试按检测到的平台处理，如果失败请检查链接格式",
                    duration: 3000,
                });
            }

            switch (detectedPlatform.platform) {
                case 'bilibili':
                    await handleBilibiliDownload(normalizedUrl);
                    break;
                case 'douyin':
                    await handleDouyinDownload(normalizedUrl);
                    break;
                default:
                    setError(dict.errors.unsupportedPlatform);
                    setLoading(false);
                    return;
            }

            setUrl('');
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? (err.response?.data?.error || dict.errors.getVideoInfoFailed)
                : (err instanceof Error ? err.message : dict.errors.downloadError);
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: dict.errors.downloadFailed,
                description: errorMessage
            });
        }

        setLoading(false);
    };

    const handleRedownload = (url: string) => {
        setUrl(url);
        toast({
            title: "链接已填入",
            description: "点击下载按钮开始重新下载",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closeDouyinResult = () => {
        setDouyinResult(null);
    };



    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="absolute top-4 right-4 z-10">
                <LanguageSwitcher currentLocale={locale} dict={dict} />
            </div>

            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                    <Card className="shrink-0">
                        <CardHeader>
                            <h1 className="text-2xl text-center font-semibold tracking-tight">
                                <CardTitle>{dict.unified.pageTitle}</CardTitle>
                            </h1>
                            <p className="text-xs text-muted-foreground text-center pt-1">
                                {dict.unified.pageDescription}
                            </p>

                            {/* 平台检测指示器 */}
                            {url.trim() && (
                                <div className="flex items-center justify-center gap-2 mt-2 animate-in fade-in duration-300">
                                    <LinkIcon className="h-4 w-4" />
                                    {platformInfo.platform !== 'unknown' && platformInfo.confidence > 0.6 ? (
                                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            {dict.unified.platformDetected} {getPlatformDisplayName(platformInfo.platform)}
                                        </span>
                                    ) : platformInfo.confidence > 0.3 ? (
                                        <span className="text-sm text-yellow-600 dark:text-yellow-400">
                                            {dict.unified.platformDetected} {getPlatformDisplayName(platformInfo.platform)} (低置信度)
                                        </span>
                                    ) : (
                                        <span className="text-sm text-orange-600 dark:text-orange-400">
                                            {dict.unified.platformUnknown}
                                        </span>
                                    )}
                                </div>
                            )}

                            <p className="text-center text-xs text-muted-foreground pt-4">
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
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Textarea
                                        id="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder={getPlaceholder()}
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

                                                    // 延迟检测平台并显示结果
                                                    setTimeout(() => {
                                                        const detected = detectPlatform(text.trim());
                                                        if (detected.platform !== 'unknown' && detected.confidence > 0.6) {
                                                            toast({
                                                                title: dict.toast.linkFilled,
                                                                description: `${dict.unified.platformDetected} ${getPlatformDisplayName(detected.platform)}`,
                                                            });
                                                        } else {
                                                            toast({
                                                                title: dict.toast.linkFilled,
                                                            });
                                                        }
                                                    }, 100);
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

                    {/* 抖音下载结果卡片 */}
                    {douyinResult && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{dict.result.title}</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" onClick={closeDouyinResult}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium break-all">{douyinResult.title}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={douyinResult.downloadUrl}
                                            download={true}
                                            className="flex-1"
                                        >
                                            <Button className="w-full">
                                                <Download className="h-4 w-4 mr-2" />
                                                {dict.result.downloadButton}
                                            </Button>
                                        </a>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        {dict.toast.manualDownloadLink}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 历史记录 */}
                    <DownloadHistory
                        dict={{
                            history: {
                                title: dict.history.title,
                                description: dict.history.description,
                                clear: dict.history.clear,
                                cleared: "历史记录已清空",
                                viewSource: dict.history.viewSource,
                                redownload: dict.history.redownload,
                                linkFilled: "链接已填入",
                                clickToRedownload: "点击下载按钮开始重新下载"
                            }
                        }}
                        onRedownload={handleRedownload}
                    />
                </div>
            </main>
        </div>
    );
} 