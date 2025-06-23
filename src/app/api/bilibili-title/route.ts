import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json(
                { error: '请提供视频URL' },
                { status: 400 }
            );
        }


        // 请求B站API获取视频信息
        const apiUrl = request.url;

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.bilibili.com/',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 0) {
            return NextResponse.json(
                { error: data.message || '获取视频信息失败' },
                { status: 400 }
            );
        }

        const videoInfo = data.data;

        return NextResponse.json({
            success: true,
            data: {
                title: videoInfo.title,
                bvid: videoInfo.bvid,
                aid: videoInfo.aid,
                author: videoInfo.owner.name,
                duration: videoInfo.duration,
                pubdate: videoInfo.pubdate,
                desc: videoInfo.desc,
                pic: videoInfo.pic,
                view: videoInfo.stat.view,
                danmaku: videoInfo.stat.danmaku,
                reply: videoInfo.stat.reply,
                favorite: videoInfo.stat.favorite,
                coin: videoInfo.stat.coin,
                share: videoInfo.stat.share,
                like: videoInfo.stat.like,
            }
        });

    } catch (error) {
        console.error('获取B站视频信息失败:', error);
        return NextResponse.json(
            {
                error: '获取视频信息失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
} 