import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "협동 역사 MUD · 실시간 교실",
  description: "호와 역할로 함께 판단하는 10분 이내 역사 협동 활동",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#172554",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
