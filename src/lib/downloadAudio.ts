import axios, { AxiosError, AxiosProgressEvent } from 'axios';

export enum AudioQualityEnums {
    Low = 64,
    Medium = 132,
    High = 192,
    Highest = 320,
}

interface AudioStream {
    id: number;
    baseUrl: string;
}

export class AudioDownloader {
    private readonly headers: { [key: string]: string };
    private bv: string = '';
    private cid: string = '';
    private title: string = '';
    private audioUrl: string = '';
    private readonly axiosInstance;
    private readonly maxRetries = 3;
    private readonly retryDelay = 3000; // 3 seconds
    private downloadStartTime: number = 0;

    constructor(private readonly baseUrl: string, private readonly audioQuality: AudioQualityEnums = AudioQualityEnums.High) {
        this.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Referer": "https://www.bilibili.com",
            "Origin": "https://www.bilibili.com"
        };

        this.axiosInstance = axios.create({
            timeout: 60000,
            maxRedirects: 5,
            headers: this.headers,
        });
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    private formatSpeed(bytesPerSecond: number): string {
        return `${this.formatBytes(bytesPerSecond)}/s`;
    }

    private async retryOperation<T>(operation: () => Promise<T>, retryCount = 0): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (retryCount >= this.maxRetries) {
                throw error;
            }
            
            console.log(`[音频下载器] 第${retryCount + 1}次尝试失败，${this.retryDelay/1000}秒后重试...`);
            await this.sleep(this.retryDelay);
            return this.retryOperation(operation, retryCount + 1);
        }
    }

    public async run(): Promise<{ buffer: Buffer; filename: string }> {
        console.log("[音频下载器] 开始下载音频...");
        await this.retryOperation(() => this.getCid());
        await this.retryOperation(() => this.getAudioUrl());
        const buffer = await this.retryOperation(() => this.downloadAudio());
        return {
            buffer,
            filename: `${this.title}.mp3`
        };
    }

    private async getCid(): Promise<void> {
        const pattern = /(BV[a-zA-Z0-9]+)/;
        const match = this.baseUrl.match(pattern);
        if (!match) throw new Error("Invalid BiliBili URL");
        this.bv = match[1];

        const response = await this.axiosInstance.get("https://api.bilibili.com/x/web-interface/view", {
            params: { bvid: this.bv },
            headers: this.headers
        });

        if (!response.data.data) {
            throw new Error("Failed to get video information");
        }

        this.cid = response.data.data.cid;
        this.title = response.data.data.title.replace(/[<>:"/\\|?*]/g, '_'); // Remove invalid filename characters
        console.log(`[音频下载器] 获取到CID: ${this.cid}`);
        console.log(`[音频下载器] 视频标题: ${this.title}`);
    }

    private async getAudioUrl(): Promise<void> {
        const response = await this.axiosInstance.get("https://api.bilibili.com/x/player/wbi/playurl", {
            params: {
                bvid: this.bv,
                cid: this.cid,
                qn: this.audioQuality,
                fnver: 0,
                fnval: 4048,
                fourk: 1
            },

            headers: this.headers
        });

        if (!response.data.data?.dash?.audio?.length) {
            throw new Error("No audio stream found");
        }

        // Find the audio stream with the requested quality or fallback to the best available
        const audioStreams = response.data.data.dash.audio as AudioStream[];
        let selectedStream = audioStreams.find(stream => stream.id === this.audioQuality);
        if (!selectedStream) {
            selectedStream = audioStreams[0];
        }

        this.audioUrl = selectedStream.baseUrl;
        console.log(`[音频下载器] 获取到音频URL，质量: ${selectedStream.id}kbps`);
    }

    private async downloadAudio(): Promise<Buffer> {
        try {
            this.downloadStartTime = Date.now();
            const response = await this.axiosInstance.get(this.audioUrl, {
                headers: {
                    ...this.headers,
                    referer: this.baseUrl
                },
                responseType: 'arraybuffer',
                decompress: true,
                maxRedirects: 10,
                onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
                    const elapsedTime = (Date.now() - this.downloadStartTime) / 1000;
                    const speed = progressEvent.loaded / elapsedTime;
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
                    const downloadedSize = this.formatBytes(progressEvent.loaded);
                    const totalSize = progressEvent.total ? this.formatBytes(progressEvent.total) : 'Unknown';
                    const downloadSpeed = this.formatSpeed(speed);
                    
                    process.stdout.write(`\r[音频下载器] 下载进度: ${percent}% | ${downloadedSize}/${totalSize} | ${downloadSpeed}`);
                    
                    if (progressEvent.loaded === progressEvent.total) {
                        process.stdout.write('\n');
                    }
                }
            });

            console.log(`[音频下载器] 音频下载成功`);
            return Buffer.from(response.data);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[音频下载器] 下载音频失败:`, {
                message: axiosError.message,
                code: axiosError.code,
                status: axiosError.response?.status
            });
            throw error;
        }
    }
}
// // 示例用法
// const bvid = 'BV1K1ktYNEHt'; // 替换为实际的 BV 号
// new AudioDownloader(`https://www.bilibili.com/video/${bvid}`).run().catch(console.error);
