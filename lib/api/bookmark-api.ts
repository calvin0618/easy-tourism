/**
 * @file lib/api/bookmark-api.ts
 * @description 북마크 관련 API 함수 (Server Actions)
 *
 * Supabase를 사용하여 북마크 기능을 제공합니다.
 * - 북마크 추가/삭제
 * - 사용자 북마크 목록 조회
 * - 북마크 여부 확인
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 * - @clerk/nextjs: Clerk 인증
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { getServiceRoleClient } from '@/lib/supabase/service-role';

/**
 * 북마크 추가 (Server Action)
 */
export async function addBookmark(contentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.group('[북마크 API] 북마크 추가 시도');
    console.log('contentId:', contentId);

    // Clerk 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      console.error('인증 실패: 로그인 필요');
      return { success: false, error: '로그인이 필요합니다.' };
    }

    console.log('Clerk 사용자 ID:', userId);

    // Supabase에 사용자 정보 조회 (service role 사용)
    const supabase = getServiceRoleClient();

    // users 테이블에서 clerk_id로 사용자 찾기
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !dbUser) {
      console.error('사용자 조회 실패:', userError);
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }

    console.log('DB 사용자 ID:', dbUser.id);

    // 북마크 추가 (중복 체크는 UNIQUE 제약조건으로 처리)
    const { error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: dbUser.id,
        content_id: contentId,
      });

    if (insertError) {
      // 중복 북마크인 경우
      if (insertError.code === '23505') {
        console.log('이미 북마크된 항목입니다.');
        return { success: false, error: '이미 북마크된 항목입니다.' };
      }
      console.error('북마크 추가 실패:', insertError);
      return { success: false, error: '북마크 추가에 실패했습니다.' };
    }

    console.log('북마크 추가 성공');
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error('북마크 추가 중 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 북마크 삭제 (Server Action)
 */
export async function removeBookmark(contentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.group('[북마크 API] 북마크 삭제 시도');
    console.log('contentId:', contentId);

    // Clerk 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      console.error('인증 실패: 로그인 필요');
      return { success: false, error: '로그인이 필요합니다.' };
    }

    console.log('Clerk 사용자 ID:', userId);

    // Supabase에 사용자 정보 조회 (service role 사용)
    const supabase = getServiceRoleClient();

    // users 테이블에서 clerk_id로 사용자 찾기
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !dbUser) {
      console.error('사용자 조회 실패:', userError);
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }

    console.log('DB 사용자 ID:', dbUser.id);

    // 북마크 삭제
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', dbUser.id)
      .eq('content_id', contentId);

    if (deleteError) {
      console.error('북마크 삭제 실패:', deleteError);
      return { success: false, error: '북마크 삭제에 실패했습니다.' };
    }

    console.log('북마크 삭제 성공');
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error('북마크 삭제 중 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}


/**
 * 사용자 북마크 목록 조회 (Server Action)
 */
export async function getUserBookmarks(): Promise<{
  success: boolean;
  data?: Array<{ id: string; content_id: string; created_at: string }>;
  error?: string;
}> {
  try {
    console.group('[북마크 API] 북마크 목록 조회');
    
    // Clerk 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      console.error('인증 실패: 로그인 필요');
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Supabase에 사용자 정보 조회 (service role 사용)
    const supabase = getServiceRoleClient();

    // users 테이블에서 clerk_id로 사용자 찾기
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !dbUser) {
      console.error('사용자 조회 실패:', userError);
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }

    // 북마크 목록 조회
    const { data, error: fetchError } = await supabase
      .from('bookmarks')
      .select('id, content_id, created_at')
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('북마크 목록 조회 실패:', fetchError);
      return { success: false, error: '북마크 목록을 불러올 수 없습니다.' };
    }

    console.log('북마크 목록 조회 성공:', data?.length || 0, '개');
    console.groupEnd();
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('북마크 목록 조회 중 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

