import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function PlaceDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* 헤더 스켈레톤 */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-9 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 대표 이미지 스켈레톤 */}
        <Skeleton className="w-full h-64 md:h-96 mb-6 rounded-lg" />

        {/* 제목 및 뱃지 스켈레톤 */}
        <div className="mb-6">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* 기본 정보 섹션 스켈레톤 */}
        <Card className="p-6 mb-6">
          <Skeleton className="h-7 w-24 mb-4" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </Card>

        {/* 운영 정보 섹션 스켈레톤 */}
        <Card className="p-6 mb-6">
          <Skeleton className="h-7 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-full" />
          </div>
        </Card>

        {/* 지도 스켈레톤 */}
        <Skeleton className="w-full h-96 mb-6 rounded-lg" />
      </div>
    </div>
  );
}

