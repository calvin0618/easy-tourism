/**
 * @file app/api/pet-friendly/route.ts
 * @description 반려동물 정보 API 라우트
 *
 * 반려동물 정보 추가/수정을 위한 API 라우트입니다.
 * TODO-pet-friendly.md Phase 7.2를 참고하여 작성되었습니다.
 *
 * 주요 기능:
 * - POST: 반려동물 정보 추가
 * - PUT: 반려동물 정보 수정
 * - 인증 확인 (로그인한 사용자만)
 *
 * @dependencies
 * - @clerk/nextjs/server: 인증 확인
 * - lib/api/pet-friendly-server: 반려동물 정보 서버 함수
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  addPetFriendlyInfoServer,
  updatePetFriendlyInfoServer,
} from '@/lib/api/pet-friendly-server';
import type { PetFriendlyInfoInput } from '@/lib/types/pet-friendly';

/**
 * POST /api/pet-friendly - 반려동물 정보 추가
 */
export async function POST(request: NextRequest) {
  try {
    console.group('[반려동물 API Route] POST 요청');
    
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.error('인증되지 않은 사용자');
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('요청 본문:', body);

    // 입력값 검증
    if (!body.content_id) {
      return NextResponse.json(
        { success: false, error: '관광지 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (typeof body.is_pet_allowed !== 'boolean') {
      return NextResponse.json(
        { success: false, error: '반려동물 동반 가능 여부가 필요합니다.' },
        { status: 400 }
      );
    }

    const petInfoInput: PetFriendlyInfoInput = {
      content_id: body.content_id,
      is_pet_allowed: body.is_pet_allowed,
      pet_policy: body.pet_policy || undefined,
      pet_fee: body.pet_fee || undefined,
      pet_size_limit: body.pet_size_limit || undefined,
      pet_count_limit: body.pet_count_limit || undefined,
      notes: body.notes || undefined,
    };

    console.log('[반려동물 API Route] 반려동물 정보 추가 시도:', petInfoInput);

    const result = await addPetFriendlyInfoServer(petInfoInput);

    if (result.success) {
      console.log('[반려동물 API Route] 반려동물 정보 추가 성공');
      console.groupEnd();
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      console.error('[반려동물 API Route] 반려동물 정보 추가 실패:', result.error);
      console.groupEnd();
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[반려동물 API Route] POST 요청 중 예상치 못한 오류:', error);
    return NextResponse.json(
      { success: false, error: '예상치 못한 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pet-friendly - 반려동물 정보 수정
 */
export async function PUT(request: NextRequest) {
  try {
    console.group('[반려동물 API Route] PUT 요청');
    
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.error('인증되지 않은 사용자');
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('요청 본문:', body);

    // 입력값 검증
    if (!body.content_id) {
      return NextResponse.json(
        { success: false, error: '관광지 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const updateData: Partial<Omit<PetFriendlyInfoInput, 'content_id'>> = {};
    if (typeof body.is_pet_allowed === 'boolean') {
      updateData.is_pet_allowed = body.is_pet_allowed;
    }
    if (body.pet_policy !== undefined) {
      updateData.pet_policy = body.pet_policy || undefined;
    }
    if (body.pet_fee !== undefined) {
      updateData.pet_fee = body.pet_fee || undefined;
    }
    if (body.pet_size_limit !== undefined) {
      updateData.pet_size_limit = body.pet_size_limit || undefined;
    }
    if (body.pet_count_limit !== undefined) {
      updateData.pet_count_limit = body.pet_count_limit || undefined;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes || undefined;
    }

    console.log('[반려동물 API Route] 반려동물 정보 수정 시도:', {
      contentId: body.content_id,
      updateData,
    });

    const result = await updatePetFriendlyInfoServer(body.content_id, updateData);

    if (result.success) {
      console.log('[반려동물 API Route] 반려동물 정보 수정 성공');
      console.groupEnd();
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      console.error('[반려동물 API Route] 반려동물 정보 수정 실패:', result.error);
      console.groupEnd();
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[반려동물 API Route] PUT 요청 중 예상치 못한 오류:', error);
    return NextResponse.json(
      { success: false, error: '예상치 못한 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

