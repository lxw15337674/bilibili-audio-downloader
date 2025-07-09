export type Platform = 'bilibili' | 'douyin' | 'unknown';

export interface PlatformInfo {
  platform: Platform;
  confidence: number; // 0-1之间，表示检测的置信度
  reason?: string; // 检测原因，用于调试
}

/**
 * 检测URL属于哪个平台
 */
export function detectPlatform(url: string): PlatformInfo {
  if (!url || typeof url !== 'string') {
    return { platform: 'unknown', confidence: 0, reason: 'Empty or invalid URL' };
  }

  const cleanUrl = url.trim();
  
  // B站检测逻辑
  const bilibiliInfo = detectBilibili(cleanUrl);
  if (bilibiliInfo.confidence > 0.8) {
    return bilibiliInfo;
  }
  
  // 抖音检测逻辑
  const douyinInfo = detectDouyin(cleanUrl);
  if (douyinInfo.confidence > 0.8) {
    return douyinInfo;
  }
  
  // 返回置信度更高的结果
  if (bilibiliInfo.confidence > douyinInfo.confidence) {
    return bilibiliInfo;
  } else if (douyinInfo.confidence > bilibiliInfo.confidence) {
    return douyinInfo;
  }
  
  return { platform: 'unknown', confidence: 0, reason: 'No platform detected' };
}

/**
 * 检测是否为B站链接
 */
function detectBilibili(url: string): PlatformInfo {
  let confidence = 0;
  const reasons: string[] = [];
  
  // 域名检测
  if (url.includes('bilibili.com') || url.includes('b23.tv')) {
    confidence += 0.7;
    reasons.push('Bilibili domain detected');
  }
  
  // BV号检测
  if (/BV[a-zA-Z0-9]+/.test(url)) {
    confidence += 0.8;
    reasons.push('BV number detected');
  }
  
  // AV号检测
  if (/av\d+/i.test(url)) {
    confidence += 0.6;
    reasons.push('AV number detected');
  }
  
  // 路径检测
  if (url.includes('/video/')) {
    confidence += 0.3;
    reasons.push('Video path detected');
  }
  
  // bvid参数检测
  if (url.includes('bvid=')) {
    confidence += 0.5;
    reasons.push('bvid parameter detected');
  }
  
  // 限制最大置信度
  confidence = Math.min(confidence, 1);
  
  return {
    platform: 'bilibili',
    confidence,
    reason: reasons.join(', ')
  };
}

/**
 * 检测是否为抖音链接
 */
function detectDouyin(url: string): PlatformInfo {
  let confidence = 0;
  const reasons: string[] = [];
  
  // 域名检测
  const douyinDomains = [
    'douyin.com',
    'v.douyin.com',
    'iesdouyin.com',
    'dy.to'  // 短链接域名
  ];
  
  for (const domain of douyinDomains) {
    if (url.includes(domain)) {
      confidence += 0.8;
      reasons.push(`Douyin domain (${domain}) detected`);
      break;
    }
  }
  
  // 路径检测
  if (url.includes('/video/') || url.includes('/note/')) {
    confidence += 0.3;
    reasons.push('Video/Note path detected');
  }
  
  // 分享ID检测 (抖音分享链接通常有特定格式)
  if (/\/[\w-]{10,}/.test(url)) {
    confidence += 0.2;
    reasons.push('Share ID pattern detected');
  }
  
  // 限制最大置信度
  confidence = Math.min(confidence, 1);
  
  return {
    platform: 'douyin',
    confidence,
    reason: reasons.join(', ')
  };
}

/**
 * 获取平台的显示名称
 */
export function getPlatformDisplayName(platform: Platform): string {
  switch (platform) {
    case 'bilibili':
      return 'Bilibili';
    case 'douyin':
      return '抖音/Douyin';
    default:
      return '未知平台';
  }
}

/**
 * 检查URL是否有效
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    // 检查是否只是缺少协议
    try {
      new URL('https://' + url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 标准化URL（添加协议等）
 */
export function normalizeUrl(url: string): string {
  if (!url) return url;
  
  const trimmed = url.trim();
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  return 'https://' + trimmed;
} 