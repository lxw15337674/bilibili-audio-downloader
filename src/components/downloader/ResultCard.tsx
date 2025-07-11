import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';
import { UnifiedParseResult } from "../../lib/types";
import { downloadFile } from "../../lib/utils";

interface ResultCardProps {
    result: UnifiedParseResult['data'] | null | undefined
    onClose: () => void;
    dict: Dictionary;
}

export function ResultCard({ result, onClose, dict }: ResultCardProps) {
    if (!result) return null;
    console.log(result)
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{dict.result.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 break-all">
                        {result.title}
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
                            variant="outline"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={() => {
                                downloadFile(result.downloadVideoUrl!)
                            }}
                        >
                            {dict.result.downloadVideo}
                        </Button>
                        {result.downloadAudioUrl && (
                            <Button
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2"
                                onClick={() => {
                                    downloadFile(result.downloadAudioUrl!)
                                }}
                            >
                                {dict.result.downloadAudio}
                            </Button>
                        )}

                        {result.originDownloadVideoUrl && (
                            <Button
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <a href={result.originDownloadVideoUrl} target="_blank" rel="noopener noreferrer">
                                    {dict.result.originDownloadVideo}
                                </a>
                            </Button>
                        )}
                    </div>
                    {
                        result.originDownloadVideoUrl && <div className="text-xs text-muted-foreground text-center space-y-1">
                            <p className="flex items-center justify-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {dict.douyin.apiLimitDownload}
                            </p>
                        </div>
                    }
                </div>
            </CardContent>
        </Card>
    );
} 