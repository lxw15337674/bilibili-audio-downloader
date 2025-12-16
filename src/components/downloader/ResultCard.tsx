import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Download, Loader2, Package } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';
import { UnifiedParseResult, PageInfo } from "../../lib/types";
import { downloadFile, formatDuration } from "../../lib/utils";
import { ExtractAudioButton } from "./ExtractAudioButton";
import { useState, useEffect } from 'react';
import axios from 'axios';
import JSZip from 'jszip';

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
    const [imageBlobs, setImageBlobs] = useState<Map<number, string>>(new Map());
    const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map());
    const [errorStates, setErrorStates] = useState<Map<number, boolean>>(new Map());
    const [isPackaging, setIsPackaging] = useState(false);
    const [packagingProgress, setPackagingProgress] = useState(0);

    useEffect(() => {
        // 初始化加载状态
        const initialLoading = new Map<number, boolean>();
        images.forEach((_, index) => {
            initialLoading.set(index, true);
        });
        setLoadingStates(initialLoading);

        // 获取所有图片
        const fetchImages = async () => {
            const newBlobs = new Map<number, string>();
            const newErrors = new Map<number, boolean>();

            await Promise.all(
                images.map(async (imageUrl, index) => {
                    try {
                        const response = await axios.get(imageUrl, {
                            responseType: 'blob',
                            headers: {
                                'Referer': 'https://www.xiaohongshu.com/'
                            }
                        });
                        const blobUrl = URL.createObjectURL(response.data);
                        newBlobs.set(index, blobUrl);
                        newErrors.set(index, false);
                    } catch (error) {
                        console.error(`Failed to load image ${index}:`, error);
                        newErrors.set(index, true);
                    } finally {
                        setLoadingStates(prev => {
                            const updated = new Map(prev);
                            updated.set(index, false);
                            return updated;
                        });
                    }
                })
            );

            setImageBlobs(newBlobs);
            setErrorStates(newErrors);
        };

        fetchImages();

        // 清理函数：释放所有 blob URLs
        return () => {
            imageBlobs.forEach(blobUrl => {
                URL.revokeObjectURL(blobUrl);
            });
        };
    }, [images]);

    const handleDownload = (index: number, originalUrl: string) => {
        const blobUrl = imageBlobs.get(index);
        if (blobUrl) {
            // 如果有 blob，直接下载
            downloadFile(blobUrl, `${title}-${index + 1}.jpg`);
        } else {
            // 否则在新标签打开原始 URL
            window.open(originalUrl, '_blank');
        }
    };

    const handlePackageDownload = async () => {
        setIsPackaging(true);
        setPackagingProgress(0);

        try {
            const zip = new JSZip();
            let successCount = 0;
            let failCount = 0;

            // 遍历所有图片，添加到 zip
            for (let index = 0; index < images.length; index++) {
                const blobUrl = imageBlobs.get(index);
                const hasError = errorStates.get(index);

                if (blobUrl && !hasError) {
                    try {
                        // 从 blob URL 获取实际的 blob 数据
                        const response = await fetch(blobUrl);
                        const blob = await response.blob();
                        zip.file(`${title}-${index + 1}.jpg`, blob);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to add image ${index} to zip:`, error);
                        failCount++;
                    }
                } else {
                    failCount++;
                }

                // 更新进度
                setPackagingProgress(Math.round(((index + 1) / images.length) * 100));
            }

            // 检查是否有成功添加的图片
            if (successCount === 0) {
                alert('所有图片加载失败，无法打包下载');
                return;
            }

            if (failCount > 0) {
                const confirmDownload = confirm(
                    `有 ${failCount} 张图片加载失败，是否下载其余 ${successCount} 张图片？`
                );
                if (!confirmDownload) {
                    return;
                }
            }

            // 生成 zip 文件
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            // 触发下载
            const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '-'); // 清理文件名中的非法字符
            downloadFile(URL.createObjectURL(zipBlob), `${sanitizedTitle}.zip`);
        } catch (error) {
            console.error('Failed to package images:', error);
            alert('打包失败，请重试');
        } finally {
            setIsPackaging(false);
            setPackagingProgress(0);
        }
    };

    // 计算加载完成的数量
    const loadedCount = Array.from(loadingStates.values()).filter(loading => !loading).length;
    const allLoaded = loadedCount === images.length;
    const successCount = Array.from(errorStates.values()).filter(hasError => !hasError).length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        📝 {dict.result.imageNote}
                    </span>
                    <span className="ml-2">
                        {dict.result.imageCount?.replace('{count}', String(images.length)) || `共 ${images.length} 张图片`}
                    </span>
                    {!allLoaded && (
                        <span className="ml-2 text-xs">
                            (加载中 {loadedCount}/{images.length})
                        </span>
                    )}
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={!allLoaded || isPackaging || successCount === 0}
                    onClick={handlePackageDownload}
                    className="shrink-0"
                >
                    {isPackaging ? (
                        <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            打包中 {packagingProgress}%
                        </>
                    ) : (
                        <>
                            <Package className="h-3 w-3 mr-1" />
                            打包下载
                        </>
                    )}
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {images.map((imageUrl, index) => {
                    const isLoading = loadingStates.get(index);
                    const hasError = errorStates.get(index);
                    const blobUrl = imageBlobs.get(index);

                    return (
                        <div
                            key={index}
                            className="relative group border rounded-lg overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="aspect-square relative bg-muted flex items-center justify-center">
                                {isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground mt-2">加载中...</p>
                                    </div>
                                )}
                                {!isLoading && hasError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="text-2xl">🖼️</div>
                                        <p className="text-xs mt-2">图片 #{index + 1}</p>
                                        <p className="text-[10px] mt-1 opacity-60">加载失败</p>
                                    </div>
                                )}
                                {!isLoading && !hasError && blobUrl && (
                                    <img
                                        src={blobUrl}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            {!isLoading && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="flex-1 h-7 text-xs"
                                        onClick={() => handleDownload(index, imageUrl)}
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        {blobUrl ? dict.result.downloadImage : '查看大图'}
                                    </Button>
                                </div>
                            )}
                            <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                {index + 1}
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
                💡 图片已自动加载，点击下载按钮保存
            </p>
        </div>
    );
} 