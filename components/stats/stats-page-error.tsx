/**
 * @file stats-page-error.tsx
 * @description 통계 페이지 에러 컴포넌트 (Client Component)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { RefreshButton } from '@/components/stats/refresh-button';
import { useI18n } from '@/components/providers/i18n-provider';

export function StatsPageError() {
  const { t } = useI18n();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          {t.stats.error}
        </CardTitle>
        <CardDescription>
          {t.stats.errorLoading}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {t.stats.errorDescription}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="default">
            <Link href="/">
              {t.stats.backToHome}
            </Link>
          </Button>
          <RefreshButton />
        </div>
      </CardContent>
    </Card>
  );
}

