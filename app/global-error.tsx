/**
 * @file global-error.tsx
 * @description 최상위 전역 에러 핸들링 컴포넌트
 *
 * Next.js App Router의 global-error.tsx는 최상위 레이아웃(root layout)에서 발생한 에러를 처리합니다.
 * error.tsx와 달리, global-error.tsx는 <html> 태그를 포함해야 합니다.
 *
 * 참고: https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 에러 로깅 (실제 프로덕션에서는 에러 리포팅 서비스로 전송)
    console.error('[Global Error Boundary] 최상위 레이아웃에서 에러 발생:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>심각한 오류가 발생했습니다</CardTitle>
              </div>
              <CardDescription>
                애플리케이션의 최상위 레이아웃에서 예상치 못한 오류가 발생했습니다.
                페이지를 새로고침하거나 홈으로 돌아가세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>에러 메시지:</strong> {error.message || '알 수 없는 오류'}
                </p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground">
                    <strong>에러 ID:</strong> {error.digest}
                  </p>
                )}
                {process.env.NODE_ENV === 'development' && error.stack && (
                  <details className="mt-4 p-4 bg-destructive/10 rounded-md">
                    <summary className="cursor-pointer font-medium mb-2 text-sm">
                      스택 트레이스 (개발 모드)
                    </summary>
                    <pre className="text-xs overflow-auto text-left whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={reset} variant="default" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  홈으로
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}

