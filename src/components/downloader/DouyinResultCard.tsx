'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { X, Copy, ExternalLink, Video, AlertTriangle, Music } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';

interface DouyinResultCardProps {
    title: string;
    downloadUrl: string;
    originalUrl: string;
    onDownload: (format: 'audio' | 'video', url: string) => void;
    onClose: () => void;
    dict: Dictionary;
}

export function DouyinResultCard({
    title,
    downloadUrl,
    originalUrl,
    onDownload,
    onClose,
    dict
}: DouyinResultCardProps) {

    const handleDownload = () => {
        onDownload('video', originalUrl);
    };

    const handleOpenLink = () => {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{dict.douyin.parseResult}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 break-all">
                        {title}
                        {originalUrl}
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
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Music className="h-4 w-4" />
                            {dict.douyin.downloadAudio}
                        </Button>
                        <Button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Video className="h-4 w-4" />
                            {dict.douyin.downloadVideo}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={handleOpenLink}
                        >
                            <ExternalLink className="h-4 w-4" />
                            {dict.douyin.openLink}
                        </Button>
                    </div>
                    {/*限制说明 */}
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                        <p className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {dict.douyin.apiLimitAudio}
                        </p>
                        <p className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {dict.douyin.apiLimitDownload}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 