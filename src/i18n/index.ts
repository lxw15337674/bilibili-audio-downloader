import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-cn.json';
import zhTW from './locales/zh-tw.json';
import en from './locales/en.json';

const resources = {
    'zh-CN': {
        translation: zhCN
    },
    'zh-TW': {
        translation: zhTW
    },
    en: {
        translation: en
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'zh-CN',
        debug: process.env.NODE_ENV === 'development',

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },

        react: {
            useSuspense: false,
        }
    });

export default i18n; 