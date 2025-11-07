/**
 * @file components/pet-friendly/pet-review-form.tsx
 * @description 반려동물 리뷰 작성 폼 컴포넌트
 *
 * 관광지의 반려동물 동반 리뷰를 작성하는 폼 컴포넌트입니다.
 * TODO-pet-friendly.md Phase 8.3을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 평점 선택 (1-5점)
 * - 리뷰 내용 입력
 * - 반려동물 종류 선택
 * - 반려동물 크기 선택
 * - 폼 유효성 검사 (Zod)
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: Zod 리졸버
 * - components/ui/form: shadcn Form 컴포넌트
 * - components/ui/dialog: shadcn Dialog 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, MessageSquare, Dog, Ruler, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { PetReviewInput, PetType, PetSizeLimit } from '@/lib/types/pet-friendly';
import { PET_TYPE_LABELS, PET_SIZE_LIMIT_LABELS } from '@/lib/types/pet-friendly';
import { toast } from 'sonner';

/**
 * 폼 스키마 정의
 */
const petReviewFormSchema = z.object({
  rating: z.number().min(1, '평점을 선택해주세요.').max(5, '평점은 5점까지입니다.'),
  review_text: z.string().optional(),
  pet_type: z.enum(['dog', 'cat', 'other']).optional().nullable(),
  pet_size: z.enum(['small', 'medium', 'large', 'unlimited']).optional().nullable(),
});

type PetReviewFormValues = z.infer<typeof petReviewFormSchema>;

interface PetReviewFormProps {
  /** 관광지 contentId */
  contentId: string;
  /** 기존 리뷰 (수정 모드) */
  existingReview?: PetReviewInput;
  /** 폼 제출 핸들러 */
  onSubmit: (data: PetReviewInput) => Promise<{ success: boolean; error?: string }>;
  /** 폼 닫기 핸들러 */
  onClose: () => void;
  /** 모달 열림 상태 */
  open: boolean;
}

/**
 * 평점 옵션
 */
const RATING_OPTIONS = [1, 2, 3, 4, 5];

/**
 * 반려동물 종류 옵션
 */
const PET_TYPE_OPTIONS: (PetType | null)[] = [null, 'dog', 'cat', 'other'];

/**
 * 반려동물 크기 옵션
 */
const PET_SIZE_OPTIONS: (PetSizeLimit | null)[] = [
  null,
  'small',
  'medium',
  'large',
  'unlimited',
];

/**
 * 반려동물 리뷰 작성 폼 컴포넌트
 */
export function PetReviewForm({
  contentId,
  existingReview,
  onSubmit,
  onClose,
  open,
}: PetReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PetReviewFormValues>({
    resolver: zodResolver(petReviewFormSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 5,
      review_text: existingReview?.review_text ?? '',
      pet_type: (existingReview?.pet_type as PetType) ?? null,
      pet_size: (existingReview?.pet_size as PetSizeLimit) ?? null,
    },
  });

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (values: PetReviewFormValues) => {
    try {
      setIsSubmitting(true);
      console.group('[반려동물 리뷰 폼] 제출 시도');
      console.log('contentId:', contentId);
      console.log('formData:', values);

      const formData: PetReviewInput = {
        content_id: contentId,
        rating: values.rating,
        review_text: values.review_text && values.review_text.trim() !== '' ? values.review_text : undefined,
        pet_type: values.pet_type || undefined,
        pet_size: values.pet_size || undefined,
      };

      const result = await onSubmit(formData);

      if (result.success) {
        console.log('[반려동물 리뷰 폼] 제출 성공');
        console.groupEnd();
        toast.success(existingReview ? '리뷰가 수정되었습니다.' : '리뷰가 작성되었습니다.');
        form.reset();
        onClose();
      } else {
        console.error('[반려동물 리뷰 폼] 제출 실패:', result.error);
        console.groupEnd();
        toast.error(result.error || '리뷰 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('[반려동물 리뷰 폼] 제출 중 예상치 못한 오류:', error);
      console.groupEnd();
      toast.error('예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {existingReview ? '리뷰 수정' : '리뷰 작성'}
          </DialogTitle>
          <DialogDescription>
            이 관광지에서 반려동물과 함께 방문한 경험을 공유해주세요.
            {existingReview && ' 기존 리뷰를 수정할 수 있습니다.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 평점 선택 */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    평점
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      {RATING_OPTIONS.map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => field.onChange(rating)}
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            transition-colors
                            ${
                              field.value >= rating
                                ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                            }
                          `}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              field.value >= rating ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {field.value}점
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    이 관광지의 반려동물 친화도를 평가해주세요. (1점: 매우 불만족, 5점: 매우 만족)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 리뷰 내용 */}
            <FormField
              control={form.control}
              name="review_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    리뷰 내용
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="반려동물과 함께 방문한 경험을 자유롭게 작성해주세요..."
                      className="resize-none"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    반려동물 동반 시 주의사항, 추천 포인트 등을 작성해주세요. (선택 사항)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 반려동물 종류 */}
            <FormField
              control={form.control}
              name="pet_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Dog className="w-4 h-4" />
                    반려동물 종류
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? null : (value as PetType))
                    }
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="반려동물 종류 선택 (선택 사항)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">선택 안 함</SelectItem>
                      {PET_TYPE_OPTIONS.filter((type) => type !== null).map((type) => (
                        <SelectItem key={type!} value={type!}>
                          {PET_TYPE_LABELS[type!]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    함께 방문한 반려동물의 종류를 선택해주세요. (선택 사항)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 반려동물 크기 */}
            <FormField
              control={form.control}
              name="pet_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    반려동물 크기
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? null : (value as PetSizeLimit))
                    }
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="반려동물 크기 선택 (선택 사항)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">선택 안 함</SelectItem>
                      {PET_SIZE_OPTIONS.filter((size) => size !== null).map((size) => (
                        <SelectItem key={size!} value={size!}>
                          {PET_SIZE_LIMIT_LABELS[size!]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    함께 방문한 반려동물의 크기를 선택해주세요. (선택 사항)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingReview ? '수정 중...' : '작성 중...'}
                  </>
                ) : (
                  existingReview ? '수정하기' : '작성하기'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

