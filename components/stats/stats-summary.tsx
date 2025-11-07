/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드의 요약 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * PRD.md 2.6.3 통계 요약 카드 요구사항을 참고하여 작성되었습니다.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { StatsSummary } from '@/lib/types/stats';
import { BarChart3, MapPin, Tag, Clock } from 'lucide-react';

interface StatsSummaryProps {
  /** 통계 요약 데이터 */
  summary?: StatsSummary;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 통계 요약 카드 컴포넌트
 */
export function StatsSummary({ summary, isLoading }: StatsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // 마지막 업데이트 시간 포맷팅
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 전체 관광지 수 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">전체 관광지</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">전국 관광지 총 개수</p>
        </CardContent>
      </Card>

      {/* Top 1 지역 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">가장 많은 지역</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {summary.topRegions.length > 0 ? (
            <>
              <div className="text-2xl font-bold">{summary.topRegions[0].areaName}</div>
              <p className="text-xs text-muted-foreground">
                {summary.topRegions[0].count.toLocaleString()}개 관광지
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold">-</div>
          )}
        </CardContent>
      </Card>

      {/* Top 1 타입 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">가장 많은 타입</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {summary.topTypes.length > 0 ? (
            <>
              <div className="text-2xl font-bold">{summary.topTypes[0].typeName}</div>
              <p className="text-xs text-muted-foreground">
                {summary.topTypes[0].count.toLocaleString()}개 관광지
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold">-</div>
          )}
        </CardContent>
      </Card>

      {/* 마지막 업데이트 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">마지막 업데이트</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatLastUpdated(summary.lastUpdated)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.lastUpdated.toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

