/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 로딩 상태를 표시하는 스피너 컴포넌트입니다.
 * 다양한 크기와 스타일을 지원합니다.
 */

import { cn } from '@/lib/utils';

interface LoadingProps {
  /** 크기 (sm, md, lg) */
  size?: 'sm' | 'md' | 'lg';
  /** 전체 화면 로딩 여부 */
  fullScreen?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** 로딩 메시지 */
  message?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export function Loading({
  size = 'md',
  fullScreen = false,
  className,
  message,
}: LoadingProps) {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent border-primary',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
        {message && (
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {message && (
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

