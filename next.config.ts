import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 성능 최적화 설정
  compress: true, // gzip 압축 활성화 (기본값이지만 명시)
  poweredByHeader: false, // X-Powered-By 헤더 제거 (보안)
  reactStrictMode: true, // React Strict Mode 활성화 (개발 모드에서 경고 표시)
  
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "tong.visitkorea.or.kr" }, // 한국관광공사 이미지 도메인
      { hostname: "maps.googleapis.com" }, // 구글 지도 이미지 도메인
      { hostname: "maps.gstatic.com" }, // 구글 지도 정적 리소스 도메인
    ],
    // 이미지 최적화 설정
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 이미지 최적화 품질 설정
    minimumCacheTTL: 60, // 최소 캐시 TTL (초)
  },
  
  // 실험적 기능 (성능 최적화)
  experimental: {
    // 서버 컴포넌트 최적화
    optimizePackageImports: ['lucide-react', '@clerk/nextjs'],
  },
};

export default nextConfig;
