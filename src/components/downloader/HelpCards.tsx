'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Globe, Link, CheckCircle, AlertCircle } from 'lucide-react';

export function HelpCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:flex lg:flex-col lg:space-y-4">
            {/* 快速入门指南 */}
            <Card className="order-1">
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
                            <p className="text-sm text-muted-foreground">从B站/抖音等平台复制视频链接</p>
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

            {/* 支持平台 */}
            <Card className="order-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Globe className="h-5 w-5 text-primary" />
                        支持的视频平台
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">哔哩哔哩 (bilibili.com)</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>• 支持音频提取</p>
                                <p>• 支持视频下载</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">抖音 (douyin.com)</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>• 仅支持视频下载</p>
                                <p>• 需手动提取音频</p>
                                <p>• API限制较多</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                        🔄 更多平台即将支持...
                    </div>
                </CardContent>
            </Card>

            {/* URL格式说明 */}
            <Card className="order-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Link className="h-5 w-5 text-primary" />
                        支持的链接格式
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-medium mb-2">🔗 B站链接示例：</p>
                        <div className="bg-muted p-3 rounded-md space-y-1 text-sm font-mono">
                            <p>https://www.bilibili.com/video/BV1xx411c7mD</p>
                            <p>https://b23.tv/BV1xx411c7mD <span className="text-muted-foreground">(短链接)</span></p>
                        </div>
                    </div>
                    <div>
                        <p className="font-medium mb-2">🔗 抖音链接示例：</p>
                        <div className="bg-muted p-3 rounded-md space-y-1 text-sm font-mono">
                            <p>https://www.douyin.com/jingxuan?modal_id=7522057669591485738</p>
                            <p>https://v.douyin.com/fiU6t9rA3QU/ <span className="text-muted-foreground">(短链接)</span></p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                        <div className="text-blue-500 mt-0.5">💡</div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            提示：复制分享链接即可，无需手动修改
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 