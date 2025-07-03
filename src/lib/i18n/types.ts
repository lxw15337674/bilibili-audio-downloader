export interface Dictionary {
    home: {
        title: string;
        description: string;
        bilibiliButton: string;
        douyinButton: string;
    };
    bilibili: {
        pageTitle: string;
        pageDescription: string;
    };
    douyin: {
        pageTitle: string;
        pageDescription: string;
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
        viewSource: string;
        redownload: string;
    };
    toast: {
        historyCleared: string;
        linkFilled: string;
        clickToRedownload: string;
        douyinParseSuccess: string;
        manualDownloadLink: string;
        recordDeleted: string;
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
} 