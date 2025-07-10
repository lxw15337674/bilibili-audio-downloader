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
    // 统一接口
    unified: {
        parse: '/v1/parse',
        download: '/v1/download',
    },
} as const;
