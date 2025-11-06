# 환경변수 설정 가이드

> My Trip 프로젝트 필수 환경변수 설정 가이드

## 필수 환경변수 목록

### 한국관광공사 API
```bash
# 방법 1 (권장)
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key

# 방법 2 (대안 - NEXT_PUBLIC_ 접두사가 인식되지 않을 경우)
TOUR_API_KEY=your_tour_api_key
```

**참고**: 두 가지 방법 모두 지원하도록 API 클라이언트에서 처리합니다.

### 구글 지도 API
```bash
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=your_google_map_api_key
```

### Clerk Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

## 설정 방법

1. 프로젝트 루트에 `.env.local` 파일 생성
2. 위의 환경변수들을 복사하여 실제 값으로 채우기
3. `.env.local`은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다

## 환경변수 확인

개발 서버 실행 전에 환경변수가 올바르게 설정되었는지 확인하세요:

```bash
# 개발 서버 실행
pnpm dev
```

환경변수가 누락되면 콘솔에 에러 메시지가 표시됩니다.

