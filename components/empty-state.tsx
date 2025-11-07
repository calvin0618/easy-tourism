/**
 * @file empty-state.tsx
 * @description 빈 상태 표시 컴포넌트
 *
 * 데이터가 없을 때 표시하는 빈 상태 컴포넌트입니다.
 * 다양한 상황에 맞춰 사용할 수 있습니다.
 */

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** 아이콘 */
  icon?: LucideIcon;
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 액션 버튼 라벨 */
  actionLabel?: string;
  /** 액션 버튼 핸들러 */
  onAction?: () => void;
  /** 추가 클래스명 */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const { t } = useI18n();
  const defaultTitle = title || t.emptyState.noData;
  
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <Icon className="w-16 h-16 text-muted-foreground/50 mb-4" />
      )}
      <h3 className="text-lg font-semibold mb-2">{defaultTitle}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * 검색 결과 없음 컴포넌트
 */
export function EmptySearchResults({
  searchKeyword,
  onReset,
}: {
  searchKeyword?: string;
  onReset?: () => void;
}) {
  const { t } = useI18n();
  
  return (
    <EmptyState
      title={t.emptyState.noSearchResults}
      description={
        searchKeyword
          ? t.emptyState.noSearchResultsDesc.replace('{keyword}', searchKeyword)
          : t.emptyState.noSearchResultsTryOther
      }
      actionLabel={t.emptyState.resetSearch}
      onAction={onReset}
    />
  );
}

/**
 * 관광지 목록 없음 컴포넌트
 */
export function EmptyTourList({
  onReset,
  isPetFilterActive,
}: {
  onReset?: () => void;
  isPetFilterActive?: boolean;
}) {
  const { t } = useI18n();
  
  return (
    <EmptyState
      title={t.emptyState.noTours}
      description={
        isPetFilterActive
          ? t.emptyState.noToursPetFilter
          : t.emptyState.noToursDesc
      }
      actionLabel={t.emptyState.resetFilters}
      onAction={onReset}
    />
  );
}

