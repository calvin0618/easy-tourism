import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextFetchEvent } from 'next/server';

// 환경 변수 확인 (런타임에서 확인)
function isClerkConfigured(): boolean {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  return !!(clerkPublishableKey && clerkSecretKey);
}

// 메인 미들웨어 함수
export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  // Clerk가 설정되어 있으면 Clerk 미들웨어 사용
  if (isClerkConfigured()) {
    try {
      const clerkHandler = clerkMiddleware();
      return await clerkHandler(request, event);
    } catch (error) {
      console.error('[Middleware] Clerk 미들웨어 오류:', error);
      // 오류 발생 시 기본 응답 반환
      return NextResponse.next();
    }
  }

  // Clerk가 설정되지 않았으면 기본 응답 반환
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
