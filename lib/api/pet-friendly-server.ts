/**
 * @file lib/api/pet-friendly-server.ts
 * @description 반려동물 친화 정보 서버 컴포넌트용 API 함수
 *
 * 서버 사이드에서 사용할 반려동물 친화 정보 조회 함수들입니다.
 * createClerkSupabaseClient 또는 getServiceRoleClient를 사용합니다.
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lib/supabase/server: createClerkSupabaseClient
 * - lib/supabase/service-role: getServiceRoleClient
 * - lib/api/pet-friendly-api: 공통 API 함수
 *
 * @example
 * ```tsx
 * // Server Component
 * import { getPetFriendlyInfoServer } from '@/lib/api/pet-friendly-server';
 *
 * export default async function PlaceDetailPage({ params }) {
 *   const { contentId } = await params;
 *   const result = await getPetFriendlyInfoServer(contentId);
 *   if (result.success && result.data) {
 *     // 반려동물 정보 표시
 *   }
 * }
 * ```
 */

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import {
  getPetFriendlyInfo,
  getPetFriendlyTours,
  searchPetFriendlyTours,
  addPetFriendlyInfo,
  updatePetFriendlyInfo,
} from './pet-friendly-api';
import type { PetFriendlyInfo, PetFriendlyInfoInput } from '@/lib/types/pet-friendly';

/**
 * 반려동물 정보 조회 (서버 컴포넌트용)
 * Clerk 인증된 클라이언트 사용
 *
 * @param contentId - 관광지 contentId
 * @returns 반려동물 정보 조회 결과
 */
export async function getPetFriendlyInfoServer(
  contentId: string
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo;
  error?: string;
}> {
  const supabase = createClerkSupabaseClient();
  return getPetFriendlyInfo(contentId, supabase);
}

/**
 * 반려동물 동반 가능한 관광지 목록 조회 (서버 컴포넌트용)
 * Clerk 인증된 클라이언트 사용
 *
 * @param options - 조회 옵션
 * @returns 반려동물 동반 가능 관광지 목록
 */
export async function getPetFriendlyToursServer(options?: {
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: PetFriendlyInfo[];
  error?: string;
}> {
  const supabase = createClerkSupabaseClient();
  return getPetFriendlyTours(supabase, options);
}

/**
 * 반려동물 동반 가능 관광지 검색 (서버 컴포넌트용)
 * Clerk 인증된 클라이언트 사용
 *
 * @param keyword - 검색 키워드
 * @param options - 조회 옵션
 * @returns 검색 결과
 */
export async function searchPetFriendlyToursServer(
  keyword: string,
  options?: { limit?: number; offset?: number }
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo[];
  error?: string;
}> {
  const supabase = createClerkSupabaseClient();
  return searchPetFriendlyTours(keyword, supabase, options);
}

/**
 * 반려동물 정보 추가 (서버 컴포넌트용, 관리자용)
 * Service Role 클라이언트 사용 (RLS 우회)
 *
 * @param data - 반려동물 정보 입력 데이터
 * @returns 반려동물 정보 추가 결과
 */
export async function addPetFriendlyInfoServer(
  data: PetFriendlyInfoInput
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo;
  error?: string;
}> {
  const supabase = getServiceRoleClient();
  return addPetFriendlyInfo(data, supabase);
}

/**
 * 반려동물 정보 수정 (서버 컴포넌트용, 관리자용)
 * Service Role 클라이언트 사용 (RLS 우회)
 *
 * @param contentId - 관광지 contentId
 * @param data - 반려동물 정보 수정 데이터
 * @returns 반려동물 정보 수정 결과
 */
export async function updatePetFriendlyInfoServer(
  contentId: string,
  data: Partial<Omit<PetFriendlyInfoInput, 'content_id'>>
): Promise<{
  success: boolean;
  data?: PetFriendlyInfo;
  error?: string;
}> {
  const supabase = getServiceRoleClient();
  return updatePetFriendlyInfo(contentId, data, supabase);
}

