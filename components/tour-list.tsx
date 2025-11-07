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
import { getAreaBasedList, searchKeyword, getDetailCommon, getDetailIntro } from '@/lib/api/tour-api';
import { getPetFriendlyInfo, getPetFriendlyTours, getAllPetFriendlyInfo, normalizeContentId } from '@/lib/api/pet-friendly-api';
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import type { PetFilterOptions } from '@/components/pet-friendly/pet-filter';
import { useI18n } from '@/components/providers/i18n-provider';
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
  /** 반려동물 필터 옵션 */
  petFilterOptions?: PetFilterOptions;
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
  petFilterOptions,
  className,
  onToursLoad,
  onTourClick,
}: TourListProps) {
  const { t } = useI18n();
  const [tours, setTours] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const supabase = useClerkSupabaseClient();

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
              contentidType: typeof result.items[0].contentid,
              contentidValue: String(result.items[0].contentid),
              contentidNormalized: normalizeContentId(result.items[0].contentid),
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
            firstItem: result.items[0] ? {
              title: result.items[0].title,
              contentid: result.items[0].contentid,
              contentidType: typeof result.items[0].contentid,
              contentidValue: String(result.items[0].contentid),
              contentidNormalized: normalizeContentId(result.items[0].contentid),
            } : null,
          });
        }

        // 여러 타입이 선택된 경우, 클라이언트 사이드에서 필터링
        let filteredTours = result.items;
        if (contentTypes.length > 1) {
          filteredTours = result.items.filter((tour) =>
            contentTypes.includes(tour.contenttypeid)
          );
        }

        // 반려동물 관련 키워드 감지
        const petKeywords = ['반려동물', '펫', '애완동물', '반려견', '반려묘', 'pet', '애완'];
        const isPetRelatedSearch = query && petKeywords.some((keyword) =>
          query.toLowerCase().includes(keyword.toLowerCase())
        );

        // 반려동물 관련 검색어가 있으면 반려동물 필터 자동 활성화 (사용자가 명시적으로 비활성화하지 않은 경우)
        const shouldApplyPetFilter =
          isPetRelatedSearch && petFilterOptions?.petFriendly !== false;

        // 반려동물 정보 조회 (필터 활성화 여부와 무관하게 항상 조회하여 뱃지 표시)
        console.group('[TourList] 반려동물 정보 조회');
        console.log('[TourList] 필터링 전 관광지 개수:', filteredTours.length);
        console.log('[TourList] 원본 관광지 개수:', result.items.length);
        
        // 모든 반려동물 정보 조회 (뱃지 표시용, is_pet_allowed 값과 무관)
        const allPetFriendlyResult = await getAllPetFriendlyInfo(supabase, {
          limit: 1000,
          offset: 0,
        });

        // 반려동물 정보를 TourItem에 추가 (필터링 전에 먼저 매칭)
        const petInfoMap = new Map(
          (allPetFriendlyResult.data || []).map((info) => [
            normalizeContentId(info.content_id),
            info,
          ])
        );

        // 모든 관광지에 반려동물 정보 추가 (필터링 전)
        filteredTours = filteredTours.map((tour) => {
          const tourContentId = normalizeContentId(tour.contentid);
          return {
            ...tour,
            petFriendlyInfo: petInfoMap.get(tourContentId),
          };
        });

        // 반려동물 필터가 활성화된 경우에만 필터링 적용
        if (petFilterOptions?.petFriendly === true || shouldApplyPetFilter) {
          console.log('[TourList] 반려동물 필터 적용');
          
          // 먼저 Supabase에서 반려동물 동반 가능한 관광지 목록을 가져옴 (필터링용)
          const petFriendlyResult = await getPetFriendlyTours(supabase, {
            limit: 1000, // 충분히 큰 값으로 설정
            offset: 0,
          });

          console.log('[TourList] getPetFriendlyTours 결과:', {
            success: petFriendlyResult.success,
            dataLength: petFriendlyResult.data?.length || 0,
            error: petFriendlyResult.error,
            firstFewItems: petFriendlyResult.data?.slice(0, 3).map(item => ({
              content_id: item.content_id,
              content_id_type: typeof item.content_id,
              content_id_normalized: normalizeContentId(item.content_id),
              is_pet_allowed: item.is_pet_allowed,
            })),
          });

          // Supabase에 데이터가 없으면 TOUR API의 chkpet 필드를 활용
          const useTourApiFallback = !petFriendlyResult.success || !petFriendlyResult.data || petFriendlyResult.data.length === 0;
          
          if (useTourApiFallback) {
            console.log('[TourList] Supabase에 반려동물 정보가 없습니다. TOUR API의 chkpet 필드를 활용합니다.');
            
            // TOUR API의 detailIntro2를 병렬로 호출하여 chkpet 필드 확인
            // 전체 관광지를 확인하여 반려동물 동반 가능한 관광지 찾기
            const toursToCheck = filteredTours;
            const introPromises = toursToCheck.map(tour => 
              getDetailIntro(normalizeContentId(tour.contentid), tour.contenttypeid)
                .then(intro => ({ tour, intro, chkpet: intro.chkpet }))
                .catch(() => ({ tour, intro: null, chkpet: undefined }))
            );
            
            const introResults = await Promise.allSettled(introPromises);
            
            // chkpet 필드 값 확인을 위한 상세 로그
            const fulfilledResults = introResults.filter(
              (r): r is PromiseFulfilledResult<{ tour: TourItem; intro: any; chkpet: string }> => 
                r.status === 'fulfilled'
            );
            
            console.log('[TourList] TOUR API detailIntro 결과 샘플:', {
              total: introResults.length,
              fulfilled: fulfilledResults.length,
              rejected: introResults.filter(r => r.status === 'rejected').length,
              chkpetSamples: fulfilledResults
                .filter(r => r.value.intro !== null)
                .slice(0, 10)
                .map(r => ({
                  title: r.value.tour.title,
                  contentid: normalizeContentId(r.value.tour.contentid),
                  chkpet: r.value.chkpet,
                  chkpetType: typeof r.value.chkpet,
                  chkpetValue: String(r.value.chkpet),
                  chkpetTrimmed: typeof r.value.chkpet === 'string' ? r.value.chkpet.trim() : 'N/A',
                })),
            });
            
            const petFriendlyTours = fulfilledResults
              .filter((result): result is PromiseFulfilledResult<{ tour: TourItem; intro: any; chkpet: string }> =>
                result.value.chkpet !== undefined &&
                result.value.chkpet !== null &&
                typeof result.value.chkpet === 'string' &&
                (result.value.chkpet === '가능' || 
                 result.value.chkpet === 'Y' || 
                 result.value.chkpet.trim() === '가능' || 
                 result.value.chkpet.trim() === 'Y')
              )
              .map(result => result.value.tour);
            
            console.log('[TourList] TOUR API chkpet 필터링 결과:', {
              확인한관광지수: toursToCheck.length,
              반려동물동반가능수: petFriendlyTours.length,
              샘플: petFriendlyTours.slice(0, 5).map(t => ({
                contentid: normalizeContentId(t.contentid),
                title: t.title,
              })),
            });
            
            // 필터링된 관광지만 남김
            const petFriendlyContentIds = new Set(
              petFriendlyTours.map(tour => normalizeContentId(tour.contentid))
            );
            
            filteredTours = filteredTours.filter((tour) => {
              const tourContentId = normalizeContentId(tour.contentid);
              return petFriendlyContentIds.has(tourContentId);
            });
            
            console.log('[TourList] TOUR API 기반 필터링 완료:', {
              필터링후개수: filteredTours.length,
            });
          } else {
            // 반려동물 동반 가능한 관광지의 contentId 목록
            // content_id를 문자열로 변환하여 비교 (타입 일치 보장)
            // TOUR API의 contentid 형식에 맞추기 위해 정규화
            const petFriendlyContentIds = new Set(
              petFriendlyResult.data
                .filter((info) => {
                  // 기본 필터: is_pet_allowed가 true인 경우만
                  if (!info.is_pet_allowed) return false;

                  // 추가 필터 조건 (크기, 마리 수)
                  if (petFilterOptions.petSize && info.pet_size_limit) {
                    const sizeMatch = info.pet_size_limit
                      .toLowerCase()
                      .includes(petFilterOptions.petSize.toLowerCase());
                    if (!sizeMatch) return false;
                  }

                  if (
                    petFilterOptions.minPetCount &&
                    info.pet_count_limit &&
                    info.pet_count_limit < petFilterOptions.minPetCount
                  ) {
                    return false;
                  }

                  return true;
                })
                .map((info) => {
                  // TOUR API의 contentid 형식에 맞추기 위해 정규화
                  // normalizeContentId 함수를 사용하여 일관된 형식으로 변환
                  return normalizeContentId(info.content_id);
                })
            );

            console.log('[TourList] 반려동물 동반 가능 관광지 contentId:', {
              총개수: petFriendlyContentIds.size,
              contentIds: Array.from(petFriendlyContentIds).slice(0, 10), // 처음 10개만 로그
              contentIdsType: Array.from(petFriendlyContentIds).slice(0, 3).map(id => typeof id), // 타입 확인
              원본관광지개수: filteredTours.length,
              원본관광지contentIds: filteredTours.slice(0, 5).map(t => {
                const normalized = normalizeContentId(t.contentid);
                return {
                  contentid: t.contentid,
                  type: typeof t.contentid,
                  normalized,
                  title: t.title,
                };
              }), // 처음 5개만 로그
              // 매칭 테스트: 반려동물 contentId 중 하나가 원본 관광지에 있는지 확인
              매칭테스트: filteredTours.slice(0, 5).map(t => {
                const normalized = normalizeContentId(t.contentid);
                const isInPetFriendly = petFriendlyContentIds.has(normalized);
                return {
                  tourContentId: normalized,
                  isInPetFriendly,
                  petFriendlyContentIds_has: isInPetFriendly,
                };
              }),
            });

            // 원본 관광지 목록에서 반려동물 동반 가능한 관광지만 필터링
            // TOUR API의 contentid 형식에 맞추기 위해 정규화하여 비교
            let matchCount = 0;
            let noMatchCount = 0;
            const noMatchSamples: Array<{ tourContentId: string; tourContentIdRaw: string | number; title: string }> = [];
            const matchSamples: Array<{ tourContentId: string; title: string }> = [];
            
            filteredTours = filteredTours.filter((tour) => {
              // TOUR API의 contentid는 number 타입일 수 있으므로 정규화
              // normalizeContentId 함수를 사용하여 일관된 형식으로 변환
              const tourContentId = normalizeContentId(tour.contentid);
              
              const isMatch = petFriendlyContentIds.has(tourContentId);
              
              if (isMatch) {
                matchCount++;
                // 매칭 성공 샘플 수집 (최대 3개)
                if (matchSamples.length < 3) {
                  matchSamples.push({
                    tourContentId,
                    title: tour.title,
                  });
                }
              } else {
                noMatchCount++;
                // 매칭 실패 샘플 수집 (최대 5개)
                if (noMatchSamples.length < 5) {
                  noMatchSamples.push({
                    tourContentId,
                    tourContentIdRaw: tour.contentid, // 원본 값도 저장
                    title: tour.title,
                  });
                }
              }
              
              return isMatch;
            });
            
            // 매칭 결과 상세 로그
            console.log('[TourList] 매칭 결과:', {
              매칭성공: matchCount,
              매칭실패: noMatchCount,
              반려동물동반가능개수: petFriendlyContentIds.size,
              원본관광지개수: filteredTours.length + noMatchCount, // 필터링 전 개수
              필터링후개수: filteredTours.length,
              매칭성공샘플: matchSamples,
              매칭실패샘플: noMatchSamples,
              반려동물contentId샘플: Array.from(petFriendlyContentIds).slice(0, 10),
              반려동물contentId타입: Array.from(petFriendlyContentIds).slice(0, 3).map(id => ({
                value: id,
                type: typeof id,
                length: id.length,
              })),
            });

            console.log('[TourList] 반려동물 필터링 결과:', {
              원본개수: result.items.length,
              반려동물동반가능개수: petFriendlyContentIds.size,
              필터링후개수: filteredTours.length,
            });
          }
        }
        console.groupEnd();

        // 반려동물 관련 검색어가 있으면 반려동물 동반 가능한 관광지를 우선 정렬
        if (isPetRelatedSearch) {
          console.log('[TourList] 반려동물 관련 검색어 감지, 우선 정렬 적용');
          filteredTours.sort((a, b) => {
            const aHasPet = a.petFriendlyInfo?.is_pet_allowed === true;
            const bHasPet = b.petFriendlyInfo?.is_pet_allowed === true;

            // 반려동물 동반 가능한 관광지를 우선 표시
            if (aHasPet && !bHasPet) return -1;
            if (!aHasPet && bHasPet) return 1;

            // 둘 다 반려동물 동반 가능하거나 둘 다 불가능한 경우, 기존 정렬 기준 사용
            return 0;
          });
        }

        // 검색어가 있고 클라이언트 사이드 정렬이 필요한 경우
        if (query && query.trim() && sortBy === 'Q') {
          // 최신순 정렬 (modifiedtime 기준)
          // 반려동물 우선 정렬 후에 적용
          filteredTours.sort((a, b) => {
            // 반려동물 동반 가능 여부를 먼저 고려
            const aHasPet = a.petFriendlyInfo?.is_pet_allowed === true;
            const bHasPet = b.petFriendlyInfo?.is_pet_allowed === true;
            if (isPetRelatedSearch) {
              if (aHasPet && !bHasPet) return -1;
              if (!aHasPet && bHasPet) return 1;
            }

            // 같은 반려동물 상태면 최신순 정렬
            const timeA = a.modifiedtime ? new Date(a.modifiedtime).getTime() : 0;
            const timeB = b.modifiedtime ? new Date(b.modifiedtime).getTime() : 0;
            return timeB - timeA; // 내림차순 (최신순)
          });
        } else if (query && query.trim() && sortBy === 'O') {
          // 이름순 정렬 (제목 기준)
          // 반려동물 우선 정렬 후에 적용
          filteredTours.sort((a, b) => {
            // 반려동물 동반 가능 여부를 먼저 고려
            const aHasPet = a.petFriendlyInfo?.is_pet_allowed === true;
            const bHasPet = b.petFriendlyInfo?.is_pet_allowed === true;
            if (isPetRelatedSearch) {
              if (aHasPet && !bHasPet) return -1;
              if (!aHasPet && bHasPet) return 1;
            }

            // 같은 반려동물 상태면 이름순 정렬
            return a.title.localeCompare(b.title, 'ko');
          });
        }

        // 반려동물 필터가 적용된 경우: 원본 API 응답을 기준으로 hasMore 계산
        // 필터링 후 개수가 적어도, 원본 API에 더 많은 데이터가 있으면 계속 불러옴
        const isPetFilterActive = petFilterOptions?.petFriendly === true || shouldApplyPetFilter;
        
        if (append) {
          setTours((prev) => {
            const newTours = [...prev, ...filteredTours];
            const currentTotal = newTours.length;
            
            // 반려동물 필터 활성화 시: 원본 API 응답 기준으로 판단
            // 필터 비활성화 시: 필터링된 결과 기준으로 판단
            const shouldContinueLoading = isPetFilterActive
              ? result.items.length === numOfRows && result.totalCount > (page * numOfRows)
              : filteredTours.length === numOfRows && currentTotal < result.totalCount;
            
            setHasMore(shouldContinueLoading);
            return newTours;
          });
        } else {
          setTours(filteredTours);
          const currentTotal = filteredTours.length;
          
          // 반려동물 필터 활성화 시: 원본 API 응답 기준으로 판단
          // 필터 비활성화 시: 필터링된 결과 기준으로 판단
          const shouldContinueLoading = isPetFilterActive
            ? result.items.length === numOfRows && result.totalCount > numOfRows
            : filteredTours.length === numOfRows && currentTotal < result.totalCount;
          
          setHasMore(shouldContinueLoading);
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
    [areaCode, contentTypes, query, sortBy, petFilterOptions, supabase]
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
  }, [
    areaCode,
    contentTypes.join(','),
    query,
    sortBy,
    petFilterOptions?.petFriendly,
    petFilterOptions?.petSize,
    petFilterOptions?.minPetCount,
  ]);

  // 무한 스크롤: Intersection Observer (개선된 버전)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchTours(pageNo + 1, true);
        }
      },
      { 
        threshold: 0.1,
        // 화면 하단 200px 전에 미리 트리거 (더 일찍 로드)
        rootMargin: '0px 0px 200px 0px'
      }
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

  // 자동 연속 로드: 초기 로드 후 자동으로 추가 페이지 불러오기
  useEffect(() => {
    // 초기 로드가 완료되고, 더 불러올 데이터가 있고, 로딩 중이 아닐 때
    if (!loading && !loadingMore && hasMore && tours.length > 0 && tours.length < 100) {
      // 관광지가 100개 미만이면 자동으로 다음 페이지 불러오기
      const timer = setTimeout(() => {
        if (hasMore && !loadingMore && !loading) {
          fetchTours(pageNo + 1, true);
        }
      }, 500); // 0.5초 후 자동 로드

      return () => clearTimeout(timer);
    }
  }, [loading, loadingMore, hasMore, tours.length, pageNo, fetchTours]);

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
        isPetFilterActive={petFilterOptions?.petFriendly === true}
        onReset={() => {
          // 필터 초기화는 부모 컴포넌트에서 처리
          window.location.reload();
        }}
      />
    );
  }

  // 반려동물 관련 키워드 감지 (UI 표시용)
  const petKeywords = ['반려동물', '펫', '애완동물', '반려견', '반려묘', 'pet', '애완'];
  const isPetRelatedSearch = query && petKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );

  // 목록 표시
  return (
    <div className="space-y-4">
      {/* 검색 결과 개수 표시 */}
      {query && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span> {t.tourList.searchResults}{' '}
          <span className="font-medium">{totalCount.toLocaleString()}</span>{t.tourList.searchResultsCount}
          {/* 반려동물 관련 검색어 감지 시 안내 */}
          {isPetRelatedSearch && (
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              {t.tourList.petPriorityNotice}
            </span>
          )}
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
                <span className="text-sm">{t.tourList.loadingMore}</span>
              </div>
            )}
          </div>
        )}

        {/* 더 이상 불러올 데이터가 없을 때 */}
        {!hasMore && tours.length > 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t.tourList.allToursLoaded}
          </div>
        )}
    </div>
  );
}

