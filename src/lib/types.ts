/**
 * 统一接口类型定义
 */

export interface UnifiedParseResult {
    success: boolean;
    data?: {
        title: string;
        platform: string;
        downloadAudioUrl: string | null;
        downloadVideoUrl: string | null;
        originDownloadVideoUrl: string | null;
        url: string;
    };
    error?: string;
    url?: string; // 错误时可能包含原始URL
}

export interface UnifiedDownloadOptions {
    format: 'audio' | 'video';
    quality?: string;
}

export interface UnifiedApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}


export type Platform = 'bili' | 'bilibili' | 'douyin' | 'unknown'; 
