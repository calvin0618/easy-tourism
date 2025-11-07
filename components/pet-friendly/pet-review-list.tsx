/**
 * @file components/pet-friendly/pet-review-list.tsx
 * @description 반려동물 리뷰 목록 컴포넌트
 *
 * 관광지의 반려동물 동반 리뷰 목록을 표시하는 컴포넌트입니다.
 * TODO-pet-friendly.md Phase 8.2를 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 반려동물 리뷰 목록 표시
 * - 평점 표시 (별점)
 * - 리뷰 내용 표시
 * - 반려동물 정보 표시
 * - 리뷰 작성 버튼
 *
 * @dependencies
 * - lib/types/pet-friendly: 반려동물 리뷰 타입
 * - lib/api/pet-friendly-api: 리뷰 API 함수
 * - components/ui/card: shadcn Card 컴포넌트
 * - components/pet-friendly/pet-review-form: 리뷰 작성 폼
 * - lucide-react: 아이콘
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Dog, Ruler, Plus, Trash2, Edit2 } from 'lucide-react';
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { getPetReviews, addPetReview, updatePetReview, deletePetReview } from '@/lib/api/pet-friendly-api';
import type { PetReview, PetReviewInput } from '@/lib/types/pet-friendly';
import { PET_TYPE_LABELS, PET_SIZE_LIMIT_LABELS } from '@/lib/types/pet-friendly';
import { PetReviewForm } from './pet-review-form';
import { toast } from 'sonner';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

interface PetReviewListProps {
  /** 관광지 contentId */
  contentId: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 리뷰 카드 컴포넌트
 */
function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: {
  review: PetReview;
  currentUserId?: string;
  onEdit: (review: PetReview) => void;
  onDelete: (reviewId: string) => void;
}) {
  const isOwnReview = currentUserId && review.user_id === currentUserId;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* 헤더: 평점 및 날짜 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={cn(
                      'w-4 h-4',
                      rating <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {review.rating}점
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isOwnReview && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(review)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(review.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>

          {/* 리뷰 내용 */}
          {review.review_text && (
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {review.review_text}
            </p>
          )}

          {/* 반려동물 정보 */}
          {(review.pet_type || review.pet_size) && (
            <div className="flex items-center gap-2 flex-wrap">
              {review.pet_type && (
                <Badge variant="outline" className="text-xs">
                  <Dog className="w-3 h-3 mr-1" />
                  {PET_TYPE_LABELS[review.pet_type as keyof typeof PET_TYPE_LABELS] || review.pet_type}
                </Badge>
              )}
              {review.pet_size && (
                <Badge variant="outline" className="text-xs">
                  <Ruler className="w-3 h-3 mr-1" />
                  {PET_SIZE_LIMIT_LABELS[review.pet_size as keyof typeof PET_SIZE_LIMIT_LABELS] || review.pet_size}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 반려동물 리뷰 목록 컴포넌트
 */
export function PetReviewList({ contentId, className }: PetReviewListProps) {
  const { userId: clerkUserId } = useAuth();
  const supabase = useClerkSupabaseClient();
  const [reviews, setReviews] = useState<PetReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PetReview | null>(null);

  /**
   * 사용자 ID 조회
   */
  useEffect(() => {
    async function fetchUserId() {
      if (!clerkUserId || !supabase) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', clerkUserId)
          .single();

        if (fetchError) {
          console.error('[PetReviewList] 사용자 ID 조회 실패:', fetchError);
          return;
        }

        if (data) {
          setDbUserId(data.id);
        }
      } catch (err) {
        console.error('[PetReviewList] 사용자 ID 조회 중 오류:', err);
      }
    }

    fetchUserId();
  }, [clerkUserId, supabase]);

  /**
   * 리뷰 목록 조회
   */
  useEffect(() => {
    async function fetchReviews() {
      if (!supabase) return;

      try {
        setLoading(true);
        setError(null);

        const result = await getPetReviews(contentId, supabase);

        if (result.success && result.data) {
          setReviews(result.data);
        } else {
          setError(result.error || '리뷰를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('[PetReviewList] 리뷰 목록 조회 중 오류:', err);
        setError('리뷰를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [contentId, supabase]);

  /**
   * 리뷰 작성 핸들러
   */
  const handleSubmitReview = async (data: PetReviewInput) => {
    if (!dbUserId || !supabase) {
      toast.error('로그인이 필요합니다.');
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      console.group('[PetReviewList] 리뷰 작성');
      console.log('data:', data);

      let result;
      if (editingReview) {
        // 수정 모드
        result = await updatePetReview(editingReview.id, data, dbUserId, supabase);
      } else {
        // 작성 모드
        result = await addPetReview(data, dbUserId, supabase);
      }

      if (result.success) {
        console.log('[PetReviewList] 리뷰 작성/수정 성공');
        console.groupEnd();

        // 리뷰 목록 새로고침
        const refreshResult = await getPetReviews(contentId, supabase);
        if (refreshResult.success && refreshResult.data) {
          setReviews(refreshResult.data);
        }

        setIsFormOpen(false);
        setEditingReview(null);
        return { success: true };
      } else {
        console.error('[PetReviewList] 리뷰 작성/수정 실패:', result.error);
        console.groupEnd();
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('[PetReviewList] 리뷰 작성/수정 중 오류:', err);
      return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
    }
  };

  /**
   * 리뷰 수정 핸들러
   */
  const handleEditReview = (review: PetReview) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  /**
   * 리뷰 삭제 핸들러
   */
  const handleDeleteReview = async (reviewId: string) => {
    if (!dbUserId || !supabase) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      console.group('[PetReviewList] 리뷰 삭제');
      console.log('reviewId:', reviewId);

      const result = await deletePetReview(reviewId, dbUserId, supabase);

      if (result.success) {
        console.log('[PetReviewList] 리뷰 삭제 성공');
        console.groupEnd();
        toast.success('리뷰가 삭제되었습니다.');

        // 리뷰 목록 새로고침
        const refreshResult = await getPetReviews(contentId, supabase);
        if (refreshResult.success && refreshResult.data) {
          setReviews(refreshResult.data);
        }
      } else {
        console.error('[PetReviewList] 리뷰 삭제 실패:', result.error);
        console.groupEnd();
        toast.error(result.error || '리뷰 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('[PetReviewList] 리뷰 삭제 중 오류:', err);
      toast.error('예상치 못한 오류가 발생했습니다.');
    }
  };

  /**
   * 리뷰 작성 폼 열기
   */
  const handleOpenForm = () => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  /**
   * 리뷰 작성 폼 닫기
   */
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReview(null);
  };

  // 평균 평점 계산
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 헤더: 평균 평점 및 리뷰 작성 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            반려동물 리뷰
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {averageRating.toFixed(1)} ({reviews.length}개)
              </span>
            </div>
          )}
        </div>
        <SignedIn>
          <Button onClick={handleOpenForm} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            리뷰 작성
          </Button>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              리뷰 작성
            </Button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          리뷰를 불러오는 중...
        </div>
      )}

      {/* 에러 상태 */}
      {error && !loading && (
        <div className="text-center py-8 text-destructive">
          {error}
        </div>
      )}

      {/* 리뷰 목록 */}
      {!loading && !error && (
        <>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>아직 작성된 리뷰가 없습니다.</p>
              <p className="text-sm mt-1">첫 번째 리뷰를 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={dbUserId || undefined}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 리뷰 작성 폼 */}
      <PetReviewForm
        contentId={contentId}
        existingReview={editingReview || undefined}
        onSubmit={handleSubmitReview}
        onClose={handleCloseForm}
        open={isFormOpen}
      />
    </div>
  );
}

