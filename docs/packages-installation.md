# 패키지 설치 가이드

> My Trip 프로젝트에 설치된 패키지 및 설정 가이드

---

## 📦 설치된 패키지

### 1. Swiper (이미지 슬라이더/캐러셀)

**설치 날짜**: 2025-01-XX  
**버전**: 12.0.3  
**용도**: 상세페이지 이미지 갤러리 슬라이더

#### 설치 방법
```bash
pnpm add swiper
```

#### 사용 예시
```tsx
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Swiper CSS 불러오기
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function ImageGallery({ images }: { images: string[] }) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      className="w-full h-[400px]"
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <img
            src={image}
            alt={`이미지 ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
```

#### 참고 문서
- [Swiper 공식 문서](https://swiperjs.com/)
- [React 통합 가이드](https://swiperjs.com/react)

---

## 🗺️ 구글 지도 API 타입 정의

**파일 위치**: `types/googlemaps.d.ts` (생성 예정)  
**용도**: 구글 지도 API TypeScript 타입 정의

**참고**: 구글 지도 API는 `@types/google.maps` 패키지 또는 직접 타입 정의를 사용할 수 있습니다.

### 설정 방법

구글 지도 API는 스크립트로 직접 로드되며, `@types/google.maps` 패키지로 타입을 제공합니다.

#### 설치 방법

```bash
pnpm add -D @types/google.maps
```

#### 레이아웃에 스크립트 추가 예시

```tsx
// app/layout.tsx 또는 컴포넌트에서
import Script from 'next/script';

export default function Layout({ children }) {
  const googleMapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${googleMapApiKey}`}
        strategy="lazyOnload"
      />
      {children}
    </>
  );
}
```

#### 타입 사용 예시
```tsx
'use client';

import { useEffect, useRef } from 'react';

export function GoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 37.5665, lng: 126.9780 }, // 서울시청
      zoom: 15,
    });

    const marker = new google.maps.Marker({
      position: { lat: 37.5665, lng: 126.9780 },
      map: map,
    });
  }, []);

  return <div ref={mapRef} className="w-full h-[600px]" />;
}
```

#### 참고 문서
- [구글 지도 JavaScript API 문서](https://developers.google.com/maps/documentation/javascript)
- [구글 Maps Platform 가이드](https://developers.google.com/maps/documentation)

---

## 📋 환경변수 설정

### 필수 환경변수

```bash
# 한국관광공사 API
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key
# 또는
TOUR_API_KEY=your_tour_api_key

# 구글 지도
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=your_google_map_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

### 환경변수 확인 방법

1. `.env.local` 파일 생성 (로컬 개발용)
2. `.env.example` 파일 참고
3. Vercel 배포 시 환경변수 설정

---

## 🚀 다음 단계

패키지 설치가 완료되었으므로 다음 작업을 진행할 수 있습니다:

1. **Phase 1.2**: 타입 정의 (`lib/types/tour.ts`)
2. **Phase 1.3**: API 클라이언트 구현 (`lib/api/tour-api.ts`)
3. **Phase 3.5**: 이미지 갤러리 컴포넌트 (`components/tour-detail/detail-gallery.tsx`) - Swiper 사용

---

## 📝 참고 사항

### Swiper 스타일링
Swiper는 기본 CSS를 불러와야 합니다. Next.js에서는 다음과 같이 처리합니다:

```tsx
// 컴포넌트 상단
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
```

### 구글 지도 로딩
구글 지도 API는 동적으로 로드되므로, 컴포넌트에서 `window.google` 존재 여부를 확인해야 합니다:

```tsx
useEffect(() => {
  if (typeof window !== 'undefined' && window.google) {
    // 지도 초기화
  }
}, []);
```

또는 동적 import를 사용:

```tsx
const GoogleMap = dynamic(() => import('@/components/google-map'), {
  ssr: false,
});
```

---

**마지막 업데이트**: 2025-01-XX

