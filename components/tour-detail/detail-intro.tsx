/**
 * @file detail-intro.tsx
 * @description 상세페이지 운영 정보 섹션 컴포넌트
 *
 * 관광지의 운영 시간, 휴무일, 요금, 주차 등의 운영 정보를 표시합니다.
 * PRD.md 2.4.2 운영 정보 섹션 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 운영시간 / 개장시간
 * - 휴무일
 * - 이용요금
 * - 주차 가능 여부
 * - 수용인원
 * - 체험 프로그램
 * - 유모차/반려동물 동반 가능 여부
 */

'use client';

import { Clock, Calendar, DollarSign, ParkingCircle, Users, Baby, Dog, Phone, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TourIntro } from '@/lib/types/tour';

interface DetailIntroProps {
  /** 운영 정보 데이터 */
  intro: TourIntro;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 정보 아이템 렌더링 헬퍼
 */
function InfoItem({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  badge?: boolean;
}) {
  if (!value || value.trim() === '' || value === 'null') {
    return null;
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-base text-foreground whitespace-pre-wrap break-words">
          {value}
        </p>
        {badge && (
          <Badge variant="secondary" className="mt-2">
            {value}
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * 상세페이지 운영 정보 섹션 컴포넌트
 */
export function DetailIntro({ intro, className }: DetailIntroProps) {
  // 정보가 있는지 확인
  const hasInfo =
    intro.usetime ||
    intro.restdate ||
    intro.usefee ||
    intro.parking ||
    intro.accomcount ||
    intro.expguide ||
    intro.chkbabycarriage ||
    intro.chkpet ||
    intro.infocenter ||
    intro.usetimeculture;

  // 정보가 없으면 표시하지 않음
  if (!hasInfo) {
    return null;
  }

  return (
    <Card className={`p-6 ${className || ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">운영 정보</h2>
      </div>

      <div className="space-y-0">
        {/* 운영시간 */}
        <InfoItem
          icon={Clock}
          label="운영시간"
          value={intro.usetime || intro.usetimeculture}
        />

        {/* 휴무일 */}
        <InfoItem icon={Calendar} label="휴무일" value={intro.restdate} />

        {/* 이용요금 */}
        <InfoItem icon={DollarSign} label="이용요금" value={intro.usefee} />

        {/* 문의처 */}
        <InfoItem icon={Phone} label="문의처" value={intro.infocenter} />

        {/* 주차 */}
        <InfoItem icon={ParkingCircle} label="주차" value={intro.parking} />

        {/* 수용인원 */}
        <InfoItem icon={Users} label="수용인원" value={intro.accomcount} />

        {/* 체험 프로그램 */}
        <InfoItem icon={Info} label="체험 프로그램" value={intro.expguide} />

        {/* 유모차 동반 */}
        <InfoItem
          icon={Baby}
          label="유모차 동반"
          value={intro.chkbabycarriage}
          badge={intro.chkbabycarriage === '가능' || intro.chkbabycarriage === 'Y'}
        />

        {/* 반려동물 동반 */}
        <InfoItem
          icon={Dog}
          label="반려동물 동반"
          value={intro.chkpet}
          badge={intro.chkpet === '가능' || intro.chkpet === 'Y'}
        />
      </div>
    </Card>
  );
}

