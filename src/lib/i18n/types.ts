export interface Dictionary {
    home: {
        title: string;
        description: string;
        bilibiliButton: string;
        douyinButton: string;
    };
    unified: {
        pageTitle: string;
        pageDescription: string;
        placeholder: string;
        placeholderBilibili: string;
        placeholderDouyin: string;
        platformDetected: string;
        platformUnknown: string;
        switchToUnified: string;
    };
    page: {
        title: string;
        description: string;
        feedback: string;
        feedbackLinkText: string;
        copyrightVideo: string;
        copyrightStorage: string;
        copyrightYear: string;
    };
    form: {
        placeholder: string;
        douyinPlaceholder: string;
        pasteButton: string;
        downloadButton: string;
        downloading: string;
        fallbackTitle: string;
    };
    errors: {
        emptyUrl: string;
        invalidUrl: string;
        unsupportedPlatform: string;
        downloadFailed: string;
        clipboardFailed: string;
        clipboardPermission: string;
        downloadError: string;
        videoLinkInvalid: string;
        getVideoInfoFailed: string;
        networkError: string;
    };
    history: {
        title: string;
        description: string;
        clear: string;
        cleared: string;
        viewSource: string;
        redownload: string;
        linkFilled: string;
        clickToRedownload: string;
    };
    toast: {
        historyCleared: string;
        linkFilled: string;
        clickToRedownload: string;
        douyinParseSuccess: string;
        manualDownloadLink: string;
        recordDeleted: string;
        platformDetected: string;
        lowConfidenceDetection: string;
        lowConfidenceDescription: string;
        linkFilledForRedownload: string;
        clickToRedownloadDesc: string;
        linkCopied: string;
        copyFailed: string;
        downloadFailed: string;
    };
    metadata: {
        title: string;
        description: string;
        keywords: string;
        ogTitle: string;
        ogDescription: string;
        siteName: string;
    };
    languages: {
        zh: string;
        'zh-tw': string;
        en: string;
    };
    douyin: {
        parseResult: string;
        downloadAudio: string;
        downloadVideo: string;
        openLink: string;
        copyLink: string;
        copySuccess: string;
        copyFailed: string;
        downloadTip: string;
        apiLimitAudio: string;
        apiLimitDownload: string;
    };
    guide: {
        quickStart: {
            title: string;
            steps: Array<{
                title: string;
                description: string;
            }>;
        };
        platformSupport: {
            title: string;
            bilibili: {
                name: string;
                features: string[];
                limitations: string[];
            };
            douyin: {
                name: string;
                features: string[];
                limitations: string[];
            };
            urlExamples: {
                title: string;
                bilibili: string[];
                douyin: string[];
            };
            tip: string;
            comingSoon: string;
        };
        linkFormats: {
            title: string;
            bilibili: {
                title: string;
                examples: string[];
            };
            douyin: {
                title: string;
                examples: string[];
            };
            tip: string;
        };
    };
    freeSupport: {
        title: string;
        features: {
            freeToUse: string;
            noRegistration: string;
            unlimitedDownloads: string;
        };
        privacy: {
            title: string;
            noUserRecords: string;
            localStorage: string;
        };
        revenue: {
            adsSupport: string;
            serverCosts: string;
        };
    };
    seo: {
        features: {
            en: string[];
            zh: string[];
        };
        faq: {
            en: Array<{
                question: string;
                answer: string;
            }>;
            zh: Array<{
                question: string;
                answer: string;
            }>;
        };
        howTo: {
            title: {
                en: string;
                zh: string;
            };
            steps: {
                en: Array<{
                    name: string;
                    text: string;
                }>;
                zh: Array<{
                    name: string;
                    text: string;
                }>;
            };
        };
    };
} 