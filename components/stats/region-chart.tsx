/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 차트 (Bar Chart)
 *
 * 각 시/도별 관광지 개수를 Bar Chart로 시각화하는 컴포넌트입니다.
 * PRD.md 2.6.1 지역별 관광지 분포 요구사항을 참고하여 작성되었습니다.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { RegionStats } from '@/lib/types/stats';
import { MapPin } from 'lucide-react';

interface RegionChartProps {
  /** 지역별 통계 데이터 */
  regionStats?: RegionStats[];
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 지역별 분포 차트 컴포넌트
 */
export function RegionChart({ regionStats, isLoading }: RegionChartProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            지역별 관광지 분포
          </CardTitle>
          <CardDescription>각 시/도별 관광지 개수를 표시합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!regionStats || regionStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            지역별 관광지 분포
          </CardTitle>
          <CardDescription>각 시/도별 관광지 개수를 표시합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  // 상위 10개 지역만 표시 (또는 전체)
  const displayStats = regionStats.slice(0, 10);

  // 차트 데이터 포맷팅
  const chartData = displayStats.map((stat) => ({
    name: stat.areaName,
    count: stat.count,
    areaCode: stat.areaCode,
  }));

  // 바 클릭 핸들러 (해당 지역의 관광지 목록 페이지로 이동)
  const handleBarClick = (areaCode: string) => {
    if (areaCode) {
      router.push(`/?areaCode=${areaCode}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          지역별 관광지 분포
        </CardTitle>
        <CardDescription>
          각 시/도별 관광지 개수를 표시합니다. 바를 클릭하면 해당 지역의 관광지 목록을 볼 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: '관광지 개수',
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              aria-label="지역별 관광지 분포 차트"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-xs"
                label={{ value: '관광지 개수', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof chartData[0];
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            관광지 개수: <span className="font-medium">{data.count.toLocaleString()}개</span>
                          </p>
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[8, 8, 0, 0]}
                style={{ cursor: 'pointer' }}
                aria-label="지역별 관광지 개수"
                onClick={(data) => {
                  // data는 클릭된 바의 데이터 객체
                  if (data && data.areaCode) {
                    handleBarClick(data.areaCode);
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

