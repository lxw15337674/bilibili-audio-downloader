import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Download, Loader2, Package } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';
import { UnifiedParseResult, PageInfo } from "../../lib/types";
import { downloadFile, formatDuration, sanitizeFilename } from "../../lib/utils";
import { ExtractAudioButton } from "./ExtractAudioButton";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface ResultCardProps {
    result: UnifiedParseResult['data'] | null | undefined
    onClose: () => void;
    dict: Dictionary;
}

export function ResultCard({ result, onClose, dict }: ResultCardProps) {
    if (!result) return null;

    const isMultiPart = result.isMultiPart && result.pages && result.pages.length > 1;
    const isXiaohongshuImageNote = result.platform === 'xiaohongshu' && result.noteType === 'image';

    const displayTitle = result.title;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{dict.result.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 break-all">
                        {displayTitle}
                        {result.duration != null && (
                            <span className="ml-2 text-xs">({formatDuration(result.duration)})</span>
                        )}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isXiaohongshuImageNote ? (
                        <ImageNoteGrid
                            images={result.images!}
                            title={displayTitle}
                            dict={dict}
                        />
                    ) : isMultiPart ? (
                        <MultiPartList
                            pages={result.pages!}
                            currentPage={result.currentPage}
                            dict={dict}
                        />
                    ) : (
                        <SinglePartButtons result={result} dict={dict} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * 单P视频的下载按钮
 */
function SinglePartButtons({ result, dict }: { result: NonNullable<UnifiedParseResult['data']>; dict: Dictionary }) {
    const isDouyin = result.platform === 'douyin';

    return (
        <>
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

                {isDouyin && result.downloadVideoUrl && (
                    <ExtractAudioButton
                        videoUrl={result.downloadVideoUrl}
                        title={result.title}
                        dict={dict}
                    />
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
            {result.originDownloadVideoUrl && (
                <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p className="flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {dict.douyin.apiLimitDownload}
                    </p>
                </div>
            )}
        </>
    );
}

/**
 * 多P视频的分P列表
 */
function MultiPartList({ pages, currentPage, dict }: { pages: PageInfo[]; currentPage?: number; dict: Dictionary }) {
    return (
        <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
                {dict.result.totalParts?.replace('{count}', String(pages.length)) || `共 ${pages.length} 个分P`}
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {pages.map((page) => (
                    <div
                        key={page.page}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${
                            page.page === currentPage
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-muted/50'
                        }`}
                    >
                        <span className="text-xs font-medium text-muted-foreground shrink-0">
                            P{page.page}
                        </span>
                        <span className="text-sm truncate flex-1 min-w-0" title={page.part}>
                            {page.part}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                            {formatDuration(page.duration)}
                        </span>
                        <div className="flex gap-1 shrink-0">
                            {page.downloadVideoUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadFile(page.downloadVideoUrl!)}
                                >
                                    {dict.result.downloadVideo}
                                </Button>
                            )}
                            {page.downloadAudioUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadFile(page.downloadAudioUrl!)}
                                >
                                    {dict.result.downloadAudio}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * 小红书图文笔记的图片网格
 */
function ImageNoteGrid({ images, title, dict }: { images: string[]; title: string; dict: Dictionary }) {
    return (
        <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-3">
                <span className="inline-flex items-center gap-1">
                    {dict.result.imageNote}
                </span>
                <span className="ml-2">
                    {dict.result.imageCount?.replace('{count}', String(images.length)) || `共 ${images.length} 张图片`}
                </span>
            </div>
            <div className="space-y-2">
                {images.map((imageUrl, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                        <span className="text-xs font-medium text-muted-foreground min-w-[2rem]">
                            #{index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
                                title={imageUrl}
                            >
                                {imageUrl}
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 