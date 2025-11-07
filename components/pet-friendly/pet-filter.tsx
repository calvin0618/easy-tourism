/**
 * @file components/pet-friendly/pet-filter.tsx
 * @description 반려동물 필터 컴포넌트
 *
 * 반려동물 동반 가능한 관광지를 필터링하는 컴포넌트입니다.
 * TODO-pet-friendly.md Phase 3.3을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - "반려동물 동반 가능" 체크박스
 * - 반려동물 크기 필터 (소형, 중형, 대형)
 * - 반려동물 마리 수 필터
 * - 필터 상태 관리
 *
 * @dependencies
 * - components/ui/checkbox: shadcn Checkbox 컴포넌트
 * - components/ui/select: shadcn Select 컴포넌트
 * - lib/types/pet-friendly: 반려동물 친화 정보 타입
 */

'use client';

import { Dog, Filter } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { PetSizeLimit } from '@/lib/types/pet-friendly';
import { PET_SIZE_LIMIT_LABELS } from '@/lib/types/pet-friendly';
import { cn } from '@/lib/utils';

export interface PetFilterOptions {
  /** 반려동물 동반 가능 여부 필터 */
  petFriendly?: boolean;
  /** 반려동물 크기 필터 */
  petSize?: PetSizeLimit;
  /** 반려동물 마리 수 필터 (최소값) */
  minPetCount?: number;
}

interface PetFilterProps {
  /** 현재 필터 옵션 */
  filterOptions: PetFilterOptions;
  /** 필터 변경 핸들러 */
  onFilterChange: (options: PetFilterOptions) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 반려동물 크기 옵션 목록
 */
const PET_SIZE_OPTIONS: (PetSizeLimit | 'all')[] = [
  'all',
  'small',
  'medium',
  'large',
  'unlimited',
];

/**
 * 반려동물 마리 수 옵션
 */
const PET_COUNT_OPTIONS = [
  { value: 'all', label: '제한없음' },
  { value: '1', label: '1마리 이상' },
  { value: '2', label: '2마리 이상' },
  { value: '3', label: '3마리 이상' },
];

/**
 * 반려동물 필터 컴포넌트
 */
export function PetFilter({
  filterOptions,
  onFilterChange,
  className,
}: PetFilterProps) {
  /**
   * 반려동물 동반 가능 필터 토글
   */
  const handlePetFriendlyToggle = (checked: boolean) => {
    onFilterChange({
      ...filterOptions,
      petFriendly: checked ? true : undefined,
    });
  };

  /**
   * 반려동물 크기 필터 변경
   */
  const handlePetSizeChange = (value: string) => {
    onFilterChange({
      ...filterOptions,
      petSize: value === 'all' ? undefined : (value as PetSizeLimit),
    });
  };

  /**
   * 반려동물 마리 수 필터 변경
   */
  const handlePetCountChange = (value: string) => {
    onFilterChange({
      ...filterOptions,
      minPetCount: value === 'all' ? undefined : parseInt(value, 10),
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 border rounded-lg bg-card',
        className
      )}
    >
      {/* 제목 */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">반려동물 필터</h3>
      </div>

      {/* 반려동물 동반 가능 체크박스 */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="pet-friendly"
          checked={filterOptions.petFriendly === true}
          onCheckedChange={handlePetFriendlyToggle}
        />
        <Label
          htmlFor="pet-friendly"
          className="text-sm font-normal cursor-pointer flex items-center gap-2"
        >
          <Dog className="w-4 h-4" />
          반려동물 동반 가능
        </Label>
      </div>

      {/* 반려동물 크기 필터 (반려동물 동반 가능이 선택된 경우에만 표시) */}
      {filterOptions.petFriendly && (
        <div className="space-y-2">
          <Label htmlFor="pet-size" className="text-sm font-medium">
            반려동물 크기
          </Label>
          <Select
            value={filterOptions.petSize || 'all'}
            onValueChange={handlePetSizeChange}
          >
            <SelectTrigger id="pet-size" className="w-full">
              <SelectValue placeholder="크기 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {PET_SIZE_OPTIONS.filter((opt) => opt !== 'all').map((size) => (
                <SelectItem key={size} value={size}>
                  {PET_SIZE_LIMIT_LABELS[size]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 반려동물 마리 수 필터 (반려동물 동반 가능이 선택된 경우에만 표시) */}
      {filterOptions.petFriendly && (
        <div className="space-y-2">
          <Label htmlFor="pet-count" className="text-sm font-medium">
            최소 마리 수
          </Label>
          <Select
            value={
              filterOptions.minPetCount
                ? filterOptions.minPetCount.toString()
                : 'all'
            }
            onValueChange={handlePetCountChange}
          >
            <SelectTrigger id="pet-count" className="w-full">
              <SelectValue placeholder="마리 수 선택" />
            </SelectTrigger>
            <SelectContent>
              {PET_COUNT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

