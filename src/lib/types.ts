/**
 * 统一接口类型定义
 */

/**
 * 多P视频的单个分P信息
 */
export interface PageInfo {
    page: number;
    cid: string;
    part: string;
    duration: number;
    downloadAudioUrl: string | null;
    downloadVideoUrl: string | null;
}

export interface UnifiedParseResult {
    success: boolean;
    data?: {
        title: string;
        desc?: string;
        platform: string;
        downloadAudioUrl: string | null;
        downloadVideoUrl: string | null;
        originDownloadVideoUrl: string | null;
        url: string;
        // 时长（秒）
        duration?: number;
        // 多P视频相关字段
        isMultiPart?: boolean;
        currentPage?: number;
        pages?: PageInfo[];
        // 小红书相关字段
        noteType?: 'video' | 'image';
        images?: string[];
        author?: string;
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


export type Platform = 'bili' | 'bilibili' | 'douyin' | 'xiaohongshu' | 'unknown'; 
