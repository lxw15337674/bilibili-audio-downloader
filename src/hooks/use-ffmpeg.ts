'use client';

import { useState, useCallback } from 'react';
import { extractAudioFromVideo, downloadBlob, ExtractStage } from '@/lib/ffmpeg';

export type FFmpegStatus = 'idle' | 'loading' | 'downloading' | 'converting' | 'completed' | 'error';

export interface UseFFmpegReturn {
  status: FFmpegStatus;
  progress: number;
  error: string | null;
  extractAudio: (videoUrl: string, title: string) => Promise<void>;
  reset: () => void;
}

export function useFFmpeg(): UseFFmpegReturn {
  const [status, setStatus] = useState<FFmpegStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const extractAudio = useCallback(async (videoUrl: string, title: string) => {
    try {
      setStatus('loading');
      setProgress(0);
      setError(null);

      const audioBlob = await extractAudioFromVideo({
        videoUrl,
        onProgress: (prog: number, stage: ExtractStage) => {
          setStatus(stage);
          setProgress(prog);
        },
      });

      // Trigger download
      const safeFilename = title.replace(/[<>:"/\\|?*]/g, '_');
      downloadBlob(audioBlob, `${safeFilename}.mp3`);

      setStatus('completed');

      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 2000);

    } catch (err) {
      console.error('Extract audio error:', err);
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Unknown error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { status, progress, error, extractAudio, reset };
}
