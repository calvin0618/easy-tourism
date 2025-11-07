/**
 * @file components/pet-friendly/pet-badge.tsx
 * @description 반려동물 친화 뱃지 컴포넌트
 *
 * 관광지의 반려동물 동반 가능 여부를 표시하는 뱃지 컴포넌트입니다.
 * TODO-pet-friendly.md Phase 3.1을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 반려동물 동반 가능 여부에 따른 뱃지 표시
 * - 색상 구분 (가능: 초록색, 불가능: 회색, 조건부: 노란색)
 * - 아이콘 표시 (🐕, 🐈 등)
 * - 크기 옵션 (sm, default, lg)
 * - 툴팁 표시 (정책 정보, 선택 사항)
 *
 * @dependencies
 * - lib/types/pet-friendly: 반려동물 친화 정보 타입 및 유틸리티 함수
 * - components/ui/badge: shadcn Badge 컴포넌트
 */

'use client';

import { Badge } from '@/components/ui/badge';
import type { PetFriendlyInfo } from '@/lib/types/pet-friendly';
import {
  getPetFriendlyStatus,
  getPetFriendlyBadgeColor,
  getPetFriendlyBadgeText,
  formatPetPolicy,
} from '@/lib/types/pet-friendly';
import { cn } from '@/lib/utils';

interface PetBadgeProps {
  /** 반려동물 친화 정보 */
  info: PetFriendlyInfo;
  /** 뱃지 크기 */
  size?: 'sm' | 'default' | 'lg';
  /** 툴팁 표시 여부 (기본값: false) */
  showTooltip?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 크기에 따른 텍스트 크기 클래스
 */
const sizeClasses = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
};

/**
 * 반려동물 친화 뱃지 컴포넌트
 */
export function PetBadge({
  info,
  size = 'default',
  showTooltip = false,
  className,
}: PetBadgeProps) {
  const status = getPetFriendlyStatus(info);
  const badgeColor = getPetFriendlyBadgeColor(status);
  const badgeText = getPetFriendlyBadgeText(status);
  const policyText = formatPetPolicy(info);

  // 아이콘 선택 (상태에 따라)
  const icon = status === 'not_allowed' ? '🚫' : '🐕';

  return (
    <Badge
      variant="outline"
      className={cn(
        badgeColor,
        sizeClasses[size],
        'inline-flex items-center gap-1',
        className
      )}
      title={showTooltip ? policyText : undefined}
      aria-label={`반려동물 동반: ${badgeText}`}
    >
      <span className="text-base leading-none" aria-hidden="true">
        {icon}
      </span>
      <span>{badgeText}</span>
    </Badge>
  );
}

