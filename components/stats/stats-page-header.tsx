/**
 * @file stats-page-header.tsx
 * @description 통계 페이지 헤더 컴포넌트 (Client Component)
 */

'use client';

import { useI18n } from '@/components/providers/i18n-provider';

export function StatsPageHeader() {
  const { t } = useI18n();
  
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{t.stats.title}</h1>
      <p className="text-muted-foreground">
        {t.stats.description}
      </p>
    </div>
  );
}

