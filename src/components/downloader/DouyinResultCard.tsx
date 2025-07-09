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
    dict: {
        douyin: {
            parseResult: string;
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

export function DouyinResultCard({ result, onClose, dict }: DouyinResultCardProps) {
    const { toast } = useToast();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{dict.douyin.parseResult}</CardTitle>
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
                            }}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            {dict.douyin.copyLink}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {dict.douyin.openLink}
                        </Button>

                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p className="text-center">
                            {dict.douyin.downloadTip}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 