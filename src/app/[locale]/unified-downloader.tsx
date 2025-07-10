'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import type { Dictionary } from '@/lib/i18n/types';
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/language-switcher";
import { API_ENDPOINTS } from '@/lib/config';
import { downloadFile } from '@/lib/utils';

import { DownloadHistory, type DownloadRecord } from './download-history';
import { DouyinResultCard } from '@/components/downloader/DouyinResultCard';
import { BilibiliResultCard } from '@/components/downloader/BilibiliResultCard';
import { useLocalStorageState } from 'ahooks';
import type { UnifiedParseResult } from '@/lib/types';
import { Platform } from '@/lib/types';

interface ParseResult {
    title: string;
    downloadUrl: string;
    originalUrl: string;
    platform: Platform;
}

interface UnifiedDownloaderProps {
    dict: Dictionary;
    locale: Locale;
}



export function UnifiedDownloader({ dict, locale }: UnifiedDownloaderProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);

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

        const parseResult: UnifiedParseResult = parseResponse.data;

        if (!parseResult.data) {
            throw new Error('No data returned from parse API');
        }

        const { title, platform, downloadUrl, url } = parseResult.data;

        // 显示结果卡片，让用户选择下载格式
        setParseResult({
            title: title,
            downloadUrl: downloadUrl || '',
            originalUrl: url,
            platform: platform as Platform
        });

        // 添加到下载历史
        const newRecord: DownloadRecord = {
            url: videoUrl,
            title: title || 'Unknown Title',
            timestamp: Date.now(),
            platform: platform as Platform
        };
        addToHistory(newRecord);

        // 显示成功提示
        toast({
            title: dict.toast.douyinParseSuccess,
            description: `${platform}: ${title}`,
            duration: 3000
        });
    };

    const closeParseResult = () => {
        setParseResult(null);
    };

    // 处理用户选择的下载格式
    const handleDownload = async (format: 'audio' | 'video', originalUrl: string) => {
        try {
            let downloadUrl;

            if (format === 'audio') {
                // 调用音频下载API
                downloadUrl = `${API_ENDPOINTS.unified.download}?url=${encodeURIComponent(originalUrl)}&type=audio`;
            } else {
                // 调用视频下载API
                downloadUrl = `${API_ENDPOINTS.unified.download}?url=${encodeURIComponent(originalUrl)}&type=video`;
            }
            downloadFile(downloadUrl);
            toast({
                title: format === 'audio' ? '开始下载音频' : '开始下载视频',
                description: '下载已开始，请稍候...',
                duration: 3000
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '下载失败';
            toast({
                variant: "destructive",
                title: "下载失败",
                description: errorMessage
            });
        }
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
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
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

                    {/* 抖音专用卡片 */}
                    {parseResult && parseResult.platform.toLowerCase() === 'douyin' && (
                        <DouyinResultCard
                            title={parseResult.title}
                            downloadUrl={parseResult.downloadUrl}
                            originalUrl={parseResult.originalUrl}
                            onDownload={handleDownload}
                            onClose={closeParseResult}
                            dict={dict}
                        />
                    )}

                    {/* B站专用卡片 */}
                    {parseResult && parseResult.platform.toLowerCase() === 'bili' && (
                        <BilibiliResultCard
                            title={parseResult.title}
                            originalUrl={parseResult.originalUrl}
                            onDownload={handleDownload}
                            onClose={closeParseResult}
                        />
                    )}

                    {/* 历史记录 */}
                    <DownloadHistory
                        dict={dict}
                        downloadHistory={downloadHistory || []}
                        clearHistory={clearDownloadHistory}
                        onRedownload={handleRedownload}
                    />
                </div>
            </main>
        </div>
    );
} 