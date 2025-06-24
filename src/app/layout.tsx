import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated Metadata from page.tsx
export const metadata: Metadata = {
  title: 'B站音频提取 - 轻松提取哔哩哔哩视频 MP3 音频',
  description: '免费在线 B 站音频下载工具，输入 Bilibili 视频链接，一键提取并下载高质量 MP3 音频文件。支持 BV 号和 AV 号。',
  keywords: ['B站音频下载', '哔哩哔哩音频提取', 'Bilibili 转 MP3', 'BV 转 MP3', 'bilibili音频提取器', '视频转音频', 'B站下载器'],
  openGraph: {
    title: 'B站音频下载器 - 轻松提取哔哩哔哩视频 MP3 音频',
    description: '免费在线 B 站音频下载工具，输入 Bilibili 视频链接，一键提取并下载高质量 MP3 音频文件。',
    url: 'https://your-website-url.com', // Replace with your actual URL
    siteName: 'B站音频下载器',
    // images: [ // Optional: Add an image for social sharing
    //   {
    //     url: 'https://your-website-url.com/og-image.png', 
    //     width: 800,
    //     height: 600,
    //   },
    // ],
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://bilibili-audio-downloader.vercel.app", // Keep or update your canonical URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
