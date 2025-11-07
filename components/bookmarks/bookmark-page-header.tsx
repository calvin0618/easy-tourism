/**
 * @file bookmark-page-header.tsx
 * @description 북마크 페이지 헤더 컴포넌트 (Client Component)
 */

'use client';

import { useI18n } from '@/components/providers/i18n-provider';

interface BookmarkPageHeaderProps {
  /** 북마크 개수 */
  count: number;
}

export function BookmarkPageHeader({ count }: BookmarkPageHeaderProps) {
  const { t } = useI18n();
  
  return (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.bookmarks.title}</h1>
      <p className="text-muted-foreground">
        {count > 0
          ? t.bookmarks.subtitle.replace('{count}', String(count))
          : t.bookmarks.subtitleEmpty}
      </p>
    </div>
  );
}

interface BookmarkPageErrorProps {
  /** 에러 타입 */
  type: 'user' | 'loading';
  /** 에러 메시지 (선택 사항) */
  errorMessage?: string;
}

export function BookmarkPageError({ type, errorMessage }: BookmarkPageErrorProps) {
  const { t } = useI18n();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{t.bookmarks.title}</h1>
        <p className="text-muted-foreground">
          {type === 'user'
            ? t.bookmarks.errorUserInfo
            : errorMessage || t.bookmarks.errorLoading}
        </p>
      </div>
    </div>
  );
}

