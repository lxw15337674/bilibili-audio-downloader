import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import https from 'https';

interface AudioTrack {
    baseUrl: string;
    // Add other properties if needed
}

class AudioDownloader {
    private readonly headers: { [key: string]: string };
    private bv: string = '';
    private cid: string = '';
    private audioUrls: string[] = [];
    private readonly axiosInstance;

    constructor(private readonly baseUrl: string, private readonly qn: number = 100) {
        this.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203",
            "Referer": this.baseUrl
        };

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';  // Only use this in development environment
        this.axiosInstance = axios.create({
            timeout: 60000,
            maxRedirects: 5,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
                keepAlive: true
            })
        });
    }

    public async run(): Promise<void> {
        console.log("[AudioDownloader] Starting audio download...");
        await this.getCid();
        await this.getAudioUrl();
        await this.downloadAudio();
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
        console.log(`[AudioDownloader] Fetched CID: ${this.cid}`);
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

        this.audioUrls = response.data.data.dash.audio.map((audio: AudioTrack) => audio.baseUrl);
        console.log(`[AudioDownloader] Fetched ${this.audioUrls.length} audio URLs`);
    }

    private async downloadAudio(): Promise<void> {
        for (let i = 0; i < this.audioUrls.length; i++) {
            const audioUrl = this.audioUrls[i];
            const audioPath = path.join('./', `${Date.now()}-${this.bv}-audio-${i + 1}.mp3`);

            try {
                const response = await this.axiosInstance.get(audioUrl, {
                    headers: this.headers,
                    responseType: 'arraybuffer'
                });

                fs.writeFileSync(audioPath, response.data);
                console.log(`[AudioDownloader] Audio ${i + 1} downloaded successfully: ${audioPath}`);
            } catch (error) {
                console.error(`[AudioDownloader] Failed to download audio ${i + 1}:`, error);
                throw error;
            }
        }
    }
}

// 使用示例
const audioDownloader = new AudioDownloader("https://www.bilibili.com/video/BV1hsk2YhExq/");
audioDownloader.run();