/**
 * @file components/bookmarks/bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지 상세페이지에서 북마크를 추가/제거하는 버튼입니다.
 * PRD.md 2.4.5 북마크 기능 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 별 아이콘으로 북마크 상태 표시 (채워짐/비어있음)
 * - 클릭 시 북마크 추가/제거
 * - Clerk 인증 확인
 *   - 로그인 O: Supabase DB에 저장
 *   - 로그인 X: localStorage 임시 저장 + 로그인 유도
 * - 로딩 상태 및 에러 처리
 *
 * @dependencies
 * - @clerk/nextjs: Clerk 인증
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lucide-react: 아이콘
 * - sonner: 토스트 메시지
 */

'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { addBookmark, removeBookmark, isBookmarked as checkIsBookmarked } from '@/lib/api/supabase-api';

interface BookmarkButtonProps {
  /** 관광지 contentId */
  contentId: string;
  /** 버튼 크기 */
  size?: 'sm' | 'default' | 'lg' | 'icon';
  /** 버튼 variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 북마크 버튼 컴포넌트
 */
// localStorage 키
const BOOKMARKS_STORAGE_KEY = 'my-trip-bookmarks-temp';

/**
 * localStorage에서 임시 북마크 목록 가져오기
 */
function getTempBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * localStorage에 임시 북마크 저장
 */
function saveTempBookmark(contentId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const bookmarks = getTempBookmarks();
    if (!bookmarks.includes(contentId)) {
      bookmarks.push(contentId);
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    }
  } catch (error) {
    console.error('[BookmarkButton] localStorage 저장 실패:', error);
  }
}

/**
 * localStorage에서 임시 북마크 제거
 */
function removeTempBookmark(contentId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const bookmarks = getTempBookmarks();
    const filtered = bookmarks.filter((id) => id !== contentId);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[BookmarkButton] localStorage 삭제 실패:', error);
  }
}

export function BookmarkButton({
  contentId,
  size = 'default',
  variant = 'outline',
  className,
}: BookmarkButtonProps) {
  const { isSignedIn, userId } = useAuth();
  const supabase = useClerkSupabaseClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);

  /**
   * Supabase users 테이블에서 사용자 ID 조회
   */
  useEffect(() => {
    async function fetchDbUserId() {
      if (!isSignedIn || !userId) {
        setDbUserId(null);
        return;
      }

      try {
        console.group('[BookmarkButton] 사용자 ID 조회');
        const { data: dbUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (userError || !dbUser) {
          console.log('[BookmarkButton] 사용자 조회 실패:', userError);
          setDbUserId(null);
          console.groupEnd();
          return;
        }

        console.log('[BookmarkButton] DB 사용자 ID:', dbUser.id);
        setDbUserId(dbUser.id);
        console.groupEnd();
      } catch (error) {
        console.error('[BookmarkButton] 사용자 ID 조회 중 오류:', error);
        setDbUserId(null);
      }
    }

    fetchDbUserId();
  }, [isSignedIn, userId, supabase]);

  /**
   * 북마크 상태 확인
   */
  useEffect(() => {
    async function checkBookmarkStatus() {
      // 로그인하지 않은 경우: localStorage 확인
      if (!isSignedIn || !userId) {
        const tempBookmarks = getTempBookmarks();
        setIsBookmarked(tempBookmarks.includes(contentId));
        setIsLoading(false);
        return;
      }

      // DB 사용자 ID가 아직 로드되지 않은 경우 대기
      if (!dbUserId) {
        setIsLoading(true);
        return;
      }

      try {
        setIsLoading(true);
        console.group('[BookmarkButton] 북마크 상태 확인');
        console.log('contentId:', contentId);
        console.log('dbUserId:', dbUserId);

        // checkIsBookmarked 함수 사용
        const result = await checkIsBookmarked(dbUserId, contentId, supabase);
        
        if (result.error) {
          console.error('[BookmarkButton] 북마크 상태 확인 실패:', result.error);
          setIsBookmarked(false);
        } else {
          setIsBookmarked(result.isBookmarked);
          console.log('[BookmarkButton] 북마크 상태:', result.isBookmarked);
        }
        console.groupEnd();
      } catch (error) {
        console.error('[BookmarkButton] 북마크 상태 확인 중 오류:', error);
        setIsBookmarked(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkBookmarkStatus();
  }, [contentId, isSignedIn, userId, dbUserId, supabase]);

  /**
   * 북마크 토글 (추가/제거)
   * 로그인한 사용자만 사용 가능
   */
  const handleToggle = async () => {
    if (isToggling) return;

    // 로그인하지 않은 경우는 SignInButton이 처리하므로 여기서는 처리하지 않음
    if (!isSignedIn || !userId) {
      return;
    }

    // DB 사용자 ID가 없는 경우
    if (!dbUserId) {
      toast.error('사용자 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      setIsToggling(true);
      console.group('[BookmarkButton] 북마크 토글');
      console.log('contentId:', contentId);
      console.log('dbUserId:', dbUserId);
      console.log('현재 상태:', isBookmarked ? '북마크됨' : '북마크 안됨');

      let result;
      if (isBookmarked) {
        // 북마크 제거
        result = await removeBookmark(dbUserId, contentId, supabase);
        if (result.success) {
          setIsBookmarked(false);
          toast.success('북마크가 제거되었습니다.');
          console.log('[BookmarkButton] 북마크 제거 성공');
        } else {
          toast.error(result.error || '북마크 제거에 실패했습니다.');
          console.error('[BookmarkButton] 북마크 제거 실패:', result.error);
        }
      } else {
        // 북마크 추가
        result = await addBookmark(dbUserId, contentId, supabase);
        if (result.success) {
          setIsBookmarked(true);
          toast.success('북마크에 추가되었습니다.');
          console.log('[BookmarkButton] 북마크 추가 성공');
        } else {
          // 중복 북마크인 경우는 이미 북마크된 것으로 처리
          if (result.error?.includes('이미 북마크')) {
            setIsBookmarked(true);
            toast.info('이미 북마크된 항목입니다.');
          } else {
            toast.error(result.error || '북마크 추가에 실패했습니다.');
            console.error('[BookmarkButton] 북마크 추가 실패:', result.error);
          }
        }
      }
      console.groupEnd();
    } catch (error) {
      console.error('[BookmarkButton] 북마크 토글 중 오류:', error);
      toast.error('북마크 처리 중 오류가 발생했습니다.');
    } finally {
      setIsToggling(false);
    }
  };

  // 북마크 버튼 내용
  const buttonContent = (
    <>
      <Star
        className={`w-4 h-4 ${size === 'icon' ? '' : 'mr-2'} ${
          isBookmarked
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-none text-muted-foreground'
        } ${isToggling ? 'opacity-50' : ''}`}
      />
      {size !== 'icon' && (
        <span>{isBookmarked ? '북마크됨' : '북마크'}</span>
      )}
    </>
  );

  // 로그인하지 않은 경우: SignInButton으로 감싸서 로그인 팝업 표시
  if (!isSignedIn || !userId) {
    return (
      <SignInButton mode="modal">
        <Button
          size={size}
          variant={variant}
          className={className}
          disabled={isLoading}
          aria-label="북마크 추가 (로그인 필요)"
        >
          {buttonContent}
        </Button>
      </SignInButton>
    );
  }

  // 로그인한 경우: 기존 북마크 토글 기능 사용
  return (
    <Button
      onClick={handleToggle}
      size={size}
      variant={variant}
      className={className}
      disabled={isLoading || isToggling}
      aria-label={isBookmarked ? '북마크 제거' : '북마크 추가'}
    >
      {buttonContent}
    </Button>
  );
}

