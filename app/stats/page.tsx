/**
 * @file page.tsx
 * @description 통계 대시보드 페이지
 *
 * 관광지 데이터를 차트로 시각화하여 전국 관광지 현황을 파악할 수 있는 통계 페이지입니다.
 * PRD.md 2.6 통계 대시보드 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 통계 요약 카드 (전체 개수, Top 3 지역, Top 3 타입, 마지막 업데이트)
 * - 지역별 분포 차트 (Bar Chart)
 * - 관광 타입별 분포 차트 (Donut Chart)
 */

import { Suspense } from 'react';
import { getAllStats } from '@/lib/api/stats-api';
import { StatsSummary } from '@/components/stats/stats-summary';
import { RegionChart } from '@/components/stats/region-chart';
import { TypeChart } from '@/components/stats/type-chart';
import { StatsPageHeader } from '@/components/stats/stats-page-header';
import { StatsPageError } from '@/components/stats/stats-page-error';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Statistics Dashboard',
  description: 'View comprehensive statistics about tourist spots across Korea at a glance.',
};

/**
 * 통계 데이터 로딩 컴포넌트
 */
async function StatsContent() {
  try {
    // 통계 데이터 수집 (Server Component에서 직접 호출)
    const statsData = await getAllStats();

    return (
      <>
        {/* 통계 요약 카드 */}
        <StatsSummary summary={statsData.summary} />

        {/* 지역별 분포 차트 */}
        <RegionChart regionStats={statsData.regionStats} />

        {/* 타입별 분포 차트 */}
        <TypeChart typeStats={statsData.typeStats} />
      </>
    );
  } catch (error) {
    console.error('[Stats Page] 통계 데이터 수집 실패:', error);
    return <StatsPageError />;
  }
}

/**
 * 통계 대시보드 페이지
 */
export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 페이지 헤더 */}
      <StatsPageHeader />

      {/* 통계 데이터 로딩 (Suspense로 감싸서 로딩 상태 처리) */}
      <Suspense
        fallback={
          <div className="space-y-8">
            <StatsSummary isLoading />
            <RegionChart isLoading />
            <TypeChart isLoading />
          </div>
        }
      >
        <StatsContent />
      </Suspense>
    </div>
  );
}

