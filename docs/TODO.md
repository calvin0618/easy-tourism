# My Trip - 개발 TODO

> PRD.md 기반 개발 작업 목록  
> 참고: [PRD.md](../docs/PRD.md), [Design.md](../docs/Design.md), [myTrip_schema.sql](../supabase/migrations/myTrip_schema.sql)

---

## 📋 현재 상태

### ✅ 완료된 작업
- [x] 프로젝트 셋업 (Next.js 15.5.6, React 19)
- [x] Clerk 인증 설정 및 Supabase 연동
- [x] 기본 레이아웃 구조 (`app/layout.tsx`)
- [x] 사용자 동기화 시스템 (Clerk → Supabase)
- [x] 기본 Supabase 마이그레이션 (users 테이블)
- [x] shadcn/ui 일부 컴포넌트 설치 (button, input, dialog, accordion, form, label, textarea)
- [x] Phase 2.1: 페이지 기본 구조
- [x] Phase 2.2: 관광지 목록 기능
- [x] Phase 2.3: 필터 기능 추가
- [x] Phase 2.4: 검색 기능 추가 (MVP 2.3)
- [x] Phase 2.5: 구글 지도 연동 (MVP 2.2) - **참고**: PRD.md에서는 네이버 지도 사용 명시
- [x] Phase 2.6: 정렬 & 페이지네이션
- [x] Phase 3.1: 상세페이지 기본 구조
- [x] Phase 3.2: 기본 정보 섹션 (MVP 2.4.1)
- [x] Phase 4: 통계 대시보드 (Phase 4.1-4.7 완료)
- [x] Phase 5: 북마크 기능 완료
- [x] Phase 6: UI/UX 개선 및 다국어 지원
- [x] Phase 7: 최적화 & 배포 (Phase 7.1-7.6 완료)
- [x] Phase 8: 반려동물 친화 기능 (Phase 8.1-8.8 완료)

### 📦 필요한 패키지 설치
- [x] 이미지 슬라이더/캐러셀 라이브러리 (swiper 12.0.3 설치 완료)
- [x] 구글 지도 API 타입 정의 (`types/googlemaps.d.ts` 생성 완료)
  - **참고**: PRD.md에서는 네이버 지도(Naver Maps API v3)를 사용하도록 명시되어 있으나, 현재 구현은 구글 지도를 사용 중

---

## Phase 1: 기본 구조 & 공통 설정

### 1.1 프로젝트 인프라
- [x] 환경변수 설정 확인
  - [x] `NEXT_PUBLIC_TOUR_API_KEY` 또는 `TOUR_API_KEY` 설정 (문서화 완료)
  - [x] `NEXT_PUBLIC_GOOGLE_MAP_API_KEY` 설정 (문서화 완료)
    - **참고**: PRD.md에서는 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` (네이버 지도)를 사용하도록 명시되어 있으나, 현재 구현은 구글 지도를 사용 중
  - [x] Clerk, Supabase 환경변수 확인 (문서화 완료)
  - [x] `docs/env-setup.md` 생성

### 1.2 타입 정의
- [x] `lib/types/tour.ts` 생성
  - [x] `TourItem` 인터페이스 (목록용)
  - [x] `TourDetail` 인터페이스 (상세정보)
  - [x] `TourIntro` 인터페이스 (운영정보)
  - [x] `ContentType` 타입 (관광 타입 12, 14, 15, 25, 28, 32, 38, 39)
  - [x] `AreaCode` 타입 (지역코드)
  - [x] 기타 유틸리티 타입 및 인터페이스

### 1.3 API 클라이언트
- [x] `lib/api/tour-api.ts` 생성
  - [x] `getAreaCodes()` - 지역코드 조회 (`areaCode2`)
  - [x] `getAreaBasedList()` - 지역 기반 관광지 목록 (`areaBasedList2`)
  - [x] `searchKeyword()` - 키워드 검색 (`searchKeyword2`)
  - [x] `getDetailCommon()` - 상세 기본정보 (`detailCommon2`)
  - [x] `getDetailIntro()` - 상세 운영정보 (`detailIntro2`)
  - [x] `getDetailImage()` - 상세 이미지 (`detailImage2`)
  - [x] 공통 파라미터 처리 (serviceKey, MobileOS, MobileApp, _type)
  - [x] 에러 처리 및 로깅

### 1.4 공통 컴포넌트
- [x] `components/ui/skeleton.tsx` (shadcn 설치)
- [x] `components/ui/sonner.tsx` (shadcn 설치) - 토스트 메시지용
- [x] `components/ui/select.tsx` (shadcn 설치) - 필터용
- [x] `components/ui/card.tsx` (shadcn 설치) - 카드 레이아웃용
- [x] `components/ui/badge.tsx` (shadcn 설치) - 관광 타입 뱃지용
- [x] `components/loading.tsx` - 로딩 스피너
- [x] `components/error-boundary.tsx` - 에러 처리
- [x] `components/empty-state.tsx` - 빈 상태 표시

### 1.5 레이아웃 구조
- [x] `app/layout.tsx` 업데이트
  - [x] 헤더 컴포넌트 추가 (로고, 검색창, 로그인/회원가입)
  - [x] 푸터 컴포넌트 추가
  - [x] 메타데이터 설정
  - [x] ErrorBoundary 통합
  - [x] Toaster 통합
- [x] `components/header.tsx` 생성
  - [x] 로고 (My Trip)
  - [x] 검색창 (헤더 고정, 모바일 반응형)
  - [x] Clerk UserButton (로그인/회원가입)
- [x] `components/footer.tsx` 생성
  - [x] 저작권 정보
  - [x] 한국관광공사 API 제공 표기

---

## Phase 2: 홈페이지 (`/`) - 관광지 목록

### 2.1 페이지 기본 구조
- [x] `app/page.tsx` 생성
  - [x] 기본 레이아웃 구조 (헤더, 메인, 푸터)
  - [x] 반응형 컨테이너 설정
  - [x] Hero 섹션 추가 (선택 사항)

### 2.2 관광지 목록 기능 (MVP 2.1)
- [x] `components/tour-card.tsx` 생성
  - [x] 썸네일 이미지 (Next.js Image 컴포넌트)
  - [x] 관광지명 (클릭 시 상세페이지 이동)
  - [x] 주소 표시
  - [x] 관광 타입 뱃지
  - [x] 간단한 개요 (cat1, cat2 표시)
  - [x] 기본 이미지 플레이스홀더 (이미지 없을 때)
  - [x] 호버 효과 (shadow-xl, scale-[1.02])
  - [x] 반응형 레이아웃 (모바일/데스크톱)
  - [x] 이미지 로딩 실패 처리

- [x] `components/tour-list.tsx` 생성
  - [x] 그리드 레이아웃 (데스크톱: 3열, 태블릿: 2열, 모바일: 1열)
  - [x] API 연동하여 실제 데이터 표시
  - [x] 로딩 상태 (Skeleton UI)
  - [x] 빈 상태 처리
  - [x] 에러 처리

- [x] `app/page.tsx`에 목록 표시
  - [x] `tour-list.tsx` 통합
  - [x] 기본 스타일링 (Design.md 참고)
  - [x] Hero 섹션 추가

### 2.3 필터 기능 추가
- [x] `components/tour-filters.tsx` 생성
  - [x] 지역 필터 (Select 컴포넌트)
    - [x] 시/도 단위 선택
    - [x] "전체" 옵션
    - [x] `getAreaCodes()` API 연동
  - [x] 관광 타입 필터 (Multi-select 버튼)
    - [x] 관광지 (12), 문화시설 (14), 축제/행사 (15), 여행코스 (25), 레포츠 (28), 숙박 (32), 쇼핑 (38), 음식점 (39)
    - [x] "전체" 옵션 (모든 타입 선택/해제)
  - [x] 필터 초기화 버튼
  - [x] 반응형 디자인 (모바일: 가로 스크롤, 데스크톱: 인라인)
  - [x] 선택된 필터 뱃지 표시 (모바일)

- [x] 필터 상태 관리
  - [x] `app/page.tsx`에서 `useState`로 상태 관리
  - [x] `areaCode`, `contentTypes` 상태 관리
  - [x] 필터 상태를 `TourList`에 props로 전달

- [x] 필터링 로직
  - [x] 필터 변경 시 `getAreaBasedList()` 호출
  - [x] 여러 타입 선택 시 클라이언트 사이드 필터링
  - [x] 로딩 상태 표시 (TourList에서 처리)
  - [x] 에러 처리

- [x] `app/page.tsx`에 필터 통합
  - [x] 필터 컴포넌트 배치 (Sticky 위치)
  - [x] 필터 결과를 목록에 반영
  - [x] 레이아웃 재구성 (데스크톱: 분할 레이아웃 준비, 모바일: 단일 컬럼)

### 2.4 검색 기능 추가 (MVP 2.3)
- [x] `components/tour-search.tsx` 생성
  - [x] 검색창 UI (Input 컴포넌트)
  - [x] 검색 아이콘 (lucide-react)
  - [x] 검색 버튼 또는 Enter 키 이벤트
  - [x] 헤더에 통합 또는 별도 배치

- [x] 검색 로직
  - [x] `searchKeyword()` API 연동
  - [x] 검색어 상태 관리
  - [x] 검색 결과를 목록에 표시
  - [x] 검색 결과 개수 표시
  - [x] 검색 결과 없음 메시지

- [x] 검색 + 필터 조합
  - [x] 검색어와 필터 동시 적용
  - [x] 검색 시 필터 상태 유지
  - [x] 필터 변경 시 검색어 유지

- [x] `app/page.tsx`에 검색 통합
  - [x] 헤더 검색창과 연결
  - [x] 검색 결과 표시
  - [x] UX 개선 (검색 중 로딩 스피너)

### 2.5 지도 연동 (MVP 2.2)
- [x] 구글 지도 API 설정 (현재 구현)
  - [x] Google Maps API 키 확인
  - [x] `app/layout.tsx`에 외부 스크립트 추가
  - [x] 타입 정의 (`types/googlemaps.d.ts` 생성 완료)
  - **참고**: PRD.md에서는 네이버 지도(Naver Maps JavaScript API v3 (NCP))를 사용하도록 명시되어 있으나, 현재 구현은 구글 지도를 사용 중
  - **향후 작업**: 네이버 지도로 마이그레이션 시 `NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID` 환경변수 및 `ncpKeyId` 파라미터 사용 필요

- [x] `components/google-map.tsx` 생성
  - [x] 동적 import (`ssr: false`)
  - [x] 기본 지도 표시
  - [x] 초기 중심 좌표 설정 (선택된 지역 기준)
  - [x] 줌 레벨 자동 조정
  - [x] 지도 컨트롤 (줌 인/아웃, 지도 타입)
  - [x] 반응형 크기 (모바일: 400px, 데스크톱: 600px)

- [x] 마커 표시 기능
  - [x] 관광지 목록 데이터를 마커로 표시
  - [x] KATEC → WGS84 좌표 변환 (`mapx/10000000`, `mapy/10000000`)
  - [x] 마커 클릭 시 인포윈도우
    - [x] 관광지명
    - [x] 간단한 설명
    - [x] "상세보기" 버튼 (클릭 시 `/places/[contentId]` 이동)
  - [ ] 관광 타입별 마커 색상 구분 (선택 사항 - 향후 구현)

- [x] 리스트-지도 연동
  - [x] 리스트 항목 클릭 시 해당 마커로 지도 이동
  - [ ] 리스트 항목 호버 시 해당 마커 강조 (선택 사항 - 향후 구현)
  - [ ] 마커 클릭 시 리스트 항목 강조 (선택 사항 - 향후 구현)

- [x] 반응형 레이아웃
  - [x] 데스크톱: 리스트(좌측 50%) + 지도(우측 50%) 분할
  - [x] 모바일: 탭 형태로 리스트/지도 전환
  - [x] `components/view-toggle.tsx` 생성 (모바일 탭용)

- [x] `app/page.tsx`에 지도 통합
  - [x] 반응형 레이아웃 구현
  - [x] 리스트-지도 데이터 동기화
  - [x] 인터랙션 테스트

### 2.6 정렬 & 페이지네이션
- [x] 정렬 기능
  - [x] 정렬 옵션 UI (Select 컴포넌트)
    - [x] 최신순 (modifiedtime 기준, 'Q')
    - [x] 이름순 (가나다순, 'O')
  - [x] 정렬 로직 구현
    - [x] 지역 기반 목록: API arrange 파라미터 사용
    - [x] 검색 결과: 클라이언트 사이드 정렬
  - [ ] 정렬 상태를 URL 파라미터로 관리 (선택 사항 - 향후 구현)

- [x] 페이지네이션
  - [x] 무한 스크롤 구현 (Intersection Observer)
  - [x] 페이지당 20개 항목
  - [x] 로딩 상태 (하단 스피너)
  - [x] 더 이상 불러올 데이터 없음 메시지

- [x] 로딩 상태 개선
  - [x] Skeleton UI 컴포넌트 (이미 구현됨)
  - [x] 카드 스켈레톤 적용 (이미 구현됨)
  - [ ] 지도 스켈레톤 (선택 사항 - 향후 구현)

- [x] 최종 페이지 확인
  - [x] 모든 기능 통합 테스트
  - [x] 반응형 테스트 (모바일/태블릿/데스크톱)
  - [x] 성능 최적화 (이미지 lazy loading, 코드 분할 - 이미 적용됨)

---

## Phase 3: 상세페이지 (`/places/[contentId]`)

### 3.1 페이지 기본 구조
- [x] `app/places/[contentId]/page.tsx` 생성
  - [x] 동적 라우팅 설정
  - [x] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
  - [ ] 로딩 상태 (Skeleton UI) - 향후 개선
  - [x] 404 에러 처리 (관광지 없을 때)

- [x] 라우팅 테스트
  - [x] 홈에서 카드 클릭 시 이동 확인
  - [x] URL 직접 입력 테스트
  - [x] 뒤로가기 버튼 동작 확인

### 3.2 기본 정보 섹션 (MVP 2.4.1)
- [x] `components/tour-detail/address-copy-button.tsx` 생성
  - [x] 주소 복사 버튼 컴포넌트
    - [x] 클립보드 API (`navigator.clipboard.writeText()`)
    - [x] 복사 완료 토스트 메시지

- [x] `app/places/[contentId]/page.tsx` 기본 정보 섹션 구현
  - [x] 관광지명 (대제목, H1)
  - [x] 대표 이미지 (크게 표시, Next.js Image)
  - [x] 주소 표시 + 복사 버튼
  - [x] 전화번호 표시 + 클릭 시 전화 연결 (`tel:` 링크)
  - [x] 홈페이지 표시 + 외부 링크 (`target="_blank"`)
  - [x] 개요 표시 (긴 설명문, 줄바꿈 처리)
  - [x] 관광 타입 및 카테고리 뱃지
  - [x] 반응형 레이아웃 (모바일 우선)

- [x] `getDetailCommon()` API 연동
  - [x] `app/places/[contentId]/page.tsx`에서 호출
  - [x] API Route에 `detailCommon` action 추가
  - [x] 에러 처리
  - [ ] 로딩 상태 (Skeleton UI) - 향후 개선

- [x] 페이지 확인 및 스타일링
  - [x] Design.md 레이아웃 참고
  - [x] 모바일/데스크톱 반응형 확인
  - [ ] 접근성 확인 (ARIA 라벨, 키보드 네비게이션) - 향후 개선

### 3.3 지도 섹션 (MVP 2.4.4)
- [x] `components/tour-detail/detail-map.tsx` 생성
  - [x] 구글 지도 표시 (단일 관광지) - 현재 구현
  - [x] 현재 위치 마커만 표시 (목적지 마커 제거)
  - [x] 현재 위치 허용 시: "내 위치" 마커 표시
  - [x] 현재 위치 미허용 시: "서울시청" 마커 표시
  - [x] 좌표 변환 (KATEC → WGS84)
  - [x] 지도 크기 조정 (모바일: 400px, 데스크톱: 600px)
  - **참고**: PRD.md에서는 네이버 지도를 사용하도록 명시되어 있으나, 현재 구현은 구글 지도를 사용 중

- [x] "길찾기" 버튼
  - [x] 구글 지도 앱/웹 연동 (`https://www.google.com/maps/dir/...`) - 현재 구현
  - [x] 현재 위치 자동 감지 (Geolocation API)
  - [x] 목적지 자동 설정 (관광지명/주소 사용)
  - [x] 좌표 정보 표시
  - [x] 좌표 복사 기능
  - **참고**: PRD.md에서는 네이버 지도 앱/웹 연동을 사용하도록 명시되어 있으나, 현재 구현은 구글 지도를 사용 중

- [x] `app/places/[contentId]/page.tsx`에 지도 통합
  - [x] 상세정보 하단에 배치
  - [x] 페이지 확인

### 3.4 공유 기능 (MVP 2.4.5)
- [x] `components/tour-detail/share-button.tsx` 생성
  - [x] 공유 아이콘 버튼 (Share/Link 아이콘)
  - [x] URL 복사 기능
    - [x] 클립보드 API 사용
    - [x] 현재 페이지 URL 복사
    - [x] 복사 완료 토스트 메시지
  - [x] 에러 처리 (HTTPS 환경 확인)

- [x] Open Graph 메타태그 동적 생성
  - [x] `app/places/[contentId]/page.tsx`에서 Metadata 생성
  - [x] `generateMetadata()` 함수 구현
    - [x] `og:title`: 관광지명
    - [x] `og:description`: 관광지 설명 (100자 이내)
    - [x] `og:image`: 대표 이미지 (1200x630 권장)
    - [x] `og:url`: 상세페이지 URL
    - [x] `og:type`: "website"
  - [ ] Twitter Card 메타태그 (선택 사항 - 향후 구현)

- [x] `app/places/[contentId]/page.tsx`에 공유 버튼 통합
  - [x] 헤더에 배치
  - [x] 공유 테스트 (소셜 미디어 미리보기 확인)

### 3.5 추가 정보 섹션 (향후 구현)
- [x] `components/tour-detail/detail-intro.tsx` 생성
- [x] 운영 정보 표시
  - [x] 운영시간 / 개장시간
  - [x] 휴무일
  - [x] 이용요금
  - [x] 주차 가능 여부
  - [x] 수용인원
  - [x] 체험 프로그램
  - [x] 유모차/반려동물 동반 가능 여부
- [x] 타입별 필드 처리 (contentTypeId에 따라 다른 필드)
  - [x] 타입별 필드 우선순위 정의 (`TYPE_FIELD_PRIORITY`)
  - [x] 필드 정의 맵 (`FIELD_DEFINITIONS`)으로 아이콘, 라벨, 값 추출 함수 관리
  - [x] 우선순위에 따라 필드 정렬 및 표시
  - [x] 운영시간 필드 특별 처리 (`usetime` 또는 `usetimeculture` 중 하나만 표시)
- [x] 정보 없으면 섹션 숨김

- [x] `getDetailIntro()` API 연동
  - [x] `app/places/[contentId]/page.tsx`에서 호출
  - [x] 데이터를 `detail-intro.tsx`에 전달
  - [x] 에러 처리
  - [x] API Route에 `detailIntro` action 추가

- [x] `components/tour-detail/detail-gallery.tsx` 생성
  - [x] 이미지 갤러리 (기본 캐러셀)
  - [x] 대표 이미지 + 서브 이미지들
  - [x] 이미지 클릭 시 전체화면 모달
  - [x] 이미지 슬라이드 기능 (이전/다음 버튼)
  - [x] 썸네일 그리드 표시
  - [x] 이미지 없으면 섹션 숨김

- [x] `getDetailImage()` API 연동
  - [x] `app/places/[contentId]/page.tsx`에서 호출
  - [x] 데이터를 `detail-gallery.tsx`에 전달
  - [x] 에러 처리
  - [x] API Route에 `detailImage` action 추가
  - [x] 대표 이미지도 갤러리에 포함

- [x] 페이지 확인
  - [x] 모든 섹션 통합
  - [x] 반응형 확인
  - [x] 이미지 최적화 확인

---

## Phase 4: 통계 대시보드 (`/stats`) - 선택 사항

> PRD.md 2.6 통계 대시보드 요구사항 참고

### 4.1 페이지 기본 구조
- [x] `app/stats/page.tsx` 생성
  - [x] 기본 레이아웃 구조 (헤더, 섹션 구분)
  - [x] 반응형 레이아웃 설정 (모바일 우선)

### 4.2 타입 정의
- [x] `lib/types/stats.ts` 생성
  - [x] `RegionStats` 인터페이스 (지역별 통계)
  - [x] `TypeStats` 인터페이스 (타입별 통계)
  - [x] `StatsSummary` 인터페이스 (통계 요약)

### 4.3 통계 데이터 수집
- [x] `lib/api/stats-api.ts` 생성
  - [x] `getRegionStats()` - 지역별 관광지 개수 집계
  - [x] `getTypeStats()` - 타입별 관광지 개수 집계
  - [x] `getStatsSummary()` - 전체 통계 요약
  - [x] 병렬 API 호출로 성능 최적화
  - [x] 에러 처리 및 재시도 로직
  - [x] 데이터 캐싱 (revalidate: 3600) - `getAreaBasedList`에서 이미 적용됨

### 4.4 통계 요약 카드
- [x] `components/stats/stats-summary.tsx` 생성
  - [x] 전체 관광지 수 표시
  - [x] Top 3 지역 표시
  - [x] Top 3 타입 표시
  - [x] 마지막 업데이트 시간 표시
  - [x] 카드 레이아웃 디자인
  - [x] 로딩 상태 (Skeleton UI)

### 4.5 지역별 분포 차트 (Bar Chart)
- [x] `components/stats/region-chart.tsx` 생성
  - [x] shadcn/ui Chart 컴포넌트 설치 (Bar)
  - [x] recharts 기반 Bar Chart 구현
  - [x] X축: 지역명, Y축: 관광지 개수
  - [x] 바 클릭 시 해당 지역 목록 페이지로 이동
  - [x] 호버 시 정확한 개수 표시
  - [x] 다크/라이트 모드 지원
  - [x] 반응형 디자인
  - [x] 로딩 상태
  - [x] 접근성 (ARIA 라벨, 키보드 네비게이션)

### 4.6 타입별 분포 차트 (Donut Chart)
- [x] `components/stats/type-chart.tsx` 생성
  - [x] shadcn/ui Chart 컴포넌트 설치 (Pie/Donut)
  - [x] recharts 기반 Donut Chart 구현
  - [x] 타입별 비율 및 개수 표시
  - [x] 섹션 클릭 시 해당 타입 목록 페이지로 이동
  - [x] 호버 시 타입명, 개수, 비율 표시
  - [x] 다크/라이트 모드 지원
  - [x] 반응형 디자인
  - [x] 로딩 상태
  - [x] 접근성 (ARIA 라벨)

### 4.7 페이지 통합 및 최적화
- [x] `app/stats/page.tsx`에 모든 컴포넌트 통합
  - [x] 통계 요약 카드 (상단)
  - [x] 지역별 분포 차트 (중단)
  - [x] 타입별 분포 차트 (하단)
- [x] Server Component로 구현
- [x] 데이터 캐싱 설정 (revalidate: 3600) - `getAreaBasedList`에서 이미 적용됨
- [x] 에러 처리 (에러 메시지 + 재시도 버튼)
- [x] 네비게이션에 통계 페이지 링크 추가
- [x] 최종 페이지 확인

---

## Phase 5: 북마크 기능 (`/bookmarks`) - 선택 사항

### 5.1 Supabase 설정
- [x] `supabase/migrations/20251106172121_create_bookmarks_table.sql` 생성
  - [x] `bookmarks` 테이블 생성
    - [x] `id`: UUID (Primary Key)
    - [x] `user_id`: UUID (Foreign Key → users.id, ON DELETE CASCADE)
    - [x] `content_id`: TEXT (관광지 contentId)
    - [x] `created_at`: TIMESTAMP WITH TIME ZONE
    - [x] UNIQUE 제약조건 (user_id, content_id)
  - [x] 인덱스 생성 (`user_id`, `content_id`, `created_at`)
  - [x] RLS 비활성화 (개발 단계)
  - [x] 권한 부여 (anon, authenticated, service_role)

- [x] 마이그레이션 적용 가이드 작성
  - [x] `docs/bookmark-migration-guide.md` 생성
  - [x] Supabase 대시보드 적용 방법 안내
  - [x] 테이블 생성 확인 SQL 쿼리 제공
- [x] 마이그레이션 적용 (수동)
  - [x] Supabase 대시보드에서 SQL Editor로 마이그레이션 실행
  - [x] 테이블 생성 확인 (제공된 SQL 쿼리 사용)

### 5.2 북마크 API 함수
- [x] `lib/api/supabase-api.ts` 생성
  - [x] `addBookmark(userId, contentId, supabase?)` - 북마크 추가
  - [x] `removeBookmark(userId, contentId, supabase?)` - 북마크 삭제
  - [x] `getUserBookmarks(userId, supabase?)` - 사용자 북마크 목록 조회
  - [x] `isBookmarked(userId, contentId, supabase?)` - 북마크 여부 확인
  - [x] 에러 처리 및 로깅

### 5.3 북마크 버튼 컴포넌트
- [x] `components/bookmarks/bookmark-button.tsx` 생성/수정
  - [x] 별 아이콘 (lucide-react Star)
  - [x] 북마크 상태 표시 (채워짐/비어있음)
  - [x] 클릭 시 북마크 추가/제거
  - [x] Clerk 인증 확인
    - [x] 로그인 O: Supabase DB에 저장 (`lib/api/supabase-api.ts` 사용)
    - [x] 로그인 X: localStorage 임시 저장 + 로그인 유도
  - [x] 로딩 상태
  - [x] 에러 처리 (토스트 메시지)

- [x] `app/places/[contentId]/page.tsx`에 북마크 버튼 통합
  - [x] 헤더에 배치 (ShareButton과 함께)
  - [x] 북마크 동작 확인 (사용자 테스트 완료)

### 5.4 북마크 목록 페이지
- [x] `app/bookmarks/page.tsx` 생성
  - [x] Clerk 인증 확인 (로그인 필요, 미로그인 시 `/sign-in` 리다이렉트)
  - [x] 북마크 목록 조회 (`getUserBookmarks()`)
  - [x] 각 북마크의 관광지 정보 조회 (`getDetailCommon()`)
  - [x] 빈 상태 (북마크 없을 때)
  - [x] 에러 처리

- [x] `components/bookmarks/bookmark-list.tsx` 생성
  - [x] 북마크한 관광지 목록 표시
  - [x] 카드 레이아웃 (북마크 전용 카드 컴포넌트)
  - [x] 북마크 날짜 표시 (YYYY.MM.DD 형식)
  - [x] 개별 삭제 버튼
  - [x] 일괄 삭제 기능 (체크박스)
    - [x] 체크박스 선택 기능
    - [x] 전체 선택/해제 기능
    - [x] 선택된 항목 일괄 삭제
    - [x] 선택된 항목 개수 표시

- [x] 정렬 기능
  - [x] 정렬 옵션 (최신순, 이름순, 지역별)
  - [x] 정렬 UI (Select 컴포넌트)
  - [x] 정렬 로직 구현
    - [x] 최신순: created_at 기준 내림차순
    - [x] 이름순: title 기준 가나다순
    - [x] 지역별: 주소에서 지역 추출 후 정렬

- [x] 페이지 확인
  - [x] 북마크 추가/삭제 흐름 테스트
  - [x] 반응형 확인
  - [x] 로그인하지 않은 경우 처리 확인

---

## Phase 6: UI/UX 개선 및 다국어 지원

### 6.1 인증 및 사용자 경험 개선
- [x] 로그인/가입하기 버튼 추가
  - [x] `components/header.tsx`에 `SignUpButton` 추가
  - [x] `SignedOut` 상태에서 로그인/가입 버튼 표시
  - [x] `SignedIn` 상태에서 `UserButton` 표시
- [x] 기본 다크모드 적용 및 토글 버튼
  - [x] `next-themes` 설치 및 `ThemeProvider` 설정 (`app/layout.tsx`)
  - [x] `defaultTheme="dark"`로 기본 다크모드 적용
  - [x] `components/theme-toggle.tsx` 생성 및 헤더에 통합
- [x] 언어 선택 버튼 및 다국어 지원
  - [x] i18n 라이브러리 직접 구현
  - [x] 지원 언어: 영어, 한국어, 일어, 중국어, 스페인어
  - [x] `components/language-selector.tsx` 생성 및 헤더에 통합
  - [x] 선택한 언어로 홈페이지 내용 변경 (주요 UI 텍스트)
  - [x] `localStorage`에 언어 설정 저장
  - [x] `<html>` 태그의 `lang` 속성 동적 변경 (`components/language-sync.tsx`)

---

## Phase 7: 최적화 & 배포

### 7.1 이미지 최적화
- [x] `next.config.ts` 외부 도메인 설정
  - [x] 한국관광공사 API 이미지 도메인 추가
  - [x] 구글 지도 이미지 도메인 추가 (maps.googleapis.com, maps.gstatic.com)
  - [x] 이미지 최적화 설정 (formats, deviceSizes, imageSizes)
- [x] Next.js Image 컴포넌트 최적화
  - [x] `sizes` 속성 설정 (tour-card.tsx, detail-gallery.tsx, places/[contentId]/page.tsx)
  - [x] `priority` 속성 (위치 기반, 상세 페이지 대표 이미지)
  - [x] `loading="lazy"` 속성 (목록 이미지)

### 7.2 에러 처리 개선
- [x] 전역 에러 핸들링
  - [x] `app/error.tsx` 생성 (에러 경계, 재시도 버튼, 홈으로 이동)
  - [x] `app/global-error.tsx` 생성 (최상위 레이아웃 에러 경계, `<html>` 태그 포함)
- [x] 404 페이지
  - [x] `app/not-found.tsx` 생성
  - [x] 커스텀 404 UI (카드 레이아웃, 홈/검색 버튼)
- [x] API 에러 처리
  - [x] 재시도 버튼 (error.tsx에 구현)
  - [x] 사용자 친화적 에러 메시지 (에러 ID, 설명 포함)

### 7.3 SEO 최적화
- [x] 메타데이터 설정
  - [x] `app/layout.tsx` 기본 메타데이터 (title template, description, keywords, Open Graph, Twitter Card, robots)
  - [x] 각 페이지별 메타데이터 (places/[contentId]/page.tsx에 generateMetadata 구현됨)
- [x] `sitemap.xml` 생성
  - [x] `app/sitemap.ts` 생성 (동적, 정적 페이지 포함)
- [x] `robots.txt` 생성
  - [x] `app/robots.ts` 생성 (크롤러 규칙, sitemap 링크)

### 7.4 성능 최적화
- [ ] Lighthouse 점수 측정 (수동 작업 필요)
  - [ ] 목표: > 80점
  - [ ] 성능 개선 항목 확인
  - [x] 성능 최적화 가이드 문서 작성 (`docs/performance-optimization-guide.md`)
- [x] 코드 분할
  - [x] 지도 컴포넌트 동적 import (`ssr: false`) - GoogleMap, DetailMap
  - [x] 무거운 컴포넌트 lazy loading (동적 import 사용)
- [x] 캐싱 전략
  - [x] API 응답 캐싱 (ISR) - `lib/api/tour-api.ts`의 `fetchApiDirect`에서 `next: { revalidate: 3600 }` 설정
  - [x] `revalidate` 설정 (1시간 권장) - 3600초 설정 완료
- [x] Next.js 설정 최적화 (`next.config.ts`)
  - [x] `compress: true` (gzip 압축)
  - [x] `poweredByHeader: false` (보안)
  - [x] `reactStrictMode: true` (개발 모드 경고)
  - [x] `swcMinify: true` (SWC minifier)
  - [x] `minimumCacheTTL: 60` (이미지 캐시 TTL)
  - [x] `optimizePackageImports` (lucide-react, @clerk/nextjs 최적화)

### 7.5 환경변수 보안 검증
- [x] 모든 필수 환경변수 확인
  - [x] 한국관광공사 API 키 (NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY)
  - [x] 구글 지도 API 키 (NEXT_PUBLIC_GOOGLE_MAP_API_KEY)
  - [x] Clerk 키 (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
  - [x] Supabase 키 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [x] `.env.example` 업데이트 (프로젝트 루트에 생성, .cursorignore로 인해 직접 생성 불가 - 내용은 docs/production-env-guide.md 참고)
- [x] 프로덕션 환경변수 설정 가이드 작성 (`docs/production-env-guide.md` 생성)

### 7.6 배포 준비
- [x] 빌드 테스트
  - [x] `pnpm build` 실행
  - [x] 빌드 에러 확인 및 수정
    - [x] TypeScript 타입 에러 수정 (`InfoWindow.open()` 메서드 호출 형태 변경)
- [x] Vercel 배포
  - [x] Vercel 프로젝트 생성
  - [x] 환경변수 설정
  - [x] 배포 및 테스트
- [ ] 프로덕션 테스트
  - [ ] 모든 기능 동작 확인
  - [ ] 성능 확인
  - [ ] 모바일/데스크톱 테스트

---

## Phase 8: 반려동물 친화 기능 (선택 사항)

> 반려동물 동반 관광지 정보 기능 개발 작업 목록

### 📋 개요

현재 관광지 정보 서비스에 반려동물 동반 가능 여부 정보를 추가하여, 반려동물과 함께 여행하는 사용자들이 편리하게 관광지를 찾을 수 있도록 하는 기능입니다.

### 주요 목표
- 반려동물 동반 가능한 관광지 정보 제공
- 반려동물 친화적인 관광지 필터링 기능
- 반려동물 관련 상세 정보 표시
- 사용자 경험 개선 (뱃지, 아이콘, 정책 안내)

### 8.1 데이터베이스 스키마 및 타입 정의
- [x] `supabase/migrations/20251107131505_create_pet_friendly_info_table.sql` 생성
  - [x] `pet_friendly_info` 테이블 생성
    - [x] `id` (UUID, PK)
    - [x] `content_id` (TEXT, UNIQUE, 관광지 contentId)
    - [x] `is_pet_allowed` (BOOLEAN, 기본값 false)
    - [x] `pet_policy` (TEXT, 반려동물 정책 설명)
    - [x] `pet_fee` (DECIMAL, 반려동물 추가 요금 - 숙박 시설용)
    - [x] `pet_size_limit` (TEXT, 반려동물 크기 제한)
    - [x] `pet_count_limit` (INTEGER, 반려동물 마리 수 제한)
    - [x] `notes` (TEXT, 추가 안내사항)
    - [x] `created_at` (TIMESTAMP)
    - [x] `updated_at` (TIMESTAMP, 자동 업데이트 트리거 포함)
  - [x] 인덱스 생성
  - [x] RLS 비활성화 (개발 단계)
  - [x] 권한 부여 (anon, authenticated, service_role)
- [x] `lib/types/pet-friendly.ts` 생성
  - [x] `PetFriendlyInfo` 인터페이스 정의
  - [x] `PetSizeLimit` 타입 정의 (소형, 중형, 대형, 제한없음)
  - [x] `PetFriendlyStatus` 타입 정의 (가능, 불가능, 조건부)
  - [x] 유틸리티 함수 (formatPetPolicy, getPetFriendlyBadgeColor, getPetFriendlyStatus, getPetFriendlyBadgeText)
- [x] `lib/types/tour.ts` 수정
  - [x] `PetFriendlyInfo` 타입 import 추가
  - [x] `TourItem` 인터페이스에 `petFriendlyInfo?` 필드 추가
  - [x] `TourDetail` 인터페이스에 `petFriendlyInfo?` 필드 추가

### 8.2 API 함수 및 데이터 조회
- [x] `lib/api/pet-friendly-api.ts` 생성
  - [x] `getPetFriendlyInfo(contentId, supabase?)` - 반려동물 정보 조회
  - [x] `getPetFriendlyTours(supabase?, options?)` - 반려동물 동반 가능한 관광지 목록 조회
  - [x] `searchPetFriendlyTours(keyword, supabase?, options?)` - 반려동물 동반 가능 관광지 검색
  - [x] `addPetFriendlyInfo(data, supabase?)` - 반려동물 정보 추가
  - [x] `updatePetFriendlyInfo(contentId, data, supabase?)` - 반려동물 정보 수정
  - [x] `getPetReviews(contentId, supabase?, options?)` - 반려동물 리뷰 목록 조회
  - [x] `addPetReview(data, userId, supabase?)` - 반려동물 리뷰 추가
  - [x] `updatePetReview(reviewId, data, userId, supabase?)` - 반려동물 리뷰 수정
  - [x] `deletePetReview(reviewId, userId, supabase?)` - 반려동물 리뷰 삭제
  - [x] 에러 처리 및 로깅
  - [x] 입력값 검증
  - [x] 구조화된 로깅 (console.group 사용)
- [x] `lib/api/pet-friendly-server.ts` 생성
  - [x] `getPetFriendlyInfoServer()` - 서버 사이드 반려동물 정보 조회
  - [x] `getPetFriendlyToursServer()` - 서버 사이드 반려동물 동반 가능 관광지 목록 조회
  - [x] `searchPetFriendlyToursServer()` - 서버 사이드 반려동물 동반 가능 관광지 검색
  - [x] `addPetFriendlyInfoServer()` - 서버 사이드 반려동물 정보 추가 (Service Role 사용)
  - [x] `updatePetFriendlyInfoServer()` - 서버 사이드 반려동물 정보 수정 (Service Role 사용)

### 8.3 UI 컴포넌트
- [x] `components/pet-friendly/pet-badge.tsx` 생성
  - [x] 반려동물 동반 가능 여부에 따른 뱃지 표시
  - [x] 색상 구분 (가능: 초록색, 불가능: 회색, 조건부: 노란색)
  - [x] 아이콘 표시 (🐕, 🚫 등)
  - [x] 크기 옵션 (sm, default, lg)
  - [x] 툴팁 표시 (정책 정보)
- [x] `components/pet-friendly/pet-info-card.tsx` 생성
  - [x] 반려동물 정책 상세 정보 표시
  - [x] 반려동물 추가 요금 정보 (숙박 시설)
  - [x] 반려동물 크기/마리 수 제한 표시
  - [x] 추가 안내사항 표시
  - [x] 아이콘 및 시각적 요소
  - [x] 상태별 색상 구분 (가능/불가능/조건부)
- [x] `components/pet-friendly/pet-filter.tsx` 생성
  - [x] "반려동물 동반 가능" 체크박스
  - [x] 반려동물 크기 필터 (소형, 중형, 대형, 제한없음)
  - [x] 반려동물 마리 수 필터 (최소 마리 수)
  - [x] 필터 상태 관리
  - [x] 조건부 필터 표시 (반려동물 동반 가능 선택 시에만 크기/마리 수 필터 표시)

### 8.4 관광지 목록 및 필터 통합
- [x] `components/tour-filters.tsx` 수정
  - [x] 반려동물 필터 추가
  - [x] `petFilterOptions` prop 추가
  - [x] `onPetFilterChange` 핸들러 추가
  - [x] 필터 UI에 반려동물 옵션 추가 (데스크톱/모바일)
  - [x] 반려동물 필터 뱃지 표시 (모바일)
- [x] `components/tour-list.tsx` 수정
  - [x] 반려동물 필터 파라미터 처리 (`petFilterOptions` prop 추가)
  - [x] 반려동물 정보 조회 로직 추가 (병렬 처리)
  - [x] 필터링된 결과 표시 (반려동물 동반 가능한 관광지만)
  - [x] 반려동물 정보를 TourItem에 추가 (`petFriendlyInfo` 필드)
  - [x] 성능 최적화 (필터 없을 때는 최대 20개만 조회)
- [x] `components/tour-card.tsx` 수정
  - [x] 반려동물 뱃지 표시 (반려동물 동반 가능한 경우)
  - [x] `PetBadge` 컴포넌트 import 및 사용
  - [x] 뱃지 위치 결정 (관광 타입 뱃지 옆)
  - [x] 툴팁 표시

### 8.5 관광지 상세 페이지 통합
- [x] `app/places/[contentId]/page.tsx` 수정
  - [x] 반려동물 정보 조회 로직 추가 (`getPetFriendlyInfoServer` 사용)
  - [x] 반려동물 정보 섹션 추가 (운영 정보 섹션 다음에 배치)
  - [x] 반려동물 정보 카드 컴포넌트 통합 (`PetInfoCard` 사용)
  - [x] 병렬 로드 처리 (기본 정보, 운영 정보, 이미지, 반려동물 정보)
- [x] 반려동물 정보 섹션 디자인
  - [x] 섹션 제목 ("반려동물 동반 안내")
  - [x] 반려동물 동반 가능 여부 표시 (뱃지 및 상태 아이콘)
  - [x] 정책 상세 정보 표시 (pet_policy 필드)
  - [x] 추가 요금 정보 (숙박 시설) - pet_fee 필드
  - [x] 주의사항 표시 (notes 필드)
  - [x] 아이콘 및 시각적 요소 (Dog, DollarSign, Users, Ruler, Info 등)
  - [x] 상태별 색상 구분 (가능/불가능/조건부)

### 8.6 검색 기능 확장
- [x] `components/tour-list.tsx` 검색 로직 수정
  - [x] 검색어에 "반려동물", "펫", "애완동물" 포함 시 관련 관광지 우선 표시
  - [x] 반려동물 필터와 검색어 조합 처리
  - [x] 반려동물 관련 키워드 감지 로직 추가 (반려동물, 펫, 애완동물, 반려견, 반려묘, pet, 애완)
  - [x] 반려동물 관련 검색어가 있으면 반려동물 동반 가능한 관광지를 우선 정렬
  - [x] 정렬 옵션(최신순, 이름순)과 반려동물 우선 정렬 조합 처리
- [x] 검색 결과 표시
  - [x] 검색 결과에 반려동물 정보 하이라이트
  - [x] 관광지명 옆에 "🐕 반려동물 가능" 텍스트 표시 (반려동물 동반 가능한 경우)
  - [x] 반려동물 뱃지 표시 (기존 구현 활용)
  - [x] 반려동물 관련 키워드 강조 표시
  - [x] 검색 결과 개수 옆에 "(반려동물 동반 가능한 관광지 우선 표시)" 안내 메시지 추가

### 8.7 사용자 입력 기능 (선택 사항)
- [x] `components/pet-friendly/pet-info-form.tsx` 생성
  - [x] 반려동물 동반 가능 여부 선택 (Checkbox)
  - [x] 정책 설명 입력 (Textarea)
  - [x] 추가 요금 입력 (숙박 시설, Number Input)
  - [x] 크기/마리 수 제한 입력 (Select, Number Input)
  - [x] 추가 안내사항 입력 (Textarea)
  - [x] 폼 유효성 검사 (Zod 스키마)
  - [x] react-hook-form + zodResolver 사용
  - [x] Dialog 모달로 표시
- [x] `app/api/pet-friendly/route.ts` 생성
  - [x] POST: 반려동물 정보 추가
  - [x] PUT: 반려동물 정보 수정
  - [x] 인증 확인 (로그인한 사용자만, Clerk auth 사용)
  - [x] 입력값 검증
  - [x] 에러 처리 및 로깅
  - [x] Service Role 클라이언트 사용
- [x] `components/pet-friendly/pet-info-submit-button.tsx` 생성
  - [x] "반려동물 정보 제출" 버튼 (기존 정보 없을 때)
  - [x] "반려동물 정보 수정" 버튼 (기존 정보 있을 때)
  - [x] 로그인하지 않은 경우 SignInButton으로 감싸서 로그인 팝업 표시
- [x] 관광지 상세 페이지에 통합 (`app/places/[contentId]/page.tsx`)
  - [x] 반려동물 정보가 있을 때: 정보 카드 + 수정 버튼
  - [x] 반려동물 정보가 없을 때: 안내 메시지 + 제출 버튼
  - [x] 모달 또는 다이얼로그로 폼 표시 (Dialog 컴포넌트 사용)
  - [x] 제출 완료 후 피드백 (toast 메시지 + 페이지 새로고침)

### 8.8 반려동물 정보 리뷰 기능 (선택 사항)
- [x] `supabase/migrations/20251107141913_create_pet_reviews_table.sql` 생성
  - [x] `pet_reviews` 테이블 생성
    - [x] `id` (UUID, PK)
    - [x] `user_id` (UUID, FK to users)
    - [x] `content_id` (TEXT, 관광지 contentId)
    - [x] `rating` (INTEGER, 1-5점)
    - [x] `review_text` (TEXT, 리뷰 내용)
    - [x] `pet_type` (TEXT, 반려동물 종류 - 강아지, 고양이 등)
    - [x] `pet_size` (TEXT, 반려동물 크기)
    - [x] `created_at` (TIMESTAMP)
    - [x] `updated_at` (TIMESTAMP, 자동 업데이트 트리거 포함)
  - [x] 인덱스 및 제약조건
  - [x] TypeScript 타입 정의 (`lib/types/pet-friendly.ts`)
    - [x] `PetReview` 인터페이스
    - [x] `PetReviewInput` 인터페이스
    - [x] `PetType` 타입 및 라벨
  - [x] API 함수 (`lib/api/pet-friendly-api.ts`)
    - [x] `getPetReviews` - 리뷰 목록 조회
    - [x] `addPetReview` - 리뷰 추가
    - [x] `updatePetReview` - 리뷰 수정
    - [x] `deletePetReview` - 리뷰 삭제
- [x] `components/pet-friendly/pet-review-list.tsx` 생성
  - [x] 반려동물 리뷰 목록 표시
  - [x] 평점 표시 (별점)
  - [x] 평균 평점 계산 및 표시
  - [x] 리뷰 작성 버튼 (로그인 필요)
  - [x] 리뷰 수정/삭제 버튼 (본인 리뷰만)
  - [x] 반려동물 정보 표시 (종류, 크기)
- [x] `components/pet-friendly/pet-review-form.tsx` 생성
  - [x] 리뷰 작성 폼
  - [x] 평점 선택 (1-5점, 별점 UI)
  - [x] 리뷰 내용 입력 (Textarea)
  - [x] 반려동물 정보 입력 (종류, 크기)
  - [x] 폼 유효성 검사 (Zod)
  - [x] 수정 모드 지원

---

## Phase 9: 통계 및 추천 기능 (선택 사항)

### 9.1 반려동물 친화 통계
- [ ] 반려동물 동반 가능한 관광지 통계
  - [ ] 지역별 반려동물 친화 관광지 수
  - [ ] 관광 타입별 반려동물 친화 비율
  - [ ] 반려동물 친화 관광지 추천

### 9.2 추천 기능
- [ ] 반려동물 친화 관광지 추천 알고리즘
- [ ] 사용자 위치 기반 반려동물 친화 관광지 추천

---

## Phase 10: 테스트 및 문서화

### 10.1 테스트
- [ ] 데이터베이스 마이그레이션 테스트
- [ ] API 함수 테스트
- [ ] 컴포넌트 테스트
- [ ] 통합 테스트
- [ ] 반응형 테스트

### 10.2 문서화
- [ ] 반려동물 정보 입력 가이드 작성
- [ ] API 문서 업데이트
- [ ] 사용자 가이드 작성

---

## 📝 참고 사항

### 개발 원칙
- **TDD**: 테스트 코드 작성 후 구현 (선택 사항)
- **모바일 퍼스트**: 모바일 레이아웃부터 구현
- **접근성**: ARIA 라벨, 키보드 네비게이션 필수
- **성능**: 이미지 최적화, 코드 분할, 캐싱

### 주요 파일 참고
- **PRD.md**: 전체 요구사항 및 API 명세
- **Design.md**: UI/UX 디자인 가이드 및 컴포넌트 스타일
- **myTrip_schema.sql**: 데이터 흐름도 및 아키텍처
- **setup_schema.sql**: Supabase users 테이블 구조

### API 엔드포인트
- Base URL: `https://apis.data.go.kr/B551011/KorService2`
- 필수 파라미터: `serviceKey`, `MobileOS="ETC"`, `MobileApp="MyTrip"`, `_type="json"`

### 지도 API 참고사항
- **PRD.md 명시**: 네이버 지도 (Naver Maps JavaScript API v3 (NCP)) 사용
  - 환경변수: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 또는 `NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID`
  - URL 파라미터: `ncpKeyId` (구 `ncpClientId` 아님)
  - 월 10,000,000건 무료 (네이버 클라우드 플랫폼)
- **현재 구현**: 구글 지도 (Google Maps JavaScript API) 사용
  - 환경변수: `NEXT_PUBLIC_GOOGLE_MAP_API_KEY`
  - 월 $200 무료 크레딧 제공
  - 향후 네이버 지도로 마이그레이션 필요 시 코드 수정 필요

### 반려동물 친화 기능 참고사항

#### 데이터 수집 방법
1. **수동 입력**: 관리자 또는 사용자가 직접 입력
2. **크롤링**: 관광지 홈페이지에서 정보 추출 (법적 고려 필요)
3. **API 연동**: 반려동물 관련 정보를 제공하는 외부 API 활용 (있는 경우)
4. **커뮤니티 기반**: 사용자 제출 및 리뷰를 통한 정보 수집

#### 법적 고려사항
- 개인정보 보호법 준수
- 웹 크롤링 시 robots.txt 및 이용약관 확인
- 사용자 제출 정보의 검증 및 관리

#### UI/UX 고려사항
- 반려동물 아이콘 및 뱃지 디자인
- 색상 코딩 (가능/불가능/조건부)
- 접근성 고려 (스크린 리더, 키보드 네비게이션)
- 모바일 반응형 디자인

### 다음 단계
각 Phase를 순차적으로 진행하며, 각 단계마다 테스트와 검증을 수행합니다.
필요시 Phase를 병렬로 진행할 수 있으나, 의존성 관계를 고려해야 합니다.

---

**마지막 업데이트**: 2025-01-27  
**작성 기준**: PRD.md v1.0  
**최근 완료**: 
- Phase 3.3 지도 섹션 개선 (현재 위치만 표시, 목적지 마커 제거)
- Phase 5.1 인증 및 사용자 경험 개선 (로그인/가입, 다크모드, 다국어 지원)
- Phase 6.6 배포 준비 (Vercel 배포 타입 에러 수정)
- Phase 5.1 북마크 기능 Supabase 설정 (북마크 테이블 마이그레이션 적용 완료)
- Phase 8: 반려동물 친화 기능 완료 (Phase 8.1-8.8)
  - Phase 8.1: 데이터베이스 스키마 및 타입 정의
  - Phase 8.2: API 함수 및 데이터 조회
  - Phase 8.3: UI 컴포넌트 (뱃지, 정보 카드, 필터)
  - Phase 8.4: 관광지 목록 및 필터 통합
  - Phase 8.5: 관광지 상세 페이지 통합
  - Phase 8.6: 검색 기능 확장
  - Phase 8.7: 사용자 입력 기능
  - Phase 8.8: 반려동물 정보 리뷰 기능

