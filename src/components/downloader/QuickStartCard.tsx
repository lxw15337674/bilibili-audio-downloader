'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle } from 'lucide-react';

export function QuickStartCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    三步轻松下载
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        1
                    </div>
                    <div>
                        <p className="font-medium">复制视频链接</p>
                        <p className="text-sm text-muted-foreground">从B站/抖音等平台复制视频分享链接</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        2
                    </div>
                    <div>
                        <p className="font-medium">粘贴并解析</p>
                        <p className="text-sm text-muted-foreground">在输入框粘贴链接，点击解析按钮</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        3
                    </div>
                    <div>
                        <p className="font-medium">选择下载</p>
                        <p className="text-sm text-muted-foreground">选择音频或视频格式开始下载</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 