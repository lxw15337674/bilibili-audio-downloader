import { NextRequest, NextResponse } from 'next/server';
import { AudioDownloader } from '@/lib/downloadAudio';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        if (!url.includes('bilibili.com')) {
            return NextResponse.json({ error: "无效的B站链接" }, { status: 400 });
        }

        // 获取音频流信息
        const downloader = new AudioDownloader(url);
        const { audioUrl, filename } = await downloader.getAudioStreamUrl();

        // 处理客户端的Range请求（用于断点续传）
        const range = request.headers.get('range');

        // 构建请求B站的headers
        const bilibiliHeaders: HeadersInit = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Referer": "https://www.bilibili.com",
            "Origin": "https://www.bilibili.com"
        };

        // 如果客户端请求了Range，转发给B站
        if (range) {
            bilibiliHeaders['Range'] = range;
        }

        // 从B站获取音频流
        const bilibiliResponse = await fetch(audioUrl, {
            headers: bilibiliHeaders
        });

        if (!bilibiliResponse.ok) {
            throw new Error(`B站响应错误: ${bilibiliResponse.status} ${bilibiliResponse.statusText}`);
        }

        // 编码文件名
        const encodedFilename = encodeURIComponent(filename)
            .replace(/['()]/g, escape)
            .replace(/\*/g, '%2A')
            .replace(/%(?:7C|60|5E)/g, unescape);

        // 构建响应headers
        const responseHeaders: HeadersInit = {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
        };

        // 转发B站的相关headers
        const contentLength = bilibiliResponse.headers.get('content-length');
        const contentRange = bilibiliResponse.headers.get('content-range');
        const acceptRanges = bilibiliResponse.headers.get('accept-ranges');

        if (contentLength) {
            responseHeaders['Content-Length'] = contentLength;
        }
        if (contentRange) {
            responseHeaders['Content-Range'] = contentRange;
        }
        if (acceptRanges) {
            responseHeaders['Accept-Ranges'] = acceptRanges;
        } else {
            responseHeaders['Accept-Ranges'] = 'bytes';
        }

        // 返回流式响应，直接转发B站的响应体
        return new Response(bilibiliResponse.body, {
            status: bilibiliResponse.status,
            headers: responseHeaders
        });

    } catch (error) {
        console.error('[API] Stream proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Stream proxy failed' },
            { status: 500 }
        );
    }
} 