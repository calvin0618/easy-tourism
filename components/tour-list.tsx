/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * PRD.md 2.1 관광지 목록 요구사항을 참고하여 작성되었습니다.
 *
 * Phase 2.2: 하드코딩 테스트 데이터로 먼저 구현
 * 이후 API 연동하여 실제 데이터 표시
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { TourCard } from '@/components/tour-card';
import { Loading } from '@/components/loading';
import { EmptyTourList, EmptySearchResults } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import type { TourItem } from '@/lib/types/tour';
import { getAreaBasedList, searchKeyword } from '@/lib/api/tour-api';
import { cn } from '@/lib/utils';
import type { SortOption } from '@/components/tour-filters';

interface TourListProps {
  /** 초기 지역코드 (선택 사항) */
  areaCode?: string;
  /** 초기 관광 타입 배열 (선택 사항) */
  contentTypes?: string[];
  /** 검색 키워드 (선택 사항) */
  query?: string;
  /** 정렬 옵션 */
  sortBy?: SortOption;
  /** 추가 클래스명 */
  className?: string;
  /** 관광지 데이터 로드 콜백 (지도 컴포넌트에 전달용) */
  onToursLoad?: (tours: TourItem[]) => void;
  /** 관광지 카드 클릭 핸들러 (지도 이동용) */
  onTourClick?: (tourId: string) => void;
}

/**
 * 카드 스켈레톤 컴포넌트
 */
function TourCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48 md:h-56" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Card>
  );
}

export function TourList({
  areaCode,
  contentTypes = [],
  query,
  sortBy = 'O',
  className,
  onToursLoad,
  onTourClick,
}: TourListProps) {
  const [tours, setTours] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // API 호출 함수
  const fetchTours = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setPageNo(1);
          setHasMore(true);
        }
        setError(null);

        const numOfRows = 20;
        let result: { items: TourItem[]; totalCount: number };

        // 검색어가 있으면 검색 API 호출, 없으면 지역 기반 목록 조회
        if (query && query.trim()) {
          const contentTypeId = contentTypes.length > 0 ? contentTypes[0] : undefined;

          console.log('[TourList] 검색 API 호출:', {
            keyword: query.trim(),
            areaCode,
            contentTypeId,
            page,
          });

          // 검색 API는 arrange 파라미터를 지원하지 않으므로 클라이언트 사이드 정렬
          result = await searchKeyword({
            keyword: query.trim(),
            areaCode: areaCode,
            contentTypeId: contentTypeId as any,
            numOfRows,
            pageNo: page,
          });

          console.log('[TourList] 검색 결과:', {
            itemCount: result.items.length,
            totalCount: result.totalCount,
            firstItem: result.items[0] ? {
              title: result.items[0].title,
              contentid: result.items[0].contentid,
            } : null,
          });
        } else {
          // 지역 기반 목록 API 호출 (arrange 파라미터 지원)
          console.log('[TourList] 지역 기반 목록 조회:', {
            areaCode,
            contentTypeId: contentTypes.length > 0 ? contentTypes[0] : undefined,
            sortBy,
            page,
          });

          result = await getAreaBasedList({
            areaCode: areaCode,
            contentTypeId: contentTypes.length > 0 ? (contentTypes[0] as any) : undefined,
            arrange: sortBy,
            numOfRows,
            pageNo: page,
          });

          console.log('[TourList] 지역 기반 목록 결과:', {
            itemCount: result.items.length,
            totalCount: result.totalCount,
          });
        }

        // 여러 타입이 선택된 경우, 클라이언트 사이드에서 필터링
        let filteredTours = result.items;
        if (contentTypes.length > 1) {
          filteredTours = result.items.filter((tour) =>
            contentTypes.includes(tour.contenttypeid)
          );
        }

        // 검색어가 있고 클라이언트 사이드 정렬이 필요한 경우
        if (query && query.trim() && sortBy === 'Q') {
          // 최신순 정렬 (modifiedtime 기준)
          filteredTours.sort((a, b) => {
            const timeA = a.modifiedtime ? new Date(a.modifiedtime).getTime() : 0;
            const timeB = b.modifiedtime ? new Date(b.modifiedtime).getTime() : 0;
            return timeB - timeA; // 내림차순 (최신순)
          });
        } else if (query && query.trim() && sortBy === 'O') {
          // 이름순 정렬 (제목 기준)
          filteredTours.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
        }

        if (append) {
          setTours((prev) => {
            const newTours = [...prev, ...filteredTours];
            const currentTotal = newTours.length;
            // hasMore 계산: 현재 페이지의 항목 수가 numOfRows와 같고, 전체 개수가 더 많으면
            setHasMore(filteredTours.length === numOfRows && currentTotal < result.totalCount);
            return newTours;
          });
        } else {
          setTours(filteredTours);
          const currentTotal = filteredTours.length;
          // hasMore 계산: 현재 페이지의 항목 수가 numOfRows와 같고, 전체 개수가 더 많으면
          setHasMore(filteredTours.length === numOfRows && currentTotal < result.totalCount);
        }

        setTotalCount(result.totalCount);
        setPageNo(page);
      } catch (err) {
        console.error('관광지 목록 로딩 실패:', err);
        setError(err instanceof Error ? err : new Error('알 수 없는 오류'));
        
        if (!append) {
          setTours([]);
          setTotalCount(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [areaCode, contentTypes.join(','), query, sortBy]
  );

  // tours 상태 변경 시 부모 컴포넌트에 알림 (렌더링 후 호출)
  useEffect(() => {
    if (onToursLoad) {
      onToursLoad(tours);
    }
  }, [tours, onToursLoad]);

  // 초기 로드 및 필터/정렬 변경 시
  useEffect(() => {
    fetchTours(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaCode, contentTypes.join(','), query, sortBy]);

  // 무한 스크롤: Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchTours(pageNo + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, pageNo, fetchTours]);

  // 로딩 상태
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <TourCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive mb-4">관광지 목록을 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    // 검색 결과가 없을 때
    if (query) {
      return (
        <EmptySearchResults
          searchKeyword={query}
          onReset={() => {
            // 검색 초기화는 부모 컴포넌트에서 처리
            window.location.href = '/';
          }}
        />
      );
    }
    
    // 필터 조건에 맞는 관광지가 없을 때
    return (
      <EmptyTourList
        onReset={() => {
          // 필터 초기화는 부모 컴포넌트에서 처리
          window.location.reload();
        }}
      />
    );
  }

  // 목록 표시
  return (
    <div className="space-y-4">
      {/* 검색 결과 개수 표시 */}
      {query && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">"{query}"</span> 검색 결과{' '}
          <span className="font-medium">{totalCount.toLocaleString()}</span>개
        </div>
      )}

        {/* 관광지 목록 그리드 */}
        <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
          {tours.map((tour) => (
            <TourCard
              key={tour.contentid}
              tour={tour}
              onCardClick={onTourClick}
            />
          ))}
        </div>

        {/* 무한 스크롤 트리거 */}
        {hasMore && (
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loading size="sm" />
                <span className="text-sm">더 많은 관광지를 불러오는 중...</span>
              </div>
            )}
          </div>
        )}

        {/* 더 이상 불러올 데이터가 없을 때 */}
        {!hasMore && tours.length > 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            모든 관광지를 불러왔습니다.
          </div>
        )}
    </div>
  );
}

