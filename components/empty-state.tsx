/**
 * @file empty-state.tsx
 * @description 빈 상태 표시 컴포넌트
 *
 * 데이터가 없을 때 표시하는 빈 상태 컴포넌트입니다.
 * 다양한 상황에 맞춰 사용할 수 있습니다.
 */

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  title = '데이터가 없습니다',
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
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
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
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
  return (
    <EmptyState
      title="검색 결과가 없습니다"
      description={
        searchKeyword
          ? `"${searchKeyword}"에 대한 검색 결과를 찾을 수 없습니다.`
          : '다른 검색어로 시도해보세요.'
      }
      actionLabel="검색 초기화"
      onAction={onReset}
    />
  );
}

/**
 * 관광지 목록 없음 컴포넌트
 */
export function EmptyTourList({
  onReset,
}: {
  onReset?: () => void;
}) {
  return (
    <EmptyState
      title="관광지가 없습니다"
      description="선택한 조건에 맞는 관광지가 없습니다. 다른 필터를 선택해보세요."
      actionLabel="필터 초기화"
      onAction={onReset}
    />
  );
}

