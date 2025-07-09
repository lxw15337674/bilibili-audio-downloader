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
    bilibili: {
        pageTitle: string;
        pageDescription: string;
    };
    douyin: {
        pageTitle: string;
        pageDescription: string;
        parseResult: string;
        copyLink: string;
        openLink: string;
        copySuccess: string;
        copyFailed: string;
        downloadTip: string;
    };
    page: {
        title: string;
        description: string;
        feedback: string;
        feedbackLinkText: string;
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
    result: {
        title: string;
        downloadButton: string;
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
    collapsible: {
        whyChooseUs: {
            title: string;
            description: string;
        };
        userGuide: {
            title: string;
            description: string;
        };
        privacyTerms: {
            title: string;
            description: string;
        };
        expandHint: string;
        autoCollapseNotice: string;
    };
    features: {
        title: string;
        subtitle: string;
        quality: {
            title: string;
            description: string;
        };
        speed: {
            title: string;
            description: string;
        };
        free: {
            title: string;
            description: string;
        };
        privacy: {
            title: string;
            description: string;
        };
    };
    steps: {
        title: string;
        subtitle: string;
        step1: {
            title: string;
            description: string;
        };
        step2: {
            title: string;
            description: string;
        };
        step3: {
            title: string;
            description: string;
        };
    };
    technical: {
        title: string;
        subtitle: string;
        extraction: {
            title: string;
            description: string;
        };
        formats: {
            title: string;
            description: string;
        };
        compatibility: {
            title: string;
            description: string;
        };
        reliability: {
            title: string;
            description: string;
        };
    };
    legal: {
        title: string;
        subtitle: string;
        personalUse: string;
        copyright: string;
        support: string;
        disclaimer: string;
    };
    faq: {
        title: string;
        subtitle: string;
        format: {
            question: string;
            answer: string;
        };
        quality: {
            question: string;
            answer: string;
        };
        limit: {
            question: string;
            answer: string;
        };
        safety: {
            question: string;
            answer: string;
        };
    };
    navigation: {
        home: string;
        privacy: string;
        terms: string;
        about: string;
        contact: string;
    };
    privacy: {
        title: string;
        lastUpdated: string;
        introduction: {
            title: string;
            content: string;
        };
        collection: {
            title: string;
            subtitle: string;
            noPersonalData: string;
            technicalData: string;
            usageData: string;
        };
        usage: {
            title: string;
            subtitle: string;
            serviceProvision: string;
            improvement: string;
            security: string;
            analytics: string;
        };
        storage: {
            title: string;
            subtitle: string;
            noStorage: string;
            temporary: string;
            security: string;
        };
        cookies: {
            title: string;
            subtitle: string;
            localStorage: string;
            analytics: string;
            ads: string;
        };
        thirdParty: {
            title: string;
            subtitle: string;
            analytics: string;
            ads: string;
            hosting: string;
        };
        rights: {
            title: string;
            subtitle: string;
            access: string;
            deletion: string;
            optOut: string;
        };
        updates: {
            title: string;
            content: string;
        };
        contact: {
            title: string;
            content: string;
        };
    };
} 