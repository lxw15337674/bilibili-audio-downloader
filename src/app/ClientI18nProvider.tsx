'use client';

import { useEffect } from 'react';
import '../i18n';

interface ClientI18nProviderProps {
    children: React.ReactNode;
}

export function ClientI18nProvider({ children }: ClientI18nProviderProps) {
    useEffect(() => {
        // i18n 已在导入时初始化
    }, []);

    return <>{children}</>;
} 