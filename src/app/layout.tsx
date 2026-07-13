import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "广西岗位数据监测平台 · 招培就一体化",
  description: "基于全国大学生就业服务平台，每日监测广西区域岗位发布数据，形成产业需求与人才供给的数据闭环。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
