/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 개별 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * PRD.md 2.1 목록 표시 정보 요구사항을 참고하여 작성되었습니다.
 * Design.md의 카드 디자인을 반영했습니다.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PetBadge } from '@/components/pet-friendly/pet-badge';
import type { TourItem } from '@/lib/types/tour';
import { CONTENT_TYPE_LABELS } from '@/lib/types/tour';
import { cn } from '@/lib/utils';

interface TourCardProps {
  /** 관광지 데이터 */
  tour: TourItem;
  /** 추가 클래스명 */
  className?: string;
  /** 카드 클릭 핸들러 (선택 사항, 지도 이동용) */
  onCardClick?: (tourId: string) => void;
}

/**
 * 이미지 URL 검증
 */
function isValidImageUrl(imageUrl?: string): boolean {
  return !!(imageUrl && imageUrl.trim() !== '' && imageUrl !== 'null');
}

/**
 * 주소 표시 (addr1 + addr2)
 */
function getFullAddress(tour: TourItem): string {
  const addr = tour.addr1 || '';
  const addr2 = tour.addr2 || '';
  return addr2 ? `${addr} ${addr2}` : addr;
}

export function TourCard({ tour, className, onCardClick }: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2;
  const hasImage = isValidImageUrl(imageUrl);
  const [imageError, setImageError] = useState(false);
  const fullAddress = getFullAddress(tour);
  const contentTypeLabel =
    CONTENT_TYPE_LABELS[tour.contenttypeid as keyof typeof CONTENT_TYPE_LABELS] ||
    '관광지';

  const showPlaceholder = !hasImage || imageError;

  const handleClick = (e: React.MouseEvent) => {
    // 데스크톱에서만 지도 이동 (모바일에서는 상세 페이지로 바로 이동)
    if (onCardClick && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      e.preventDefault();
      onCardClick(tour.contentid);
      // 지도 이동 후 약간의 지연 후 상세 페이지로 이동 (UX 개선)
      setTimeout(() => {
        window.location.href = `/places/${tour.contentid}`;
      }, 500);
    }
  };

  return (
    <Link href={`/places/${tour.contentid}`} onClick={handleClick}>
      <Card
        className={cn(
          'group cursor-pointer transition-all duration-300',
          'hover:shadow-xl hover:scale-[1.02]',
          'border border-gray-200 dark:border-gray-700',
          'overflow-hidden',
          className
        )}
      >
        {/* 썸네일 이미지 */}
        <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {showPlaceholder ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900">
              <MapPin className="w-12 h-12 text-muted-foreground/50" />
            </div>
          ) : (
            <Image
              src={imageUrl!}
              alt={tour.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        <CardContent className="p-4">
          {/* 관광 타입 뱃지 및 반려동물 뱃지 */}
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {contentTypeLabel}
            </Badge>
            {/* 반려동물 뱃지 (반려동물 동반 가능한 경우에만 표시) */}
            {tour.petFriendlyInfo && tour.petFriendlyInfo.is_pet_allowed && (
              <PetBadge info={tour.petFriendlyInfo} size="sm" showTooltip />
            )}
          </div>

          {/* 관광지명 */}
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tour.title}
            {/* 반려동물 동반 가능한 경우 강조 표시 (검색 결과 하이라이트) */}
            {tour.petFriendlyInfo && tour.petFriendlyInfo.is_pet_allowed && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                🐕 반려동물 가능
              </span>
            )}
          </h3>

          {/* 주소 */}
          <div className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{fullAddress}</span>
          </div>

          {/* 간단한 개요 (선택 사항 - 데이터가 있을 경우) */}
          {tour.cat1 && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {tour.cat1} {tour.cat2 && `· ${tour.cat2}`}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

