'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { X, Copy, ExternalLink, Video, AlertTriangle, Music } from 'lucide-react';

interface DouyinResultCardProps {
    title: string;
    downloadUrl: string;
    originalUrl: string;
    onDownload: (format: 'audio' | 'video', url: string) => void;
    onClose: () => void;
    dict: {
        douyin: {
            copyLink: string;
            openLink: string;
            copySuccess: string;
            copyFailed: string;
            downloadTip: string;
        };
        toast: {
            linkCopied: string;
            copyFailed: string;
        };
    };
}

export function DouyinResultCard({
    title,
    downloadUrl,
    originalUrl,
    onDownload,
    onClose,
    dict
}: DouyinResultCardProps) {
    const { toast } = useToast();

    const handleDownload = () => {
        onDownload('video', originalUrl);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(downloadUrl);
            toast({
                title: dict.toast.linkCopied,
                description: dict.douyin.copySuccess,
                duration: 3000,
            });
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            toast({
                variant: "destructive",
                title: dict.toast.copyFailed,
                description: dict.douyin.copyFailed,
                duration: 5000,
            });
        }
    };

    const handleOpenLink = () => {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">抖音解析结果</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 break-all">
                        {title}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Button
                            disabled={true}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Music className="h-4 w-4" />
                            下载音频
                        </Button>
                        <Button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Video className="h-4 w-4" />
                            下载视频
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={handleOpenLink}
                        >
                            <ExternalLink className="h-4 w-4" />
                            打开链接
                        </Button>
                    </div>
                    {/*限制说明 */}
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                        <p className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            API限制：无法下载音频，需要下载视频后手动提取音频
                        </p>
                        <p className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            如果自动下载失败，请点击打开链接手动下载（下载功能在视频右下角）
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 