import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "你的 IQ 有多高？｜80 題認知推理推估",
  description: "80 題、約 20～25 分鐘的非臨床認知推理推估，涵蓋七種能力向度。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
