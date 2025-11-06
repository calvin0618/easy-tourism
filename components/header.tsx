/**
 * @file header.tsx
 * @description 헤더 컴포넌트
 *
 * 사이트 상단 헤더로, 로고, 검색창, 로그인/회원가입 버튼을 포함합니다.
 * Design.md의 헤더 디자인을 참고하여 작성되었습니다.
 *
 * 검색 기능:
 * - 검색어 입력 후 Enter 또는 검색 버튼 클릭 시 홈페이지로 이동하면서 검색어 전달
 * - URL 쿼리 파라미터로 검색어 관리
 */

'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SignedOut, SignInButton, SignUpButton, SignedIn, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { useI18n } from '@/components/providers/i18n-provider';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
  const { t } = useI18n();

  // URL 쿼리 파라미터 변경 시 검색창 state 업데이트
  useEffect(() => {
    const q = searchParams.get('q');
    // 홈페이지가 아니거나 검색어가 없으면 검색창 초기화
    if (pathname !== '/') {
      setSearchKeyword('');
    } else {
      setSearchKeyword(q || '');
    }
  }, [searchParams, pathname]);

  // 검색 실행
  const handleSearch = () => {
    const trimmedKeyword = searchKeyword.trim();
    if (trimmedKeyword) {
      console.log('[Header] 검색 실행:', trimmedKeyword);
      // 홈페이지로 이동하면서 검색어를 쿼리 파라미터로 전달
      router.push(`/?q=${encodeURIComponent(trimmedKeyword)}`);
    } else {
      // 검색어가 없으면 쿼리 파라미터 제거
      router.push('/');
    }
  };

  // Enter 키 이벤트 처리
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            My Trip
          </span>
        </Link>

        {/* 검색창 (모바일에서는 숨김, 데스크톱에서만 표시) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.header.searchPlaceholder}
              className="w-full pl-10 pr-12"
              aria-label={t.header.searchPlaceholder}
            />
            {searchKeyword && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-2"
              >
                {t.header.search}
              </Button>
            )}
          </div>
        </div>

        {/* 모바일 검색 아이콘 */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="검색"
          onClick={() => {
            // 모바일에서는 검색어 입력 후 검색 실행
            const trimmedKeyword = searchKeyword.trim();
            if (trimmedKeyword) {
              router.push(`/?q=${encodeURIComponent(trimmedKeyword)}`);
            }
          }}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* 다크모드, 언어 선택, 로그인/회원가입 버튼 */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                {t.common.login}
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">
                {t.common.signup}
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

