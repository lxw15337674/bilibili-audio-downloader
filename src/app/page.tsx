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
  const [downloadHistory, setDownloadHistory] = useLocalStorageState<DownloadRecord[]>('download-history', {
    defaultValue: []
  });

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // URL格式验证
    if (!url.trim()) {
      setError('请输入视频链接');
      setLoading(false);
      return;
    }

    // 验证是否为B站域名
    const bilibiliDomainRegex = /^https?:\/\/(www\.)?bilibili\.com\//;
    if (!bilibiliDomainRegex.test(url.trim())) {
      setError('请输入有效的B站链接');
      setLoading(false);
      return;
    }

    try {
      // 构建下载链接
      const downloadUrl = `https://bhwa233-api.vercel.app/api/bilibili-audio/download?url=${encodeURIComponent(url)}`;

      // 获取备用标题（视频ID）
      const urlMatch = url.match(/\/video\/([^/?]+)/);
      const videoId = urlMatch ? urlMatch[1] : 'unknown';
      const fallbackTitle = `B站音频_${videoId}`;

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
              errorMessage: errorData.error || '视频链接可能无效'
            };
          } else {
            return {
              title: fallbackTitle,
              hasError: true,
              errorMessage: axios.isAxiosError(error) ? (error.response?.data?.error || '获取视频信息失败') : '网络错误'
            };
          }
        });

      // 等待两个操作完成
      const [, titleResult] = await Promise.all([downloadPromise, titlePromise]);

      // 处理标题获取结果
      const title = titleResult.title;

      // 如果获取标题时出现错误，显示警告
      if (titleResult.hasError && titleResult.errorMessage) {
        toast({
          variant: "destructive",
          title: "警告",
          description: `${titleResult.errorMessage}，但下载将继续进行`,
        });
      }

      // Add to download history
      const newRecord: DownloadRecord = {
        url,
        title,
        timestamp: Date.now(),
      };
      setDownloadHistory([newRecord, ...(downloadHistory || []).slice(0, 50)]); 
      toast({
        title: "下载开始",
        description: `正在下载：${title}`,
      });

      // Clear the input field after successful download
      setUrl('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '下载过程中出现错误';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "下载失败",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setDownloadHistory([]);
    toast({
      title: "下载历史已清除",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-hidden">
        <div className="max-w-2xl mx-auto h-full flex flex-col gap-4">
          <Card className="shrink-0">
            <CardHeader>
              <h1 className="text-2xl text-center font-semibold tracking-tight">
                <CardTitle>B站音频下载</CardTitle>
              </h1>
              <p className="text-xs text-muted-foreground text-center pt-1">
                所有下载历史记录均保存在您的浏览器本地，服务器不会保留任何信息。
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDownload} className="space-y-6">
                <div className="space-y-2">
                  <Textarea
                    id="url"
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUrl(e.target.value)}
                    placeholder="输入完整的B站视频链接,例如：https://www.bilibili.com/video/BV1LrETzVE8t"
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
                            title: "读取剪贴板失败",
                            description: "请检查是否授予了剪贴板权限",
                          });
                        }
                      }}
                    >
                      从剪贴板粘贴链接
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2"
                      disabled={loading || !url.trim()}
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {loading ? '下载中...' : '下载音频'}
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
                    <CardTitle>下载历史</CardTitle>
                  </h2>
                  <CardDescription>最近 50 条记录</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  清除历史
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
                          查看源视频
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUrl(record.url);
                            toast({
                              title: "链接已填入",
                              description: "点击下载按钮重新下载",
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          重新下载
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
