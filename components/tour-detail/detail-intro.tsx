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
import type { TourIntro, ContentType } from '@/lib/types/tour';

interface DetailIntroProps {
  /** 운영 정보 데이터 */
  intro: TourIntro;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 타입별 필드 우선순위 정의
 * 각 타입별로 중요한 필드를 우선 표시
 */
const TYPE_FIELD_PRIORITY: Record<ContentType, Array<keyof TourIntro>> = {
  '12': ['usetime', 'restdate', 'usefee', 'parking', 'chkpet', 'chkbabycarriage', 'accomcount', 'expguide', 'infocenter'],
  '14': ['usetimeculture', 'restdate', 'usefee', 'parking', 'chkpet', 'chkbabycarriage', 'accomcount', 'expguide', 'infocenter'],
  '15': ['usetime', 'restdate', 'usefee', 'parking', 'chkpet', 'chkbabycarriage', 'accomcount', 'expguide', 'infocenter'],
  '25': ['usetime', 'restdate', 'usefee', 'parking', 'chkpet', 'chkbabycarriage', 'accomcount', 'expguide', 'infocenter'],
  '28': ['usetime', 'restdate', 'usefee', 'parking', 'chkpet', 'chkbabycarriage', 'accomcount', 'expguide', 'infocenter'],
  '32': ['usetime', 'restdate', 'usefee', 'parking', 'chkpet', 'chkbabycarriage', 'accomcount', 'infocenter'],
  '38': ['usetime', 'restdate', 'usefee', 'parking', 'chkpet', 'chkbabycarriage', 'accomcount', 'infocenter'],
  '39': ['usetime', 'restdate', 'usefee', 'parking', 'chkpet', 'chkbabycarriage', 'accomcount', 'infocenter'],
};

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
 * 필드 정의 맵
 * 각 필드의 아이콘, 라벨, 값 추출 함수를 정의
 */
const FIELD_DEFINITIONS: Record<
  keyof TourIntro,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    getValue: (intro: TourIntro) => string | undefined;
    badge?: (value: string) => boolean;
  }
> = {
  contentid: {
    icon: Info,
    label: '콘텐츠ID',
    getValue: (intro) => intro.contentid,
  },
  contenttypeid: {
    icon: Info,
    label: '타입',
    getValue: () => undefined, // 표시하지 않음
  },
  usetime: {
    icon: Clock,
    label: '운영시간',
    getValue: (intro) => intro.usetime,
  },
  usetimeculture: {
    icon: Clock,
    label: '운영시간',
    getValue: (intro) => intro.usetimeculture,
  },
  restdate: {
    icon: Calendar,
    label: '휴무일',
    getValue: (intro) => intro.restdate,
  },
  usefee: {
    icon: DollarSign,
    label: '이용요금',
    getValue: (intro) => intro.usefee,
  },
  parking: {
    icon: ParkingCircle,
    label: '주차',
    getValue: (intro) => intro.parking,
  },
  chkpet: {
    icon: Dog,
    label: '반려동물 동반',
    getValue: (intro) => intro.chkpet,
    badge: (value) => value === '가능' || value === 'Y',
  },
  accomcount: {
    icon: Users,
    label: '수용인원',
    getValue: (intro) => intro.accomcount,
  },
  expguide: {
    icon: Info,
    label: '체험 프로그램',
    getValue: (intro) => intro.expguide,
  },
  chkbabycarriage: {
    icon: Baby,
    label: '유모차 동반',
    getValue: (intro) => intro.chkbabycarriage,
    badge: (value) => value === '가능' || value === 'Y',
  },
  infocenter: {
    icon: Phone,
    label: '문의처',
    getValue: (intro) => intro.infocenter,
  },
};

/**
 * 상세페이지 운영 정보 섹션 컴포넌트
 */
export function DetailIntro({ intro, className }: DetailIntroProps) {
  const contentTypeId = intro.contenttypeid;

  // 타입별 필드 우선순위 가져오기
  const fieldPriority = TYPE_FIELD_PRIORITY[contentTypeId] || TYPE_FIELD_PRIORITY['12'];

  // 운영시간 필드 처리: usetime 또는 usetimeculture 중 하나만 표시
  const getOperatingTime = () => {
    if (intro.usetime) return { field: 'usetime' as keyof TourIntro, value: intro.usetime };
    if (intro.usetimeculture) return { field: 'usetimeculture' as keyof TourIntro, value: intro.usetimeculture };
    return null;
  };

  // 우선순위에 따라 필드 정렬 (운영시간은 특별 처리)
  const orderedFields: Array<{ field: keyof TourIntro; value: string | undefined }> = [];
  
  // 운영시간을 먼저 추가 (우선순위에 따라)
  const operatingTime = getOperatingTime();
  if (operatingTime) {
    orderedFields.push(operatingTime);
  }

  // 나머지 필드를 우선순위에 따라 추가
  for (const field of fieldPriority) {
    // 운영시간은 이미 추가했으므로 건너뛰기
    if (field === 'usetime' || field === 'usetimeculture') continue;
    
    const value = intro[field];
    if (value && value.trim() !== '' && value !== 'null') {
      orderedFields.push({ field, value: value as string });
    }
  }

  // 정보가 없으면 표시하지 않음
  if (orderedFields.length === 0) {
    return null;
  }

  return (
    <Card className={`p-6 ${className || ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">운영 정보</h2>
      </div>

      <div className="space-y-0">
        {orderedFields.map(({ field, value }) => {
          const fieldDef = FIELD_DEFINITIONS[field];
          if (!fieldDef || !value) return null;

          return (
            <InfoItem
              key={field}
              icon={fieldDef.icon}
              label={fieldDef.label}
              value={value}
              badge={fieldDef.badge ? fieldDef.badge(value) : false}
            />
          );
        })}
      </div>
    </Card>
  );
}

