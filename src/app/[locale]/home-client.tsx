'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorageState } from 'ahooks';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
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
            setDownloadHistory([newRecord, ...(downloadHistory || []).slice(0, 50)]);
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
        <div className="h-screen flex flex-col bg-background">
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
                                        className="min-h-[80px] resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={async () => {
                                                try {
                                                    const text = await navigator.clipboard.readText();
                                                    if (text.includes('bilibili.com/video/')) {
                                                        setUrl(text);
                                                    }
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
                    {downloadHistory && downloadHistory.length > 0 && (
                        <Card className="flex-1 min-h-0 flex flex-col">
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
                            <CardContent className="flex-1 min-h-0 p-6 pt-0">
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