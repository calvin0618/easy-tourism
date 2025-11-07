/**
 * @file lib/api/supabase-api.ts
 * @description 북마크 관련 Supabase API 함수
 *
 * Supabase를 사용하여 북마크 기능을 제공하는 유틸리티 함수들입니다.
 * 클라이언트와 서버 컴포넌트 모두에서 사용할 수 있습니다.
 *
 * 주요 기능:
 * - 북마크 추가/삭제
 * - 사용자 북마크 목록 조회
 * - 북마크 여부 확인
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 *
 * @example
 * ```tsx
 * // 클라이언트 컴포넌트에서 사용
 * 'use client';
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { addBookmark } from '@/lib/api/supabase-api';
 *
 * const supabase = useClerkSupabaseClient();
 * const userId = 'user-uuid';
 * await addBookmark(supabase, userId, '125266');
 * ```
 *
 * @example
 * ```tsx
 * // 서버 컴포넌트에서 사용
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 * import { getUserBookmarks } from '@/lib/api/supabase-api';
 *
 * const supabase = createClerkSupabaseClient();
 * const userId = 'user-uuid';
 * const bookmarks = await getUserBookmarks(supabase, userId);
 * ```
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 북마크 타입 정의
 */
export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

/**
 * 북마크 추가
 *
 * @param userId - 사용자 ID (Supabase users 테이블의 id, UUID)
 * @param contentId - 관광지 contentId (TEXT)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항, 없으면 내부에서 생성)
 * @returns 성공 여부와 에러 메시지
 *
 * @example
 * ```ts
 * // 클라이언트 컴포넌트에서 사용
 * const supabase = useClerkSupabaseClient();
 * const result = await addBookmark(userId, '125266', supabase);
 *
 * // 서버 컴포넌트에서 사용
 * const supabase = createClerkSupabaseClient();
 * const result = await addBookmark(userId, '125266', supabase);
 * ```
 */
export async function addBookmark(
  userId: string,
  contentId: string,
  supabase?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    console.group('[북마크 API] 북마크 추가 시도');
    console.log('userId:', userId);
    console.log('contentId:', contentId);

    // 입력값 검증
    if (!userId || !contentId) {
      console.error('입력값 검증 실패: userId 또는 contentId가 없습니다.');
      return { success: false, error: '필수 파라미터가 누락되었습니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // 북마크 추가 (중복 체크는 UNIQUE 제약조건으로 처리)
    const { error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        content_id: contentId,
      });

    if (insertError) {
      // 중복 북마크인 경우 (UNIQUE 제약조건 위반)
      if (insertError.code === '23505') {
        console.log('이미 북마크된 항목입니다.');
        console.groupEnd();
        return { success: false, error: '이미 북마크된 항목입니다.' };
      }

      console.error('북마크 추가 실패:', insertError);
      console.groupEnd();
      return { success: false, error: '북마크 추가에 실패했습니다.' };
    }

    console.log('북마크 추가 성공');
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error('북마크 추가 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 북마크 삭제
 *
 * @param userId - 사용자 ID (Supabase users 테이블의 id, UUID)
 * @param contentId - 관광지 contentId (TEXT)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항, 없으면 내부에서 생성)
 * @returns 성공 여부와 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await removeBookmark(userId, '125266', supabase);
 * ```
 */
export async function removeBookmark(
  userId: string,
  contentId: string,
  supabase?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    console.group('[북마크 API] 북마크 삭제 시도');
    console.log('userId:', userId);
    console.log('contentId:', contentId);

    // 입력값 검증
    if (!userId || !contentId) {
      console.error('입력값 검증 실패: userId 또는 contentId가 없습니다.');
      return { success: false, error: '필수 파라미터가 누락되었습니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // 북마크 삭제
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (deleteError) {
      console.error('북마크 삭제 실패:', deleteError);
      console.groupEnd();
      return { success: false, error: '북마크 삭제에 실패했습니다.' };
    }

    console.log('북마크 삭제 성공');
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error('북마크 삭제 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 사용자 북마크 목록 조회
 *
 * @param userId - 사용자 ID (Supabase users 테이블의 id, UUID)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항, 없으면 내부에서 생성)
 * @returns 성공 여부, 북마크 목록 데이터, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await getUserBookmarks(userId, supabase);
 * if (result.success && result.data) {
 *   console.log('북마크 개수:', result.data.length);
 * }
 * ```
 */
export async function getUserBookmarks(
  userId: string,
  supabase?: SupabaseClient
): Promise<{
  success: boolean;
  data?: Bookmark[];
  error?: string;
}> {
  try {
    console.group('[북마크 API] 북마크 목록 조회');
    console.log('userId:', userId);

    // 입력값 검증
    if (!userId) {
      console.error('입력값 검증 실패: userId가 없습니다.');
      return { success: false, error: '사용자 ID가 필요합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // 북마크 목록 조회 (최신순 정렬)
    const { data, error: fetchError } = await supabase
      .from('bookmarks')
      .select('id, user_id, content_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('북마크 목록 조회 실패:', fetchError);
      console.groupEnd();
      return { success: false, error: '북마크 목록을 불러올 수 없습니다.' };
    }

    console.log('북마크 목록 조회 성공:', data?.length || 0, '개');
    console.groupEnd();
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('북마크 목록 조회 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 북마크 여부 확인
 *
 * @param userId - 사용자 ID (Supabase users 테이블의 id, UUID)
 * @param contentId - 관광지 contentId (TEXT)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항, 없으면 내부에서 생성)
 * @returns 북마크 여부 (true/false)와 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await isBookmarked(userId, '125266', supabase);
 * if (result.isBookmarked) {
 *   console.log('이미 북마크된 항목입니다.');
 * }
 * ```
 */
export async function isBookmarked(
  userId: string,
  contentId: string,
  supabase?: SupabaseClient
): Promise<{ isBookmarked: boolean; error?: string }> {
  try {
    console.group('[북마크 API] 북마크 여부 확인');
    console.log('userId:', userId);
    console.log('contentId:', contentId);

    // 입력값 검증
    if (!userId || !contentId) {
      console.error('입력값 검증 실패: userId 또는 contentId가 없습니다.');
      return { isBookmarked: false, error: '필수 파라미터가 누락되었습니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { isBookmarked: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // 북마크 존재 여부 확인
    const { data, error: fetchError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .limit(1)
      .single();

    if (fetchError) {
      // 데이터가 없는 경우 (PGRST116: No rows returned)
      if (fetchError.code === 'PGRST116') {
        console.log('북마크되지 않은 항목입니다.');
        console.groupEnd();
        return { isBookmarked: false };
      }

      console.error('북마크 여부 확인 실패:', fetchError);
      console.groupEnd();
      return { isBookmarked: false, error: '북마크 여부를 확인할 수 없습니다.' };
    }

    const isBookmarked = !!data;
    console.log('북마크 여부:', isBookmarked);
    console.groupEnd();
    return { isBookmarked };
  } catch (error) {
    console.error('북마크 여부 확인 중 예상치 못한 오류:', error);
    return { isBookmarked: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

