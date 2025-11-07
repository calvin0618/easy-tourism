/**
 * @file components/bookmarks/bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 * PRD.md 2.4.5 북마크 목록 페이지 요구사항을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 북마크한 관광지 목록 표시
 * - 북마크 날짜 표시
 * - 개별 삭제 버튼
 * - 일괄 삭제 기능 (체크박스)
 * - 정렬 기능 (최신순, 이름순, 지역별)
 * - 빈 상태 처리
 *
 * @dependencies
 * - @clerk/nextjs: Clerk 인증
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lucide-react: 아이콘
 * - sonner: 토스트 메시지
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Trash2, Calendar, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { removeBookmark } from '@/lib/api/supabase-api';
import type { TourItem } from '@/lib/types/tour';
import type { Bookmark } from '@/lib/api/supabase-api';
import { CONTENT_TYPE_LABELS } from '@/lib/types/tour';
import { cn } from '@/lib/utils';

/**
 * 북마크와 관광지 정보를 결합한 타입
 */
export interface BookmarkWithTourItem {
  bookmark: Bookmark;
  tour: TourItem;
}

/**
 * 정렬 옵션 타입
 */
export type BookmarkSortOption = 'latest' | 'name' | 'region';

interface BookmarkListProps {
  /** 북마크와 관광지 정보 배열 */
  bookmarks: BookmarkWithTourItem[];
}

/**
 * 이미지 URL 검증
 */
function isValidImageUrl(imageUrl?: string): boolean {
  return !!(imageUrl && imageUrl.trim() !== '' && imageUrl !== 'null');
}

/**
 * 주소 표시 (addr1 + addr2)
 */
function getFullAddress(tour: TourItem): string {
  const addr = tour.addr1 || '';
  const addr2 = tour.addr2 || '';
  return addr2 ? `${addr} ${addr2}` : addr;
}

/**
 * 날짜 포맷팅 (YYYY.MM.DD)
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return dateString;
  }
}

/**
 * 주소에서 지역명 추출 (예: "서울특별시 종로구" -> "서울")
 */
function extractRegion(addr: string): string {
  if (!addr) return '';
  // 시/도 단위 추출 (서울, 부산, 경기 등)
  const match = addr.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
  return match ? match[1] : addr.split(' ')[0] || '';
}

/**
 * 북마크 카드 컴포넌트
 */
function BookmarkCard({
  bookmark,
  tour,
  onDelete,
  isDeleting,
  isSelected,
  onSelect,
}: {
  bookmark: Bookmark;
  tour: TourItem;
  onDelete: (contentId: string) => void;
  isDeleting: boolean;
  isSelected?: boolean;
  onSelect?: (contentId: string, selected: boolean) => void;
}) {
  const imageUrl = tour.firstimage || tour.firstimage2;
  const hasImage = isValidImageUrl(imageUrl);
  const [imageError, setImageError] = useState(false);
  const fullAddress = getFullAddress(tour);
  const contentTypeLabel =
    CONTENT_TYPE_LABELS[tour.contenttypeid as keyof typeof CONTENT_TYPE_LABELS] ||
    '관광지';
  const showPlaceholder = !hasImage || imageError;
  const bookmarkDate = formatDate(bookmark.created_at);

  return (
    <Card
      className={cn(
        'group transition-all duration-300',
        'hover:shadow-xl',
        'border border-gray-200 dark:border-gray-700',
        'overflow-hidden',
        isDeleting && 'opacity-50',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      <div className="flex gap-4 p-4">
        {/* 체크박스 */}
        <div className="flex-shrink-0 flex items-center">
          <Checkbox
            checked={isSelected || false}
            onCheckedChange={(checked) =>
              onSelect?.(tour.contentid, checked === true)
            }
            aria-label={`${tour.title} 선택`}
          />
        </div>

        {/* 썸네일 이미지 */}
        <Link
          href={`/places/${tour.contentid}`}
          className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          {showPlaceholder ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900">
              <MapPin className="w-8 h-8 text-muted-foreground/50" />
            </div>
          ) : (
            <Image
              src={imageUrl!}
              alt={tour.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 128px, 160px"
              onError={() => setImageError(true)}
            />
          )}
        </Link>

        {/* 정보 영역 */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* 관광 타입 뱃지 */}
            <div className="mb-2">
              <Badge variant="secondary" className="text-xs">
                {contentTypeLabel}
              </Badge>
            </div>

            {/* 관광지명 */}
            <Link href={`/places/${tour.contentid}`}>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tour.title}
              </h3>
            </Link>

            {/* 주소 */}
            <div className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{fullAddress}</span>
            </div>

            {/* 북마크 날짜 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>북마크 날짜: {bookmarkDate}</span>
            </div>
          </div>
        </div>

        {/* 삭제 버튼 */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(tour.contentid)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="북마크 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * 북마크 목록 컴포넌트
 */
export function BookmarkList({ bookmarks }: BookmarkListProps) {
  const { isSignedIn, userId } = useAuth();
  const supabase = useClerkSupabaseClient();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [localBookmarks, setLocalBookmarks] =
    useState<BookmarkWithTourItem[]>(bookmarks);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<BookmarkSortOption>('latest');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  /**
   * 정렬된 북마크 목록
   */
  const sortedBookmarks = useMemo(() => {
    const sorted = [...localBookmarks];
    
    switch (sortBy) {
      case 'latest':
        // 최신순 (created_at 기준, 내림차순)
        sorted.sort((a, b) => {
          const dateA = new Date(a.bookmark.created_at).getTime();
          const dateB = new Date(b.bookmark.created_at).getTime();
          return dateB - dateA;
        });
        break;
      case 'name':
        // 이름순 (가나다순)
        sorted.sort((a, b) => {
          return a.tour.title.localeCompare(b.tour.title, 'ko');
        });
        break;
      case 'region':
        // 지역별 정렬
        sorted.sort((a, b) => {
          const regionA = extractRegion(a.tour.addr1);
          const regionB = extractRegion(b.tour.addr1);
          if (regionA !== regionB) {
            return regionA.localeCompare(regionB, 'ko');
          }
          // 같은 지역이면 이름순
          return a.tour.title.localeCompare(b.tour.title, 'ko');
        });
        break;
    }
    
    return sorted;
  }, [localBookmarks, sortBy]);

  /**
   * 체크박스 선택/해제
   */
  const handleSelect = (contentId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(contentId);
      } else {
        next.delete(contentId);
      }
      return next;
    });
  };

  /**
   * 전체 선택/해제
   */
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(sortedBookmarks.map((item) => item.tour.contentid)));
    } else {
      setSelectedIds(new Set());
    }
  };

  /**
   * 일괄 삭제
   */
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      toast.info('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!isSignedIn || !userId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    const confirmMessage = `선택한 ${selectedIds.size}개의 북마크를 삭제하시겠습니까?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setIsBulkDeleting(true);
      console.group('[BookmarkList] 일괄 삭제');
      console.log('삭제할 항목 개수:', selectedIds.size);

      // Supabase users 테이블에서 사용자 ID 조회
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !dbUser) {
        console.error('[BookmarkList] 사용자 조회 실패:', userError);
        toast.error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // 선택된 모든 북마크 삭제
      const deletePromises = Array.from(selectedIds).map((contentId) =>
        removeBookmark(dbUser.id, contentId, supabase)
      );

      const results = await Promise.allSettled(deletePromises);
      
      let successCount = 0;
      let failCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          failCount++;
        }
      });

      // 성공한 항목들을 로컬 상태에서 제거
      const successIds = Array.from(selectedIds).filter((_, index) => {
        const result = results[index];
        return result.status === 'fulfilled' && result.value.success;
      });

      setLocalBookmarks((prev) =>
        prev.filter((item) => !successIds.includes(item.tour.contentid))
      );
      setSelectedIds(new Set());

      if (failCount === 0) {
        toast.success(`${successCount}개의 북마크가 삭제되었습니다.`);
      } else {
        toast.warning(
          `${successCount}개 삭제 성공, ${failCount}개 삭제 실패했습니다.`
        );
      }

      console.log('[BookmarkList] 일괄 삭제 완료:', {
        success: successCount,
        fail: failCount,
      });
      console.groupEnd();
    } catch (error) {
      console.error('[BookmarkList] 일괄 삭제 중 오류:', error);
      toast.error('일괄 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  /**
   * 북마크 삭제 (개별)
   */
  const handleDelete = async (contentId: string) => {
    if (!isSignedIn || !userId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    // 중복 삭제 방지
    if (deletingIds.has(contentId)) {
      return;
    }

    try {
      setDeletingIds((prev) => new Set(prev).add(contentId));
      console.group('[BookmarkList] 북마크 삭제');
      console.log('contentId:', contentId);

      // Supabase users 테이블에서 사용자 ID 조회
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !dbUser) {
        console.error('[BookmarkList] 사용자 조회 실패:', userError);
        toast.error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // 북마크 삭제
      const result = await removeBookmark(dbUser.id, contentId, supabase);

      if (result.success) {
        // 로컬 상태에서 제거
        setLocalBookmarks((prev) =>
          prev.filter((item) => item.tour.contentid !== contentId)
        );
        toast.success('북마크가 삭제되었습니다.');
        console.log('[BookmarkList] 북마크 삭제 성공');
      } else {
        toast.error(result.error || '북마크 삭제에 실패했습니다.');
        console.error('[BookmarkList] 북마크 삭제 실패:', result.error);
      }
      console.groupEnd();
    } catch (error) {
      console.error('[BookmarkList] 북마크 삭제 중 오류:', error);
      toast.error('북마크 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(contentId);
        return next;
      });
    }
  };

  // 빈 상태
  if (localBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Star className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">아직 북마크한 관광지가 없습니다</h2>
          <p className="text-muted-foreground mb-6">
            관광지를 둘러보고 마음에 드는 곳을 북마크해보세요.
          </p>
          <Link href="/">
            <Button>관광지 둘러보기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allSelected = selectedIds.size === sortedBookmarks.length && sortedBookmarks.length > 0;

  return (
    <div className="space-y-4">
      {/* 컨트롤 영역 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b">
        {/* 정렬 옵션 */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as BookmarkSortOption)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="region">지역별</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 일괄 삭제 컨트롤 */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size}개 선택됨
            </span>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0 || isBulkDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            일괄 삭제
          </Button>
        </div>
      </div>

      {/* 전체 선택 체크박스 */}
      <div className="flex items-center gap-2 pb-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          aria-label="전체 선택"
        />
        <span className="text-sm text-muted-foreground">
          전체 선택 ({sortedBookmarks.length}개)
        </span>
      </div>

      {/* 북마크 목록 */}
      <div className="space-y-4">
        {sortedBookmarks.map((item) => (
          <BookmarkCard
            key={item.bookmark.id}
            bookmark={item.bookmark}
            tour={item.tour}
            onDelete={handleDelete}
            isDeleting={deletingIds.has(item.tour.contentid)}
            isSelected={selectedIds.has(item.tour.contentid)}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

