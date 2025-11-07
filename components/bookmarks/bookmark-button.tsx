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
import { useAuth } from '@clerk/nextjs';
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { addBookmark, removeBookmark } from '@/lib/api/bookmark-api';

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

  /**
   * 북마크 상태 확인
   */
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!isSignedIn || !userId) {
        setIsBookmarked(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // users 테이블에서 clerk_id로 사용자 찾기
        const { data: dbUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (userError || !dbUser) {
          console.log('[BookmarkButton] 사용자 조회 실패:', userError);
          setIsBookmarked(false);
          setIsLoading(false);
          return;
        }

        // 북마크 여부 확인
        const { data, error: checkError } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', dbUser.id)
          .eq('content_id', contentId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116은 "no rows returned" 에러 (북마크 없음)
          throw checkError;
        }

        setIsBookmarked(!!data);
        console.log('[BookmarkButton] 북마크 상태 확인:', !!data);
      } catch (error) {
        console.error('[BookmarkButton] 북마크 상태 확인 중 오류:', error);
        setIsBookmarked(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkBookmarkStatus();
  }, [contentId, isSignedIn, userId, supabase]);

  /**
   * 북마크 토글 (추가/제거)
   */
  const handleToggle = async () => {
    // 로그인하지 않은 경우
    if (!isSignedIn) {
      toast.info('북마크 기능을 사용하려면 로그인이 필요합니다.');
      return;
    }

    if (isToggling) return;

    try {
      setIsToggling(true);
      console.group('[BookmarkButton] 북마크 토글');
      console.log('contentId:', contentId);
      console.log('현재 상태:', isBookmarked ? '북마크됨' : '북마크 안됨');

      let result;
      if (isBookmarked) {
        // 북마크 제거
        result = await removeBookmark(contentId);
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
        result = await addBookmark(contentId);
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

  return (
    <Button
      onClick={handleToggle}
      size={size}
      variant={variant}
      className={className}
      disabled={isLoading || isToggling}
      aria-label={isBookmarked ? '북마크 제거' : '북마크 추가'}
    >
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
    </Button>
  );
}

