'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, CheckCircle, AlertCircle } from 'lucide-react';

export function PlatformGuideCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-primary" />
                    平台支持指南
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* B站部分 */}
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <p className="font-medium">哔哩哔哩 (bilibili.com)</p>
                            <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                <p>⚠️ 支持视频下载（由于b站限制，视频不包含音频流，需要再下载音频，再手动合并音频流）</p>
                                <p>✅ 支持音频下载</p>
                            </div>
                        </div>
                    </div>
                    <div >
                        <p className="text-sm font-medium text-muted-foreground mb-1">🔗 链接格式：</p>
                        <div className="bg-muted p-2 rounded text-xs font-mono space-y-1">
                            <p className="break-all">https://www.bilibili.com/video/BV1xx411c7mD</p>
                            <p className="break-all">https://b23.tv/BV1xx411c7mD <span className="text-muted-foreground">(短链接)</span></p>
                        </div>
                    </div>
                </div>

                {/* 抖音部分 */}
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <p className="font-medium">抖音 (douyin.com)</p>
                            <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                <p>✅ 支持视频下载</p>
                                <p>⚠️ 不支持音频提取，需要下载视频后手动提取音频</p>
                            </div>
                        </div>
                    </div>
                    <div >
                        <p className="text-sm font-medium text-muted-foreground mb-1">🔗 链接格式：</p>
                        <div className="bg-muted p-2 rounded text-xs font-mono space-y-1">
                            <p className="break-all">https://www.douyin.com/jingxuan?modal_id=7522057669591485738</p>
                            <p className="break-all">https://v.douyin.com/fiU6t9rA3QU/ <span className="text-muted-foreground">(短链接)</span></p>
                        </div>
                    </div>
                </div>

                {/* 使用提示 */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                    <div className="text-blue-500 mt-0.5">💡</div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        使用提示：复制分享链接即可，无需手动修改
                    </p>
                </div>

                {/* 更多平台预告 */}
                <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                    🔄 更多平台即将支持...
                </div>
            </CardContent>
        </Card>
    );
} 