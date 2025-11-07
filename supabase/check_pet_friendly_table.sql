-- pet_friendly_info 테이블 상태 확인 쿼리
-- Supabase 대시보드의 SQL Editor에서 실행하세요.

-- 1. 테이블 존재 여부 확인
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'pet_friendly_info';

-- 2. 테이블 구조 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pet_friendly_info'
ORDER BY ordinal_position;

-- 3. 현재 데이터 개수 확인
SELECT COUNT(*) as total_count FROM pet_friendly_info;

-- 4. 반려동물 동반 가능한 관광지 개수
SELECT COUNT(*) as pet_allowed_count 
FROM pet_friendly_info 
WHERE is_pet_allowed = true;

-- 5. 최근 등록된 데이터 확인 (최대 10개)
SELECT 
  content_id,
  is_pet_allowed,
  pet_policy,
  pet_fee,
  pet_size_limit,
  pet_count_limit,
  notes,
  created_at,
  updated_at
FROM pet_friendly_info
ORDER BY created_at DESC
LIMIT 10;

-- 6. RLS 정책 상태 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'pet_friendly_info';

