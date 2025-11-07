/**
 * @file components/pet-friendly/pet-info-card.tsx
 * @description 반려동물 친화 정보 카드 컴포넌트
 *
 * 관광지의 반려동물 동반 관련 상세 정보를 표시하는 카드 컴포넌트입니다.
 * TODO-pet-friendly.md Phase 3.2를 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 반려동물 정책 상세 정보 표시
 * - 반려동물 추가 요금 정보 (숙박 시설)
 * - 반려동물 크기/마리 수 제한 표시
 * - 추가 안내사항 표시
 * - 아이콘 및 시각적 요소
 *
 * @dependencies
 * - lib/types/pet-friendly: 반려동물 친화 정보 타입 및 유틸리티 함수
 * - components/ui/card: shadcn Card 컴포넌트
 * - lucide-react: 아이콘
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dog,
  DollarSign,
  Users,
  Ruler,
  Info,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { PetFriendlyInfo } from '@/lib/types/pet-friendly';
import {
  getPetFriendlyStatus,
  getPetFriendlyBadgeColor,
  getPetFriendlyBadgeText,
  formatPetPolicy,
} from '@/lib/types/pet-friendly';
import { cn } from '@/lib/utils';

interface PetInfoCardProps {
  /** 반려동물 친화 정보 */
  info: PetFriendlyInfo;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 반려동물 친화 정보 카드 컴포넌트
 */
export function PetInfoCard({ info, className }: PetInfoCardProps) {
  const status = getPetFriendlyStatus(info);
  const badgeColor = getPetFriendlyBadgeColor(status);
  const badgeText = getPetFriendlyBadgeText(status);
  const policyText = formatPetPolicy(info);

  // 상태에 따른 아이콘 및 색상
  const statusConfig = {
    allowed: {
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    not_allowed: {
      icon: XCircle,
      iconColor: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-950/20',
    },
    conditional: {
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        'border-l-4',
        status === 'allowed' && 'border-l-green-500',
        status === 'not_allowed' && 'border-l-gray-500',
        status === 'conditional' && 'border-l-yellow-500',
        className
      )}
    >
      <CardHeader className={cn('pb-3', config.bgColor)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Dog className="w-5 h-5" />
            반려동물 동반 안내
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(badgeColor, 'text-xs')}
          >
            {badgeText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 상태 아이콘 및 기본 메시지 */}
        <div className="flex items-start gap-3">
          <StatusIcon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
          <div className="flex-1">
            <p className="font-medium text-sm">
              {status === 'allowed'
                ? '반려동물 동반이 가능합니다.'
                : status === 'not_allowed'
                  ? '반려동물 동반이 불가능합니다.'
                  : '반려동물 동반이 조건부로 가능합니다.'}
            </p>
            {policyText && (
              <p className="text-sm text-muted-foreground mt-1">{policyText}</p>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="space-y-3 pt-2 border-t">
          {/* 반려동물 정책 */}
          {info.pet_policy && (
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">정책</p>
                <p className="text-sm text-muted-foreground">{info.pet_policy}</p>
              </div>
            </div>
          )}

          {/* 반려동물 추가 요금 */}
          {info.pet_fee && info.pet_fee > 0 && (
            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">추가 요금</p>
                <p className="text-sm text-muted-foreground">
                  {info.pet_fee.toLocaleString('ko-KR')}원
                </p>
              </div>
            </div>
          )}

          {/* 반려동물 크기 제한 */}
          {info.pet_size_limit && (
            <div className="flex items-start gap-3">
              <Ruler className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">크기 제한</p>
                <p className="text-sm text-muted-foreground">{info.pet_size_limit}</p>
              </div>
            </div>
          )}

          {/* 반려동물 마리 수 제한 */}
          {info.pet_count_limit && info.pet_count_limit > 0 && (
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">마리 수 제한</p>
                <p className="text-sm text-muted-foreground">
                  최대 {info.pet_count_limit}마리
                </p>
              </div>
            </div>
          )}

          {/* 추가 안내사항 */}
          {info.notes && (
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">추가 안내</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {info.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

