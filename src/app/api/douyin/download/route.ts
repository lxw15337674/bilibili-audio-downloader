import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
        const douyinApiUrl = process.env.DOUYIN_API_URL || 'http://localhost:8080/api/douyin/download';

        const response = await fetch(`${douyinApiUrl}?url=${encodeURIComponent(url)}`);

        if (!response.ok) {
            throw new Error(`External API responded with status: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
} 