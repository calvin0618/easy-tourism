/**
 * @file components/pet-friendly/pet-info-form.tsx
 * @description 반려동물 정보 입력 폼 컴포넌트
 *
 * 관광지의 반려동물 동반 정보를 입력하는 폼 컴포넌트입니다.
 * TODO-pet-friendly.md Phase 7.1을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - 반려동물 동반 가능 여부 선택
 * - 정책 설명 입력
 * - 추가 요금 입력 (숙박 시설)
 * - 크기/마리 수 제한 입력
 * - 추가 안내사항 입력
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
import { Dog, DollarSign, Users, Ruler, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { PetFriendlyInfoInput, PetSizeLimit } from '@/lib/types/pet-friendly';
import { PET_SIZE_LIMIT_LABELS } from '@/lib/types/pet-friendly';
import { toast } from 'sonner';

/**
 * 폼 스키마 정의
 */
const petInfoFormSchema = z.object({
  is_pet_allowed: z.boolean(),
  pet_policy: z.string().optional(),
  pet_fee: z
    .number()
    .min(0, '추가 요금은 0원 이상이어야 합니다.')
    .optional()
    .nullable(),
  pet_size_limit: z.enum(['small', 'medium', 'large', 'unlimited']).optional().nullable(),
  pet_count_limit: z
    .number()
    .int('마리 수는 정수여야 합니다.')
    .min(1, '마리 수는 1마리 이상이어야 합니다.')
    .optional()
    .nullable(),
  notes: z.string().optional(),
});

type PetInfoFormValues = z.infer<typeof petInfoFormSchema>;

interface PetInfoFormProps {
  /** 관광지 contentId */
  contentId: string;
  /** 기존 반려동물 정보 (수정 모드) */
  existingInfo?: PetFriendlyInfoInput;
  /** 폼 제출 핸들러 */
  onSubmit: (data: PetFriendlyInfoInput) => Promise<{ success: boolean; error?: string }>;
  /** 폼 닫기 핸들러 */
  onClose: () => void;
  /** 모달 열림 상태 */
  open: boolean;
}

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
 * 반려동물 정보 입력 폼 컴포넌트
 */
export function PetInfoForm({
  contentId,
  existingInfo,
  onSubmit,
  onClose,
  open,
}: PetInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PetInfoFormValues>({
    resolver: zodResolver(petInfoFormSchema),
    defaultValues: {
      is_pet_allowed: existingInfo?.is_pet_allowed ?? false,
      pet_policy: existingInfo?.pet_policy ?? '',
      pet_fee: existingInfo?.pet_fee ?? null,
      pet_size_limit: (existingInfo?.pet_size_limit as PetSizeLimit) ?? null,
      pet_count_limit: existingInfo?.pet_count_limit ?? null,
      notes: existingInfo?.notes ?? '',
    },
  });

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (values: PetInfoFormValues) => {
    try {
      setIsSubmitting(true);
      console.group('[반려동물 정보 폼] 제출 시도');
      console.log('contentId:', contentId);
      console.log('formData:', values);

      // TOUR API의 contentid 형식에 맞게 정규화하여 저장
      // 한국관광공사 API는 contentid를 숫자 문자열로 반환합니다 (예: "125266")
      const normalizedContentId = String(contentId).trim();
      const formData: PetFriendlyInfoInput = {
        content_id: normalizedContentId, // TOUR API 형식에 맞게 정규화
        is_pet_allowed: values.is_pet_allowed,
        pet_policy: values.pet_policy && values.pet_policy.trim() !== '' ? values.pet_policy : undefined,
        pet_fee: values.pet_fee && values.pet_fee > 0 ? values.pet_fee : undefined,
        pet_size_limit: values.pet_size_limit || undefined,
        pet_count_limit: values.pet_count_limit && values.pet_count_limit > 0 ? values.pet_count_limit : undefined,
        notes: values.notes && values.notes.trim() !== '' ? values.notes : undefined,
      };

      const result = await onSubmit(formData);

      if (result.success) {
        console.log('[반려동물 정보 폼] 제출 성공');
        console.groupEnd();
        toast.success('반려동물 정보가 성공적으로 제출되었습니다.');
        form.reset();
        onClose();
      } else {
        console.error('[반려동물 정보 폼] 제출 실패:', result.error);
        console.groupEnd();
        toast.error(result.error || '반려동물 정보 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('[반려동물 정보 폼] 제출 중 예상치 못한 오류:', error);
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
            <Dog className="w-5 h-5" />
            반려동물 정보 제출
          </DialogTitle>
          <DialogDescription>
            이 관광지의 반려동물 동반 가능 여부 및 관련 정보를 입력해주세요.
            {existingInfo && ' 기존 정보를 수정할 수 있습니다.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 반려동물 동반 가능 여부 */}
            <FormField
              control={form.control}
              name="is_pet_allowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-medium">
                      반려동물 동반 가능
                    </FormLabel>
                    <FormDescription>
                      이 관광지에서 반려동물 동반이 가능한지 선택해주세요.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* 반려동물 정책 설명 */}
            <FormField
              control={form.control}
              name="pet_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    정책 설명
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="예: 소형견만 가능, 케이지 필수 등"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    반려동물 동반 관련 정책이나 조건을 입력해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 추가 요금 */}
            <FormField
              control={form.control}
              name="pet_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    추가 요금 (숙박 시설용)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="1000"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? null : parseFloat(value));
                      }}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    반려동물 동반 시 추가로 부과되는 요금을 입력해주세요. (숙박 시설의 경우)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 반려동물 크기 제한 */}
            <FormField
              control={form.control}
              name="pet_size_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    반려동물 크기 제한
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? null : (value as PetSizeLimit))
                    }
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="크기 제한 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">제한없음</SelectItem>
                      {PET_SIZE_OPTIONS.filter((opt) => opt !== null).map((size) => (
                        <SelectItem key={size!} value={size!}>
                          {PET_SIZE_LIMIT_LABELS[size!]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    반려동물 크기 제한이 있는 경우 선택해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 반려동물 마리 수 제한 */}
            <FormField
              control={form.control}
              name="pet_count_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    반려동물 마리 수 제한
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="예: 2"
                      min="1"
                      step="1"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? null : parseInt(value, 10));
                      }}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    반려동물 마리 수 제한이 있는 경우 입력해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 추가 안내사항 */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    추가 안내사항
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="예: 실내 반려동물 출입 금지, 야외 공간에서만 가능 등"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    반려동물 동반 시 주의사항이나 추가 안내사항을 입력해주세요.
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
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {existingInfo ? '수정하기' : '제출하기'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

