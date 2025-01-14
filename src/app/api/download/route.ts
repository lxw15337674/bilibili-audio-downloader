import { NextRequest, NextResponse } from 'next/server';
import { AudioDownloader } from '@/lib/downloadAudio';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        if (!url.includes('bilibili.com/video/')) {
            return NextResponse.json({ error: "无效的B站视频链接" }, { status: 400 });
        }

        const downloader = new AudioDownloader(url);
        const { buffer, filename } = await downloader.run();

        // Encode the filename for Content-Disposition header
        const encodedFilename = encodeURIComponent(filename)
            .replace(/['()]/g, escape)
            .replace(/\*/g, '%2A')
            .replace(/%(?:7C|60|5E)/g, unescape);

        // Return the file as a response
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
            },
        });
    } catch (error) {
        console.error('[API] Download error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Download failed' },
            { status: 500 }
        );
    }
} 