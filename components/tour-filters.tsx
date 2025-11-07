/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역 필터와 관광 타입 필터를 제공하는 컴포넌트입니다.
 * PRD.md 2.1 관광지 목록 + 지역/타입 필터 요구사항을 참고하여 작성되었습니다.
 * Design.md의 필터 레이아웃을 반영했습니다.
 */

'use client';

import { useEffect, useState } from 'react';
import { MapPin, Filter, X, ArrowUpDown, Dog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAreaCodes } from '@/lib/api/tour-api';
import type { AreaCodeInfo, ContentType } from '@/lib/types/tour';
import { CONTENT_TYPE_LABELS } from '@/lib/types/tour';
import type { PetFilterOptions } from '@/components/pet-friendly/pet-filter';
import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/utils';

/** 정렬 옵션 타입 */
export type SortOption = 'O' | 'Q'; // O: 제목순, Q: 최신순

interface TourFiltersProps {
  /** 선택된 지역코드 */
  selectedAreaCode?: string;
  /** 선택된 관광 타입 배열 */
  selectedContentTypes: ContentType[];
  /** 선택된 정렬 옵션 */
  sortBy?: SortOption;
  /** 반려동물 필터 옵션 */
  petFilterOptions?: PetFilterOptions;
  /** 필터 변경 핸들러 */
  onAreaChange: (areaCode?: string) => void;
  /** 관광 타입 변경 핸들러 */
  onContentTypeChange: (types: ContentType[]) => void;
  /** 정렬 변경 핸들러 */
  onSortChange?: (sort: SortOption) => void;
  /** 반려동물 필터 변경 핸들러 */
  onPetFilterChange?: (options: PetFilterOptions) => void;
  /** 필터 초기화 핸들러 */
  onReset: () => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광 타입 목록
 */
const CONTENT_TYPES: ContentType[] = ['12', '14', '15', '25', '28', '32', '38', '39'];

export function TourFilters({
  selectedAreaCode,
  selectedContentTypes,
  sortBy = 'O',
  petFilterOptions,
  onAreaChange,
  onContentTypeChange,
  onSortChange,
  onPetFilterChange,
  onReset,
  className,
}: TourFiltersProps) {
  const { t } = useI18n();
  const [areaCodes, setAreaCodes] = useState<AreaCodeInfo[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // 지역코드 목록 로드
  useEffect(() => {
    async function loadAreaCodes() {
      try {
        setLoadingAreas(true);
        const codes = await getAreaCodes({ numOfRows: 50 });
        setAreaCodes(codes);
      } catch (error) {
        console.error('지역코드 로딩 실패:', error);
      } finally {
        setLoadingAreas(false);
      }
    }

    loadAreaCodes();
  }, []);

  // 관광 타입 토글
  const toggleContentType = (type: ContentType) => {
    if (selectedContentTypes.includes(type)) {
      // 선택 해제
      onContentTypeChange(selectedContentTypes.filter((t) => t !== type));
    } else {
      // 선택 추가
      onContentTypeChange([...selectedContentTypes, type]);
    }
  };

  // 전체 타입 선택/해제
  const toggleAllTypes = () => {
    if (selectedContentTypes.length === CONTENT_TYPES.length) {
      // 모두 해제
      onContentTypeChange([]);
    } else {
      // 모두 선택
      onContentTypeChange([...CONTENT_TYPES]);
    }
  };

  const hasActiveFilters =
    selectedAreaCode ||
    selectedContentTypes.length > 0 ||
    petFilterOptions?.petFriendly === true;

  return (
    <div
      className={cn(
        'sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
        className
      )}
    >
      <div className="container mx-auto px-4 py-4">
        {/* 데스크톱 레이아웃 */}
        <div className="hidden md:flex items-center gap-4 flex-wrap">
          {/* 지역 필터 */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Select
              value={selectedAreaCode || 'all'}
              onValueChange={(value) => onAreaChange(value === 'all' ? undefined : value)}
              disabled={loadingAreas}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.filter.areaSelect} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filter.all}</SelectItem>
                {areaCodes.map((area) => (
                  <SelectItem key={area.code} value={area.code}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 관광 타입 필터 */}
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={selectedContentTypes.length === CONTENT_TYPES.length ? 'default' : 'outline'}
                size="sm"
                onClick={toggleAllTypes}
                className="h-8"
              >
                {t.filter.all}
              </Button>
              {CONTENT_TYPES.map((type) => {
                const isSelected = selectedContentTypes.includes(type);
                return (
                  <Button
                    key={type}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleContentType(type)}
                    className="h-8"
                  >
                    {CONTENT_TYPE_LABELS[type]}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 정렬 옵션 */}
          {onSortChange && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select
                value={sortBy || 'O'}
                onValueChange={(value) => onSortChange(value as SortOption)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t.filter.sortPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="O">{t.filter.sortByName}</SelectItem>
                  <SelectItem value="Q">{t.filter.sortByNewest}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 반려동물 필터 (데스크톱) */}
          {onPetFilterChange && (
            <div className="flex items-center gap-2">
              <Dog className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pet-friendly-desktop"
                  checked={petFilterOptions?.petFriendly === true}
                  onCheckedChange={(checked) => {
                    onPetFilterChange({
                      ...petFilterOptions,
                      petFriendly: checked ? true : undefined,
                    });
                  }}
                />
                <Label
                  htmlFor="pet-friendly-desktop"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t.filter.petFriendly}
                </Label>
              </div>
            </div>
          )}

          {/* 필터 초기화 버튼 */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              {t.filter.reset}
            </Button>
          )}
        </div>

        {/* 모바일 레이아웃 - 가로 스크롤 */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* 지역 필터 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Select
                value={selectedAreaCode || 'all'}
                onValueChange={(value) => onAreaChange(value === 'all' ? undefined : value)}
                disabled={loadingAreas}
              >
                <SelectTrigger className="w-[120px] flex-shrink-0">
                  <SelectValue placeholder={t.filter.areaSelectMobile} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filter.all}</SelectItem>
                  {areaCodes.map((area) => (
                    <SelectItem key={area.code} value={area.code}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 관광 타입 필터 - 가로 스크롤 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Button
                variant={selectedContentTypes.length === CONTENT_TYPES.length ? 'default' : 'outline'}
                size="sm"
                onClick={toggleAllTypes}
                className="h-8 flex-shrink-0 whitespace-nowrap"
              >
                {t.filter.all}
              </Button>
              {CONTENT_TYPES.map((type) => {
                const isSelected = selectedContentTypes.includes(type);
                return (
                  <Button
                    key={type}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleContentType(type)}
                    className="h-8 flex-shrink-0 whitespace-nowrap"
                  >
                    {CONTENT_TYPE_LABELS[type]}
                  </Button>
                );
              })}
            </div>

            {/* 정렬 옵션 (모바일) */}
            {onSortChange && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Select
                  value={sortBy || 'O'}
                  onValueChange={(value) => onSortChange(value as SortOption)}
                >
                  <SelectTrigger className="w-[100px] flex-shrink-0">
                    <SelectValue placeholder={t.filter.sortPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O">{t.filter.sortByName}</SelectItem>
                    <SelectItem value="Q">{t.filter.sortByNewest}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 반려동물 필터 (모바일) */}
            {onPetFilterChange && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Dog className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pet-friendly-mobile"
                    checked={petFilterOptions?.petFriendly === true}
                    onCheckedChange={(checked) => {
                      onPetFilterChange({
                        ...petFilterOptions,
                        petFriendly: checked ? true : undefined,
                      });
                    }}
                  />
                  <Label
                    htmlFor="pet-friendly-mobile"
                    className="text-sm font-normal cursor-pointer whitespace-nowrap"
                  >
                    {t.filter.petFriendly}
                  </Label>
                </div>
              </div>
            )}

            {/* 필터 초기화 버튼 */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* 선택된 필터 표시 (모바일) */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {selectedAreaCode && (
                <Badge variant="secondary" className="gap-1">
                  {areaCodes.find((a) => a.code === selectedAreaCode)?.name || selectedAreaCode}
                  <button
                    onClick={() => onAreaChange(undefined)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedContentTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {CONTENT_TYPE_LABELS[type]}
                  <button
                    onClick={() => toggleContentType(type)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {petFilterOptions?.petFriendly && (
                <Badge variant="secondary" className="gap-1">
                  {t.filter.petFriendly}
                  <button
                    onClick={() => {
                      onPetFilterChange?.({
                        ...petFilterOptions,
                        petFriendly: undefined,
                      });
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

