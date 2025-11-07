/**
 * @file not-found.tsx
 * @description 404 페이지 컴포넌트
 *
 * Next.js App Router의 not-found.tsx는 404 에러를 처리합니다.
 * 이 파일은 해당 라우트 세그먼트에서 notFound()가 호출되거나
 * 존재하지 않는 경로로 접근할 때 표시됩니다.
 *
 * 참고: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <MapPin className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription className="text-lg">
            페이지를 찾을 수 없습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            <br />
            URL을 확인하시거나 홈으로 돌아가서 다시 시도해주세요.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              가능한 원인:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>잘못된 URL 입력</li>
              <li>삭제된 관광지 정보</li>
              <li>페이지 경로 변경</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="default" className="w-full sm:flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:flex-1">
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              관광지 검색하기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

