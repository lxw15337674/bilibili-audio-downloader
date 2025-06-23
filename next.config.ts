import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.AUDIO_API_BASE_URL || 'https://bhwa233-api.vercel.app';
    return [
      {
        source: '/download',
        destination: `${apiBaseUrl}/api/bilibili-audio/download`
      }
    ];
  }
};

export default nextConfig;
