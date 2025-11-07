/**
 * @file components/pet-friendly/pet-info-submit-button.tsx
 * @description 반려동물 정보 제출 버튼 컴포넌트
 *
 * 관광지 상세 페이지에 반려동물 정보를 제출할 수 있는 버튼과 폼을 제공하는 컴포넌트입니다.
 * TODO-pet-friendly.md Phase 7.3을 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - "반려동물 정보 제출" 버튼 표시
 * - 모달로 폼 표시
 * - 제출 완료 후 피드백
 *
 * @dependencies
 * - components/pet-friendly/pet-info-form: 반려동물 정보 입력 폼
 * - @clerk/nextjs: 인증 확인
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PetInfoForm } from './pet-info-form';
import { useAuth } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { Plus, Edit } from 'lucide-react';
import type { PetFriendlyInfoInput, PetFriendlyInfo } from '@/lib/types/pet-friendly';
import { toast } from 'sonner';

interface PetInfoSubmitButtonProps {
  /** 관광지 contentId */
  contentId: string;
  /** 기존 반려동물 정보 (수정 모드) */
  existingInfo?: PetFriendlyInfo;
}

/**
 * 반려동물 정보 제출 버튼 컴포넌트
 */
export function PetInfoSubmitButton({
  contentId,
  existingInfo,
}: PetInfoSubmitButtonProps) {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (
    data: PetFriendlyInfoInput
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsSubmitting(true);
      console.group('[PetInfoSubmitButton] 반려동물 정보 제출');
      console.log('contentId:', contentId);
      console.log('data:', data);

      // 기존 정보가 있으면 PUT, 없으면 POST
      const method = existingInfo ? 'PUT' : 'POST';
      const url = '/api/pet-friendly';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        console.log('[PetInfoSubmitButton] 반려동물 정보 제출 성공');
        console.groupEnd();
        
        // 페이지 새로고침으로 최신 정보 표시
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
        
        return { success: true };
      } else {
        console.error('[PetInfoSubmitButton] 반려동물 정보 제출 실패:', result.error);
        console.groupEnd();
        return { success: false, error: result.error || '제출에 실패했습니다.' };
      }
    } catch (error) {
      console.error('[PetInfoSubmitButton] 제출 중 예상치 못한 오류:', error);
      console.groupEnd();
      return {
        success: false,
        error: '예상치 못한 오류가 발생했습니다.',
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인하지 않은 경우: SignInButton으로 감싸서 로그인 팝업 표시
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          반려동물 정보 제출
        </Button>
      </SignInButton>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        {existingInfo ? (
          <>
            <Edit className="w-4 h-4" />
            반려동물 정보 수정
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            반려동물 정보 제출
          </>
        )}
      </Button>

      <PetInfoForm
        contentId={contentId}
        existingInfo={existingInfo}
        onSubmit={handleSubmit}
        onClose={() => setIsOpen(false)}
        open={isOpen}
      />
    </>
  );
}

