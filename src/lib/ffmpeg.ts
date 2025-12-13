import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

const FFMPEG_CORE_VERSION = '0.12.10';
const FFMPEG_CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    // Check if SharedArrayBuffer is available
    if (typeof SharedArrayBuffer === 'undefined') {
      throw new Error('SharedArrayBuffer is not available. This may be due to missing COOP/COEP headers.');
    }

    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    try {
      // Use toBlobURL to load from CDN, avoiding dynamic import issues in Next.js
      const coreURL = await toBlobURL(
        `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
        'text/javascript'
      );
      const wasmURL = await toBlobURL(
        `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
        'application/wasm'
      );

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });
    } catch (err) {
      loadPromise = null;
      throw new Error(`Failed to load FFmpeg: ${err instanceof Error ? err.message : String(err)}`);
    }

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadPromise;
}

export type ExtractStage = 'downloading' | 'converting';

export interface ExtractAudioOptions {
  videoUrl: string;
  onProgress?: (progress: number, stage: ExtractStage) => void;
}

export async function extractAudioFromVideo({
  videoUrl,
  onProgress,
}: ExtractAudioOptions): Promise<Blob> {
  console.log('[FFmpeg] Starting audio extraction from:', videoUrl);

  const ffmpeg = await getFFmpeg();
  console.log('[FFmpeg] FFmpeg loaded successfully');

  // Download video file
  onProgress?.(0, 'downloading');
  console.log('[FFmpeg] Downloading video...');

  let videoData: Uint8Array;
  try {
    videoData = await fetchFile(videoUrl);
    console.log('[FFmpeg] Video downloaded, size:', videoData.byteLength);
  } catch (err) {
    throw new Error(`Failed to download video: ${err instanceof Error ? err.message : String(err)}`);
  }

  onProgress?.(100, 'downloading');

  // Write to virtual file system
  await ffmpeg.writeFile('input.mp4', videoData);
  console.log('[FFmpeg] Video written to virtual filesystem');

  // Set conversion progress listener
  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(Math.round(progress * 100), 'converting');
  });

  // Execute conversion: extract audio to MP3
  console.log('[FFmpeg] Starting conversion...');
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-vn',
    '-acodec', 'libmp3lame',
    '-q:a', '2',
    'output.mp3'
  ]);
  console.log('[FFmpeg] Conversion completed');

  // Read output file
  const outputData = await ffmpeg.readFile('output.mp3');

  // Cleanup files
  await ffmpeg.deleteFile('input.mp4');
  await ffmpeg.deleteFile('output.mp3');

  // Create Blob (outputData is Uint8Array or string)
  if (typeof outputData === 'string') {
    throw new Error('Unexpected string output from ffmpeg');
  }
  // Copy to a new ArrayBuffer to avoid SharedArrayBuffer issues
  const buffer = new ArrayBuffer(outputData.byteLength);
  new Uint8Array(buffer).set(outputData);
  console.log('[FFmpeg] Audio blob created, size:', buffer.byteLength);
  return new Blob([buffer], { type: 'audio/mpeg' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
