/**
 * @file pet-friendly.ts
 * @description 반려동물 친화 정보 타입 정의
 *
 * 관광지의 반려동물 동반 가능 여부 및 관련 정책 정보를 위한 TypeScript 타입 정의입니다.
 * TODO-pet-friendly.md Phase 1.2를 참고하여 작성되었습니다.
 */

/**
 * 반려동물 크기 제한 타입
 */
export type PetSizeLimit = 'small' | 'medium' | 'large' | 'unlimited';

/**
 * 반려동물 크기 제한 라벨
 */
export const PET_SIZE_LIMIT_LABELS: Record<PetSizeLimit, string> = {
  small: '소형',
  medium: '중형',
  large: '대형',
  unlimited: '제한없음',
};

/**
 * 반려동물 친화 상태 타입
 */
export type PetFriendlyStatus = 'allowed' | 'not_allowed' | 'conditional';

/**
 * 반려동물 친화 상태 라벨
 */
export const PET_FRIENDLY_STATUS_LABELS: Record<PetFriendlyStatus, string> = {
  allowed: '동반 가능',
  not_allowed: '동반 불가',
  conditional: '조건부 가능',
};

/**
 * 반려동물 친화 정보 인터페이스
 * Supabase pet_friendly_info 테이블과 매핑
 */
export interface PetFriendlyInfo {
  /** 고유 ID (UUID) */
  id: string;
  /** 관광지 contentId */
  content_id: string;
  /** 반려동물 동반 가능 여부 */
  is_pet_allowed: boolean;
  /** 반려동물 정책 설명 */
  pet_policy?: string;
  /** 반려동물 추가 요금 (숙박 시설용) */
  pet_fee?: number;
  /** 반려동물 크기 제한 */
  pet_size_limit?: string;
  /** 반려동물 마리 수 제한 */
  pet_count_limit?: number;
  /** 추가 안내사항 */
  notes?: string;
  /** 생성일시 */
  created_at: string;
  /** 수정일시 */
  updated_at: string;
}

/**
 * 반려동물 친화 정보 생성/수정용 인터페이스
 * (id, created_at, updated_at 제외)
 */
export interface PetFriendlyInfoInput {
  /** 관광지 contentId */
  content_id: string;
  /** 반려동물 동반 가능 여부 */
  is_pet_allowed: boolean;
  /** 반려동물 정책 설명 */
  pet_policy?: string;
  /** 반려동물 추가 요금 */
  pet_fee?: number;
  /** 반려동물 크기 제한 */
  pet_size_limit?: string;
  /** 반려동물 마리 수 제한 */
  pet_count_limit?: number;
  /** 추가 안내사항 */
  notes?: string;
}

/**
 * 반려동물 정책 텍스트 포맷팅
 *
 * @param info - 반려동물 친화 정보
 * @returns 포맷팅된 정책 텍스트
 *
 * @example
 * ```ts
 * const policy = formatPetPolicy({
 *   is_pet_allowed: true,
 *   pet_policy: "소형견만 가능",
 *   pet_fee: 10000,
 *   pet_count_limit: 2
 * });
 * // "소형견만 가능, 추가 요금: 10,000원, 최대 2마리"
 * ```
 */
export function formatPetPolicy(info: PetFriendlyInfo): string {
  const parts: string[] = [];

  if (info.pet_policy) {
    parts.push(info.pet_policy);
  }

  if (info.pet_fee && info.pet_fee > 0) {
    parts.push(`추가 요금: ${info.pet_fee.toLocaleString('ko-KR')}원`);
  }

  if (info.pet_count_limit && info.pet_count_limit > 0) {
    parts.push(`최대 ${info.pet_count_limit}마리`);
  }

  if (info.pet_size_limit) {
    parts.push(`크기 제한: ${info.pet_size_limit}`);
  }

  if (parts.length === 0) {
    return info.is_pet_allowed ? '반려동물 동반 가능' : '반려동물 동반 불가';
  }

  return parts.join(', ');
}

/**
 * 반려동물 친화 상태 결정
 *
 * @param info - 반려동물 친화 정보
 * @returns 반려동물 친화 상태
 */
export function getPetFriendlyStatus(
  info: PetFriendlyInfo
): PetFriendlyStatus {
  if (!info.is_pet_allowed) {
    return 'not_allowed';
  }

  // 조건부 가능 여부 확인 (정책이나 제한이 있는 경우)
  if (
    info.pet_policy ||
    info.pet_fee ||
    info.pet_size_limit ||
    info.pet_count_limit
  ) {
    return 'conditional';
  }

  return 'allowed';
}

/**
 * 반려동물 뱃지 색상 결정
 *
 * @param status - 반려동물 친화 상태
 * @returns Tailwind CSS 색상 클래스
 *
 * @example
 * ```tsx
 * const color = getPetFriendlyBadgeColor('allowed');
 * // "bg-green-500 text-white"
 * ```
 */
export function getPetFriendlyBadgeColor(
  status: PetFriendlyStatus
): string {
  switch (status) {
    case 'allowed':
      return 'bg-green-500 text-white';
    case 'not_allowed':
      return 'bg-gray-500 text-white';
    case 'conditional':
      return 'bg-yellow-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

/**
 * 반려동물 뱃지 텍스트 결정
 *
 * @param status - 반려동물 친화 상태
 * @returns 뱃지에 표시할 텍스트
 */
export function getPetFriendlyBadgeText(
  status: PetFriendlyStatus
): string {
  return PET_FRIENDLY_STATUS_LABELS[status];
}

/**
 * 반려동물 종류 타입
 */
export type PetType = 'dog' | 'cat' | 'other';

/**
 * 반려동물 종류 라벨
 */
export const PET_TYPE_LABELS: Record<PetType, string> = {
  dog: '강아지',
  cat: '고양이',
  other: '기타',
};

/**
 * 반려동물 리뷰 인터페이스
 * Supabase pet_reviews 테이블과 매핑
 */
export interface PetReview {
  /** 고유 ID (UUID) */
  id: string;
  /** 사용자 ID (UUID) */
  user_id: string;
  /** 관광지 contentId */
  content_id: string;
  /** 평점 (1-5점) */
  rating: number;
  /** 리뷰 내용 */
  review_text?: string;
  /** 반려동물 종류 */
  pet_type?: string;
  /** 반려동물 크기 */
  pet_size?: string;
  /** 생성일시 */
  created_at: string;
  /** 수정일시 */
  updated_at: string;
}

/**
 * 반려동물 리뷰 생성/수정용 인터페이스
 * (id, user_id, created_at, updated_at 제외)
 */
export interface PetReviewInput {
  /** 관광지 contentId */
  content_id: string;
  /** 평점 (1-5점) */
  rating: number;
  /** 리뷰 내용 */
  review_text?: string;
  /** 반려동물 종류 */
  pet_type?: string;
  /** 반려동물 크기 */
  pet_size?: string;
}

