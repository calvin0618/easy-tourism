-- Pet Reviews 테이블 생성
-- 관광지별 반려동물 동반 리뷰 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS public.pet_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    pet_type TEXT,
    pet_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, content_id)
);

-- 테이블 소유자 설정
ALTER TABLE public.pet_reviews OWNER TO postgres;

-- Row Level Security (RLS) 비활성화
-- 개발 단계에서는 RLS를 끄고, 프로덕션에서는 활성화하는 것을 권장합니다
ALTER TABLE public.pet_reviews DISABLE ROW LEVEL SECURITY;

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_pet_reviews_content_id ON public.pet_reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_pet_reviews_user_id ON public.pet_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_reviews_rating ON public.pet_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_pet_reviews_created_at ON public.pet_reviews(created_at DESC);

-- updated_at 자동 업데이트를 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_pet_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거 생성
CREATE TRIGGER trigger_update_pet_reviews_updated_at
    BEFORE UPDATE ON public.pet_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_pet_reviews_updated_at();

-- 권한 부여
GRANT ALL ON TABLE public.pet_reviews TO anon;
GRANT ALL ON TABLE public.pet_reviews TO authenticated;
GRANT ALL ON TABLE public.pet_reviews TO service_role;

