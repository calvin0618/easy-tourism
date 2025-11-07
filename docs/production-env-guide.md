# 프로덕션 환경변수 설정 가이드

> 프로덕션 환경에서 환경변수를 안전하게 설정하는 방법을 안내합니다.

---

## 📋 개요

이 가이드는 Vercel, Netlify, AWS 등 다양한 배포 플랫폼에서 환경변수를 설정하는 방법을 설명합니다.

---

## 🔐 필수 환경변수 목록

### 1. 한국관광공사 API

```bash
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key_here
# 또는 서버 사이드 전용
TOUR_API_KEY=your_tour_api_key_here
```

**발급 방법:**
1. [공공데이터포털](https://www.data.go.kr) 접속
2. "한국관광공사_국문 관광정보 서비스" 검색
3. 활용신청 후 인증키 발급

**보안 고려사항:**
- `NEXT_PUBLIC_` 접두사가 붙은 변수는 클라이언트 번들에 포함됩니다
- API 키가 노출되더라도 Rate Limit이 있어 상대적으로 안전하지만, 가능하면 서버 사이드에서만 사용 권장

### 2. 구글 지도 API

```bash
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=your_google_map_api_key_here
```

**발급 방법:**
1. [Google Cloud Platform](https://console.cloud.google.com) 접속
2. 프로젝트 생성
3. "Maps JavaScript API" 활성화
4. API 키 생성 및 제한 설정 (HTTP 리퍼러 제한 권장)

**보안 고려사항:**
- API 키 제한 설정 필수 (HTTP 리퍼러, IP 주소 등)
- 월 $200 무료 크레딧 제공, 초과 시 과금 발생

### 3. Clerk Authentication

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key_here
```

**발급 방법:**
1. [Clerk 대시보드](https://dashboard.clerk.com) 접속
2. 프로젝트 생성
3. API Keys 섹션에서 키 복사
4. 프로덕션 환경에서는 `pk_live_`, `sk_live_` 접두사 사용 (테스트는 `pk_test_`, `sk_test_`)

**보안 고려사항:**
- `CLERK_SECRET_KEY`는 절대 클라이언트에 노출되면 안 됩니다
- 서버 사이드에서만 사용하므로 `NEXT_PUBLIC_` 접두사 없이 설정

### 4. Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**발급 방법:**
1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 프로젝트 생성
3. Settings > API에서 URL 및 키 확인

**보안 고려사항:**
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출되면 안 됩니다
- RLS(Row Level Security) 정책을 적절히 설정하여 데이터 보호

### 5. 사이트 URL (선택 사항)

```bash
NEXT_PUBLIC_SITE_URL=https://your-site-url.com
```

**용도:**
- SEO 최적화 (sitemap.xml, robots.txt, Open Graph 등)
- 공유 링크 생성 시 사용

---

## 🚀 배포 플랫폼별 설정 방법

### Vercel

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings > Environment Variables
4. 각 환경변수 추가:
   - **Name**: 환경변수 이름
   - **Value**: 환경변수 값
   - **Environment**: Production, Preview, Development 선택
5. 저장 후 재배포

**참고:**
- Production 환경에만 설정하면 Preview/Development는 기본값 사용
- 환경변수 변경 후 자동 재배포 또는 수동 재배포 필요

### Netlify

1. Netlify 대시보드 접속
2. Site settings > Environment variables
3. "Add a variable" 클릭
4. 각 환경변수 추가
5. 저장 후 재배포

### AWS (Amplify, EC2 등)

**Amplify:**
1. AWS Amplify Console 접속
2. App settings > Environment variables
3. 각 환경변수 추가

**EC2 / ECS:**
- `.env` 파일을 서버에 직접 배치 (보안 그룹 설정 필수)
- 또는 AWS Systems Manager Parameter Store 사용 권장

---

## ✅ 환경변수 검증 체크리스트

배포 전 다음 항목을 확인하세요:

- [ ] 모든 필수 환경변수가 설정되었는가?
- [ ] 프로덕션 키를 사용하고 있는가? (Clerk: `pk_live_`, `sk_live_`)
- [ ] API 키 제한이 설정되었는가? (구글 지도, Clerk 등)
- [ ] `NEXT_PUBLIC_` 접두사가 올바르게 사용되었는가?
- [ ] 민감한 키(`CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)가 클라이언트에 노출되지 않는가?
- [ ] 환경변수 값에 공백이나 특수문자가 없는가?
- [ ] `.env.local` 파일이 Git에 커밋되지 않았는가? (`.gitignore` 확인)

---

## 🔒 보안 모범 사례

1. **환경변수 분리**
   - 개발/스테이징/프로덕션 환경별로 다른 키 사용
   - 프로덕션 키는 개발 환경에서 사용 금지

2. **키 로테이션**
   - 정기적으로 API 키 변경 (3-6개월마다 권장)
   - 키 변경 시 모든 환경에 동시 적용

3. **접근 제한**
   - API 키에 IP 주소, HTTP 리퍼러 제한 설정
   - 불필요한 권한 제거

4. **모니터링**
   - API 사용량 모니터링 (구글 지도, Clerk 등)
   - 비정상적인 사용량 감지 시 즉시 키 비활성화

5. **문서화**
   - 환경변수 목록과 용도를 문서화
   - 팀원과 공유 (비밀번호 관리 도구 사용 권장)

---

## 🐛 문제 해결

### 환경변수가 인식되지 않을 때

1. **변수명 확인**
   - 대소문자 정확히 일치하는지 확인
   - `NEXT_PUBLIC_` 접두사 누락 확인

2. **재배포**
   - 환경변수 변경 후 반드시 재배포 필요
   - Vercel: 자동 재배포 또는 수동 트리거

3. **캐시 확인**
   - 브라우저 캐시 삭제
   - CDN 캐시 무효화 (Vercel: Settings > Purge Cache)

4. **로깅**
   - 개발 환경에서 `console.log`로 환경변수 확인
   - 프로덕션에서는 로깅 서비스 사용 (Sentry 등)

---

## 📚 참고 자료

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Clerk Environment Variables](https://clerk.com/docs/deployments/overview)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)

---

**마지막 업데이트**: 2025-01-27

