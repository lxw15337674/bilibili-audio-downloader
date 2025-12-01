import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';

interface QuickStartCardProps {
    dict: Dictionary;
}

export function QuickStartCard({ dict }: QuickStartCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    {dict.guide.quickStart.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {dict.guide.quickStart.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                        </div>
                        <div>
                            <p className="font-medium">{step.title}</p>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
} 