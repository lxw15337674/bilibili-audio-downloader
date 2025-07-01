import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        const douyinApiUrl = process.env.DOUYIN_API_URL || 'http://localhost:8080/api/douyin/download';

        return [
            {
                source: '/api/douyin/download',
                destination: douyinApiUrl,
            },
        ]
    },
};

export default nextConfig;
