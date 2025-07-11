'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';

interface PlatformGuideCardProps {
    dict: Dictionary;
}

export function PlatformGuideCard({ dict }: PlatformGuideCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-primary" />
                    {dict.guide.platformSupport.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* B站部分 */}
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <p className="font-medium">{dict.guide.platformSupport.bilibili.name}</p>
                            <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                {dict.guide.platformSupport.bilibili.limitations.map((limitation, index) => (
                                    <p key={index}>{limitation}</p>
                                ))}
                                {dict.guide.platformSupport.bilibili.features.map((feature, index) => (
                                    <p key={index}>{feature}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{dict.guide.platformSupport.urlExamples.title}</p>
                        <div className="bg-muted p-2 rounded text-xs font-mono space-y-1">
                            {dict.guide.platformSupport.urlExamples.bilibili.map((example, index) => (
                                <p key={index} className="break-all">{example}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 抖音部分 */}
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <p className="font-medium">{dict.guide.platformSupport.douyin.name}</p>
                            <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                {dict.guide.platformSupport.douyin.features.map((feature, index) => (
                                    <p key={index}>{feature}</p>
                                ))}
                                {dict.guide.platformSupport.douyin.limitations.map((limitation, index) => (
                                    <p key={index}>{limitation}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{dict.guide.platformSupport.urlExamples.title}</p>
                        <div className="bg-muted p-2 rounded text-xs font-mono space-y-1">
                            {dict.guide.platformSupport.urlExamples.douyin.map((example, index) => (
                                <p key={index} className="break-all">{example}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 抖音使用提示 */}
                {dict.guide.platformSupport.douyin.tip && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                        <div className="text-blue-500 mt-0.5">💡</div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            {dict.guide.platformSupport.douyin.tip.text}
                            <a href={dict.guide.platformSupport.douyin.tip.tool.url} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                                {dict.guide.platformSupport.douyin.tip.tool.name}
                            </a>
                        </p>
                    </div>
                )}

                {/* 更多平台预告 */}
                <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                    {dict.guide.platformSupport.comingSoon}
                </div>
            </CardContent>
        </Card>
    );
} 