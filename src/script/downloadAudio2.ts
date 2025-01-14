// import fs from 'fs';
// import axios from 'axios';
// import ffmpeg from 'fluent-ffmpeg';

// // 获取视频信息（这里只是一个简化的示例，实际情况需要根据 B 站 API 或网页结构进行调整）
// async function getVideoInfo(bvid: string): Promise<{ audioUrl: string; videoUrl: string } | null> {
//     try {
//         // 使用 axios 替换 fetch
//         const response = await axios.get(`https://www.bilibili.com/video/${bvid}`);
//         const html = response.data;

//         // 这里需要使用正则表达式或HTML解析库（如cheerio）来提取音视频URL
//         // 这部分代码需要根据B站的网页结构进行调整，以下只是一个示例
//         const audioMatch = html.match(/"audio":\[{"id":\d+,"baseUrl":"(.*?)"/);
//         const videoMatch = html.match(/"video":\[{"id":\d+,"baseUrl":"(.*?)"/);

//         if (audioMatch && videoMatch) {
//             return { audioUrl: audioMatch[1], videoUrl: videoMatch[1] };
//         } else {
//             console.error("无法找到音视频URL，请检查B站页面结构是否变化。");
//             return null;
//         }

//     } catch (error) {
//         console.error("获取视频信息出错:", error);
//         return null;
//     }
// }

// async function downloadFile(url: string, filePath: string): Promise<void> {
//     // 使用 axios 替换 fetch
//     const response = await axios({
//         method: 'get',
//         url: url,
//         responseType: 'stream',
//         headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//             referer: 'https://www.bilibili.com',
//         }
//     });

//     const writer = fs.createWriteStream(filePath);

//     return new Promise((resolve, reject) => {
//         response.data.pipe(writer);
//         writer.on('finish', resolve);
//         writer.on('error', reject);
//     });
// }

// async function extractAudio(bvid: string, outputFilename: string = 'output.mp3'): Promise<void> {
//     const videoInfo = await getVideoInfo(bvid);
//     if (!videoInfo) {
//         console.error("无法获取视频信息，提取音频失败。");
//         return;
//     }

//     const audioFilename = `audio_${bvid}.m4s`;
//     await downloadFile(videoInfo.audioUrl, audioFilename);

//     ffmpeg()
//         .input(audioFilename)
//         .audioCodec('libmp3lame') // 设置音频编码器为 libmp3lame
//         .output(outputFilename)
//         .on('end', () => {
//             console.log('音频提取完成！');
//             fs.unlinkSync(audioFilename); // 删除临时音频文件
//         })
//         .on('error', (err) => {
//             console.error('音频转换出错:', err);
//             fs.unlinkSync(audioFilename); // 发生错误时也删除临时文件
//         })
//         .run();
// }

// // 示例用法
// // const bvid = 'BV1K1ktYNEHt'; // 替换为实际的 BV 号
// // extractAudio(bvid, 'output.mp3').catch(console.error);