import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import ErrorBoundary from "@/components/error-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Trip - 한국 관광지 정보 서비스",
  description:
    "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 및 조회 서비스",
  keywords: ["관광지", "여행", "한국", "여행 정보", "관광 정보"],
  authors: [{ name: "My Trip" }],
  openGraph: {
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 및 조회 서비스",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleMapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* 구글 지도 API 스크립트 로드 */}
          {googleMapApiKey && (
            <Script
              src={`https://maps.googleapis.com/maps/api/js?key=${googleMapApiKey}&libraries=places`}
              strategy="afterInteractive"
            />
          )}
          {!googleMapApiKey && process.env.NODE_ENV === 'development' && (
            <Script
              id="google-maps-warning"
              dangerouslySetInnerHTML={{
                __html: `
                  if (typeof console !== 'undefined' && console.warn) {
                    console.warn('[Layout] Google Maps API 키가 설정되지 않았습니다. 지도 기능이 작동하지 않을 수 있습니다. .env 파일에 NEXT_PUBLIC_GOOGLE_MAP_API_KEY를 추가하세요.');
                  }
                `,
              }}
            />
          )}
          <SyncUserProvider>
            <ErrorBoundary>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </ErrorBoundary>
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
