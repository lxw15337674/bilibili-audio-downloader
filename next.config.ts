import type { NextConfig } from "next";
import { i18n } from "./src/lib/i18n/config";

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        const i18nLocales = i18n.locales.join('|');
        return [
            {
                // This will match paths like /zh/v1/..., /en/v1/...
                // It will not match /v1/... directly, which is correct
                // because the middleware ensures a locale is always present.
                source: `/:locale(${i18nLocales})/v1/:path*`,
                destination: `${API_BASE_URL}/api/:path*`,
            },
        ]
    },
};

export default nextConfig;
