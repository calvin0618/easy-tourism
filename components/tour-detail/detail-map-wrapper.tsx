/**
 * @file detail-map-wrapper.tsx
 * @description 상세페이지 지도 컴포넌트 래퍼 (클라이언트 컴포넌트)
 *
 * 서버 컴포넌트에서 사용하기 위한 클라이언트 컴포넌트 래퍼입니다.
 * Next.js 15에서는 서버 컴포넌트에서 ssr: false를 사용할 수 없으므로,
 * 클라이언트 컴포넌트로 분리하여 동적 import를 처리합니다.
 */

'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';

// 상세페이지 지도 컴포넌트는 동적 import (SSR 비활성화)
const DetailMap = dynamic(
  () => import('@/components/tour-detail/detail-map').then((mod) => ({ default: mod.DetailMap })),
  {
    ssr: false,
    loading: () => (
      <Card className="p-6">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">지도를 불러오는 중...</p>
        </div>
      </Card>
    ),
  }
);

interface DetailMapWrapperProps {
  /** 관광지명 */
  title: string;
  /** 주소 */
  address: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 상세페이지 지도 컴포넌트 래퍼
 */
export function DetailMapWrapper({
  title,
  address,
  mapx,
  mapy,
  className,
}: DetailMapWrapperProps) {
  return (
    <DetailMap
      title={title}
      address={address}
      mapx={mapx}
      mapy={mapy}
      className={className}
    />
  );
}

