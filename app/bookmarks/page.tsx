/**
 * @file app/bookmarks/page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 * PRD.md 2.4.5 북마크 목록 페이지 요구사항을 참고하여 작성되었습니다.
 *
 * Phase 4.4: 북마크 목록 페이지
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { getUserBookmarks } from '@/lib/api/supabase-api';
import { getDetailCommon } from '@/lib/api/tour-api';
import { BookmarkList } from '@/components/bookmarks/bookmark-list';
import { BookmarkPageHeader, BookmarkPageError } from '@/components/bookmarks/bookmark-page-header';
import type { TourDetail } from '@/lib/types/tour';
import type { Bookmark } from '@/lib/api/supabase-api';

/**
 * 북마크와 관광지 정보를 결합한 타입
 */
export interface BookmarkWithTour {
  bookmark: Bookmark;
  tour: TourDetail;
}

/**
 * TourDetail을 TourItem 형태로 변환 (TourCard 호환)
 */
function tourDetailToItem(detail: TourDetail): import('@/lib/types/tour').TourItem {
  return {
    contentid: detail.contentid,
    contenttypeid: detail.contenttypeid,
    title: detail.title,
    addr1: detail.addr1,
    addr2: detail.addr2,
    areacode: '', // detailCommon에는 areacode가 없으므로 빈 문자열
    mapx: detail.mapx,
    mapy: detail.mapy,
    firstimage: detail.firstimage,
    firstimage2: detail.firstimage2,
    tel: detail.tel,
    cat1: undefined,
    cat2: undefined,
    cat3: undefined,
    modifiedtime: '', // detailCommon에는 modifiedtime이 없으므로 빈 문자열
  };
}

export default async function BookmarksPage() {
  console.group('[Bookmarks Page] 페이지 로드');
  
  // Clerk 인증 확인
  const { userId } = await auth();
  
  if (!userId) {
    console.log('[Bookmarks Page] 인증되지 않은 사용자 - 리다이렉트');
    console.groupEnd();
    redirect('/sign-in');
  }

  console.log('[Bookmarks Page] Clerk 사용자 ID:', userId);

  // Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // Supabase users 테이블에서 사용자 ID 조회
  const { data: dbUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (userError || !dbUser) {
    console.error('[Bookmarks Page] 사용자 조회 실패:', userError);
    console.groupEnd();
    return <BookmarkPageError type="user" />;
  }

  console.log('[Bookmarks Page] DB 사용자 ID:', dbUser.id);

  // 북마크 목록 조회
  const bookmarksResult = await getUserBookmarks(dbUser.id, supabase);

  if (!bookmarksResult.success || !bookmarksResult.data) {
    console.error('[Bookmarks Page] 북마크 목록 조회 실패:', bookmarksResult.error);
    console.groupEnd();
    return <BookmarkPageError type="loading" errorMessage={bookmarksResult.error} />;
  }

  const bookmarks = bookmarksResult.data;
  console.log('[Bookmarks Page] 북마크 개수:', bookmarks.length);

  // 각 북마크의 관광지 정보 조회
  const bookmarkWithTours: BookmarkWithTour[] = [];
  const errors: string[] = [];

  // 병렬로 관광지 정보 조회 (성능 최적화)
  const tourPromises = bookmarks.map(async (bookmark) => {
    try {
      console.log('[Bookmarks Page] 관광지 정보 조회:', bookmark.content_id);
      const tour = await getDetailCommon(bookmark.content_id);
      return { bookmark, tour, error: null };
    } catch (error) {
      console.error(
        '[Bookmarks Page] 관광지 정보 조회 실패:',
        bookmark.content_id,
        error
      );
      return {
        bookmark,
        tour: null,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  });

  const results = await Promise.allSettled(tourPromises);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { bookmark, tour, error } = result.value;
      if (tour) {
        bookmarkWithTours.push({ bookmark, tour });
      } else if (error) {
        errors.push(`${bookmark.content_id}: ${error}`);
      }
    } else {
      errors.push(`${bookmarks[index].content_id}: ${result.reason}`);
    }
  });

  if (errors.length > 0) {
    console.warn('[Bookmarks Page] 일부 관광지 정보 조회 실패:', errors);
  }

  console.log('[Bookmarks Page] 로드 완료:', bookmarkWithTours.length, '개');
  console.groupEnd();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 페이지 제목 */}
        <BookmarkPageHeader count={bookmarkWithTours.length} />

        {/* 북마크 목록 */}
        <BookmarkList
          bookmarks={bookmarkWithTours.map((item) => ({
            bookmark: item.bookmark,
            tour: tourDetailToItem(item.tour),
          }))}
        />
      </div>
    </div>
  );
}

