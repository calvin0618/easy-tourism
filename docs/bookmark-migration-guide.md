# 북마크 테이블 마이그레이션 적용 가이드

> Phase 4.1: 북마크 기능 Supabase 설정

## 📋 개요

이 가이드는 `bookmarks` 테이블을 Supabase에 생성하는 방법을 안내합니다.

## ✅ 마이그레이션 파일 확인

마이그레이션 파일 위치: `supabase/migrations/20251106172121_create_bookmarks_table.sql`

### 테이블 구조

- `id`: UUID (Primary Key, 자동 생성)
- `user_id`: UUID (Foreign Key → users.id, ON DELETE CASCADE)
- `content_id`: TEXT (관광지 contentId)
- `created_at`: TIMESTAMP WITH TIME ZONE (기본값: now())
- UNIQUE 제약조건: (user_id, content_id) - 중복 북마크 방지

### 인덱스

- `idx_bookmarks_user_id`: 사용자별 북마크 조회 성능 향상
- `idx_bookmarks_content_id`: 관광지별 북마크 조회 성능 향상
- `idx_bookmarks_created_at`: 최신순 정렬 성능 향상

## 🚀 마이그레이션 적용 방법

### 방법 1: Supabase 대시보드 사용 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴에서 **SQL Editor** 클릭
   - **New query** 버튼 클릭

3. **마이그레이션 SQL 실행**
   - `supabase/migrations/20251106172121_create_bookmarks_table.sql` 파일 내용 복사
   - SQL Editor에 붙여넣기
   - **Run** 버튼 클릭 (또는 `Ctrl+Enter`)

4. **성공 확인**
   - `Success. No rows returned` 메시지 확인

### 방법 2: Supabase CLI 사용 (선택 사항)

Supabase CLI가 설치되어 있다면:

```bash
# 프로젝트 루트에서
supabase db push
```

또는

```bash
# 특정 마이그레이션만 적용
supabase migration up
```

## ✅ 테이블 생성 확인

마이그레이션 적용 후 다음 SQL로 테이블이 올바르게 생성되었는지 확인하세요.

### 1. 테이블 존재 확인

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'bookmarks';
```

**예상 결과**: `bookmarks` 행이 반환되어야 합니다.

### 2. 테이블 구조 확인

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookmarks'
ORDER BY ordinal_position;
```

**예상 결과**:
- `id` (uuid, NOT NULL, gen_random_uuid())
- `user_id` (uuid, NOT NULL)
- `content_id` (text, NOT NULL)
- `created_at` (timestamp with time zone, NOT NULL, now())

### 3. Foreign Key 확인

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'bookmarks';
```

**예상 결과**: `user_id` → `users.id` Foreign Key가 있어야 합니다.

### 4. UNIQUE 제약조건 확인

```sql
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'bookmarks'
  AND constraint_type = 'UNIQUE';
```

**예상 결과**: `(user_id, content_id)` UNIQUE 제약조건이 있어야 합니다.

### 5. 인덱스 확인

```sql
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'bookmarks'
ORDER BY indexname;
```

**예상 결과**:
- `bookmarks_pkey` (Primary Key)
- `idx_bookmarks_user_id`
- `idx_bookmarks_content_id`
- `idx_bookmarks_created_at`
- `bookmarks_user_id_content_id_key` (UNIQUE 제약조건 인덱스)

### 6. RLS 상태 확인

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'bookmarks';
```

**예상 결과**: `rowsecurity = false` (RLS 비활성화)

## 🔍 문제 해결

### 테이블이 생성되지 않는 경우

1. **SQL 에러 확인**
   - Supabase 대시보드의 SQL Editor에서 에러 메시지 확인
   - `users` 테이블이 먼저 생성되어 있는지 확인

2. **권한 확인**
   - Supabase 프로젝트 관리자 권한이 있는지 확인

3. **마이그레이션 파일 재확인**
   - `supabase/migrations/20251106172121_create_bookmarks_table.sql` 파일 내용 확인

### Foreign Key 에러가 발생하는 경우

- `users` 테이블이 먼저 생성되어 있어야 합니다.
- `supabase/migrations/setup_schema.sql` 마이그레이션이 먼저 적용되었는지 확인

## 📝 다음 단계

마이그레이션이 성공적으로 적용되면:

1. ✅ Phase 4.1 완료
2. 다음 단계: Phase 4.2 - 북마크 API 함수 구현
   - `lib/api/supabase-api.ts` 생성
   - `addBookmark()`, `removeBookmark()`, `getUserBookmarks()`, `isBookmarked()` 함수 구현

## 참고 자료

- [Supabase SQL Editor 가이드](https://supabase.com/docs/guides/database/tables)
- [Supabase CLI 문서](https://supabase.com/docs/reference/cli)
- [PostgreSQL Foreign Key 문서](https://www.postgresql.org/docs/current/ddl-constraints.html)

