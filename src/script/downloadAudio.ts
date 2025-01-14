import axios, { AxiosError } from 'axios';
import https from 'https';

export class AudioDownloader {
    private readonly headers: { [key: string]: string };
    private bv: string = '';
    private cid: string = '';
    private title: string = '';
    private audioUrl: string = '';
    private readonly axiosInstance;
    private readonly maxRetries = 3;
    private readonly retryDelay = 3000; // 3 seconds

    constructor(private readonly baseUrl: string, private readonly qn: number = 100) {
        this.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203",
            "Referer": "https://www.bilibili.com",
            "Origin": "https://www.bilibili.com",
            // "Cookie":"buvid3=40949A60-E6C5-1985-AFE8-D8E56978241663623infoc; b_nut=1725525163; theme_style=dark; _uuid=A31DD187-DA78-81B10-9AE3-CA89D5D8861664951infoc; buvid_fp=9e9037642040cde2a2c4bee83bd6d201; buvid4=BB5E8B3C-A441-BF9A-5362-F0A7CD0E1A5437218-024090509-9S3HYK1DLRqCHr9vBj2sL/+FHsXrsNDMX+npJi/qTqjJElcJkaNRK9Zt49vmUJA1; sid=7fkjefil; rpdid=|(um~JJRkm~J0J'u~kl)Y)kku; header_theme_version=CLOSE; enable_web_push=DISABLE; home_feed_column=5; browser_resolution=1638-954; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzcwOTk1NzIsImlhdCI6MTczNjg0MDMxMiwicGx0IjotMX0.iEfDXfobGzb-0IZit8gZj8o6Bp9Skrd2RiTaFmMHTQY; bili_ticket_expires=1737099512; CURRENT_FNVAL=4048; share_source_origin=COPY; bsource=share_source_copy_link; b_lsid=9E16B6107_19463F30CCD"
        };

        this.axiosInstance = axios.create({
            timeout: 60000,
            maxRedirects: 5,
            headers: this.headers,
            httpsAgent: new https.Agent({
                keepAlive: true,
                timeout: 60000,
                rejectUnauthorized: true
            })
        });
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
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
            filename: `${this.title}-${this.bv}.mp3`
        };
    }

    private async getCid(): Promise<void> {
        const pattern = /(BV.*)\//;
        const match = this.baseUrl.match(pattern);
        if (!match) throw new Error("Invalid BiliBili URL");
        this.bv = match[1];

        const response = await this.axiosInstance.get("https://api.bilibili.com/x/web-interface/view", {
            params: { bvid: this.bv },
            headers: this.headers
        });

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
                qn: this.qn,
                fnver: 0,
                fnval: 4048,
                fourk: 1
            },
            headers: this.headers
        });

        this.audioUrl = response.data.data.dash.audio[0].baseUrl;
        console.log(`[音频下载器] 获取到音频URL`);
    }

    private async downloadAudio(): Promise<Buffer> {
        const downloadedBytes = 0;

        try {
            const response = await this.axiosInstance.get(this.audioUrl, {
                headers: {
                    ...this.headers,
                    'Range': `bytes=${downloadedBytes}-`
                },
                responseType: 'arraybuffer',
                onDownloadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
                    process.stdout.write(`\r[音频下载器] 下载进度: ${percentCompleted}%`);
                }
            });

            process.stdout.write('\n');  // New line after progress
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