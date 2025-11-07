/**
 * @file view-toggle.tsx
 * @description 뷰 전환 컴포넌트 (모바일용)
 *
 * 모바일에서 목록/지도 뷰를 전환하는 탭 컴포넌트입니다.
 * Design.md의 모바일 레이아웃 참고.
 */

'use client';

import { FileText, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/utils';

type ViewType = 'list' | 'map';

interface ViewToggleProps {
  /** 현재 선택된 뷰 */
  currentView: ViewType;
  /** 뷰 변경 핸들러 */
  onViewChange: (view: ViewType) => void;
  /** 추가 클래스명 */
  className?: string;
}

export function ViewToggle({ currentView, onViewChange, className }: ViewToggleProps) {
  const { t } = useI18n();
  
  return (
    <div
      className={cn(
        'flex gap-2 p-2 bg-background border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2',
          currentView === 'list' && 'bg-blue-600 hover:bg-blue-700 text-white'
        )}
      >
        <FileText className="w-4 h-4" />
        <span>{t.viewToggle.list}</span>
      </Button>
      <Button
        variant={currentView === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('map')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2',
          currentView === 'map' && 'bg-blue-600 hover:bg-blue-700 text-white'
        )}
      >
        <Map className="w-4 h-4" />
        <span>{t.viewToggle.map}</span>
      </Button>
    </div>
  );
}

