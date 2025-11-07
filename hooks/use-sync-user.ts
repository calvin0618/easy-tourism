"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 훅
 *
 * 사용자가 로그인한 상태에서 이 훅을 사용하면
 * 자동으로 /api/sync-user를 호출하여 Supabase users 테이블에 사용자 정보를 저장합니다.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useSyncUser } from '@/hooks/use-sync-user';
 *
 * export default function Layout({ children }) {
 *   useSyncUser();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useSyncUser() {
  // Hook은 항상 호출되어야 하므로 조건부로 호출하지 않음
  // ClerkProvider가 없을 때는 useAuth()가 에러를 던질 수 있으므로
  // 안전하게 처리하기 위해 try-catch 사용
  let isLoaded = false;
  let userId: string | null = null;
  
  try {
    const auth = useAuth();
    isLoaded = auth.isLoaded;
    userId = auth.userId;
  } catch (error) {
    // Clerk가 초기화되지 않았을 때는 무시
    // 환경 변수가 없거나 ClerkProvider가 없을 때 발생할 수 있음
    console.warn('[useSyncUser] Clerk가 초기화되지 않았습니다:', error);
  }

  const syncedRef = useRef(false);
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    // 환경 변수가 없거나, 이미 동기화했거나, 로딩 중이거나, 로그인하지 않은 경우 무시
    if (!clerkPublishableKey || syncedRef.current || !isLoaded || !userId) {
      return;
    }

    // 동기화 실행
    const syncUser = async () => {
      try {
        const response = await fetch("/api/sync-user", {
          method: "POST",
        });

        if (!response.ok) {
          console.error("Failed to sync user:", await response.text());
          return;
        }

        syncedRef.current = true;
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [clerkPublishableKey, isLoaded, userId]);
}
