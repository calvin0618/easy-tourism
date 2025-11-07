-- 반려동물 친화 정보 테스트 데이터 삽입
-- 이 마이그레이션은 개발/테스트 목적으로 사용됩니다.

-- 기존 테스트 데이터가 있으면 삭제 (선택사항)
-- DELETE FROM pet_friendly_info WHERE content_id IN ('125266', '126508', '126509');

-- 테스트 데이터 삽입
INSERT INTO pet_friendly_info (content_id, is_pet_allowed, pet_policy, pet_fee, pet_size_limit, pet_count_limit, notes)
VALUES 
  -- 예시 1: 반려동물 동반 가능
  ('125266', true, '소형견만 가능', 0, '소형견 (10kg 이하)', 2, '실내 반려동물 동반 가능'),
  -- 예시 2: 반려동물 동반 가능 (수수료 있음)
  ('126508', true, '반려동물 동반 가능', 5000, '중형견까지 가능 (20kg 이하)', 1, '입장 시 반려동물 수수료 별도'),
  -- 예시 3: 반려동물 동반 불가
  ('126509', false, '반려동물 동반 불가', NULL, NULL, NULL, '시설 내 반려동물 출입 금지')
ON CONFLICT (content_id) 
DO UPDATE SET
  is_pet_allowed = EXCLUDED.is_pet_allowed,
  pet_policy = EXCLUDED.pet_policy,
  pet_fee = EXCLUDED.pet_fee,
  pet_size_limit = EXCLUDED.pet_size_limit,
  pet_count_limit = EXCLUDED.pet_count_limit,
  notes = EXCLUDED.notes,
  updated_at = now();

-- 삽입된 데이터 확인
SELECT 
  content_id,
  is_pet_allowed,
  pet_policy,
  pet_fee,
  created_at
FROM pet_friendly_info
ORDER BY created_at DESC
LIMIT 10;

