'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useLocalStorageState } from 'ahooks';

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

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename\*=UTF-8''(.+)$/);
      const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : 'audio.mp3';
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      // Add to download history
      const newRecord: DownloadRecord = {
        url,
        title: filename.replace('.mp3', ''),
        timestamp: Date.now(),
      };
      setDownloadHistory([newRecord, ...(downloadHistory || []).slice(0, 9)]); // Keep last 10 records

      toast({
        title: "下载成功",
        description: `音频已保存为：${filename}`,
      });
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

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">B站音频下载</CardTitle>
            <CardDescription className="text-center">
              请输入完整的B站视频链接，我们将为您提取音频
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDownload} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">视频链接</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="url"
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUrl(e.target.value)}
                    placeholder="https://www.bilibili.com/video/BV..."
                    required
                    className="min-h-[80px] resize-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
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
                    粘贴
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? '下载中...' : '下载音频'}
              </Button>
              
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {downloadHistory && downloadHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">下载历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {downloadHistory.map((record) => (
                  <div key={record.timestamp} className="flex items-center justify-between gap-4 text-sm p-2 hover:bg-muted/50 rounded-lg">
                    <span className="flex-1 truncate" title={record.title}>
                      {record.title}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(record.url, '_blank');
                        }}
                      >
                        查看视频
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
  );
}
