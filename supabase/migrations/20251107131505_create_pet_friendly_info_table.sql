-- Pet Friendly Info 테이블 생성
-- 관광지별 반려동물 동반 가능 여부 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS public.pet_friendly_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id TEXT NOT NULL UNIQUE,
    is_pet_allowed BOOLEAN DEFAULT false NOT NULL,
    pet_policy TEXT,
    pet_fee DECIMAL(10, 2),
    pet_size_limit TEXT,
    pet_count_limit INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.pet_friendly_info OWNER TO postgres;

-- Row Level Security (RLS) 비활성화
-- 개발 단계에서는 RLS를 끄고, 프로덕션에서는 활성화하는 것을 권장합니다
ALTER TABLE public.pet_friendly_info DISABLE ROW LEVEL SECURITY;

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_pet_friendly_info_content_id ON public.pet_friendly_info(content_id);
CREATE INDEX IF NOT EXISTS idx_pet_friendly_info_is_pet_allowed ON public.pet_friendly_info(is_pet_allowed);

-- updated_at 자동 업데이트를 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_pet_friendly_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거 생성
CREATE TRIGGER trigger_update_pet_friendly_info_updated_at
    BEFORE UPDATE ON public.pet_friendly_info
    FOR EACH ROW
    EXECUTE FUNCTION update_pet_friendly_info_updated_at();

-- 권한 부여
GRANT ALL ON TABLE public.pet_friendly_info TO anon;
GRANT ALL ON TABLE public.pet_friendly_info TO authenticated;
GRANT ALL ON TABLE public.pet_friendly_info TO service_role;

