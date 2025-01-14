import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B站音频下载器 | Bilibili Audio Downloader",
  description: "一个简单的B站视频音频提取工具，支持多种音质选择，快速下载B站视频的音频内容。免费、便捷、高效的哔哩哔哩视频音频下载工具。",
  keywords: ["bilibili", "音频下载", "B站", "哔哩哔哩", "视频音频", "音频提取", "音乐下载"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "B站音频下载器 | Bilibili Audio Downloader",
    description: "一个简单的B站视频音频提取工具，支持多种音质选择。",
    type: "website",
    locale: "zh_CN",
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
    canonical: "https://bilibili-audio-downloader.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
