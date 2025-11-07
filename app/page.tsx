/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 홈페이지는 관광지 목록을 표시하는 메인 페이지입니다.
 * Phase 2.1: 기본 레이아웃 구조
 * Phase 2.2: 관광지 목록 표시
 * Phase 2.3: 필터 기능 추가
 * Phase 2.4: 검색 기능 추가
 * Phase 2.5: 구글 지도 연동
 *
 * PRD.md 2.1 관광지 목록 + 지역/타입 필터 참고
 * Design.md 홈페이지 레이아웃 참고
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { TourList } from '@/components/tour-list';
import { TourFilters, type SortOption } from '@/components/tour-filters';
import { ViewToggle } from '@/components/view-toggle';
import { useI18n } from '@/components/providers/i18n-provider';
import type { ContentType, TourItem } from '@/lib/types/tour';
import type { PetFilterOptions } from '@/components/pet-friendly/pet-filter';

// 구글 지도 컴포넌트는 동적 import (SSR 비활성화)
// GoogleMap 컴포넌트는 동적 import 내부에서 useI18n을 사용할 수 없으므로
// loading 컴포넌트는 별도로 처리
const GoogleMap = dynamic(() => import('@/components/google-map').then((mod) => ({ default: mod.GoogleMap })), {
  ssr: false,
});

// useSearchParams를 사용하는 컴포넌트 분리
function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  
  // 필터 상태 관리
  const [selectedAreaCode, setSelectedAreaCode] = useState<string | undefined>();
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  // 정렬 상태 관리
  const [sortBy, setSortBy] = useState<SortOption>('O');
  // 반려동물 필터 상태 관리
  const [petFilterOptions, setPetFilterOptions] = useState<PetFilterOptions>({});
  // 검색어 상태 관리 (URL 쿼리 파라미터에서 초기값 가져오기)
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(
    searchParams.get('q') || undefined
  );
  
  // 관광지 목록 데이터 (지도와 공유)
  const [tours, setTours] = useState<TourItem[]>([]);
  // 선택된 관광지 ID (리스트 클릭 시 지도 이동용)
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  // 호버된 관광지 ID (리스트 항목 호버 시 마커 강조용)
  const [hoveredTourId, setHoveredTourId] = useState<string | undefined>();
  // 모바일 뷰 전환 상태
  const [currentView, setCurrentView] = useState<'list' | 'map'>('list');

  // URL 쿼리 파라미터 변경 감지 및 필터 초기화
  useEffect(() => {
    const q = searchParams.get('q');
    const area = searchParams.get('area');
    const types = searchParams.get('types');
    const sort = searchParams.get('sort') as SortOption | null;
    
    setSearchKeyword(q || undefined);
    
    // URL 파라미터에서 필터 상태 복원
    if (area) setSelectedAreaCode(area);
    if (types) {
      const typeArray = types.split(',').filter(Boolean);
      setSelectedContentTypes(typeArray as ContentType[]);
    }
    if (sort && (sort === 'O' || sort === 'Q')) {
      setSortBy(sort);
    }
    
    // 쿼리 파라미터가 없으면 모든 필터 초기화 (메인화면으로 돌아왔을 때)
    if (!q && !area && !types && !sort && searchParams.toString() === '') {
      setSelectedAreaCode(undefined);
      setSelectedContentTypes([]);
      setSortBy('O');
      setPetFilterOptions({});
      setSelectedTourId(undefined);
    }
  }, [searchParams]);

  // URL 파라미터 업데이트 함수
  const updateURLParams = (updates: {
    area?: string | undefined;
    types?: ContentType[] | undefined;
    sort?: SortOption;
    q?: string | undefined;
  }) => {
    const params = new URLSearchParams();
    
    if (updates.q) params.set('q', updates.q);
    if (updates.area) params.set('area', updates.area);
    if (updates.types && updates.types.length > 0) {
      params.set('types', updates.types.join(','));
    }
    if (updates.sort && updates.sort !== 'O') {
      params.set('sort', updates.sort);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    router.push(newUrl, { scroll: false });
  };

  // 필터 변경 핸들러 (URL 파라미터 업데이트 포함)
  const handleAreaChange = (areaCode?: string) => {
    setSelectedAreaCode(areaCode);
    updateURLParams({
      area: areaCode,
      types: selectedContentTypes,
      sort: sortBy,
      q: searchKeyword,
    });
  };

  const handleContentTypeChange = (types: ContentType[]) => {
    setSelectedContentTypes(types);
    updateURLParams({
      area: selectedAreaCode,
      types: types,
      sort: sortBy,
      q: searchKeyword,
    });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    updateURLParams({
      area: selectedAreaCode,
      types: selectedContentTypes,
      sort: sort,
      q: searchKeyword,
    });
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedAreaCode(undefined);
    setSelectedContentTypes([]);
    setSearchKeyword(undefined);
    setSelectedTourId(undefined);
    setSortBy('O');
    setPetFilterOptions({});
    router.push('/', { scroll: false });
  };

  // 관광지 데이터 로드 핸들러
  const handleToursLoad = (loadedTours: TourItem[]) => {
    setTours(loadedTours);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section (선택 사항) */}
      <section className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          {t.home.heroTitle}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t.home.heroDescription}
        </p>
      </section>

      {/* FILTERS & CONTROLS (Sticky) */}
      <TourFilters
        selectedAreaCode={selectedAreaCode}
        selectedContentTypes={selectedContentTypes}
        sortBy={sortBy}
        petFilterOptions={petFilterOptions}
        onAreaChange={handleAreaChange}
        onContentTypeChange={handleContentTypeChange}
        onSortChange={handleSortChange}
        onPetFilterChange={setPetFilterOptions}
        onReset={handleResetFilters}
      />

      {/* 메인 콘텐츠 영역 */}
      <div className="container mx-auto px-4 py-8">
        {/* 데스크톱: 분할 레이아웃 (좌측 리스트 + 우측 지도) */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 min-h-[600px]">
          {/* 좌측: 관광지 목록 */}
          <div className="overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
            <TourList
              areaCode={selectedAreaCode}
              contentTypes={selectedContentTypes}
              query={searchKeyword}
              sortBy={sortBy}
              petFilterOptions={petFilterOptions}
              className="grid-cols-1"
              onToursLoad={handleToursLoad}
              onTourClick={setSelectedTourId}
              onTourHover={setHoveredTourId}
              selectedTourId={selectedTourId}
            />
          </div>

          {/* 우측: 지도 영역 */}
          <div className="sticky top-24 h-[calc(100vh-12rem)]">
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <GoogleMap
                tours={tours}
                selectedTourId={selectedTourId}
                hoveredTourId={hoveredTourId}
                onMarkerClick={setSelectedTourId}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* 모바일/태블릿: 탭 전환 레이아웃 */}
        <div className="lg:hidden">
          {/* 뷰 전환 탭 */}
          <ViewToggle
            currentView={currentView}
            onViewChange={setCurrentView}
            className="sticky top-16 z-40"
          />

          {/* 목록 뷰 */}
          {currentView === 'list' && (
            <div className="mt-4">
              <TourList
                areaCode={selectedAreaCode}
                contentTypes={selectedContentTypes}
                query={searchKeyword}
                sortBy={sortBy}
                petFilterOptions={petFilterOptions}
                onToursLoad={handleToursLoad}
                onTourHover={setHoveredTourId}
                selectedTourId={selectedTourId}
              />
            </div>
          )}

          {/* 지도 뷰 */}
          {currentView === 'map' && (
            <div className="mt-4" style={{ minHeight: '400px', height: 'calc(100vh - 12rem)' }}>
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <GoogleMap
                  tours={tours}
                  selectedTourId={selectedTourId}
                  hoveredTourId={hoveredTourId}
                  onMarkerClick={setSelectedTourId}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Suspense fallback 컴포넌트
function HomePageFallback() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">{t.common.loading}</p>
      </div>
    </div>
  );
}

// Suspense로 감싼 메인 컴포넌트
export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}

