import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { LanguageSync } from "@/components/language-sync";
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
  title: {
    default: "My Trip - 한국 관광지 정보 서비스",
    template: "%s | My Trip",
  },
  description:
    "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 및 조회 서비스. 반려동물 동반 가능한 관광지 정보도 제공합니다.",
  keywords: ["관광지", "여행", "한국", "여행 정보", "관광 정보", "반려동물 동반", "펫 프렌들리"],
  authors: [{ name: "My Trip" }],
  creator: "My Trip",
  publisher: "My Trip",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://my-trip.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 및 조회 서비스",
    type: "website",
    locale: "ko_KR",
    siteName: "My Trip",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "My Trip - 한국 관광지 정보 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Trip - 한국 관광지 정보 서비스",
    description: "한국관광공사 공공 API를 활용한 전국 관광지 정보 검색 및 조회 서비스",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Console 등록 시 사용
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleMapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // 환경 변수 디버깅 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Layout] 환경 변수 확인:', {
      hasGoogleMapKey: !!googleMapApiKey,
      hasClerkKey: !!clerkPublishableKey,
      googleMapKeyLength: googleMapApiKey?.length || 0,
    });
  }

  // ClerkProvider는 publishableKey가 있을 때만 사용
  // 빌드 시 환경 변수가 없어도 빌드가 성공하도록 처리
  const content = (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 구글 지도 API 스크립트 로드 */}
        {googleMapApiKey && googleMapApiKey.trim() ? (
          <Script
            id="google-maps-api"
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapApiKey}&libraries=places`}
            strategy="afterInteractive"
          />
        ) : (
          <Script
            id="google-maps-warning"
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof console !== 'undefined' && console.error) {
                  console.error('[Layout] Google Maps API 키가 설정되지 않았습니다. 지도 기능이 작동하지 않을 수 있습니다.');
                  console.error('[Layout] 해결 방법: 프로젝트 루트에 .env.local 파일을 생성하고 NEXT_PUBLIC_GOOGLE_MAP_API_KEY를 추가하세요.');
                  console.error('[Layout] 환경:', '${process.env.NODE_ENV}');
                  console.error('[Layout] 자세한 내용은 docs/env-setup.md 파일을 참고하세요.');
                }
              `,
            }}
          />
        )}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <I18nProvider>
            <LanguageSync />
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
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );

  // Clerk publishableKey가 있으면 ClerkProvider로 감싸고, 없으면 그대로 반환
  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey} localization={koKR}>
        {content}
      </ClerkProvider>
    );
  }

  // 빌드 시 환경 변수가 없을 때는 ClerkProvider 없이 반환
  // 실제 배포 시에는 Vercel에 환경 변수를 설정해야 함
  return content;
}
