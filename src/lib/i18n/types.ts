export interface Dictionary {
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