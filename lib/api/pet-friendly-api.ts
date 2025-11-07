/**
 * @file lib/api/pet-friendly-api.ts
 * @description 반려동물 친화 정보 관련 Supabase API 함수
 *
 * Supabase를 사용하여 반려동물 친화 정보를 제공하는 유틸리티 함수들입니다.
 * 클라이언트와 서버 컴포넌트 모두에서 사용할 수 있습니다.
 *
 * 주요 기능:
 * - 반려동물 정보 조회
 * - 반려동물 동반 가능한 관광지 목록 조회
 * - 반려동물 정보 추가/수정
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lib/types/pet-friendly: 반려동물 친화 정보 타입
 *
 * @example
 * ```tsx
 * // 클라이언트 컴포넌트에서 사용
 * 'use client';
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { getPetFriendlyInfo } from '@/lib/api/pet-friendly-api';
 *
 * const supabase = useClerkSupabaseClient();
 * const result = await getPetFriendlyInfo('125266', supabase);
 * ```
 *
 * @example
 * ```tsx
 * // 서버 컴포넌트에서 사용
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 * import { getPetFriendlyInfo } from '@/lib/api/pet-friendly-api';
 *
 * const supabase = createClerkSupabaseClient();
 * const result = await getPetFriendlyInfo('125266', supabase);
 * ```
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PetFriendlyInfo,
  PetFriendlyInfoInput,
  PetReview,
  PetReviewInput,
} from '@/lib/types/pet-friendly';

/**
 * TOUR API의 contentid 형식에 맞게 정규화하는 함수
 * 한국관광공사 API는 JSON 응답에서 contentid를 number 타입으로 반환할 수 있습니다
 * 
 * @param contentId - 정규화할 contentId (문자열 또는 숫자)
 * @returns 정규화된 contentId (숫자 문자열, 앞뒤 공백 제거)
 * 
 * @example
 * normalizeContentId("125266") => "125266"
 * normalizeContentId(" 125266 ") => "125266"
 * normalizeContentId(125266) => "125266"
 * normalizeContentId(125266.0) => "125266"
 */
export function normalizeContentId(contentId: string | number): string {
  // number 타입인 경우 문자열로 변환
  if (typeof contentId === 'number') {
    // 정수로 변환 후 문자열로 (소수점 제거)
    return String(Math.floor(contentId));
  }
  
  // 문자열인 경우 앞뒤 공백 제거
  return String(contentId).trim();
}

/**
 * Supabase에서 조회한 반려동물 정보를 타입에 맞게 변환하는 함수
 * - pet_fee: DECIMAL 타입이 문자열로 반환되므로 number로 변환
 * - pet_size_limit: 한글 값이 있을 경우 영문 키로 변환 시도
 * 
 * @param rawData - Supabase에서 조회한 원본 데이터
 * @returns 변환된 PetFriendlyInfo 데이터
 */
function transformPetFriendlyData(rawData: any): PetFriendlyInfo {
  // pet_fee 변환: 문자열이면 숫자로 변환
  let petFee: number | undefined = undefined;
  if (rawData.pet_fee !== null && rawData.pet_fee !== undefined) {
    if (typeof rawData.pet_fee === 'string') {
      const parsed = parseFloat(rawData.pet_fee);
      petFee = isNaN(parsed) ? undefined : parsed;
    } else if (typeof rawData.pet_fee === 'number') {
      petFee = rawData.pet_fee;
    }
  }

  // pet_size_limit 변환: 한글 값이 있으면 영문 키로 변환 시도
  let petSizeLimit: string | undefined = rawData.pet_size_limit;
  if (petSizeLimit) {
    // 이미 영문 키인 경우 그대로 사용
    if (['small', 'medium', 'large', 'unlimited'].includes(petSizeLimit)) {
      // 이미 영문 키이므로 그대로 사용
    } else {
      // 한글 값이 있으면 영문 키로 매핑
      const sizeMapping: Record<string, string> = {
        '소형': 'small',
        '소형견': 'small',
        '중형': 'medium',
        '중형견': 'medium',
        '대형': 'large',
        '대형견': 'large',
        '제한없음': 'unlimited',
        '제한 없음': 'unlimited',
        '제한없': 'unlimited',
      };
      
      // 한글 값이 포함되어 있으면 영문 키로 변환
      const lowerValue = petSizeLimit.toLowerCase();
      let mapped = false;
      for (const [key, value] of Object.entries(sizeMapping)) {
        if (lowerValue.includes(key.toLowerCase()) || lowerValue === value) {
          petSizeLimit = value;
          mapped = true;
          break;
        }
      }
      // 매핑되지 않은 경우 원본 유지 (하위 호환성)
      if (!mapped) {
        petSizeLimit = rawData.pet_size_limit;
      }
    }
  }

  return {
    ...rawData,
    pet_fee: petFee,
    pet_size_limit: petSizeLimit,
  } as PetFriendlyInfo;
}

/**
 * 반려동물 정보 조회
 *
 * @param contentId - 관광지 contentId (TEXT)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @returns 성공 여부, 반려동물 정보 데이터, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await getPetFriendlyInfo('125266', supabase);
 * if (result.success && result.data) {
 *   console.log('반려동물 동반 가능:', result.data.is_pet_allowed);
 * }
 * ```
 */
export async function getPetFriendlyInfo(
  contentId: string,
  supabase?: SupabaseClient
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo;
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 정보 조회');
    console.log('contentId:', contentId);

    // 입력값 검증
    if (!contentId) {
      console.error('입력값 검증 실패: contentId가 없습니다.');
      return { success: false, error: '관광지 ID가 필요합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // 반려동물 정보 조회
    // maybeSingle()을 사용하여 데이터가 없을 때 에러 대신 null 반환
    // TOUR API의 contentid 형식에 맞게 정규화
    const normalizedContentId = normalizeContentId(contentId);
    const { data, error: fetchError } = await supabase
      .from('pet_friendly_info')
      .select('*')
      .eq('content_id', normalizedContentId)
      .maybeSingle();

    // 에러 처리: 테이블이 없거나 권한 문제 등
    if (fetchError) {
      // 에러 상세 정보 로깅
      const errorInfo = {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        errorString: JSON.stringify(fetchError, null, 2),
      };
      
      // PGRST205: 테이블을 찾을 수 없음, PGRST116: 데이터 없음 등은 정상적인 경우로 처리
      const isTableNotFound = fetchError.code === 'PGRST205' || 
                              fetchError.message?.includes("Could not find the table") ||
                              fetchError.message?.includes("relation") ||
                              fetchError.message?.includes("does not exist");
      
      if (isTableNotFound) {
        // 테이블이 없는 경우는 데이터가 없는 것으로 처리 (마이그레이션 미적용 등)
        console.warn('[반려동물 API] pet_friendly_info 테이블을 찾을 수 없습니다. 마이그레이션이 적용되었는지 확인하세요.');
        console.warn('[반려동물 API] 에러 상세:', errorInfo);
        console.groupEnd();
        return { success: true, data: undefined };
      }
      
      // 기타 에러는 경고로 처리하고 데이터 없음으로 반환
      console.warn('[반려동물 API] 반려동물 정보 조회 중 에러 발생:', errorInfo);
      console.groupEnd();
      // 사용자 경험을 위해 에러를 숨기고 데이터 없음으로 처리
      return { success: true, data: undefined };
    }

    // 데이터가 없는 경우 (null 반환)
    if (!data) {
      console.log('[반려동물 API] 반려동물 정보가 없습니다.');
      console.groupEnd();
      return { success: true, data: undefined };
    }

    // 데이터 변환 (pet_fee, pet_size_limit 등)
    const transformedData = transformPetFriendlyData(data);

    console.log('반려동물 정보 조회 성공');
    console.groupEnd();
    return { success: true, data: transformedData };
  } catch (error) {
    console.error('반려동물 정보 조회 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 반려동물 동반 가능한 관광지 목록 조회
 *
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @param options - 조회 옵션
 * @param options.limit - 조회할 최대 개수 (기본값: 100)
 * @param options.offset - 건너뛸 개수 (기본값: 0)
 * @returns 성공 여부, 반려동물 정보 목록, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await getPetFriendlyTours(supabase, { limit: 50 });
 * if (result.success && result.data) {
 *   console.log('반려동물 동반 가능 관광지:', result.data.length, '개');
 * }
 * ```
 */
export async function getPetFriendlyTours(
  supabase?: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo[];
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 동반 가능 관광지 목록 조회');
    console.log('options:', options);

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.warn('[반려동물 API] Supabase 클라이언트가 제공되지 않았습니다. 빈 배열 반환.');
      console.groupEnd();
      return { success: true, data: [] };
    }

    const limit = options?.limit || 100;
    const offset = options?.offset || 0;

    // 반려동물 동반 가능한 관광지 목록 조회
    const { data, error: fetchError } = await supabase
      .from('pet_friendly_info')
      .select('*')
      .eq('is_pet_allowed', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 에러가 발생한 경우 빈 배열로 처리 (데이터가 없거나 권한 문제 등)
    if (fetchError) {
      // 에러 상세 정보 로깅
      const errorInfo = {
        code: fetchError.code,
        message: fetchError.message,
        status: (fetchError as any).status,
        details: fetchError,
        errorString: JSON.stringify(fetchError, null, 2),
      };
      
      console.warn('[반려동물 API] 반려동물 동반 가능 관광지 목록 조회 중 에러 발생:', errorInfo);
      
      // 모든 에러를 빈 배열로 처리 (데이터가 없거나 권한 문제 등)
      // 사용자 경험을 위해 에러를 숨기고 빈 결과를 반환
      console.log('[반려동물 API] 빈 배열 반환 (에러 무시)');
      console.groupEnd();
      return { success: true, data: [] };
    }

    // 데이터가 없는 경우도 빈 배열 반환
    if (!data) {
      console.log('[반려동물 API] 데이터가 없습니다. 빈 배열 반환.');
      console.groupEnd();
      return { success: true, data: [] };
    }

    console.log(
      '[반려동물 API] 반려동물 동반 가능 관광지 목록 조회 성공:',
      data.length,
      '개'
    );
    
    // 데이터 변환 (pet_fee, pet_size_limit 등)
    const transformedData = data.map(item => transformPetFriendlyData(item));
    
    // 디버깅: 실제 조회된 데이터의 content_id 확인
    if (transformedData.length > 0) {
      console.log('[반려동물 API] 조회된 content_id 목록:', 
        transformedData.slice(0, 10).map(item => ({
          content_id: item.content_id,
          content_id_type: typeof item.content_id,
          is_pet_allowed: item.is_pet_allowed,
          pet_fee: item.pet_fee,
          pet_fee_type: typeof item.pet_fee,
          pet_size_limit: item.pet_size_limit,
        }))
      );
    }
    
    console.groupEnd();
    return { success: true, data: transformedData };
  } catch (error) {
    // 예상치 못한 에러도 빈 배열로 처리
    console.warn(
      '[반려동물 API] 반려동물 동반 가능 관광지 목록 조회 중 예상치 못한 오류:',
      error
    );
    console.log('[반려동물 API] 빈 배열 반환 (예외 처리)');
    return { success: true, data: [] };
  }
}

/**
 * 모든 반려동물 정보 조회 (뱃지 표시용)
 * is_pet_allowed 값과 관계없이 모든 반려동물 정보를 가져옵니다.
 *
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @param options - 조회 옵션
 * @param options.limit - 조회할 최대 개수 (기본값: 1000)
 * @param options.offset - 건너뛸 개수 (기본값: 0)
 * @returns 성공 여부, 반려동물 정보 목록, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await getAllPetFriendlyInfo(supabase, { limit: 1000 });
 * if (result.success && result.data) {
 *   console.log('모든 반려동물 정보:', result.data.length, '개');
 * }
 * ```
 */
export async function getAllPetFriendlyInfo(
  supabase?: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo[];
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 모든 반려동물 정보 조회');
    console.log('options:', options);

    if (!supabase) {
      console.warn('[반려동물 API] Supabase 클라이언트가 제공되지 않았습니다. 빈 배열 반환.');
      console.groupEnd();
      return { success: true, data: [] };
    }

    const limit = options?.limit || 1000;
    const offset = options?.offset || 0;

    // 모든 반려동물 정보 조회 (is_pet_allowed 조건 없음)
    const { data, error: fetchError } = await supabase
      .from('pet_friendly_info')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      const errorInfo = {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError,
      };
      
      console.warn('[반려동물 API] 모든 반려동물 정보 조회 중 에러 발생:', errorInfo);
      console.groupEnd();
      return { success: true, data: [] };
    }

    if (!data) {
      console.log('[반려동물 API] 데이터가 없습니다. 빈 배열 반환.');
      console.groupEnd();
      return { success: true, data: [] };
    }

    // 데이터 변환 (pet_fee, pet_size_limit 등)
    const transformedData = data.map(item => transformPetFriendlyData(item));

    console.log('[반려동물 API] 모든 반려동물 정보 조회 성공:', transformedData.length, '개');
    console.groupEnd();
    return { success: true, data: transformedData };
  } catch (error) {
    console.warn('[반려동물 API] 모든 반려동물 정보 조회 중 예상치 못한 오류:', error);
    return { success: true, data: [] };
  }
}

/**
 * 반려동물 동반 가능 관광지 검색
 *
 * @param keyword - 검색 키워드 (관광지명, 정책 등)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @param options - 조회 옵션
 * @param options.limit - 조회할 최대 개수 (기본값: 50)
 * @param options.offset - 건너뛸 개수 (기본값: 0)
 * @returns 성공 여부, 반려동물 정보 목록, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await searchPetFriendlyTours('펜션', supabase);
 * if (result.success && result.data) {
 *   console.log('검색 결과:', result.data.length, '개');
 * }
 * ```
 */
export async function searchPetFriendlyTours(
  keyword: string,
  supabase?: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo[];
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 동반 가능 관광지 검색');
    console.log('keyword:', keyword);
    console.log('options:', options);

    // 입력값 검증
    if (!keyword || keyword.trim() === '') {
      console.error('입력값 검증 실패: keyword가 없습니다.');
      return { success: false, error: '검색 키워드가 필요합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const searchKeyword = keyword.trim();

    // 반려동물 동반 가능한 관광지 중에서 검색
    // pet_policy나 notes에서 키워드 검색
    // Supabase의 .or() 메서드는 특정 형식을 요구하므로 올바른 형식으로 작성
    const { data, error: fetchError } = await supabase
      .from('pet_friendly_info')
      .select('*')
      .eq('is_pet_allowed', true)
      .or(`pet_policy.ilike.%${searchKeyword}%,notes.ilike.%${searchKeyword}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('반려동물 동반 가능 관광지 검색 실패:', fetchError);
      console.groupEnd();
      return {
        success: false,
        error: '반려동물 동반 가능 관광지 검색에 실패했습니다.',
      };
    }

    // 데이터 변환 (pet_fee, pet_size_limit 등)
    const transformedData = (data || []).map(item => transformPetFriendlyData(item));

    console.log('검색 성공:', transformedData.length, '개');
    console.groupEnd();
    return { success: true, data: transformedData };
  } catch (error) {
    console.error(
      '반려동물 동반 가능 관광지 검색 중 예상치 못한 오류:',
      error
    );
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 반려동물 정보 추가 (관리자용)
 *
 * @param data - 반려동물 정보 입력 데이터
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @returns 성공 여부, 생성된 반려동물 정보, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = getServiceRoleClient();
 * const result = await addPetFriendlyInfo({
 *   content_id: '125266',
 *   is_pet_allowed: true,
 *   pet_policy: '소형견만 가능',
 *   pet_fee: 10000
 * }, supabase);
 * ```
 */
export async function addPetFriendlyInfo(
  data: PetFriendlyInfoInput,
  supabase?: SupabaseClient
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo;
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 정보 추가');
    console.log('data:', data);

    // 입력값 검증
    if (!data.content_id) {
      console.error('입력값 검증 실패: content_id가 없습니다.');
      return { success: false, error: '관광지 ID가 필요합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // 반려동물 정보 추가
    // TOUR API의 contentid 형식에 맞게 정규화하여 저장
    const normalizedContentId = normalizeContentId(data.content_id);
    const { data: insertedData, error: insertError } = await supabase
      .from('pet_friendly_info')
      .insert({
        content_id: normalizedContentId, // TOUR API 형식에 맞게 정규화
        is_pet_allowed: data.is_pet_allowed,
        pet_policy: data.pet_policy || null,
        pet_fee: data.pet_fee || null,
        pet_size_limit: data.pet_size_limit || null,
        pet_count_limit: data.pet_count_limit || null,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (insertError) {
      // 중복 키 에러 (23505: unique_violation)
      if (insertError.code === '23505') {
        console.log('이미 반려동물 정보가 존재합니다.');
        console.groupEnd();
        return {
          success: false,
          error: '이미 반려동물 정보가 존재합니다. 수정 기능을 사용하세요.',
        };
      }

      console.error('반려동물 정보 추가 실패:', insertError);
      console.groupEnd();
      return {
        success: false,
        error: '반려동물 정보 추가에 실패했습니다.',
      };
    }

    // 데이터 변환 (pet_fee, pet_size_limit 등)
    const transformedData = transformPetFriendlyData(insertedData);

    console.log('반려동물 정보 추가 성공');
    console.groupEnd();
    return { success: true, data: transformedData };
  } catch (error) {
    console.error('반려동물 정보 추가 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 반려동물 정보 수정
 *
 * @param contentId - 관광지 contentId (TEXT)
 * @param data - 반려동물 정보 수정 데이터
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @returns 성공 여부, 수정된 반려동물 정보, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = getServiceRoleClient();
 * const result = await updatePetFriendlyInfo('125266', {
 *   is_pet_allowed: true,
 *   pet_policy: '소형견만 가능',
 *   pet_fee: 15000
 * }, supabase);
 * ```
 */
export async function updatePetFriendlyInfo(
  contentId: string,
  data: Partial<Omit<PetFriendlyInfoInput, 'content_id'>>,
  supabase?: SupabaseClient
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo;
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 정보 수정');
    console.log('contentId:', contentId);
    console.log('data:', data);

    // 입력값 검증
    if (!contentId) {
      console.error('입력값 검증 실패: contentId가 없습니다.');
      return { success: false, error: '관광지 ID가 필요합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // TOUR API의 contentid 형식에 맞게 정규화
    const normalizedContentId = normalizeContentId(contentId);

    // 수정할 데이터 준비 (undefined 필드는 제외)
    const updateData: Record<string, unknown> = {};
    if (data.is_pet_allowed !== undefined) {
      updateData.is_pet_allowed = data.is_pet_allowed;
    }
    if (data.pet_policy !== undefined) {
      updateData.pet_policy = data.pet_policy || null;
    }
    if (data.pet_fee !== undefined) {
      updateData.pet_fee = data.pet_fee || null;
    }
    if (data.pet_size_limit !== undefined) {
      updateData.pet_size_limit = data.pet_size_limit || null;
    }
    if (data.pet_count_limit !== undefined) {
      updateData.pet_count_limit = data.pet_count_limit || null;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes || null;
    }

    // 반려동물 정보 수정
    const { data: updatedData, error: updateError } = await supabase
      .from('pet_friendly_info')
      .update(updateData)
      .eq('content_id', normalizedContentId)
      .select()
      .single();

    if (updateError) {
      // 데이터가 없는 경우 (PGRST116: No rows returned)
      if (updateError.code === 'PGRST116') {
        console.log('반려동물 정보가 없습니다.');
        console.groupEnd();
        return {
          success: false,
          error: '반려동물 정보가 없습니다. 추가 기능을 사용하세요.',
        };
      }

      console.error('반려동물 정보 수정 실패:', updateError);
      console.groupEnd();
      return {
        success: false,
        error: '반려동물 정보 수정에 실패했습니다.',
      };
    }

    // 데이터 변환 (pet_fee, pet_size_limit 등)
    const transformedData = transformPetFriendlyData(updatedData);

    console.log('반려동물 정보 수정 성공');
    console.groupEnd();
    return { success: true, data: transformedData };
  } catch (error) {
    console.error('반려동물 정보 수정 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 반려동물 리뷰 목록 조회
 *
 * @param contentId - 관광지 contentId
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @param options - 조회 옵션
 * @param options.limit - 조회할 최대 개수 (기본값: 50)
 * @param options.offset - 건너뛸 개수 (기본값: 0)
 * @returns 성공 여부, 리뷰 목록, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await getPetReviews('125266', supabase);
 * if (result.success && result.data) {
 *   console.log('리뷰 개수:', result.data.length);
 * }
 * ```
 */
export async function getPetReviews(
  contentId: string,
  supabase?: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<{
  success: boolean;
  data?: PetReview[];
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 리뷰 목록 조회');
    console.log('contentId:', contentId);
    console.log('options:', options);

    // 입력값 검증
    if (!contentId) {
      console.error('입력값 검증 실패: contentId가 없습니다.');
      return { success: false, error: '관광지 ID가 필요합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    // TOUR API의 contentid 형식에 맞게 정규화
    const normalizedContentId = normalizeContentId(contentId);

    // 반려동물 리뷰 목록 조회
    const { data, error: fetchError } = await supabase
      .from('pet_reviews')
      .select('*')
      .eq('content_id', normalizedContentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('반려동물 리뷰 목록 조회 실패:', fetchError);
      console.groupEnd();
      return {
        success: false,
        error: '반려동물 리뷰 목록을 불러올 수 없습니다.',
      };
    }

    console.log('반려동물 리뷰 목록 조회 성공:', data?.length || 0, '개');
    console.groupEnd();
    return { success: true, data: (data || []) as PetReview[] };
  } catch (error) {
    console.error('반려동물 리뷰 목록 조회 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 반려동물 리뷰 추가
 *
 * @param data - 반려동물 리뷰 입력 데이터
 * @param userId - 사용자 ID (UUID)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @returns 성공 여부, 생성된 리뷰, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await addPetReview({
 *   content_id: '125266',
 *   rating: 5,
 *   review_text: '반려동물과 함께 방문했는데 정말 좋았습니다!',
 *   pet_type: 'dog',
 *   pet_size: 'small',
 * }, userId, supabase);
 * ```
 */
export async function addPetReview(
  data: PetReviewInput,
  userId: string,
  supabase?: SupabaseClient
): Promise<{
  success: boolean;
  data?: PetReview;
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 리뷰 추가');
    console.log('data:', data);
    console.log('userId:', userId);

    // 입력값 검증
    if (!data.content_id) {
      console.error('입력값 검증 실패: content_id가 없습니다.');
      return { success: false, error: '관광지 ID가 필요합니다.' };
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      console.error('입력값 검증 실패: rating이 1-5 범위가 아닙니다.');
      return { success: false, error: '평점은 1-5점 사이여야 합니다.' };
    }

    if (!userId) {
      console.error('입력값 검증 실패: userId가 없습니다.');
      return { success: false, error: '사용자 ID가 필요합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // TOUR API의 contentid 형식에 맞게 정규화하여 저장
    const normalizedContentId = normalizeContentId(data.content_id);

    // 반려동물 리뷰 추가
    const { data: insertedData, error: insertError } = await supabase
      .from('pet_reviews')
      .insert({
        user_id: userId,
        content_id: normalizedContentId,
        rating: data.rating,
        review_text: data.review_text || null,
        pet_type: data.pet_type || null,
        pet_size: data.pet_size || null,
      })
      .select()
      .single();

    if (insertError) {
      // 중복 키 에러 (23505: unique_violation) - 같은 사용자가 같은 관광지에 리뷰를 이미 작성한 경우
      if (insertError.code === '23505') {
        console.log('이미 리뷰가 존재합니다.');
        console.groupEnd();
        return {
          success: false,
          error: '이미 이 관광지에 리뷰를 작성하셨습니다. 수정 기능을 사용하세요.',
        };
      }

      console.error('반려동물 리뷰 추가 실패:', insertError);
      console.groupEnd();
      return {
        success: false,
        error: '반려동물 리뷰 추가에 실패했습니다.',
      };
    }

    console.log('반려동물 리뷰 추가 성공');
    console.groupEnd();
    return { success: true, data: insertedData as PetReview };
  } catch (error) {
    console.error('반려동물 리뷰 추가 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 반려동물 리뷰 수정
 *
 * @param reviewId - 리뷰 ID (UUID)
 * @param data - 수정할 리뷰 데이터
 * @param userId - 사용자 ID (UUID, 본인 리뷰만 수정 가능)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @returns 성공 여부, 수정된 리뷰, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await updatePetReview(reviewId, {
 *   rating: 4,
 *   review_text: '수정된 리뷰 내용',
 * }, userId, supabase);
 * ```
 */
export async function updatePetReview(
  reviewId: string,
  data: Partial<Omit<PetReviewInput, 'content_id'>>,
  userId: string,
  supabase?: SupabaseClient
): Promise<{
  success: boolean;
  data?: PetReview;
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 리뷰 수정');
    console.log('reviewId:', reviewId);
    console.log('data:', data);
    console.log('userId:', userId);

    // 입력값 검증
    if (!reviewId) {
      console.error('입력값 검증 실패: reviewId가 없습니다.');
      return { success: false, error: '리뷰 ID가 필요합니다.' };
    }

    if (!userId) {
      console.error('입력값 검증 실패: userId가 없습니다.');
      return { success: false, error: '사용자 ID가 필요합니다.' };
    }

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      console.error('입력값 검증 실패: rating이 1-5 범위가 아닙니다.');
      return { success: false, error: '평점은 1-5점 사이여야 합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // 수정할 데이터 준비 (undefined 필드는 제외)
    const updateData: Record<string, unknown> = {};
    if (data.rating !== undefined) {
      updateData.rating = data.rating;
    }
    if (data.review_text !== undefined) {
      updateData.review_text = data.review_text || null;
    }
    if (data.pet_type !== undefined) {
      updateData.pet_type = data.pet_type || null;
    }
    if (data.pet_size !== undefined) {
      updateData.pet_size = data.pet_size || null;
    }

    // 반려동물 리뷰 수정 (본인 리뷰만 수정 가능)
    const { data: updatedData, error: updateError } = await supabase
      .from('pet_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .eq('user_id', userId) // 본인 리뷰만 수정 가능
      .select()
      .single();

    if (updateError) {
      // 데이터가 없는 경우 (PGRST116: No rows returned)
      if (updateError.code === 'PGRST116') {
        console.log('리뷰가 없거나 수정 권한이 없습니다.');
        console.groupEnd();
        return {
          success: false,
          error: '리뷰를 찾을 수 없거나 수정 권한이 없습니다.',
        };
      }

      console.error('반려동물 리뷰 수정 실패:', updateError);
      console.groupEnd();
      return {
        success: false,
        error: '반려동물 리뷰 수정에 실패했습니다.',
      };
    }

    console.log('반려동물 리뷰 수정 성공');
    console.groupEnd();
    return { success: true, data: updatedData as PetReview };
  } catch (error) {
    console.error('반려동물 리뷰 수정 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

/**
 * 반려동물 리뷰 삭제
 *
 * @param reviewId - 리뷰 ID (UUID)
 * @param userId - 사용자 ID (UUID, 본인 리뷰만 삭제 가능)
 * @param supabase - Supabase 클라이언트 인스턴스 (선택 사항)
 * @returns 성공 여부, 에러 메시지
 *
 * @example
 * ```ts
 * const supabase = useClerkSupabaseClient();
 * const result = await deletePetReview(reviewId, userId, supabase);
 * ```
 */
export async function deletePetReview(
  reviewId: string,
  userId: string,
  supabase?: SupabaseClient
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.group('[반려동물 API] 반려동물 리뷰 삭제');
    console.log('reviewId:', reviewId);
    console.log('userId:', userId);

    // 입력값 검증
    if (!reviewId) {
      console.error('입력값 검증 실패: reviewId가 없습니다.');
      return { success: false, error: '리뷰 ID가 필요합니다.' };
    }

    if (!userId) {
      console.error('입력값 검증 실패: userId가 없습니다.');
      return { success: false, error: '사용자 ID가 필요합니다.' };
    }

    // Supabase 클라이언트가 제공되지 않은 경우 에러
    if (!supabase) {
      console.error('Supabase 클라이언트가 제공되지 않았습니다.');
      return { success: false, error: 'Supabase 클라이언트가 필요합니다.' };
    }

    // 반려동물 리뷰 삭제 (본인 리뷰만 삭제 가능)
    const { error: deleteError } = await supabase
      .from('pet_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId); // 본인 리뷰만 삭제 가능

    if (deleteError) {
      console.error('반려동물 리뷰 삭제 실패:', deleteError);
      console.groupEnd();
      return {
        success: false,
        error: '반려동물 리뷰 삭제에 실패했습니다.',
      };
    }

    console.log('반려동물 리뷰 삭제 성공');
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error('반려동물 리뷰 삭제 중 예상치 못한 오류:', error);
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' };
  }
}

