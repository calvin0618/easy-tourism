/**
 * @file stats.ts
 * @description 통계 대시보드 타입 정의
 *
 * 통계 대시보드 페이지에서 사용하는 데이터 타입들을 정의합니다.
 * PRD.md 2.6 통계 대시보드 요구사항을 참고하여 작성되었습니다.
 */

import type { ContentType, CONTENT_TYPE_LABELS } from './tour';

/**
 * 지역별 통계 정보
 */
export interface RegionStats {
  /** 지역 코드 */
  areaCode: string;
  /** 지역명 */
  areaName: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 관광 타입별 통계 정보
 */
export interface TypeStats {
  /** 관광 타입 ID */
  contentTypeId: ContentType;
  /** 관광 타입명 */
  typeName: string;
  /** 관광지 개수 */
  count: number;
  /** 전체 대비 비율 (백분율) */
  percentage: number;
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** Top 3 지역 */
  topRegions: Array<{
    areaCode: string;
    areaName: string;
    count: number;
  }>;
  /** Top 3 관광 타입 */
  topTypes: Array<{
    contentTypeId: ContentType;
    typeName: string;
    count: number;
  }>;
  /** 마지막 업데이트 시간 */
  lastUpdated: Date;
}

/**
 * 통계 데이터 수집 결과
 */
export interface StatsData {
  /** 지역별 통계 */
  regionStats: RegionStats[];
  /** 타입별 통계 */
  typeStats: TypeStats[];
  /** 통계 요약 */
  summary: StatsSummary;
}

