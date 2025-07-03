'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorageState } from 'ahooks';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import type { Dictionary } from '@/lib/i18n/types';
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/language-switcher";
import { API_ENDPOINTS } from '@/lib/config';

interface DownloadRecord {
    url: string;
    title: string;
    timestamp: number;
    service: string;
    cover?: string;
    downloadUrl?: string;
}

interface DouyinClientProps {
    dict: Dictionary;
    locale: Locale;
}

interface DouyinParseResult {
    title: string;
    downloadUrl: string;
    originalUrl: string;
}

export function DouyinClient({ dict, locale }: DouyinClientProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [douyinResult, setDouyinResult] = useState<DouyinParseResult | null>(null);

    const { toast } = useToast();
    const [downloadHistory, setDownloadHistory] = useLocalStorageState<DownloadRecord[]>('download-history', {
        defaultValue: []
    });

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
            // 调用解析接口获取视频信息
            const response = await axios.get(API_ENDPOINTS.douyin.parse, {
                params: {
                    url: url
                }
            });
            if (response.data) {
                const result: DouyinParseResult = {
                    title: response.data.title,
                    downloadUrl: response.data.downloadUrl,
                    originalUrl: url
                };

                // 设置结果状态用于显示卡片
                setDouyinResult(result);

                // 保存到下载历史
                const newRecord: DownloadRecord = {
                    url,
                    title: response.data.title,
                    timestamp: Date.now(),
                    service: 'douyin',
                    downloadUrl: response.data.downloadUrl
                };
                setDownloadHistory([newRecord, ...(downloadHistory || []).slice(0, 50)]);

                // 显示简化的成功 toast
                toast({
                    title: dict.toast.douyinParseSuccess,
                    duration: 3000
                });

                setUrl('');
            } else {
                setError(dict.errors.getVideoInfoFailed);
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err) ? (err.response?.data?.error || dict.errors.getVideoInfoFailed) : dict.errors.networkError;
            setError(errorMessage);
            toast({ variant: "destructive", title: dict.errors.downloadFailed, description: errorMessage });
        }

        setLoading(false);
    };

    const clearHistory = () => {
        setDownloadHistory([]);
        toast({
            title: dict.toast.historyCleared,
        });
    };

    const removeHistoryItem = (index: number) => {
        setDownloadHistory((downloadHistory || []).filter((_, i) => i !== index));
        toast({ title: dict.toast.recordDeleted });
    };

    const closeResult = () => {
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
                                <CardTitle>{dict.douyin.pageTitle}</CardTitle>
                            </h1>
                            <p className="text-xs text-muted-foreground text-center pt-1">
                                {dict.douyin.pageDescription}
                            </p>
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
                                        placeholder={dict.form.douyinPlaceholder}
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

                    {/* 下载结果卡片 */}
                    {douyinResult && (
                        <Card className="shrink-0 animate-in slide-in-from-top-2 duration-300">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-lg line-clamp-2">{dict.result.title}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={closeResult}
                                    className="h-6 w-6 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                                        视频标题
                                    </h3>
                                    <p className="text-sm leading-relaxed break-words" title={douyinResult.title}>
                                        {douyinResult.title}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                                        下载地址
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {dict.toast.manualDownloadLink}
                                    </p>
                                    <a
                                        href={douyinResult.downloadUrl}
                                        download={douyinResult.title}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline break-all block p-2 bg-muted/30 rounded border"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {douyinResult.downloadUrl}
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {downloadHistory && downloadHistory.length > 0 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{dict.history.title}</CardTitle>
                                    <CardDescription>{dict.history.description}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={clearHistory}>
                                    {dict.history.clear}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {downloadHistory.map((item, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 rounded-md hover:bg-muted/50 relative group border">
                                            {item.cover && (
                                                <img
                                                    src={item.cover}
                                                    alt={item.title}
                                                    width={80}
                                                    height={80}
                                                    className="w-20 h-20 rounded-md object-cover"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div>
                                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                                                        视频标题
                                                    </h3>
                                                    <p className="text-sm font-medium leading-relaxed line-clamp-2" title={item.title}>
                                                        {item.title}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        <span className="font-semibold">{item.service.toUpperCase()}</span> • {format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                                    </p>
                                                </div>
                                                {item.downloadUrl && item.service === 'douyin' && (
                                                    <div>
                                                        <h3 className="font-medium text-sm text-muted-foreground mb-2">
                                                            下载地址
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground mb-2">
                                                            {dict.toast.manualDownloadLink}
                                                        </p>
                                                        <a
                                                            href={item.downloadUrl}
                                                            download={item.title}
                                                            className="text-sm text-blue-600 hover:text-blue-800 underline break-all block p-2 bg-muted/30 rounded border"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {item.downloadUrl}
                                                        </a>
                                                    </div>
                                                )}
                                                {item.service === 'bilibili' && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground truncate" title={item.url}>
                                                            来源：{item.url}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={() => removeHistoryItem(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
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