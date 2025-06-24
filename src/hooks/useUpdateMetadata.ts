'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useUpdateMetadata() {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        // 更新页面标题
        document.title = t('metadata.title');

        // 更新 HTML lang 属性
        document.documentElement.lang = i18n.language.startsWith('zh') ? 'zh' : 'en';

        // 更新 meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', t('metadata.description'));
        }

        // 更新 meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute('content', t('metadata.keywords'));
        }

        // 更新 Open Graph 标题
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', t('metadata.ogTitle'));
        }

        // 更新 Open Graph 描述
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', t('metadata.ogDescription'));
        }

        // 更新 Open Graph site name
        const ogSiteName = document.querySelector('meta[property="og:site_name"]');
        if (ogSiteName) {
            ogSiteName.setAttribute('content', t('metadata.siteName'));
        }

    }, [t, i18n.language]);
}