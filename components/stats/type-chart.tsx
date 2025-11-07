/**
 * @file type-chart.tsx
 * @description 관광 타입별 분포 차트 (Donut Chart)
 *
 * 각 관광 타입별 관광지 개수와 비율을 Donut Chart로 시각화하는 컴포넌트입니다.
 * PRD.md 2.6.2 관광 타입별 분포 요구사항을 참고하여 작성되었습니다.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { TypeStats } from '@/lib/types/stats';
import { Tag } from 'lucide-react';

interface TypeChartProps {
  /** 타입별 통계 데이터 */
  typeStats?: TypeStats[];
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 차트 색상 팔레트 (다크/라이트 모드 대응)
 */
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
];

/**
 * 관광 타입별 분포 차트 컴포넌트
 */
export function TypeChart({ typeStats, isLoading }: TypeChartProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            관광 타입별 분포
          </CardTitle>
          <CardDescription>각 관광 타입별 관광지 개수와 비율을 표시합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!typeStats || typeStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            관광 타입별 분포
          </CardTitle>
          <CardDescription>각 관광 타입별 관광지 개수와 비율을 표시합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  // 차트 데이터 포맷팅
  const chartData = typeStats.map((stat, index) => ({
    name: stat.typeName,
    value: stat.count,
    percentage: stat.percentage,
    contentTypeId: stat.contentTypeId,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // 섹션 클릭 핸들러 (해당 타입의 관광지 목록 페이지로 이동)
  const handlePieClick = (contentTypeId: string) => {
    if (contentTypeId) {
      router.push(`/?contentTypeId=${contentTypeId}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          관광 타입별 분포
        </CardTitle>
        <CardDescription>
          각 관광 타입별 관광지 개수와 비율을 표시합니다. 섹션을 클릭하면 해당 타입의 관광지 목록을 볼 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartData.reduce(
            (acc, item) => {
              acc[item.name] = {
                label: item.name,
                color: item.color,
              };
              return acc;
            },
            {} as Record<string, { label: string; color: string }>
          )}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart aria-label="관광 타입별 분포 차트">
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => {
                  // 작은 비율은 라벨 숨김 (가독성 향상)
                  if (percentage < 5) return '';
                  return `${name} (${percentage}%)`;
                }}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                onClick={(data, index) => {
                  // data는 클릭된 섹션의 데이터 객체
                  if (data && chartData[index]) {
                    handlePieClick(chartData[index].contentTypeId);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof chartData[0];
                    return (
                      <ChartTooltipContent>
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            관광지 개수: <span className="font-medium">{data.value.toLocaleString()}개</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            비율: <span className="font-medium">{data.percentage}%</span>
                          </p>
                        </div>
                      </ChartTooltipContent>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const data = chartData.find((d) => d.name === value);
                  return data ? `${value} (${data.percentage}%)` : value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

