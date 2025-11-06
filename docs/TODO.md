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
- [x] Phase 2.5: 구글 지도 연동 (MVP 2.2)
- [x] Phase 2.6: 정렬 & 페이지네이션
- [x] Phase 3.1: 상세페이지 기본 구조
- [x] Phase 3.2: 기본 정보 섹션 (MVP 2.4.1)

### 📦 필요한 패키지 설치
- [x] 이미지 슬라이더/캐러셀 라이브러리 (swiper 12.0.3 설치 완료)
- [x] 구글 지도 API 타입 정의 (`types/googlemaps.d.ts` 생성 완료)

---

## Phase 1: 기본 구조 & 공통 설정

### 1.1 프로젝트 인프라
- [x] 환경변수 설정 확인
  - [x] `NEXT_PUBLIC_TOUR_API_KEY` 또는 `TOUR_API_KEY` 설정 (문서화 완료)
  - [x] `NEXT_PUBLIC_GOOGLE_MAP_API_KEY` 설정 (문서화 완료)
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
- [x] 구글 지도 API 설정
  - [x] Google Maps API 키 확인
  - [x] `app/layout.tsx`에 외부 스크립트 추가
  - [x] 타입 정의 (`types/googlemaps.d.ts` 생성 완료)

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
  - [x] 구글 지도 표시 (단일 관광지)
  - [x] 현재 위치 마커만 표시 (목적지 마커 제거)
  - [x] 현재 위치 허용 시: "내 위치" 마커 표시
  - [x] 현재 위치 미허용 시: "서울시청" 마커 표시
  - [x] 좌표 변환 (KATEC → WGS84)
  - [x] 지도 크기 조정 (모바일: 400px, 데스크톱: 600px)

- [x] "길찾기" 버튼
  - [x] 구글 지도 앱/웹 연동 (`https://www.google.com/maps/dir/...`)
  - [x] 현재 위치 자동 감지 (Geolocation API)
  - [x] 목적지 자동 설정 (관광지명/주소 사용)
  - [x] 좌표 정보 표시
  - [x] 좌표 복사 기능

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

## Phase 4: 북마크 기능 (`/bookmarks`) - 선택 사항

### 4.1 Supabase 설정
- [ ] `supabase/migrations/YYYYMMDDHHmmss_create_bookmarks_table.sql` 생성
  - [ ] `bookmarks` 테이블 생성
    - [ ] `id`: UUID (Primary Key)
    - [ ] `user_id`: UUID (Foreign Key → users.id)
    - [ ] `content_id`: TEXT (관광지 contentId)
    - [ ] `created_at`: TIMESTAMP
  - [ ] 인덱스 생성 (`user_id`, `content_id`)
  - [ ] RLS 비활성화 (개발 단계)
  - [ ] 권한 부여 (anon, authenticated, service_role)

- [ ] 마이그레이션 적용
  - [ ] Supabase CLI 또는 Supabase MCP로 마이그레이션 실행
  - [ ] 테이블 생성 확인

### 4.2 북마크 API 함수
- [ ] `lib/api/supabase-api.ts` 생성
  - [ ] `addBookmark(userId, contentId)` - 북마크 추가
  - [ ] `removeBookmark(userId, contentId)` - 북마크 삭제
  - [ ] `getUserBookmarks(userId)` - 사용자 북마크 목록 조회
  - [ ] `isBookmarked(userId, contentId)` - 북마크 여부 확인
  - [ ] 에러 처리 및 로깅

### 4.3 북마크 버튼 컴포넌트
- [ ] `components/bookmarks/bookmark-button.tsx` 생성
  - [ ] 별 아이콘 (lucide-react Star)
  - [ ] 북마크 상태 표시 (채워짐/비어있음)
  - [ ] 클릭 시 북마크 추가/제거
  - [ ] Clerk 인증 확인
    - [ ] 로그인 O: Supabase DB에 저장
    - [ ] 로그인 X: localStorage 임시 저장 + 로그인 유도
  - [ ] 로딩 상태
  - [ ] 에러 처리 (토스트 메시지)

- [ ] `app/places/[contentId]/page.tsx`에 북마크 버튼 통합
  - [ ] 헤더 또는 상세정보 섹션에 배치
  - [ ] 북마크 동작 확인

### 4.4 북마크 목록 페이지
- [ ] `app/bookmarks/page.tsx` 생성
  - [ ] Clerk 인증 확인 (로그인 필요)
  - [ ] 북마크 목록 조회 (`getUserBookmarks()`)
  - [ ] 로딩 상태
  - [ ] 빈 상태 (북마크 없을 때)
  - [ ] 에러 처리

- [ ] `components/bookmarks/bookmark-list.tsx` 생성
  - [ ] 북마크한 관광지 목록 표시
  - [ ] 카드 레이아웃 (tour-card.tsx 재사용 또는 별도)
  - [ ] 북마크 날짜 표시
  - [ ] 개별 삭제 버튼
  - [ ] 일괄 삭제 기능 (체크박스)

- [ ] 정렬 기능
  - [ ] 정렬 옵션 (최신순, 이름순, 지역별)
  - [ ] 정렬 UI (Select 컴포넌트)
  - [ ] 정렬 로직 구현

- [ ] 페이지 확인
  - [ ] 북마크 추가/삭제 흐름 테스트
  - [ ] 반응형 확인
  - [ ] 로그인하지 않은 경우 처리 확인

---

## Phase 5: UI/UX 개선 및 다국어 지원

### 5.1 인증 및 사용자 경험 개선
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

## Phase 6: 최적화 & 배포

### 6.1 이미지 최적화
- [ ] `next.config.ts` 외부 도메인 설정
  - [ ] 한국관광공사 API 이미지 도메인 추가
  - [ ] 구글 지도 이미지 도메인 추가 (필요시)
- [ ] Next.js Image 컴포넌트 최적화
  - [ ] `sizes` 속성 설정
  - [ ] `priority` 속성 (위치 기반)
  - [ ] `placeholder="blur"` (선택 사항)

### 6.2 에러 처리 개선
- [ ] 전역 에러 핸들링
  - [ ] `app/error.tsx` 생성
  - [ ] `app/global-error.tsx` 생성 (선택 사항)
- [ ] 404 페이지
  - [ ] `app/not-found.tsx` 생성
  - [ ] 커스텀 404 UI
- [ ] API 에러 처리
  - [ ] 재시도 버튼
  - [ ] 사용자 친화적 에러 메시지

### 6.3 SEO 최적화
- [ ] 메타데이터 설정
  - [ ] `app/layout.tsx` 기본 메타데이터
  - [ ] 각 페이지별 메타데이터
- [ ] `sitemap.xml` 생성
  - [ ] `app/sitemap.ts` 생성 (동적)
- [ ] `robots.txt` 생성
  - [ ] `app/robots.ts` 생성

### 6.4 성능 최적화
- [ ] Lighthouse 점수 측정
  - [ ] 목표: > 80점
  - [ ] 성능 개선 항목 확인
- [ ] 코드 분할
  - [ ] 지도 컴포넌트 동적 import (`ssr: false`)
  - [ ] 무거운 컴포넌트 lazy loading
- [ ] 캐싱 전략
  - [ ] API 응답 캐싱 (ISR 또는 SWR)
  - [ ] `revalidate` 설정 (1시간 권장)

### 6.5 환경변수 보안 검증
- [ ] 모든 필수 환경변수 확인
  - [ ] 한국관광공사 API 키
  - [ ] 구글 지도 API 키
  - [ ] Clerk 키
  - [ ] Supabase 키
- [ ] `.env.example` 업데이트
- [ ] 프로덕션 환경변수 설정 가이드 작성

### 6.6 배포 준비
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

