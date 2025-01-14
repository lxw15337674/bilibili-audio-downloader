import { NextRequest, NextResponse } from 'next/server';
import { AudioDownloader } from '@/script/downloadAudio';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes('bilibili.com/video/')) {
            return NextResponse.json({ error: '无效的B站视频链接' }, { status: 400 });
        }

        const downloader = new AudioDownloader(url);
        const { buffer, filename } = await downloader.run();

        // Return the file as a response
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: '下载失败，请稍后重试' },
            { status: 500 }
        );
    }
} 