# 성능 최적화 가이드

> Lighthouse 점수 개선을 위한 성능 최적화 가이드

## 목표

- **Lighthouse 성능 점수**: > 80점
- **First Contentful Paint (FCP)**: < 1.8초
- **Largest Contentful Paint (LCP)**: < 2.5초
- **Time to Interactive (TTI)**: < 3.8초
- **Cumulative Layout Shift (CLS)**: < 0.1

---

## 1. 이미지 최적화

### ✅ 완료된 작업

- Next.js Image 컴포넌트 사용
- `sizes` 속성 설정 (반응형 이미지)
- `priority` 속성 (Above-the-fold 이미지)
- `loading="lazy"` (Below-the-fold 이미지)
- WebP/AVIF 포맷 지원 (`next.config.ts`)
- 원격 이미지 도메인 설정

### 추가 최적화 가능 항목

1. **이미지 CDN 사용**
   - Vercel Image Optimization API 활용 (자동 적용됨)
   - 또는 Cloudinary, Imgix 등 외부 CDN 사용

2. **Blur Placeholder**
   ```tsx
   <Image
     src={imageUrl}
     alt={alt}
     placeholder="blur"
     blurDataURL={blurDataUrl}
   />
   ```

3. **이미지 크기 최적화**
   - 실제 필요한 크기만 로드
   - `sizes` 속성 정확히 설정

---

## 2. 코드 분할 및 번들 최적화

### ✅ 완료된 작업

- 지도 컴포넌트 동적 import (`ssr: false`)
- 무거운 컴포넌트 lazy loading
- Next.js App Router 자동 코드 분할

### 추가 최적화 가능 항목

1. **번들 분석**
   ```bash
   # 번들 분석 도구 설치
   pnpm add -D @next/bundle-analyzer
   ```

2. **불필요한 의존성 제거**
   - 사용하지 않는 라이브러리 제거
   - Tree-shaking 최적화

3. **동적 import 최적화**
   ```tsx
   // 무거운 컴포넌트는 동적 import
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Skeleton />,
     ssr: false, // 클라이언트 전용 컴포넌트
   });
   ```

---

## 3. 폰트 최적화

### ✅ 완료된 작업

- Next.js Font Optimization 사용 (Geist, Geist Mono)
- `variable` 속성으로 CSS 변수 사용

### 추가 최적화 가능 항목

1. **폰트 preload**
   ```tsx
   <link
     rel="preload"
     href="/fonts/geist-sans.woff2"
     as="font"
     type="font/woff2"
     crossOrigin="anonymous"
   />
   ```

2. **폰트 display 설정**
   ```tsx
   const geistSans = Geist({
     variable: "--font-geist-sans",
     subsets: ["latin"],
     display: "swap", // FOIT 방지
   });
   ```

---

## 4. 캐싱 전략

### ✅ 완료된 작업

- API 응답 캐싱 (ISR, `revalidate: 3600`)
- Next.js 자동 정적 최적화

### 추가 최적화 가능 항목

1. **Service Worker (PWA)**
   - 오프라인 지원
   - 캐시 전략 구현

2. **HTTP 캐시 헤더**
   - Vercel에서 자동 설정됨
   - 필요 시 `next.config.ts`에서 커스터마이징

---

## 5. 리소스 힌트

### 추가 가능한 최적화

1. **DNS Prefetch**
   ```tsx
   <link rel="dns-prefetch" href="https://tong.visitkorea.or.kr" />
   <link rel="dns-prefetch" href="https://maps.googleapis.com" />
   ```

2. **Preconnect**
   ```tsx
   <link rel="preconnect" href="https://tong.visitkorea.or.kr" />
   <link rel="preconnect" href="https://maps.googleapis.com" />
   ```

3. **Prefetch**
   ```tsx
   <Link href="/stats" prefetch={true}>
     통계
   </Link>
   ```

---

## 6. 렌더링 최적화

### ✅ 완료된 작업

- Server Components 사용
- 클라이언트 컴포넌트 최소화

### 추가 최적화 가능 항목

1. **React.memo 사용**
   ```tsx
   export const TourCard = React.memo(({ tour }: TourCardProps) => {
     // ...
   });
   ```

2. **useMemo, useCallback 활용**
   - 무거운 계산 결과 메모이제이션
   - 함수 참조 안정화

3. **가상화 (Virtualization)**
   - 긴 리스트의 경우 react-window 또는 react-virtual 사용

---

## 7. 네트워크 최적화

### 추가 가능한 최적화

1. **API 호출 최소화**
   - 병렬 처리 (`Promise.all`)
   - 중복 요청 방지 (SWR, React Query)

2. **응답 크기 최소화**
   - 필요한 필드만 요청
   - 압축 활성화 (gzip, brotli)

---

## 8. Lighthouse 측정 방법

### 개발 환경

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# Chrome DevTools에서 Lighthouse 실행
# 1. Chrome DevTools 열기 (F12)
# 2. Lighthouse 탭 선택
# 3. "Generate report" 클릭
```

### 목표 점수

- **Performance**: > 80
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90

### 개선 우선순위

1. **LCP (Largest Contentful Paint)**
   - 이미지 최적화
   - 폰트 최적화
   - 서버 응답 시간 개선

2. **FID (First Input Delay)**
   - JavaScript 번들 크기 감소
   - 코드 분할
   - 메인 스레드 블로킹 최소화

3. **CLS (Cumulative Layout Shift)**
   - 이미지 크기 명시
   - 폰트 로딩 전략
   - 동적 콘텐츠 크기 예약

---

## 9. 모니터링

### 프로덕션 모니터링

1. **Vercel Analytics**
   - Web Vitals 자동 수집
   - 성능 메트릭 대시보드

2. **Google Analytics**
   - Core Web Vitals 리포트
   - 사용자 경험 데이터

3. **Sentry**
   - 에러 모니터링
   - 성능 추적

---

## 10. 체크리스트

### 이미지 최적화
- [x] Next.js Image 컴포넌트 사용
- [x] `sizes` 속성 설정
- [x] `priority` 속성 (Above-the-fold)
- [x] `loading="lazy"` (Below-the-fold)
- [ ] Blur placeholder 적용
- [ ] 이미지 CDN 사용 검토

### 코드 최적화
- [x] 동적 import 사용
- [x] 코드 분할
- [ ] 번들 분석 실행
- [ ] 불필요한 의존성 제거

### 캐싱
- [x] API 캐싱 (ISR)
- [x] 정적 페이지 생성
- [ ] Service Worker 검토

### 렌더링 최적화
- [x] Server Components 사용
- [ ] React.memo 적용 (필요 시)
- [ ] useMemo, useCallback 활용

### 네트워크
- [x] API 병렬 처리
- [ ] 리소스 힌트 추가
- [ ] 압축 확인

---

## 참고 자료

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Vercel Analytics](https://vercel.com/analytics)

