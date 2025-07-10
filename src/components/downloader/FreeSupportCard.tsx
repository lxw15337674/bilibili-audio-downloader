'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Check } from 'lucide-react';

export function FreeSupportCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    永久免费服务
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">完全免费使用</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">无需注册登录</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">不限下载次数</span>
                    </div>
                </div>

                <div className="pt-2 border-t">
                    <div className="flex items-start gap-2">
                        <div className="text-blue-500 mt-0.5">💡</div>
                        <div className="text-sm text-muted-foreground">
                            <p>本服务通过展示广告获得收益，用于支撑服务器和流量成本</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 