'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { X, Copy, ExternalLink } from 'lucide-react';

export interface DouyinParseResult {
    title: string;
    downloadUrl: string;
    originalUrl: string;
}

interface DouyinResultCardProps {
    result: DouyinParseResult;
    onClose: () => void;
}

export function DouyinResultCard({ result, onClose }: DouyinResultCardProps) {
    const { toast } = useToast();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>解析结果</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="p-3 bg-muted/30 rounded-md border">
                            <p className="text-sm break-all text-muted-foreground">
                                {result.downloadUrl}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(result.downloadUrl);
                                    toast({
                                        title: "链接已复制",
                                        description: "已复制到剪贴板，可以粘贴到新标签页打开",
                                        duration: 3000,
                                    });
                                } catch (err) {
                                    console.error('Failed to copy to clipboard:', err);
                                    toast({
                                        variant: "destructive",
                                        title: "复制失败",
                                        description: "无法复制到剪贴板，请手动选择并复制上方链接",
                                        duration: 5000,
                                    });
                                }
                            }}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            复制链接
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            打开链接
                        </Button>

                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p className="text-center">
                            💡 提示：下载按钮位于视频播放页面右下角的&ldquo;...&rdquo;菜单中
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 