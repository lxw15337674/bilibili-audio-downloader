'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorageState } from 'ahooks';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns'; // Import date-fns for formatting
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useUpdateMetadata } from '@/hooks/useUpdateMetadata';

interface DownloadRecord {
  url: string;
  title: string;
  timestamp: number;
}


export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const [downloadHistory, setDownloadHistory] = useLocalStorageState<DownloadRecord[]>('download-history', {
    defaultValue: []
  });

  // 更新页面 metadata
  useUpdateMetadata();

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // URL格式验证
    if (!url.trim()) {
      setError(t('errors.emptyUrl'));
      setLoading(false);
      return;
    }

    // 验证是否为B站域名
    const bilibiliDomainRegex = /^https?:\/\/(www\.)?bilibili\.com\//;
    if (!bilibiliDomainRegex.test(url.trim())) {
      setError(t('errors.invalidUrl'));
      setLoading(false);
      return;
    }

    try {
      // 构建下载链接
      const downloadUrl = `https://bhwa233-api.vercel.app/api/bilibili-audio/download?url=${encodeURIComponent(url)}`;

      // 获取备用标题（视频ID）
      const urlMatch = url.match(/\/video\/([^/?]+)/);
      const videoId = urlMatch ? urlMatch[1] : 'unknown';
      const fallbackTitle = t('fallback.audioTitle', { videoId });

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
              errorMessage: errorData.error || t('errors.invalidVideoLink')
            };
          } else {
            return {
              title: fallbackTitle,
              hasError: true,
              errorMessage: axios.isAxiosError(error) ? (error.response?.data?.error || t('errors.fetchVideoInfoFailed')) : t('errors.networkError')
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
      const errorMessage = err instanceof Error ? err.message : t('errors.downloadError');
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: t('messages.downloadFailed'),
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setDownloadHistory([]);
    toast({
      title: t('messages.historyCleared'),
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 顶部语言切换 */}
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-0 overflow-hidden">
        <div className="max-w-2xl mx-auto h-full flex flex-col gap-4">
          <Card className="shrink-0">
            <CardHeader>
              <h1 className="text-2xl text-center font-semibold tracking-tight">
                <CardTitle>{t('main.title')}</CardTitle>
              </h1>
              <p className="text-xs text-muted-foreground text-center pt-1">
                {t('main.subtitle')}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDownload} className="space-y-6">
                <div className="space-y-2">
                  <Textarea
                    id="url"
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUrl(e.target.value)}
                    placeholder={t('main.urlPlaceholder')}
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
                            title: t('errors.clipboardReadFailed'),
                            description: t('errors.clipboardPermissionDescription'),
                          });
                        }
                      }}
                    >
                      {t('main.pasteFromClipboard')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2"
                      disabled={loading || !url.trim()}
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {loading ? t('main.downloading') : t('main.downloadAudio')}
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
                    <CardTitle>{t('main.downloadHistory')}</CardTitle>
                  </h2>
                  <CardDescription>{t('main.recentRecords')}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  {t('main.clearHistory')}
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
                          {t('main.viewSource')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUrl(record.url);
                            toast({
                              title: t('messages.linkFilled'),
                              description: t('messages.linkFilledDescription'),
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {t('main.redownload')}
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
