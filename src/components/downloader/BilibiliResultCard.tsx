'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Music, Video, AlertTriangle } from 'lucide-react';

interface BilibiliResultCardProps {
    title: string;
    originalUrl: string;
    onDownload: (format: 'audio' | 'video', url: string) => void;
    onClose: () => void;
}

export function BilibiliResultCard({
    title,
    originalUrl,
    onDownload,
    onClose
}: BilibiliResultCardProps) {

    const handleDownloadAudio = () => {
        onDownload('audio', originalUrl);
    };

    const handleDownloadVideo = () => {
        onDownload('video', originalUrl);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg flex items-center gap-1">
                        B站解析结果
                    </CardTitle>

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
                    {/* 音频/视频下载选项一行展示 */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleDownloadAudio}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Music className="h-4 w-4" />
                            下载音频
                        </Button>

                        <Button
                            onClick={handleDownloadVideo}
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Video className="h-4 w-4" />
                            下载视频
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                        <p className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            API限制：视频下载后是无声的，需要再下载音频，再手动合并音频流
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 