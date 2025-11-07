/**
 * @file refresh-button.tsx
 * @description 새로고침 버튼 컴포넌트
 *
 * 클라이언트 사이드에서 페이지를 새로고침하는 버튼입니다.
 */

'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.location.reload()}
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      다시 시도
    </Button>
  );
}

