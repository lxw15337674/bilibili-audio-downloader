/**
 * API Configuration
 */

// This is only used in next.config.ts for proxying, not needed in client-side code anymore.
// export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

/**
 * API Endpoints
 * These paths are now relative to the Next.js server, which will proxy them.
 */
export const API_ENDPOINTS = {
    bilibili: {
        download: '/v1/bilibili-audio/download',
        title: '/v1/bilibili-video/info',
    },
    douyin: {
        parse: '/v1/douyin/parse',
        download: '/v1/douyin/download',
    },
} as const;
