/**
 * @file stats-api.ts
 * @description 통계 데이터 수집 API
 *
 * 통계 대시보드에 필요한 데이터를 수집하는 함수들을 제공합니다.
 * PRD.md 2.6 통계 대시보드 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 지역별 관광지 개수 집계
 * - 타입별 관광지 개수 집계
 * - 통계 요약 정보 생성
 */

import { getAreaCodes, getAreaBasedList } from './tour-api';
import type { AreaCodeInfo } from '@/lib/types/tour';
import type { RegionStats, TypeStats, StatsSummary, StatsData } from '@/lib/types/stats';
import { CONTENT_TYPE_LABELS } from '@/lib/types/tour';
import type { ContentType } from '@/lib/types/tour';

/**
 * 지역별 관광지 개수 집계
 * 각 지역 코드별로 API를 호출하여 totalCount를 수집합니다.
 *
 * @returns 지역별 통계 배열
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  console.group('[Stats API] 지역별 통계 수집 시작');

  try {
    // 1. 지역 코드 목록 조회
    const areaCodes = await getAreaCodes({ numOfRows: 25, pageNo: 1 });
    console.log(`[Stats API] 지역 코드 조회 완료: ${areaCodes.length}개`);

    // 2. 각 지역별로 관광지 개수 조회 (병렬 처리)
    const regionPromises = areaCodes.map(async (area: AreaCodeInfo) => {
      try {
        // numOfRows=1로 최소한의 데이터만 가져와서 totalCount만 확인
        const result = await getAreaBasedList({
          areaCode: area.code,
          numOfRows: 1,
          pageNo: 1,
        });

        return {
          areaCode: area.code,
          areaName: area.name,
          count: result.totalCount || 0,
        } as RegionStats;
      } catch (error) {
        console.warn(`[Stats API] 지역 ${area.name} (${area.code}) 통계 수집 실패:`, error);
        // 에러 발생 시 0으로 처리
        return {
          areaCode: area.code,
          areaName: area.name,
          count: 0,
        } as RegionStats;
      }
    });

    const regionStats = await Promise.allSettled(regionPromises);

    // 성공한 결과만 필터링
    const stats: RegionStats[] = regionStats
      .filter((result): result is PromiseFulfilledResult<RegionStats> => result.status === 'fulfilled')
      .map((result) => result.value)
      .filter((stat) => stat.count > 0) // 개수가 0인 지역 제외
      .sort((a, b) => b.count - a.count); // 개수 내림차순 정렬

    console.log(`[Stats API] 지역별 통계 수집 완료: ${stats.length}개 지역`);
    console.groupEnd();

    return stats;
  } catch (error) {
    console.error('[Stats API] 지역별 통계 수집 중 에러:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 타입별 관광지 개수 집계
 * 각 관광 타입별로 API를 호출하여 totalCount를 수집합니다.
 *
 * @returns 타입별 통계 배열
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  console.group('[Stats API] 타입별 통계 수집 시작');

  try {
    const contentTypeIds: ContentType[] = ['12', '14', '15', '25', '28', '32', '38', '39'];

    // 각 타입별로 관광지 개수 조회 (병렬 처리)
    const typePromises = contentTypeIds.map(async (contentTypeId) => {
      try {
        // numOfRows=1로 최소한의 데이터만 가져와서 totalCount만 확인
        const result = await getAreaBasedList({
          contentTypeId,
          numOfRows: 1,
          pageNo: 1,
        });

        return {
          contentTypeId,
          typeName: CONTENT_TYPE_LABELS[contentTypeId],
          count: result.totalCount || 0,
          percentage: 0, // 나중에 계산
        } as TypeStats;
      } catch (error) {
        console.warn(`[Stats API] 타입 ${contentTypeId} 통계 수집 실패:`, error);
        // 에러 발생 시 0으로 처리
        return {
          contentTypeId,
          typeName: CONTENT_TYPE_LABELS[contentTypeId],
          count: 0,
          percentage: 0,
        } as TypeStats;
      }
    });

    const typeStatsResults = await Promise.allSettled(typePromises);

    // 성공한 결과만 필터링
    const typeStats: TypeStats[] = typeStatsResults
      .filter((result): result is PromiseFulfilledResult<TypeStats> => result.status === 'fulfilled')
      .map((result) => result.value);

    // 전체 개수 계산
    const totalCount = typeStats.reduce((sum, stat) => sum + stat.count, 0);

    // 비율 계산
    const typeStatsWithPercentage = typeStats.map((stat) => ({
      ...stat,
      percentage: totalCount > 0 ? Math.round((stat.count / totalCount) * 100 * 10) / 10 : 0,
    }));

    // 개수 내림차순 정렬
    typeStatsWithPercentage.sort((a, b) => b.count - a.count);

    console.log(`[Stats API] 타입별 통계 수집 완료: ${typeStatsWithPercentage.length}개 타입`);
    console.log(`[Stats API] 전체 관광지 수: ${totalCount}`);
    console.groupEnd();

    return typeStatsWithPercentage;
  } catch (error) {
    console.error('[Stats API] 타입별 통계 수집 중 에러:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 통계 요약 정보 생성
 * 지역별 및 타입별 통계를 기반으로 요약 정보를 생성합니다.
 *
 * @param regionStats - 지역별 통계 (선택 사항, 없으면 자동 수집)
 * @param typeStats - 타입별 통계 (선택 사항, 없으면 자동 수집)
 * @returns 통계 요약 정보
 */
export async function getStatsSummary(
  regionStats?: RegionStats[],
  typeStats?: TypeStats[]
): Promise<StatsSummary> {
  console.group('[Stats API] 통계 요약 생성 시작');

  try {
    // 통계 데이터가 제공되지 않은 경우 자동 수집
    const [regions, types] = await Promise.all([
      regionStats || getRegionStats(),
      typeStats || getTypeStats(),
    ]);

    // 전체 관광지 수 계산 (타입별 통계의 합)
    const totalCount = types.reduce((sum, stat) => sum + stat.count, 0);

    // Top 3 지역
    const topRegions = regions
      .slice(0, 3)
      .map((stat) => ({
        areaCode: stat.areaCode,
        areaName: stat.areaName,
        count: stat.count,
      }));

    // Top 3 타입
    const topTypes = types
      .slice(0, 3)
      .map((stat) => ({
        contentTypeId: stat.contentTypeId,
        typeName: stat.typeName,
        count: stat.count,
      }));

    const summary: StatsSummary = {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated: new Date(),
    };

    console.log('[Stats API] 통계 요약 생성 완료:', {
      totalCount,
      topRegions: topRegions.length,
      topTypes: topTypes.length,
    });
    console.groupEnd();

    return summary;
  } catch (error) {
    console.error('[Stats API] 통계 요약 생성 중 에러:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 모든 통계 데이터 수집
 * 지역별, 타입별 통계 및 요약 정보를 병렬로 수집합니다.
 *
 * @returns 통계 데이터
 */
export async function getAllStats(): Promise<StatsData> {
  console.group('[Stats API] 전체 통계 데이터 수집 시작');

  try {
    // 병렬로 지역별 및 타입별 통계 수집
    const [regionStats, typeStats] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 통계 요약 생성
    const summary = await getStatsSummary(regionStats, typeStats);

    const statsData: StatsData = {
      regionStats,
      typeStats,
      summary,
    };

    console.log('[Stats API] 전체 통계 데이터 수집 완료');
    console.groupEnd();

    return statsData;
  } catch (error) {
    console.error('[Stats API] 전체 통계 데이터 수집 중 에러:', error);
    console.groupEnd();
    throw error;
  }
}

