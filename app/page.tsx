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

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { TourList } from '@/components/tour-list';
import { TourFilters, type SortOption } from '@/components/tour-filters';
import { ViewToggle } from '@/components/view-toggle';
import type { ContentType, TourItem } from '@/lib/types/tour';

// 구글 지도 컴포넌트는 동적 import (SSR 비활성화)
const GoogleMap = dynamic(() => import('@/components/google-map').then((mod) => ({ default: mod.GoogleMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700" style={{ minHeight: '400px' }}>
      <div className="text-center text-muted-foreground">
        <p className="text-sm">지도를 불러오는 중...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const searchParams = useSearchParams();
  
  // 필터 상태 관리
  const [selectedAreaCode, setSelectedAreaCode] = useState<string | undefined>();
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  // 정렬 상태 관리
  const [sortBy, setSortBy] = useState<SortOption>('O');
  // 검색어 상태 관리 (URL 쿼리 파라미터에서 초기값 가져오기)
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(
    searchParams.get('q') || undefined
  );
  
  // 관광지 목록 데이터 (지도와 공유)
  const [tours, setTours] = useState<TourItem[]>([]);
  // 선택된 관광지 ID (리스트 클릭 시 지도 이동용)
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  // 모바일 뷰 전환 상태
  const [currentView, setCurrentView] = useState<'list' | 'map'>('list');

  // URL 쿼리 파라미터 변경 감지
  useEffect(() => {
    const q = searchParams.get('q');
    setSearchKeyword(q || undefined);
  }, [searchParams]);

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedAreaCode(undefined);
    setSelectedContentTypes([]);
    setSearchKeyword(undefined);
    setSelectedTourId(undefined);
    setSortBy('O');
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
          한국의 아름다운 관광지를 탐험하세요
        </h1>
        <p className="text-lg text-muted-foreground">
          전국의 관광지 정보를 한 곳에서 검색하고 확인하세요
        </p>
      </section>

      {/* FILTERS & CONTROLS (Sticky) */}
      <TourFilters
        selectedAreaCode={selectedAreaCode}
        selectedContentTypes={selectedContentTypes}
        sortBy={sortBy}
        onAreaChange={setSelectedAreaCode}
        onContentTypeChange={setSelectedContentTypes}
        onSortChange={setSortBy}
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
              className="grid-cols-1"
              onToursLoad={handleToursLoad}
              onTourClick={setSelectedTourId}
            />
          </div>

          {/* 우측: 지도 영역 */}
          <div className="sticky top-24 h-[calc(100vh-12rem)]">
            <GoogleMap
              tours={tours}
              selectedTourId={selectedTourId}
              className="h-full"
            />
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
                onToursLoad={handleToursLoad}
              />
            </div>
          )}

          {/* 지도 뷰 */}
          {currentView === 'map' && (
            <div className="mt-4" style={{ minHeight: '400px', height: 'calc(100vh - 12rem)' }}>
              <GoogleMap
                tours={tours}
                selectedTourId={selectedTourId}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

