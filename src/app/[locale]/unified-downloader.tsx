'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import type { Dictionary } from '@/lib/i18n/types';
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/language-switcher";
import { API_ENDPOINTS } from '@/lib/config';

import { DownloadHistory, type DownloadRecord } from './download-history';
import { ResultCard } from '@/components/downloader/ResultCard';
import { QuickStartCard } from '@/components/downloader/QuickStartCard';
import { PlatformGuideCard } from '@/components/downloader/PlatformGuideCard';
import { FreeSupportCard } from '@/components/downloader/FreeSupportCard';
import { useLocalStorageState } from 'ahooks';
import type { UnifiedParseResult } from '@/lib/types';
import { Platform } from '@/lib/types';

interface UnifiedDownloaderProps {
    dict: Dictionary;
    locale: Locale;
}

export function UnifiedDownloader({ dict, locale }: UnifiedDownloaderProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [parseResult, setParseResult] = useState<UnifiedParseResult['data'] | null>(null);

    const { toast } = useToast();
    const [downloadHistory, setDownloadHistory] = useLocalStorageState<DownloadRecord[]>('download-history', {
        defaultValue: []
    });
    const addToHistory = (record: DownloadRecord) => {
        setDownloadHistory(prev => [record, ...(prev || []).slice(0, 29)]);
    };

    const clearDownloadHistory = () => {
        setDownloadHistory([]);
    };

    // 统一解析处理：只解析不自动下载
    const handleUnifiedParse = async (videoUrl: string) => {
        // 调用解析接口获取视频信息
        const parseResponse = await axios.get(`${API_ENDPOINTS.unified.parse}?url=${encodeURIComponent(videoUrl)}`);

        if (!parseResponse.data || !parseResponse.data.success) {
            throw new Error(parseResponse.data?.error || 'Failed to parse video');
        }

        const apiResult: UnifiedParseResult = parseResponse.data;

        if (!apiResult.data) {
            throw new Error('No data returned from parse API');
        }

        // 直接保存完整 parseResult.data，便于 ResultCard 渲染所有字段
        setParseResult(apiResult.data);

        // 添加到下载历史
        const newRecord: DownloadRecord = {
            url: videoUrl,
            title: apiResult.data.title || 'Unknown Title',
            timestamp: Date.now(),
            platform: apiResult.data.platform as Platform
        };
        addToHistory(newRecord);

        // 显示成功提示
        toast({
            title: dict.toast.douyinParseSuccess,
            description: `${apiResult.data.platform}: ${apiResult.data.title}`,
            duration: 3000
        });
    };

    const closeParseResult = () => {
        setParseResult(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setParseResult(null);

        if (!url.trim()) {
            setError(dict.errors.emptyUrl);
            setLoading(false);
            return;
        }

        try {
            // 使用统一接口处理所有平台，后端负责所有检测和处理
            await handleUnifiedParse(url.trim());

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
            title: dict.toast.linkFilledForRedownload,
            description: dict.toast.clickToRedownloadDesc,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="absolute top-4 right-4 z-10">
                <LanguageSwitcher currentLocale={locale} dict={dict} />
            </div>

            <main className="flex-1 p-4 sm:p-6 md:p-8">
                {/* PC端三栏布局，移动端垂直布局 */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* 左栏：快速入门指南 (PC端显示，移动端隐藏) */}
                        <div className="hidden xl:block">
                            <div className="sticky top-6 space-y-4">
                                <QuickStartCard dict={dict} />
                                <FreeSupportCard dict={dict} />
                            </div>
                        </div>

                        {/* 中栏：主要功能区域 */}
                        <div className="xl:col-span-2 flex flex-col gap-4">
                            <Card className="shrink-0">
                                <CardHeader>
                                    <h1 className="text-2xl text-center font-semibold tracking-tight">
                                        <CardTitle>{dict.unified.pageTitle}</CardTitle>
                                    </h1>
                                    <p className="text-xs text-muted-foreground text-center ">
                                        {dict.unified.pageDescription}
                                    </p>

                                    <p className="text-center text-xs text-muted-foreground ">
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
                                                placeholder={dict.unified.placeholder}
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

                                                            // 显示链接已粘贴提示
                                                            toast({
                                                                title: dict.toast.linkFilled,
                                                            });
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
                            <ResultCard
                                result={parseResult}
                                    onClose={closeParseResult}
                                    dict={dict}
                            />

                            {/* 历史记录 */}
                            <DownloadHistory
                                dict={dict}
                                downloadHistory={downloadHistory || []}
                                clearHistory={clearDownloadHistory}
                                onRedownload={handleRedownload}
                            />

                            {/* 移动端帮助卡片 - 放在历史记录下方 */}
                            <div className="xl:hidden space-y-4">
                                <QuickStartCard dict={dict} />
                                <FreeSupportCard dict={dict} />
                                <PlatformGuideCard dict={dict} />
                            </div>
                        </div>

                        {/* 右栏：平台支持指南 (PC端显示，移动端隐藏) */}
                        <div className="hidden xl:block">
                            <div className="sticky top-6">
                                <PlatformGuideCard dict={dict} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 页面底部版权说明 */}
            <footer className="border-t bg-muted/30 py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <div className="text-center text-xs text-muted-foreground space-y-1">
                        <p>{dict.page.copyrightVideo}</p>
                        <p>{dict.page.copyrightStorage}</p>
                        <p>{dict.page.copyrightYear}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 